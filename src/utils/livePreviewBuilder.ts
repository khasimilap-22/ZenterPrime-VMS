import { CodeFile, ThemeMode } from '../types';

export const PREVIEW_CONSOLE_CHANNEL = 'vms-live-preview-console';

export interface PreviewBuildResult {
  html: string;
  entryPath: string;
  mode: 'html' | 'markdown' | 'svg' | 'json' | 'script' | 'info';
}

function normalizePath(p: string): string {
  return p.replace(/^\.?\//, '').replace(/\\/g, '/');
}

function resolveRelativePath(baseFilePath: string, relativeRef: string): string {
  const cleanRef = relativeRef.split('?')[0].split('#')[0].trim();
  if (cleanRef.startsWith('/')) {
    return normalizePath(cleanRef);
  }
  const baseParts = normalizePath(baseFilePath).split('/');
  baseParts.pop(); // remove filename
  const refParts = cleanRef.split('/');
  for (const part of refParts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }
  return baseParts.join('/');
}

function findFileByPath(filesMap: Map<string, CodeFile>, targetPath: string): CodeFile | undefined {
  const normalized = normalizePath(targetPath);
  if (filesMap.has(normalized)) return filesMap.get(normalized);
  // Try common extensions if omitted in ES import
  const exts = ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.css', '.json'];
  for (const ext of exts) {
    if (filesMap.has(normalized + ext)) {
      return filesMap.get(normalized + ext);
    }
  }
  // Try index file inside directory
  for (const ext of exts) {
    if (filesMap.has(`${normalized}/index${ext}`)) {
      return filesMap.get(`${normalized}/index${ext}`);
    }
  }
  return undefined;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Console & runtime error bridge injected into preview documents.
 */
function buildConsoleBridgeScript(): string {
  return `<script>
(function() {
  var CHANNEL = '${PREVIEW_CONSOLE_CHANNEL}';
  function serialize(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.stack || arg.message;
    try { return JSON.stringify(arg, null, 2); } catch (e) { return String(arg); }
  }
  function send(level, args) {
    try {
      window.parent.postMessage({
        channel: CHANNEL,
        level: level,
        message: Array.prototype.slice.call(args).map(serialize).join(' ')
      }, '*');
    } catch (e) {}
  }
  ['log', 'info', 'warn', 'error'].forEach(function(method) {
    var orig = console[method];
    console[method] = function() {
      send(method, arguments);
      if (orig) orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e) {
    send('error', [e.message + (e.lineno ? ' (line ' + e.lineno + ')' : '')]);
  });
  window.addEventListener('unhandledrejection', function(e) {
    send('error', ['Unhandled Promise Rejection: ' + serialize(e.reason)]);
  });
})();
</script>`;
}

/**
 * Recursively transforms local relative ES imports into self-contained data:text/javascript URLs
 * so multi-file ES module projects (e.g. app.js -> ./utils/dom.js) execute offline inside srcDoc.
 */
function bundleJsModuleToDataUrl(
  file: CodeFile,
  filesMap: Map<string, CodeFile>,
  visited: Set<string>
): string {
  const transformed = rewriteRelativeImports(file, filesMap, visited);
  return `data:text/javascript;charset=utf-8,${encodeURIComponent(transformed)}`;
}

function rewriteRelativeImports(
  file: CodeFile,
  filesMap: Map<string, CodeFile>,
  visited: Set<string>
): string {
  const norm = normalizePath(file.path);
  if (visited.has(norm)) return file.content;
  const nextVisited = new Set(visited);
  nextVisited.add(norm);

  const rewriteSpecifier = (specifier: string): string => {
    if (!specifier.startsWith('./') && !specifier.startsWith('../') && !specifier.startsWith('/')) {
      return specifier;
    }
    const targetPath = resolveRelativePath(file.path, specifier);
    const targetFile = findFileByPath(filesMap, targetPath);
    if (!targetFile) return specifier;
    const ext = targetFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'css') {
      // Inject CSS dynamically as an ES module side-effect
      const cssModule = `const s = document.createElement('style'); s.textContent = ${JSON.stringify(targetFile.content)}; document.head.appendChild(s);`;
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(cssModule)}`;
    }
    if (ext === 'json') {
      const jsonModule = `export default ${targetFile.content};`;
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(jsonModule)}`;
    }
    return bundleJsModuleToDataUrl(targetFile, filesMap, nextVisited);
  };

  let code = file.content;
  // import ... from './foo.js'  and  export ... from './foo.js'
  code = code.replace(
    /(\b(?:import|export)\b[^;'"]*?\bfrom\s*)(['"])([^'"]+)\2/g,
    (_m, prefix, quote, spec) => `${prefix}${quote}${rewriteSpecifier(spec)}${quote}`
  );
  // Side-effect import './styles.css'
  code = code.replace(
    /(\bimport\s*)(['"])([^'"]+)\2/g,
    (_m, prefix, quote, spec) => `${prefix}${quote}${rewriteSpecifier(spec)}${quote}`
  );

  return code;
}

/**
 * Inlines local <link rel="stylesheet"> and <script src="..."> references inside an HTML file.
 */
function buildHtmlPreview(htmlFile: CodeFile, filesMap: Map<string, CodeFile>): string {
  let doc = htmlFile.content;

  // Inline local stylesheets
  doc = doc.replace(
    /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
    (match, href) => {
      if (/^(https?:)?\/\//i.test(href)) return match;
      const targetPath = resolveRelativePath(htmlFile.path, href);
      const cssFile = findFileByPath(filesMap, targetPath);
      if (!cssFile) return match;
      return `<style data-source="${escapeHtml(cssFile.path)}">\n${cssFile.content}\n</style>`;
    }
  );
  // Also match href before rel
  doc = doc.replace(
    /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*\/?>/gi,
    (match, href) => {
      if (/^(https?:)?\/\//i.test(href)) return match;
      const targetPath = resolveRelativePath(htmlFile.path, href);
      const cssFile = findFileByPath(filesMap, targetPath);
      if (!cssFile) return match;
      return `<style data-source="${escapeHtml(cssFile.path)}">\n${cssFile.content}\n</style>`;
    }
  );

  // Inline local scripts (supporting type="module" with nested local imports!)
  doc = doc.replace(
    /<script\b([^>]*)src=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (match, beforeAttrs, src, afterAttrs) => {
      if (/^(https?:)?\/\//i.test(src)) return match;
      const targetPath = resolveRelativePath(htmlFile.path, src);
      const jsFile = findFileByPath(filesMap, targetPath);
      if (!jsFile) return match;

      const attrs = `${beforeAttrs} ${afterAttrs}`;
      const isModule = /type=["']module["']/i.test(attrs);
      const ext = jsFile.name.split('.').pop()?.toLowerCase() || '';

      // Skip Vite TSX/JSX entrypoint scripts that require a bundler; show helpful inline note instead
      if (ext === 'tsx' || ext === 'jsx' || ext === 'ts') {
        return `<script>console.info('Entrypoint ${jsFile.path} uses ${ext.toUpperCase()} syntax; showing static HTML shell.');</script>`;
      }

      const content = isModule
        ? rewriteRelativeImports(jsFile, filesMap, new Set())
        : jsFile.content;
      const safeContent = content.replace(/<\/script>/gi, '<\\/script>');
      return `<script${isModule ? ' type="module"' : ''} data-source="${escapeHtml(jsFile.path)}">\n${safeContent}\n</script>`;
    }
  );

  // Inject console bridge right after <head> or at the top of document
  const bridge = buildConsoleBridgeScript();
  if (/<head\b[^>]*>/i.test(doc)) {
    doc = doc.replace(/<head\b[^>]*>/i, (m) => `${m}\n${bridge}`);
  } else {
    doc = `${bridge}\n${doc}`;
  }

  return doc;
}

/**
 * Lightweight offline Markdown-to-HTML renderer for .md live preview.
 */
function renderMarkdownToHtml(markdown: string, theme: ThemeMode): string {
  const isDark = theme === 'dark';
  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let inList = false;

  const formatInline = (text: string): string => {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLines = [];
      } else {
        inCodeBlock = false;
        htmlParts.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${formatInline(line.replace(/^\s*[-*+]\s+/, ''))}</li>`);
      continue;
    }

    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }

    if (/^---+$/.test(line.trim())) {
      htmlParts.push('<hr />');
      continue;
    }

    if (line.trim().startsWith('>')) {
      htmlParts.push(`<blockquote>${formatInline(line.replace(/^\s*>\s?/, ''))}</blockquote>`);
      continue;
    }

    if (!line.trim()) {
      continue;
    }

    htmlParts.push(`<p>${formatInline(line)}</p>`);
  }

  if (inList) htmlParts.push('</ul>');
  if (inCodeBlock) {
    htmlParts.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body {
    margin: 0;
    padding: 24px 28px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.65;
    background: ${isDark ? '#111111' : '#ffffff'};
    color: ${isDark ? '#e5e5e5' : '#171717'};
  }
  h1, h2, h3, h4 { margin: 1.25em 0 0.5em; line-height: 1.3; font-weight: 700; }
  h1 { font-size: 1.75em; padding-bottom: 0.35em; border-bottom: 1px solid ${isDark ? '#262626' : '#e5e5e5'}; margin-top: 0; }
  h2 { font-size: 1.35em; }
  h3 { font-size: 1.1em; }
  p { margin: 0.65em 0; color: ${isDark ? '#d4d4d4' : '#374151'}; }
  ul { padding-left: 1.5rem; margin: 0.65em 0; }
  li { margin: 0.3em 0; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.88em;
    padding: 0.15em 0.4em;
    border-radius: 4px;
    background: ${isDark ? '#1f2937' : '#f3f4f6'};
    color: ${isDark ? '#38bdf8' : '#0284c7'};
  }
  pre {
    padding: 14px 16px;
    border-radius: 8px;
    overflow-x: auto;
    background: ${isDark ? '#0a0a0a' : '#f8fafc'};
    border: 1px solid ${isDark ? '#262626' : '#e2e8f0'};
  }
  pre code { background: transparent; padding: 0; color: ${isDark ? '#e5e7eb' : '#1f2937'}; }
  blockquote {
    margin: 0.85em 0;
    padding: 0.5em 1em;
    border-left: 3px solid #0284c7;
    background: ${isDark ? '#171717' : '#f8fafc'};
  }
  hr { border: none; border-top: 1px solid ${isDark ? '#262626' : '#e5e5e5'}; margin: 1.5em 0; }
  a { color: ${isDark ? '#38bdf8' : '#0284c7'}; }
</style>
</head>
<body>${htmlParts.join('\n')}</body>
</html>`;
}

function renderSvgPreview(svgCode: string, theme: ThemeMode): string {
  const isDark = theme === 'dark';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background-color: ${isDark ? '#121212' : '#f8fafc'};
    background-image: radial-gradient(${isDark ? '#262626' : '#cbd5e1'} 1px, transparent 1px);
    background-size: 16px 16px;
  }
  svg { max-width: 100%; max-height: 85vh; height: auto; }
</style>
</head>
<body>${svgCode}</body>
</html>`;
}

function renderJsonPreview(jsonCode: string, fileName: string, theme: ThemeMode): string {
  const isDark = theme === 'dark';
  let statusBadge = 'Valid JSON';
  let isError = false;
  let formatted = jsonCode;

  try {
    const parsed = JSON.parse(jsonCode);
    formatted = JSON.stringify(parsed, null, 2);
  } catch (err) {
    isError = true;
    statusBadge = err instanceof Error ? err.message : 'Invalid JSON';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body {
    margin: 0;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
    background: ${isDark ? '#111111' : '#ffffff'};
    color: ${isDark ? '#e5e5e5' : '#171717'};
  }
  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 14px;
    font-size: 13px;
    border: 1px solid ${isError ? '#ef4444' : isDark ? '#262626' : '#e2e8f0'};
    background: ${isError ? (isDark ? '#450a0a' : '#fef2f2') : isDark ? '#171717' : '#f8fafc'};
    color: ${isError ? (isDark ? '#fca5a5' : '#b91c1c') : isDark ? '#34d399' : '#047857'};
  }
  pre {
    margin: 0;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px;
    line-height: 1.55;
    background: ${isDark ? '#0a0a0a' : '#f8fafc'};
    border: 1px solid ${isDark ? '#262626' : '#e2e8f0'};
    color: ${isDark ? '#d4d4d4' : '#1f2328'};
  }
</style>
</head>
<body>
  <div class="meta">
    <strong>${escapeHtml(fileName)}</strong>
    <span>${escapeHtml(statusBadge)}</span>
  </div>
  <pre>${escapeHtml(formatted)}</pre>
</body>
</html>`;
}

function renderStandaloneScriptPreview(file: CodeFile, filesMap: Map<string, CodeFile>, theme: ThemeMode): string {
  const isDark = theme === 'dark';
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isJs = ext === 'js' || ext === 'mjs';
  const bridge = buildConsoleBridgeScript();

  if (isJs) {
    const transformed = rewriteRelativeImports(file, filesMap, new Set()).replace(/<\/script>/gi, '<\\/script>');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
${bridge}
<style>
  body {
    margin: 0;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
    background: ${isDark ? '#111111' : '#ffffff'};
    color: ${isDark ? '#e5e5e5' : '#171717'};
  }
  .banner {
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
    background: ${isDark ? '#171717' : '#f8fafc'};
    border: 1px solid ${isDark ? '#262626' : '#e2e8f0'};
    color: ${isDark ? '#a3a3a3' : '#475569'};
    margin-bottom: 14px;
  }
</style>
</head>
<body>
  <div class="banner">Running <strong>${escapeHtml(file.path)}</strong> — Console output appears in the Console drawer below.</div>
  <div id="app"></div>
  <div id="root"></div>
  <script type="module">\n${transformed}\n</script>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body {
    margin: 0;
    padding: 28px;
    font-family: system-ui, -apple-system, sans-serif;
    background: ${isDark ? '#111111' : '#ffffff'};
    color: ${isDark ? '#e5e5e5' : '#171717'};
  }
  .card {
    max-width: 520px;
    padding: 20px;
    border-radius: 10px;
    background: ${isDark ? '#171717' : '#f8fafc'};
    border: 1px solid ${isDark ? '#262626' : '#e2e8f0'};
  }
  h3 { margin: 0 0 8px; font-size: 15px; }
  p { margin: 0 0 10px; font-size: 13px; line-height: 1.55; color: ${isDark ? '#a3a3a3' : '#475569'}; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${isDark ? '#262626' : '#e2e8f0'};
    color: ${isDark ? '#38bdf8' : '#0284c7'};
  }
</style>
</head>
<body>
  <div class="card">
    <h3>Live Preview Ready</h3>
    <p>Currently viewing <code>${escapeHtml(file.path)}</code> (${escapeHtml(ext.toUpperCase() || 'TEXT')}).</p>
    <p>Browser Live Preview renders <code>.html</code> (with linked CSS &amp; JS modules), <code>.svg</code>, <code>.md</code>, <code>.json</code>, and <code>.js</code> files directly. Add an <code>index.html</code> file to preview a full web app in this CodeSpace.</p>
  </div>
</body>
</html>`;
}

/**
 * Builds the live preview document for the current active file & CodeSpace files.
 */
export function buildLivePreviewDocument(
  files: CodeFile[],
  activeFile: CodeFile | null,
  theme: ThemeMode
): PreviewBuildResult {
  const filesMap = new Map<string, CodeFile>();
  files.forEach((f) => {
    filesMap.set(normalizePath(f.path), f);
  });

  const activeExt = activeFile?.name.split('.').pop()?.toLowerCase() || '';

  // 1. Direct HTML file selected
  if (activeFile && (activeExt === 'html' || activeExt === 'htm')) {
    return {
      html: buildHtmlPreview(activeFile, filesMap),
      entryPath: activeFile.path,
      mode: 'html',
    };
  }

  // 2. Direct SVG file selected
  if (activeFile && activeExt === 'svg') {
    return {
      html: renderSvgPreview(activeFile.content, theme),
      entryPath: activeFile.path,
      mode: 'svg',
    };
  }

  // 3. Direct Markdown file selected
  if (activeFile && (activeExt === 'md' || activeExt === 'markdown')) {
    return {
      html: renderMarkdownToHtml(activeFile.content, theme),
      entryPath: activeFile.path,
      mode: 'markdown',
    };
  }

  // 4. Direct JSON file selected
  if (activeFile && (activeExt === 'json' || activeExt === 'webmanifest')) {
    return {
      html: renderJsonPreview(activeFile.content, activeFile.path, theme),
      entryPath: activeFile.path,
      mode: 'json',
    };
  }

  // 5. If editing CSS or JS in a CodeSpace that has an HTML entry file, preview the HTML entry with live CSS/JS!
  const htmlEntry =
    filesMap.get('index.html') ||
    files.find((f) => /\.(html|htm)$/i.test(f.name));

  if (htmlEntry && (activeExt === 'css' || activeExt === 'js' || activeExt === 'mjs' || !activeFile)) {
    return {
      html: buildHtmlPreview(htmlEntry, filesMap),
      entryPath: htmlEntry.path,
      mode: 'html',
    };
  }

  // 6. Standalone JS / non-HTML file fallback
  if (activeFile) {
    return {
      html: renderStandaloneScriptPreview(activeFile, filesMap, theme),
      entryPath: activeFile.path,
      mode: activeExt === 'js' || activeExt === 'mjs' ? 'script' : 'info',
    };
  }

  // 7. Empty workspace fallback
  return {
    html: renderMarkdownToHtml('# Live Preview\n\nOpen or create an `index.html`, `.css`, `.js`, `.md`, or `.svg` file to preview it live.', theme),
    entryPath: 'Workspace',
    mode: 'info',
  };
}
