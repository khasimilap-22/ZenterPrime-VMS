import React, { useEffect, useMemo, useState } from 'react';
import {
  Radio,
  RotateCw,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Terminal,
  Trash2,
} from 'lucide-react';
import { CodeFile, ThemeMode } from '../types';
import {
  buildLivePreviewDocument,
  PREVIEW_CONSOLE_CHANNEL,
} from '../utils/livePreviewBuilder';

interface LivePreviewPanelProps {
  files: CodeFile[];
  activeFile: CodeFile | null;
  theme: ThemeMode;
  width: number;
  isResizing: boolean;
  onStartResize: (e: React.MouseEvent) => void;
  onClose: () => void;
}

type ViewportPreset = 'desktop' | 'tablet' | 'mobile';

interface ConsoleEntry {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  time: string;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  files,
  activeFile,
  theme,
  width,
  isResizing,
  onStartResize,
  onClose,
}) => {
  const [viewport, setViewport] = useState<ViewportPreset>('desktop');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);

  // Debounce live file content updates so typing stays buttery-smooth
  const [debouncedFiles, setDebouncedFiles] = useState<CodeFile[]>(files);
  const [debouncedActiveFile, setDebouncedActiveFile] = useState<CodeFile | null>(activeFile);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFiles(files);
      setDebouncedActiveFile(activeFile);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [files, activeFile]);

  const previewResult = useMemo(
    () => buildLivePreviewDocument(debouncedFiles, debouncedActiveFile, theme),
    [debouncedFiles, debouncedActiveFile, theme]
  );

  // Listen for console output & runtime errors from the sandboxed preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.channel !== PREVIEW_CONSOLE_CHANNEL) return;
      const entry: ConsoleEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        level: data.level || 'log',
        message: String(data.message ?? ''),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
      setConsoleLogs((prev) => [...prev.slice(-99), entry]);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    setConsoleLogs([]);
    setReloadNonce((n) => n + 1);
  };

  const errorCount = consoleLogs.filter((l) => l.level === 'error').length;

  const iframeWidthClass =
    viewport === 'mobile'
      ? 'w-[375px] max-w-full rounded-lg border border-neutral-300 dark:border-neutral-700 shadow-sm'
      : viewport === 'tablet'
      ? 'w-[768px] max-w-full rounded-lg border border-neutral-300 dark:border-neutral-700 shadow-sm'
      : 'w-full h-full';

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative shrink-0 flex flex-col h-full border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 select-none"
    >
      {/* Left Vertical Drag Handle */}
      <div
        onMouseDown={onStartResize}
        title="Drag to resize Live Preview"
        className="absolute left-0 top-0 bottom-0 w-1.5 -ml-[3px] z-20 cursor-col-resize hover:bg-[#0284c7]/50 active:bg-[#0284c7] transition-colors"
      />

      {/* Preview Panel Header */}
      <div className="h-[42px] shrink-0 flex items-center justify-between gap-2 px-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/70">
        <div className="flex items-center gap-2 min-w-0">
          <Radio className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 shrink-0" />
          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            Live Preview
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span
            className="text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate"
            title={previewResult.entryPath}
          >
            {previewResult.entryPath}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Responsive Viewport Switcher */}
          <div className="hidden sm:flex items-center p-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 mr-1">
            {(
              [
                { id: 'desktop', icon: Monitor, label: 'Desktop (100%)' },
                { id: 'tablet', icon: Tablet, label: 'Tablet (768px)' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile (375px)' },
              ] as const
            ).map((preset) => {
              const Icon = preset.icon;
              const active = viewport === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setViewport(preset.id)}
                  title={preset.label}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-neutral-900 text-[#0284c7] dark:text-sky-400 shadow-2xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowConsole((v) => !v)}
            title="Toggle Preview Console"
            className={`h-[26px] px-2 flex items-center gap-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              showConsole
                ? 'bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            {consoleLogs.length > 0 && (
              <span
                className={`font-mono tabular-nums text-xs ${
                  errorCount > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''
                }`}
              >
                {consoleLogs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Live Preview"
            className="w-[26px] h-[26px] flex items-center justify-center rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Live Preview"
            className="w-[26px] h-[26px] flex items-center justify-center rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sandboxed Live Preview Frame */}
      <div
        className={`flex-1 min-h-0 flex justify-center overflow-auto ${
          viewport === 'desktop'
            ? 'bg-white dark:bg-neutral-950'
            : 'p-4 bg-neutral-100 dark:bg-neutral-950'
        }`}
      >
        <iframe
          key={`${previewResult.entryPath}-${reloadNonce}`}
          srcDoc={previewResult.html}
          sandbox="allow-scripts allow-forms allow-modals"
          title={`Live Preview: ${previewResult.entryPath}`}
          className={`bg-white border-0 ${iframeWidthClass} ${
            isResizing ? 'pointer-events-none' : ''
          }`}
          style={viewport === 'desktop' ? undefined : { height: '100%' }}
        />
      </div>

      {/* Collapsible Preview Console Output */}
      {showConsole && (
        <div className="h-36 shrink-0 flex flex-col border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="h-[30px] px-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Preview Console ({consoleLogs.length})
            </span>
            <button
              type="button"
              onClick={() => setConsoleLogs([])}
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 cursor-pointer"
              title="Clear console"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs space-y-1 select-text">
            {consoleLogs.length === 0 ? (
              <div className="text-neutral-400 dark:text-neutral-600">
                No console output yet.
              </div>
            ) : (
              consoleLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start justify-between gap-2 ${
                    log.level === 'error'
                      ? 'text-rose-600 dark:text-rose-400'
                      : log.level === 'warn'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words flex-1">{log.message}</span>
                  <span className="text-neutral-400 dark:text-neutral-600 shrink-0 tabular-nums">
                    {log.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
