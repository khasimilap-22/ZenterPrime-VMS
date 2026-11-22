import React from 'react';

export type TokenType =
  | 'plain'
  | 'comment'
  | 'control'
  | 'keyword'
  | 'string'
  | 'number'
  | 'type'
  | 'function'
  | 'property'
  | 'key'
  | 'tag'
  | 'attr'
  | 'selector'
  | 'css-prop'
  | 'decorator'
  | 'operator'
  | 'punctuation'
  | 'regex'
  | 'md-heading'
  | 'md-code';

interface SyntaxToken {
  type: TokenType;
  value: string;
}

const JS_CONTROL_KEYWORDS = new Set([
  'import', 'export', 'from', 'default', 'return', 'if', 'else', 'switch', 'case',
  'for', 'while', 'do', 'break', 'continue', 'try', 'catch', 'finally', 'throw',
  'await', 'yield', 'as', 'with',
]);

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum',
  'extends', 'implements', 'new', 'delete', 'typeof', 'instanceof', 'void',
  'async', 'public', 'private', 'protected', 'static', 'readonly', 'abstract',
  'declare', 'namespace', 'module', 'keyof', 'infer', 'satisfies', 'override',
  'this', 'super', 'true', 'false', 'null', 'undefined', 'in', 'of', 'get', 'set',
]);

const JS_BUILTIN_TYPES = new Set([
  'string', 'number', 'boolean', 'any', 'unknown', 'never', 'object', 'symbol',
  'bigint', 'Array', 'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit',
  'Promise', 'Map', 'Set', 'Date', 'RegExp', 'Error', 'React', 'HTMLElement',
  'Event', 'Blob', 'URL', 'JSON', 'Math', 'Console', 'Window', 'Document',
]);

const DART_CONTROL_KEYWORDS = new Set([
  'import', 'export', 'part', 'show', 'hide', 'return', 'if', 'else', 'switch',
  'case', 'default', 'for', 'while', 'do', 'break', 'continue', 'try', 'catch',
  'on', 'finally', 'throw', 'rethrow', 'await', 'yield', 'as', 'in',
]);

const DART_KEYWORDS = new Set([
  'class', 'extends', 'implements', 'with', 'mixin', 'enum', 'typedef', 'extension',
  'abstract', 'sealed', 'base', 'final', 'const', 'var', 'late', 'required',
  'static', 'void', 'dynamic', 'async', 'sync', 'get', 'set', 'operator', 'factory',
  'super', 'this', 'new', 'is', 'true', 'false', 'null', 'library',
]);

const DART_TYPES = new Set([
  'int', 'double', 'num', 'bool', 'String', 'List', 'Map', 'Set', 'Future',
  'Stream', 'Object', 'Widget', 'State', 'StatelessWidget', 'StatefulWidget',
  'BuildContext', 'Key', 'ThemeData', 'Color', 'Duration',
]);

const KOTLIN_CONTROL_KEYWORDS = new Set([
  'import', 'return', 'if', 'else', 'when', 'for', 'while', 'do', 'break',
  'continue', 'try', 'catch', 'finally', 'throw', 'as', 'in', 'is',
]);

const KOTLIN_KEYWORDS = new Set([
  'package', 'fun', 'val', 'var', 'class', 'data', 'object', 'interface', 'enum',
  'sealed', 'open', 'abstract', 'final', 'private', 'public', 'protected',
  'internal', 'override', 'companion', 'init', 'constructor', 'by', 'suspend',
  'inline', 'lateinit', 'const', 'this', 'super', 'true', 'false', 'null',
  'plugins', 'repositories', 'dependencies', 'application', 'tasks',
]);

const KOTLIN_TYPES = new Set([
  'Int', 'Long', 'Double', 'Float', 'Boolean', 'Char', 'Byte', 'Short', 'String',
  'Unit', 'Any', 'Nothing', 'List', 'MutableList', 'Map', 'MutableMap', 'Set',
  'Array', 'Pair', 'Triple',
]);

