import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Save,
  RotateCcw,
  Copy,
  Check,
  Download,
  GitCommit,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Radio,
} from 'lucide-react';
import { CodeFile, AppSettings } from '../types';
import { formatBytes } from '../utils/storage';
import { FileIcon } from './FileIcon';
import {
  saveFileEditDraft,
  getFileEditDraft,
  clearFileEditDraft,
} from '../utils/draftStorage';
import { SessionRestoredTag } from './SessionRestoredTag';
import { renderHighlightedCode } from '../utils/syntaxHighlight';

interface CodeEditorProps {
  file: CodeFile;
  settings: AppSettings;
  onSave: (fileId: string, updatedContent: string, commitNote: string) => void;
  onDeleteRequest: (file: CodeFile) => void;
  onDirtyChange?: (fileId: string, isDirty: boolean) => void;
  isLivePreviewOpen?: boolean;
  onToggleLivePreview?: () => void;
  onLiveContentChange?: (fileId: string, liveContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  settings,
  onSave,
  onDeleteRequest,
  onDirtyChange,
  isLivePreviewOpen = false,
  onToggleLivePreview,
  onLiveContentChange,
}) => {
  const [content, setContent] = useState(file.content);
  const [commitNote, setCommitNote] = useState('');
  const [showCommitInput, setShowCommitInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const [sessionRestored, setSessionRestored] = useState(false);

  // Keep latest content in ref for unload and offline listeners
  const contentRef = useRef(content);
  contentRef.current = content;

  // Smooth Zoom Feature State
  const [zoomPercent, setZoomPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vms_editor_zoom_v1');
      return saved ? Math.min(250, Math.max(60, Number(saved))) : 100;
    } catch {
      return 100;
    }
  });
  const [showZoomToast, setShowZoomToast] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightLayerRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const editorViewportRef = useRef<HTMLDivElement>(null);
  const touchStateRef = useRef<{ startDist: number; startZoom: number } | null>(null);

  const onDirtyChangeRef = useRef(onDirtyChange);
  useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange;
  }, [onDirtyChange]);

  const onLiveContentChangeRef = useRef(onLiveContentChange);
  useEffect(() => {
    onLiveContentChangeRef.current = onLiveContentChange;
  }, [onLiveContentChange]);

  // Sync content when file changes or restore saved draft from previous session
  useEffect(() => {
    const savedDraft = getFileEditDraft(file.id);
    if (savedDraft !== null && savedDraft !== file.content) {
      setContent(savedDraft);
      setSessionRestored(true);
      onDirtyChangeRef.current?.(file.id, true);
    } else {
      setContent(file.content);
      setSessionRestored(false);
      onDirtyChangeRef.current?.(file.id, false);
    }
    setCommitNote('');
    setShowCommitInput(false);
    if (textareaRef.current) {
      textareaRef.current.scrollTop = 0;
      textareaRef.current.scrollLeft = 0;
    }
    if (highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = 0;
      highlightLayerRef.current.scrollLeft = 0;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = 0;
    }
  }, [file.id, file.content]);

  // Auto-save draft changes to localStorage and sync live preview content immediately
  useEffect(() => {
    onLiveContentChangeRef.current?.(file.id, content);
    if (content !== file.content) {
      saveFileEditDraft(file.id, content);
    } else {
      clearFileEditDraft(file.id);
    }
  }, [content, file.id, file.content]);

  // Safeguard draft during disconnect or tab reload
  useEffect(() => {
    const handleUnloadOrOffline = () => {
      if (contentRef.current !== file.content) {
        saveFileEditDraft(file.id, contentRef.current);
      }
    };
    window.addEventListener('beforeunload', handleUnloadOrOffline);
    window.addEventListener('offline', handleUnloadOrOffline);
    return () => {
      window.removeEventListener('beforeunload', handleUnloadOrOffline);
      window.removeEventListener('offline', handleUnloadOrOffline);
    };
  }, [file.id, file.content]);

  // Cleanup zoom toast timer
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const triggerZoomToast = () => {
    setShowZoomToast(true);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setShowZoomToast(false);
    }, 1400);
  };

  const setZoom = (nextZoom: number | ((prev: number) => number), showFeedback = true) => {
    setZoomPercent((prev) => {
      const target = typeof nextZoom === 'function' ? nextZoom(prev) : nextZoom;
      const clamped = Math.min(250, Math.max(60, Math.round(target)));
      try {
        localStorage.setItem('vms_editor_zoom_v1', clamped.toString());
      } catch {
        // Ignore storage errors
      }
      return clamped;
    });
    if (showFeedback) {
      triggerZoomToast();
    }
  };

  // Zoom listeners: Ctrl+Scroll wheel & Touch Pinch
  useEffect(() => {
    const viewport = editorViewportRef.current;
    if (!viewport) return;

    // Wheel listener for Ctrl + Scroll / Cmd + Scroll
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Prevents whole-page browser zoom
        const isZoomIn = e.deltaY < 0;
        const step = Math.abs(e.deltaY) < 30 ? 4 : 8;
        setZoom((prev) => prev + (isZoomIn ? step : -step));
      }
    };

    // Touch listeners for Pinch-to-zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchStateRef.current = {
          startDist: dist,
          startZoom: zoomPercent,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStateRef.current) {
        e.preventDefault(); // Prevents mobile viewport zooming
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const ratio = dist / touchStateRef.current.startDist;
        const targetZoom = Math.round(touchStateRef.current.startZoom * ratio);
        setZoom(targetZoom);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStateRef.current = null;
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomPercent]);

  const isDirty = content !== file.content;
  const lines = content.split('\n');
  const lineCount = lines.length;

  const updateCursorPosition = () => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    const textBefore = content.substring(0, pos);
    const lineNum = textBefore.split('\n').length;
    const colNum = pos - textBefore.lastIndexOf('\n');
    setCursorPos({ ln: lineNum, col: colNum });
  };

  const handleEditorScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
    if (highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = ta.scrollTop;
      highlightLayerRef.current.scrollLeft = ta.scrollLeft;
    }
  };

  const highlightedCode = useMemo(
    () => renderHighlightedCode(content, file.name, file.language),
    [content, file.name, file.language]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Zoom keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setZoom((z) => z + 10);
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        setZoom((z) => z - 10);
        return;
      }
      if (e.key === '0') {
        e.preventDefault();
        setZoom(100);
        return;
      }
    }

    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(settings.tabSize || 2);

      const nextContent = content.substring(0, start) + spaces + content.substring(end);
      setContent(nextContent);
      onDirtyChangeRef.current?.(file.id, nextContent !== file.content);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
        updateCursorPosition();
      }, 0);
    }

    // Ctrl+S / Cmd+S shortcut to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (isDirty) {
        if (!showCommitInput) {
          setShowCommitInput(true);
        } else {
          executeSave();
        }
      }
    }
  };

  const executeSave = () => {
    if (!isDirty) return;
    const note = commitNote.trim() || `Updated ${file.name} revision`;
    clearFileEditDraft(file.id);
    setSessionRestored(false);
    onSave(file.id, content, note);
    setShowCommitInput(false);
    setCommitNote('');
    onDirtyChangeRef.current?.(file.id, false);
  };

  const handleRevert = () => {
    clearFileEditDraft(file.id);
    setContent(file.content);
    setSessionRestored(false);
    setShowCommitInput(false);
    onDirtyChangeRef.current?.(file.id, false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Breadcrumbs parsing
  const pathParts = file.path.split('/');

  // Font and Line Height Scaling for Zoom Animation
  const baseFontSize = parseInt(settings.fontSize || '14px', 10) || 14;
  const zoomRatio = zoomPercent / 100;
  const effectiveFontSize = Math.round(baseFontSize * zoomRatio * 10) / 10;
  const effectiveLineHeight = Math.round(effectiveFontSize * 1.6 * 10) / 10;
  const gutterWidth = Math.max(42, Math.round(40 * Math.sqrt(zoomRatio)));
  const gutterPadTop = Math.round(12 * zoomRatio);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden font-sans">
      {/* Real Product Sub-Header: Breadcrumbs & Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-[13px] text-neutral-600 dark:text-neutral-400 font-mono overflow-hidden">
          <FileIcon fileName={file.name} className="w-4 h-4 shrink-0" />
          {pathParts.map((part, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
              <span
                className={`${
                  idx === pathParts.length - 1
                    ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {part}
              </span>
            </React.Fragment>
          ))}
          {isDirty && (
            <span className="ml-2 text-xs font-sans font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Modified
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {sessionRestored && (
            <SessionRestoredTag
              size="30px"
              onDismiss={() => setSessionRestored(false)}
              onDiscardDraft={handleRevert}
            />
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="h-[30px] flex items-center justify-center gap-1.5 px-3 text-[13px] text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="h-[30px] flex items-center gap-1.5 px-3 text-[13px] text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
            title="Download this file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {isDirty && (
            <button
              type="button"
              onClick={handleRevert}
              className="h-[30px] flex items-center gap-1.5 px-3 text-[13px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
              title="Discard unsaved edits"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCommitInput((v) => !v)}
            disabled={!isDirty}
            className={`h-[30px] flex items-center gap-1.5 px-3.5 text-[13px] font-medium rounded-md transition-all shadow-xs ${
              isDirty
                ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer active:scale-98'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Revision</span>
          </button>
        </div>
      </div>

      {/* Commit message input bar */}
      {showCommitInput && isDirty && (
        <div className="flex items-center gap-2.5 px-4 py-2 bg-sky-50 dark:bg-neutral-950 border-b border-sky-200 dark:border-neutral-800 animate-in slide-in-from-top duration-150">
          <GitCommit className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <input
            type="text"
            value={commitNote}
            onChange={(e) => setCommitNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                executeSave();
              }
            }}
            placeholder={`Commit note for ${file.name}...`}
            className="flex-1 min-w-0 h-[35px] px-3 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
            autoFocus
          />
          <button
            type="button"
            onClick={executeSave}
            className="h-[35px] px-3.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Commit
          </button>
          <button
            type="button"
            onClick={() => setShowCommitInput(false)}
            className="h-[35px] px-3 flex items-center justify-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor Viewport Container with Pinch & Ctrl+Scroll handling */}
      <div
        ref={editorViewportRef}
        className="flex-1 relative flex overflow-hidden font-mono select-text"
        title="Ctrl + Scroll or Pinch to zoom"
      >
        {/* Floating Zoom Toast / Indicator Pill */}
        <div
          className={`absolute top-3 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 dark:bg-neutral-100/90 text-white dark:text-neutral-900 shadow-lg backdrop-blur-xs text-xs font-mono font-medium transition-all duration-200 pointer-events-none select-none ${
            showZoomToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Zoom: {zoomPercent}%</span>
          <span className="text-xs opacity-75 font-sans">(Ctrl + Scroll / Pinch)</span>
        </div>

        {/* Line Numbers Gutter */}
        {settings.showLineNumbers && (
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="shrink-0 select-none text-right pr-2 bg-neutral-50/80 dark:bg-neutral-950/70 border-r border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 tabular-nums overflow-hidden font-mono"
            style={{
              width: `${gutterWidth}px`,
              paddingTop: `${gutterPadTop}px`,
              transition:
                'width 180ms cubic-bezier(0.16, 1, 0.3, 1), padding-top 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {lines.map((_, idx) => (
              <div
                key={idx}
                className={`${cursorPos.ln === idx + 1 ? 'text-neutral-900 dark:text-neutral-200 font-semibold' : ''}`}
                style={{
                  height: `${effectiveLineHeight}px`,
                  lineHeight: `${effectiveLineHeight}px`,
                  fontSize: `${Math.max(10, Math.round(effectiveFontSize * 0.82 * 10) / 10)}px`,
                  transition:
                    'height 180ms cubic-bezier(0.16, 1, 0.3, 1), line-height 180ms cubic-bezier(0.16, 1, 0.3, 1), font-size 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        )}

        {/* Synchronized VS Code Syntax-Highlighted Code Area */}
        <div className="relative flex-1 min-w-0 h-full overflow-hidden">
          {/* Syntax Highlighted Backdrop */}
          <pre
            ref={highlightLayerRef}
            aria-hidden="true"
            className={`vscode-code absolute inset-0 m-0 w-full h-full overflow-hidden pointer-events-none select-none font-mono ${
              settings.codeWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${effectiveFontSize}px`,
              lineHeight: `${effectiveLineHeight}px`,
              padding: `${Math.max(10, Math.round(12 * zoomRatio))}px`,
              letterSpacing: '0px',
              tabSize: settings.tabSize || 2,
              scrollbarGutter: 'stable',
              transition:
                'font-size 180ms cubic-bezier(0.16, 1, 0.3, 1), line-height 180ms cubic-bezier(0.16, 1, 0.3, 1), padding 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {content ? (
              <>
                {highlightedCode}
                {content.endsWith('\n') ? ' ' : ''}
              </>
            ) : (
              <span className="text-neutral-400 dark:text-neutral-600">File content...</span>
            )}
          </pre>

          {/* Transparent Editable Textarea Overlay */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              const nextVal = e.target.value;
              setContent(nextVal);
              updateCursorPosition();
              onDirtyChangeRef.current?.(file.id, nextVal !== file.content);
            }}
            onScroll={handleEditorScroll}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label={`Code editor for ${file.name}`}
            className={`absolute inset-0 w-full h-full m-0 border-0 bg-transparent text-transparent caret-neutral-900 dark:caret-sky-400 selection:bg-sky-500/25 focus:outline-none resize-none font-mono ${
              settings.codeWrap
                ? 'whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden'
                : 'whitespace-pre overflow-auto'
            }`}
            style={{
              fontSize: `${effectiveFontSize}px`,
              lineHeight: `${effectiveLineHeight}px`,
              padding: `${Math.max(10, Math.round(12 * zoomRatio))}px`,
              letterSpacing: '0px',
              tabSize: settings.tabSize || 2,
              scrollbarGutter: 'stable',
              WebkitTextFillColor: 'transparent',
              transition:
                'font-size 180ms cubic-bezier(0.16, 1, 0.3, 1), line-height 180ms cubic-bezier(0.16, 1, 0.3, 1), padding 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Professional Developer Status Bar with Integrated Zoom Controls */}
      <div className="h-[40px] flex items-center justify-between px-4 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950 select-none font-sans">
        {/* Left: Position & Metrics */}
        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums">
            Ln {cursorPos.ln}, Col {cursorPos.col}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="font-mono tabular-nums">{lineCount} lines</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="font-mono tabular-nums">{formatBytes(new Blob([content]).size)}</span>
        </div>

        {/* Right: Environment, Language & Smooth Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Level Control Pill */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300"
            title="Ctrl + Scroll or Pinch to zoom in/out"
          >
            <button
              type="button"
              onClick={() => setZoom((z) => z - 10)}
              disabled={zoomPercent <= 60}
              className="p-0.5 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Zoom out (Ctrl + -)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setZoom(100)}
              className="font-mono tabular-nums text-xs px-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium cursor-pointer"
              title="Reset Zoom to 100% (Ctrl + 0)"
            >
              {zoomPercent}%
            </button>

            <button
              type="button"
              onClick={() => setZoom((z) => z + 10)}
              disabled={zoomPercent >= 250}
              className="p-0.5 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Zoom in (Ctrl + +)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {zoomPercent !== 100 && (
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline ml-0.5 cursor-pointer"
                title="Reset to 100%"
              >
                Reset
              </button>
            )}
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="font-mono">Spaces: {settings.tabSize || 2}</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="font-mono">UTF-8</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="capitalize font-mono text-neutral-700 dark:text-neutral-300">
            {file.language}
          </span>
          {onToggleLivePreview && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <button
                type="button"
                onClick={onToggleLivePreview}
                className={`h-[24px] px-2.5 inline-flex items-center gap-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isLivePreviewOpen
                    ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-[#0284c7]/12 hover:text-[#0284c7] dark:hover:text-sky-400'
                }`}
                title={isLivePreviewOpen ? 'Close Live Preview' : 'Open Live Preview side-panel'}
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span>{isLivePreviewOpen ? 'Live' : 'Go Live'}</span>
              </button>
            </>
          )}
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <button
            type="button"
            onClick={() => onDeleteRequest(file)}
            className="text-neutral-500 dark:text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
