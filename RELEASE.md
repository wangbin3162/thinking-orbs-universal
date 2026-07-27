# 发布说明

这份说明把 `thinking-orbs-universal` 的 npm 发布流程固定成两条路径：

1. 推荐：`GitHub Actions + npm trusted publishing`
2. 兜底：本地 `npm login` 后手动发布

推荐路径不依赖长期 `NPM_TOKEN`，可以直接避开 2FA / token `403` 问题。

## 一次性配置

### 1. 配置 npm trusted publishing

在 npm 后台为 `thinking-orbs-universal` 配置 GitHub Actions Trusted Publisher：

1. 打开 npm 包 `thinking-orbs-universal` 的包设置页
2. 找到 `Trusted publishers`
3. 选择 GitHub Actions
4. 仓库填 `wangbin3162/thinking-orbs-universal`
5. workflow 文件名填 `release.yml`

仓库里已经补好了工作流文件：

- [release.yml](/.github/workflows/release.yml)

配置完成后，GitHub Actions 发布时不再依赖长期 token，也不需要本地输入 OTP。

### 2. 不要把 npm token 写进仓库

仓库内不要提交带认证信息的 `.npmrc`。本仓库的 release 脚本会固定使用：

- registry: `https://registry.npmjs.org`
- cache: 本地仓库下的 `.npm-cache/`

这样可以同时规避：

- 发到错误 registry
- 本机全局 npm cache 权限异常导致的 `EPERM`

## 日常发布

### 推荐流程

每次发版只按下面执行：

1. 执行版本升级和完整预检

```sh
npm run release:version -- patch
# 或
npm run release:version -- minor
# 或
npm run release:version -- major
```

这个命令会自动完成：

- `typecheck`
- 更新 `package.json` 版本号
- 重新构建 npm 包产物
- `npm view` 校验版本号尚未发布
- `npm pack --dry-run` 校验发包内容

2. 提交 release commit

```sh
git add -A
git commit -m "release: vX.Y.Z"
```

3. 打 tag 并推送

```sh
git tag vX.Y.Z
git push origin <你的分支名>
git push origin --tags
```

4. 等待 GitHub Actions 自动发布到 npm

工作流会再次执行校验，并且要求：

- Git tag 必须等于 `v${package.json.version}`
- 当前版本号不能已经存在于 npm

## 手动兜底发布

如果 trusted publishing 尚未配置完成，或者临时需要本地直接发布，使用下面流程：

1. 先登录 npm

```sh
npm login --registry https://registry.npmjs.org --auth-type=web
```

2. 执行仓库内置发布命令

```sh
npm run release:publish
```

这个命令会先跑完整预检，再执行 `npm publish`。

如果你的 npm 账号启用了 publish 2FA，`npm publish` 时输入一次性验证码即可，这属于正常行为。

## 常见问题

### 1. `403 Forbidden` / token 无权限

优先检查下面几项：

- 当前版本是否已经发布过
- 是否误用了旧 token 或只具备 install 权限的 token
- 是否发布到了错误的 registry

推荐直接改用上面的 GitHub trusted publishing，不再依赖长期 token。

### 2. 需要 2FA / OTP

如果走本地手动发布，这是正常的。

- `npm login --auth-type=web` 负责登录
- `npm publish` 时按提示输入 OTP

如果不想每次输入 OTP，使用 GitHub trusted publishing。

### 3. `EPERM` / npm cache 权限问题

本仓库 release 脚本已经把 npm cache 固定到仓库内 `.npm-cache/`，因此正常执行：

```sh
npm run release:prepare
npm run release:version -- patch
npm run release:publish
```

都不会依赖你本机的全局 npm cache。
