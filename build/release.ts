import { spawn } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { root } from './util-path.ts'

type CommandName = 'prepare' | 'version' | 'manual-publish' | 'ci'
type VersionLevel = 'patch' | 'minor' | 'major'

interface PackageLike {
  name: string
  version: string
  publishConfig?: {
    registry?: string
  }
}

interface RunResult {
  code: number
  stdout: string
  stderr: string
}

const npmRegistry = 'https://registry.npmjs.org'
const npmCache = resolve(root, '.npm-cache')

const baseEnv = {
  ...process.env,
  npm_config_cache: npmCache,
  npm_config_registry: npmRegistry
}

async function main() {
  await mkdir(npmCache, { recursive: true })

  const command = process.argv[2] as CommandName | undefined

  switch (command) {
    case 'prepare':
      await runPrepare(await readPackageJson())
      return
    case 'version':
      await runVersion(process.argv[3] as VersionLevel | undefined)
      return
    case 'manual-publish':
      await runManualPublish()
      return
    case 'ci':
      await runCi()
      return
    default:
      printUsage()
      process.exitCode = 1
  }
}

async function runVersion(level: VersionLevel | undefined) {
  if (!level || !isVersionLevel(level)) {
    throw new Error('请传入版本升级类型：patch | minor | major')
  }

  await runChecks()
  await runCommand('npm', ['version', level, '--no-git-tag-version'])

  const pkg = await readPackageJson()
  const branch = await getCurrentBranch()

  await runBuildAndPack(pkg)

  printVersionNextSteps(pkg.version, branch)
}

async function runManualPublish() {
  const pkg = await readPackageJson()

  await runPrepare(pkg)
  await ensureManualAuth()
  await runCommand('npm', ['publish'])
}

async function runCi() {
  const pkg = await readPackageJson()

  ensureCiTagMatchesVersion(pkg)
  await runPrepare(pkg)
}

async function runPrepare(pkg: PackageLike) {
  await runChecks()
  await runBuildAndPack(pkg)
}

async function runChecks() {
  await runCommand('npm', ['run', 'typecheck'])
}

async function runBuildAndPack(pkg: PackageLike) {
  ensurePublishRegistry(pkg)
  await runCommand('npm', ['run', 'build'])
  await ensureVersionIsUnpublished(pkg)
  await runCommand('npm', ['pack', '--dry-run'])
}

async function ensureManualAuth() {
  const result = await runCommand('npm', ['whoami'], {
    capture: true,
    allowFailure: true,
    timeoutMs: 15_000
  })

  if (result.code === 0) {
    const username = result.stdout.trim()
    if (username) {
      console.log(`已登录 npm 账号：${username}`)
    }
    return
  }

  throw new Error(
    [
      'npm 登录状态不可用，无法执行手动发布。',
      '请先执行：npm login --registry https://registry.npmjs.org --auth-type=web',
      '如果账号启用了 publish 2FA，npm publish 时按提示输入一次性验证码即可。'
    ].join('\n')
  )
}

async function ensureVersionIsUnpublished(pkg: PackageLike) {
  const spec = `${pkg.name}@${pkg.version}`
  const result = await runCommand('npm', ['view', spec, 'version', '--json'], {
    capture: true,
    allowFailure: true,
    timeoutMs: 15_000
  })

  if (result.code === 0 && result.stdout.trim()) {
    throw new Error(`npm 上已经存在 ${spec}，请先升级版本后再发布。`)
  }

  const output = `${result.stdout}\n${result.stderr}`

  if (result.code !== 0 && /E404|404 Not Found|No match found for version/i.test(output)) {
    return
  }

  if (result.code !== 0) {
    throw new Error(
      [`校验 npm 版本是否已发布时失败：${spec}`, output.trim() || '未知错误'].join('\n')
    )
  }
}

