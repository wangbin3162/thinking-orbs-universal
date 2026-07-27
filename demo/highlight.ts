import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import darkThemeUrl from 'highlight.js/styles/github-dark.css?url';
import lightThemeUrl from 'highlight.js/styles/github.css?url';

// 仅注册 demo 用到的语言，避免全量引入。
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);

let linkEl: HTMLLinkElement | null = null;

/**
 * 根据明暗主题切换 highlight.js 主题样式表。
 * 两个主题都只对 `.hljs` 元素生效，互不污染其它 UI。
 */
export function initHljsTheme(theme: 'dark' | 'light') {
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
  }
  linkEl.href = theme === 'dark' ? darkThemeUrl : lightThemeUrl;
}

/**
 * 返回高亮后的 HTML 字符串，供各 demo 通过 v-html / dangerouslySetInnerHTML /
 * innerHTML 渲染。这样不会与 React/Vue 的虚拟 DOM 产物冲突。
 */
export function highlightCode(code: string, lang: 'javascript' | 'xml'): string {
  return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
}