const PYTHON_CONTROL_KEYWORDS = new Set([
  'import', 'from', 'as', 'return', 'if', 'elif', 'else', 'for', 'while', 'break',
  'continue', 'try', 'except', 'finally', 'raise', 'with', 'yield', 'await', 'pass',
  'match', 'case',
]);

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'lambda', 'async', 'and', 'or', 'not', 'in', 'is', 'None',
  'True', 'False', 'global', 'nonlocal', 'del', 'assert', 'self',
]);

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'AS', 'AND',
  'OR', 'NOT', 'IN', 'IS', 'NULL', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
  'UNIQUE', 'DEFAULT', 'CHECK', 'CONSTRAINT', 'ORDER', 'BY', 'GROUP', 'HAVING',
  'LIMIT', 'OFFSET', 'DISTINCT', 'UNION', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE',
  'END', 'ASC', 'DESC', 'EXISTS', 'BETWEEN', 'LIKE', 'TRUE', 'FALSE', 'BEGIN',
  'COMMIT', 'ROLLBACK', 'TRANSACTION', 'CASCADE', 'IF', 'VARCHAR', 'INT',
  'INTEGER', 'BIGINT', 'TEXT', 'BOOLEAN', 'TIMESTAMP', 'UUID', 'SERIAL', 'JSONB',
]);

function normalizeLang(fileName: string, language?: string): string {
  const ext = fileName.includes('.')
    ? fileName.split('.').pop()!.toLowerCase()
    : (language || '').toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'mts':
    case 'cts':
    case 'typescript':
      return 'ts';
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
    case 'javascript':
      return 'js';
    case 'html':
    case 'htm':
    case 'xml':
    case 'svg':
      return 'html';
    case 'css':
    case 'scss':
    case 'less':
      return 'css';
    case 'json':
    case 'webmanifest':
      return 'json';
    case 'dart':
      return 'dart';
    case 'kt':
    case 'kts':
    case 'kotlin':
      return 'kotlin';
    case 'py':
    case 'python':
      return 'python';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'properties':
    case 'env':
    case 'ini':
      return 'properties';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'sql':
      return 'sql';
    default:
      return 'plain';
  }
}

function isWordStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