function ensurePublishRegistry(pkg: PackageLike) {
  const publishRegistry = pkg.publishConfig?.registry

  if (publishRegistry && publishRegistry !== npmRegistry) {
    throw new Error(
      `publishConfig.registry 当前为 ${publishRegistry}，release 流程要求使用 ${npmRegistry}`
    )
  }
}

function ensureCiTagMatchesVersion(pkg: PackageLike) {
  const tag = process.env.GITHUB_REF_NAME
  const expectedTag = `v${pkg.version}`

  if (tag !== expectedTag) {
    throw new Error(
      `当前 tag 为 ${tag ?? 'undefined'}，但 package.json 版本要求 tag 为 ${expectedTag}`
    )
  }
}

function isVersionLevel(value: string): value is VersionLevel {
  return value === 'patch' || value === 'minor' || value === 'major'
}

async function getCurrentBranch() {
  const result = await runCommand('git', ['branch', '--show-current'], {
    capture: true,
    allowFailure: true,
    timeoutMs: 10_000
  })

  const branch = result.stdout.trim()
  return branch || 'HEAD'
}

async function readPackageJson() {
  const packageJsonPath = resolve(root, 'package.json')
  const raw = await readFile(packageJsonPath, 'utf-8')
  return JSON.parse(raw) as PackageLike
}

function printVersionNextSteps(version: string, branch: string) {
  const tag = `v${version}`
  const pushBranchCommand =
    branch === 'HEAD' ? 'git push origin <current-branch>' : `git push origin ${branch}`

  console.log('')
  console.log(`版本已更新到 ${tag}`)
  console.log('')
  console.log('建议按下面步骤继续，命令已替换为当前版本和当前分支，可直接复制：')
  console.log('')
  console.log(`# 1. 提交版本变更`)
  console.log('git add -A')
  console.log(`git commit -m "release: ${tag}"`)
  console.log('')
  console.log(`# 2. 打 tag`)
  console.log(`git tag ${tag}`)
  console.log('')
  console.log(`# 3. 推送分支和 tag`)
  console.log(pushBranchCommand)
  console.log(`git push origin ${tag}`)
  console.log('')
  console.log(`# 4. 等待 GitHub Actions 自动发布到 npm`)
}

async function runCommand(
  command: string,
  args: string[],
  options: {
    allowFailure?: boolean
    capture?: boolean
    timeoutMs?: number
  } = {}
) {
  const { allowFailure = false, capture = false, timeoutMs } = options

  if (!capture) {
    console.log(`\n> ${command} ${args.join(' ')}`)
  }

  const result = await spawnCommand(command, args, capture, timeoutMs)

  if (!allowFailure && result.code !== 0) {
    throw new Error(`${command} ${args.join(' ')} 执行失败，退出码 ${result.code}`)
  }

  return result
}

function spawnCommand(command: string, args: string[], capture: boolean, timeoutMs?: number) {
  return new Promise<RunResult>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: baseEnv,
      stdio: capture ? ['inherit', 'pipe', 'pipe'] : 'inherit'
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timer =
      timeoutMs == null
        ? undefined
        : setTimeout(() => {
            timedOut = true
            child.kill('SIGTERM')
          }, timeoutMs)

    if (capture) {
      child.stdout?.on('data', chunk => {
        stdout += String(chunk)
      })

      child.stderr?.on('data', chunk => {
        stderr += String(chunk)
      })
    }

    child.on('error', reject)
    child.on('close', code => {
      if (timer) {
        clearTimeout(timer)
      }

      if (timedOut) {
        reject(new Error(`${command} ${args.join(' ')} 执行超时（${timeoutMs}ms）`))
        return
      }

      resolvePromise({
        code: code ?? 1,
        stdout,
        stderr
      })
    })
  })
}

function printUsage() {
  console.log('用法：')
  console.log('npm run release:prepare')
  console.log('npm run release:version -- patch|minor|major')
  console.log('npm run release:publish')
  console.log('npm run release:ci')
}

try {
  await main()
} catch (error) {
  console.error('')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