function isWordChar(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function peekNonSpace(code: string, from: number): string {
  let j = from;
  while (j < code.length && (code[j] === ' ' || code[j] === '\t')) {
    j++;
  }
  return code[j] || '';
}

function prevNonSpace(code: string, from: number): string {
  let j = from;
  while (j >= 0 && (code[j] === ' ' || code[j] === '\t')) {
    j--;
  }
  return code[j] || '';
}

/**
 * Tokenizes JS/TS/JSX/TSX, Dart, and Kotlin using VS Code Dark+/Light+ token categories.
 */
function tokenizeCLike(
  code: string,
  lang: 'js' | 'ts' | 'dart' | 'kotlin'
): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const len = code.length;
  let i = 0;

  const controlSet =
    lang === 'dart'
      ? DART_CONTROL_KEYWORDS
      : lang === 'kotlin'
      ? KOTLIN_CONTROL_KEYWORDS
      : JS_CONTROL_KEYWORDS;

  const keywordSet =
    lang === 'dart'
      ? DART_KEYWORDS
      : lang === 'kotlin'
      ? KOTLIN_KEYWORDS
      : JS_KEYWORDS;

  const typeSet =
    lang === 'dart'
      ? DART_TYPES
      : lang === 'kotlin'
      ? KOTLIN_TYPES
      : JS_BUILTIN_TYPES;

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      tokens.push({ type, value });
    }
  };

  while (i < len) {
    const ch = code[i];
    const next = code[i + 1] || '';

    // Line comment //
    if (ch === '/' && next === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = len;
      push('comment', code.slice(i, end));
      i = end;
      continue;
    }

    // Block comment /* ... */
    if (ch === '/' && next === '*') {
      let end = code.indexOf('*/', i + 2);
      end = end === -1 ? len : end + 2;
      push('comment', code.slice(i, end));
      i = end;
      continue;
    }

    // Strings: ', ", `
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < len) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === quote) {
          j += 1;
          break;
        }
        if (quote !== '`' && code[j] === '\n') {
          break;
        }
        j++;
      }
      push('string', code.slice(i, j));
      i = j;
      continue;
    }

    // Decorators / Annotations (@override, @Test, @Component)
    if (ch === '@' && isWordStart(next)) {
      let j = i + 1;
      while (j < len && isWordChar(code[j])) j++;
      push('decorator', code.slice(i, j));
      i = j;
      continue;
    }

    // JSX/TSX closing or opening tag names: <div, </div, <Header
    if (
      (lang === 'js' || lang === 'ts') &&
      ch === '<' &&
      (next === '/' || /[A-Za-z]/.test(next))
    ) {
      const prevChar = prevNonSpace(code, i - 1);
      const isLikelyJsx =
        !prevChar ||
        /[(=,:;?!&|{}\[\n>]/.test(prevChar) ||
        code.slice(Math.max(0, i - 7), i).trimEnd().endsWith('return');

      if (isLikelyJsx) {
        const isClosing = next === '/';
        push('punctuation', isClosing ? '</' : '<');
        i += isClosing ? 2 : 1;
        const start = i;
        while (i < len && /[A-Za-z0-9_.-]/.test(code[i])) i++;
        const tagName = code.slice(start, i);
        if (tagName) {
          const isComponent = /^[A-Z]/.test(tagName);
          push(isComponent ? 'type' : 'tag', tagName);
        }
        continue;
      }
    }

    // Numbers
    if (isDigit(ch) || (ch === '.' && isDigit(next))) {
      let j = i;
      if (ch === '0' && (next === 'x' || next === 'X')) {
        j += 2;
        while (j < len && /[0-9a-fA-F_]/.test(code[j])) j++;
      } else {
        while (j < len && /[0-9._eE+-]/.test(code[j])) {
          if ((code[j] === '+' || code[j] === '-') && code[j - 1] !== 'e' && code[j - 1] !== 'E') {
            break;
          }
          j++;
        }
        if (j < len && /[nLfFdD]/.test(code[j])) j++;
      }
      push('number', code.slice(i, j));
      i = j;
      continue;
    }

    // Identifiers, keywords, types, functions, properties
    if (isWordStart(ch)) {
      let j = i + 1;
      while (j < len && isWordChar(code[j])) j++;
      const word = code.slice(i, j);
      const after = peekNonSpace(code, j);
      const before = prevNonSpace(code, i - 1);

      if (controlSet.has(word)) {
        push('control', word);
      } else if (keywordSet.has(word)) {
        push('keyword', word);
      } else if (typeSet.has(word)) {
        push('type', word);
      } else if (after === '(') {
        push('function', word);
      } else if (/^[A-Z][A-Za-z0-9_]*$/.test(word) && !/^[A-Z0-9_]+$/.test(word)) {
        push('type', word);
      } else if (before === '.') {
        push('property', word);
      } else if (after === ':' && before !== '?') {
        push('property', word);
      } else if ((lang === 'js' || lang === 'ts') && after === '=' && code[j + 1] !== '=') {
        push('attr', word);
      } else {
        push('plain', word);
      }

      i = j;
      continue;
    }

    // Operators / Punctuation
    if (/[+\-*/%=&|!<>?:~^]/.test(ch)) {
      push('operator', ch);
      i++;
      continue;
    }

    if (/[{}()[\].,;]/.test(ch)) {
      push('punctuation', ch);
      i++;
      continue;
    }

    push('plain', ch);
    i++;
  }

  return tokens;
}

/**
 * Tokenizes HTML / XML / SVG markup in VS Code style.
 */
function tokenizeHtml(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const len = code.length;
  let i = 0;

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      tokens.push({ type, value });
    }
  };

  while (i < len) {
    // HTML Comment <!-- ... -->
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4);
      const sliceEnd = end === -1 ? len : end + 3;
      push('comment', code.slice(i, sliceEnd));
      i = sliceEnd;
      continue;
    }

    // DOCTYPE
    if (code.slice(i, i + 9).toLowerCase() === '<!doctype') {
      const end = code.indexOf('>', i);
      const sliceEnd = end === -1 ? len : end + 1;
      push('keyword', code.slice(i, sliceEnd));
      i = sliceEnd;
      continue;
    }

    // Opening or closing tag
    if (code[i] === '<') {
      const isClosing = code[i + 1] === '/';
      push('punctuation', isClosing ? '</' : '<');
      i += isClosing ? 2 : 1;

      const nameStart = i;
      while (i < len && /[A-Za-z0-9:_-]/.test(code[i])) i++;
      push('tag', code.slice(nameStart, i));

      // Inside tag attributes until '>'
      while (i < len && code[i] !== '>') {
        if (code[i] === '/' && code[i + 1] === '>') {
          push('punctuation', '/>');
          i += 2;
          break;
        }
        if (/\s/.test(code[i])) {
          push('plain', code[i]);
          i++;
          continue;
        }
        if (code[i] === '=') {
          push('operator', '=');
          i++;
          continue;
        }
        if (code[i] === '"' || code[i] === "'") {
          const q = code[i];
          let j = i + 1;
          while (j < len && code[j] !== q) {
            if (code[j] === '\\') j++;
            j++;
          }
          if (j < len) j++;
          push('string', code.slice(i, j));
          i = j;
          continue;
        }
        if (/[A-Za-z0-9:_-]/.test(code[i])) {
          const attrStart = i;
          while (i < len && /[A-Za-z0-9:_-]/.test(code[i])) i++;
          push('attr', code.slice(attrStart, i));
          continue;
        }
        push('plain', code[i]);
        i++;
      }

      if (i < len && code[i] === '>') {
        push('punctuation', '>');
        i++;
      }
      continue;
    }

    push('plain', code[i]);
    i++;
  }

  return tokens;
}

/**
 * Tokenizes CSS / SCSS with VS Code Dark+/Light+ selector, property, value, and at-rule colors.
 */
function tokenizeCss(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const len = code.length;
  let i = 0;
  let braceDepth = 0;

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      tokens.push({ type, value });
    }
  };

  while (i < len) {
    const ch = code[i];

    // Block comment
    if (ch === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      end = end === -1 ? len : end + 2;
      push('comment', code.slice(i, end));
      i = end;
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      while (j < len && code[j] !== q) {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < len) j++;
      push('string', code.slice(i, j));
      i = j;
      continue;
    }

    // At-rules (@media, @import, @layer, @variant)
    if (ch === '@') {
      let j = i + 1;
      while (j < len && /[A-Za-z0-9_-]/.test(code[j])) j++;
      push('control', code.slice(i, j));
      i = j;
      continue;
    }

    if (ch === '{') {
      braceDepth++;
      push('punctuation', ch);
      i++;
      continue;
    }

    if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      push('punctuation', ch);
      i++;
      continue;
    }

    // Hex colors inside declarations
    if (braceDepth > 0 && ch === '#' && /[0-9a-fA-F]/.test(code[i + 1] || '')) {
      let j = i + 1;
      while (j < len && /[0-9a-fA-F]/.test(code[j])) j++;
      push('string', code.slice(i, j));
      i = j;
      continue;
    }

    // Numbers + units (16px, 1.5rem, 100%, 0.5)
    if (braceDepth > 0 && (isDigit(ch) || (ch === '.' && isDigit(code[i + 1] || '')))) {
      let j = i;
      while (j < len && /[0-9.]/.test(code[j])) j++;
      while (j < len && /[a-zA-Z%]/.test(code[j])) j++;
      push('number', code.slice(i, j));
      i = j;
      continue;
    }

    // CSS custom property (--var)
    if (ch === '-' && code[i + 1] === '-') {
      let j = i + 2;
      while (j < len && /[A-Za-z0-9_-]/.test(code[j])) j++;
      push('property', code.slice(i, j));
      i = j;
      continue;
    }

    // Selectors outside braces vs properties/values inside braces
    if (/[.#A-Za-z_-]/.test(ch)) {
      let j = i + 1;
      while (j < len && /[A-Za-z0-9_-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const after = peekNonSpace(code, j);

      if (braceDepth === 0) {
        push('selector', word);
      } else if (after === ':') {
        push('css-prop', word);
      } else if (after === '(') {
        push('function', word);
      } else {
        push('string', word);
      }
      i = j;
      continue;
    }

    if (/[;:(),]/.test(ch)) {
      push('punctuation', ch);
      i++;
      continue;
    }

    push('plain', ch);
    i++;
  }

  return tokens;
}

/**
 * Tokenizes JSON with distinct key, string, number, and boolean colors.
 */
function tokenizeJson(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const len = code.length;
  let i = 0;

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      tokens.push({ type, value });
    }
  };

  while (i < len) {
    const ch = code[i];

    if (ch === '"') {
      let j = i + 1;
      while (j < len) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      const str = code.slice(i, j);
      const after = peekNonSpace(code, j);
      push(after === ':' ? 'key' : 'string', str);
      i = j;
      continue;
    }

    if (isDigit(ch) || (ch === '-' && isDigit(code[i + 1] || ''))) {
      let j = i + 1;
      while (j < len && /[0-9.eE+-]/.test(code[j])) j++;
      push('number', code.slice(i, j));
      i = j;
      continue;
    }

    if (/[a-z]/.test(ch)) {
      let j = i;
      while (j < len && /[a-z]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (word === 'true' || word === 'false' || word === 'null') {
        push('keyword', word);
      } else {
        push('plain', word);
      }
      i = j;
      continue;
    }

    if (/[{}[\]:,]/.test(ch)) {
      push('punctuation', ch);
      i++;
      continue;
    }

    push('plain', ch);
    i++;
  }

  return tokens;
}

/**
 * Tokenizes YAML and .properties / .env files line-by-line.
 */
function tokenizeKeyValue(code: string, isYaml: boolean): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const lines = code.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#')) {
      tokens.push({ type: 'comment', value: line });
    } else {
      const sepIdx = isYaml ? line.indexOf(':') : line.indexOf('=');
      if (sepIdx > 0) {
        const keyPart = line.slice(0, sepIdx);
        const sepChar = line[sepIdx];
        const valPart = line.slice(sepIdx + 1);
        tokens.push({ type: 'key', value: keyPart });
        tokens.push({ type: 'punctuation', value: sepChar });

        const trimmedVal = valPart.trim();
        if (!trimmedVal) {
          tokens.push({ type: 'plain', value: valPart });
        } else if (/^(true|false|null|~)$/i.test(trimmedVal)) {
          tokens.push({ type: 'keyword', value: valPart });
        } else if (/^-?\d+(\.\d+)?$/.test(trimmedVal)) {
          tokens.push({ type: 'number', value: valPart });
        } else {
          tokens.push({ type: 'string', value: valPart });
        }
      } else {
        tokens.push({ type: 'plain', value: line });
      }
    }
    if (idx < lines.length - 1) {
      tokens.push({ type: 'plain', value: '\n' });
    }
  });

  return tokens;
}

/**
 * Tokenizes Markdown with VS Code headings, inline code, and bullets.
 */
function tokenizeMarkdown(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const lines = code.split('\n');
  let inFence = false;

  lines.forEach((line, idx) => {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      tokens.push({ type: 'md-code', value: line });
    } else if (inFence) {
      tokens.push({ type: 'md-code', value: line });
    } else if (/^#{1,6}\s/.test(line)) {
      tokens.push({ type: 'md-heading', value: line });
    } else {
      // Inline backticks
      const parts = line.split(/(`[^`]+`)/g);
      parts.forEach((part) => {
        if (!part) return;
        if (part.startsWith('`') && part.endsWith('`')) {
          tokens.push({ type: 'md-code', value: part });
        } else {
          tokens.push({ type: 'plain', value: part });
        }
      });
    }
    if (idx < lines.length - 1) {
      tokens.push({ type: 'plain', value: '\n' });
    }
  });

  return tokens;
}

/**
 * Tokenizes SQL queries.
 */
function tokenizeSql(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const len = code.length;
  let i = 0;

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      tokens.push({ type, value });
    }
  };

  while (i < len) {
    const ch = code[i];
    if (ch === '-' && code[i + 1] === '-') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = len;
      push('comment', code.slice(i, end));
      i = end;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      end = end === -1 ? len : end + 2;
      push('comment', code.slice(i, end));
      i = end;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const q = ch;
      let j = i + 1;
      while (j < len && code[j] !== q) {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < len) j++;
      push('string', code.slice(i, j));
      i = j;
      continue;
    }
    if (isDigit(ch)) {
      let j = i;
      while (j < len && /[0-9.]/.test(code[j])) j++;
      push('number', code.slice(i, j));
      i = j;
      continue;
    }
    if (isWordStart(ch)) {
      let j = i + 1;
      while (j < len && isWordChar(code[j])) j++;
      const word = code.slice(i, j);
      const after = peekNonSpace(code, j);
      if (SQL_KEYWORDS.has(word.toUpperCase())) {
        push('keyword', word);
      } else if (after === '(') {
        push('function', word);
      } else {
        push('plain', word);
      }
      i = j;
      continue;
    }
    push('plain', ch);
    i++;
  }

  return tokens;
}

/**
 * Tokenizes Python source files.
 */
function tokenizePython(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const len = code.length;
  let i = 0;

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      tokens.push({ type, value });
    }
  };

  while (i < len) {
    const ch = code[i];
    if (ch === '#') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = len;
      push('comment', code.slice(i, end));
      i = end;
      continue;
    }
    if (ch === '@' && isWordStart(code[i + 1] || '')) {
      let j = i + 1;
      while (j < len && isWordChar(code[j])) j++;
      push('decorator', code.slice(i, j));
      i = j;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      while (j < len && code[j] !== q && code[j] !== '\n') {
        if (code[j] === '\\') j++;
        j++;
      }
      if (j < len && code[j] === q) j++;
      push('string', code.slice(i, j));
      i = j;
      continue;
    }
    if (isDigit(ch)) {
      let j = i;
      while (j < len && /[0-9._]/.test(code[j])) j++;
      push('number', code.slice(i, j));
      i = j;
      continue;
    }
    if (isWordStart(ch)) {
      let j = i + 1;
      while (j < len && isWordChar(code[j])) j++;
      const word = code.slice(i, j);
      const after = peekNonSpace(code, j);
      if (PYTHON_CONTROL_KEYWORDS.has(word)) {
        push('control', word);
      } else if (PYTHON_KEYWORDS.has(word)) {
        push('keyword', word);
      } else if (after === '(') {
        push('function', word);
      } else if (/^[A-Z][A-Za-z0-9_]*$/.test(word)) {
        push('type', word);
      } else {
        push('plain', word);
      }
      i = j;
      continue;
    }
    push('plain', ch);
    i++;
  }

  return tokens;
}

export function tokenizeCode(
  code: string,
  fileName: string,
  language?: string
): SyntaxToken[] {
  const lang = normalizeLang(fileName, language);
  switch (lang) {
    case 'ts':
    case 'js':
    case 'dart':
    case 'kotlin':
      return tokenizeCLike(code, lang);
    case 'html':
      return tokenizeHtml(code);
    case 'css':
      return tokenizeCss(code);
    case 'json':
      return tokenizeJson(code);
    case 'yaml':
      return tokenizeKeyValue(code, true);
    case 'properties':
      return tokenizeKeyValue(code, false);
    case 'markdown':
      return tokenizeMarkdown(code);
    case 'sql':
      return tokenizeSql(code);
    case 'python':
      return tokenizePython(code);
    default:
      return [{ type: 'plain', value: code }];
  }
}

export function renderHighlightedCode(
  code: string,
  fileName: string,
  language?: string
): React.ReactNode {
  const tokens = tokenizeCode(code, fileName, language);
  return tokens.map((tok, idx) =>
    tok.type === 'plain' ? (
      <React.Fragment key={idx}>{tok.value}</React.Fragment>
    ) : (
      <span key={idx} className={`vscode-tok-${tok.type}`}>
        {tok.value}
      </span>
    )
  );
}
