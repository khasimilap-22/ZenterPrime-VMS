import React, { useState, useEffect } from 'react';
import { Search, FileCode, Layers, Plus, UploadCloud, Moon, Sun, X, ArrowRight } from 'lucide-react';
import { CodeFile, VersionRecord } from '../types';
import { FileIcon } from './FileIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: CodeFile[];
  versions: VersionRecord[];
  onSelectFile: (fileId: string) => void;
  onNavigateTab: (tab: 'codebase' | 'versions' | 'settings') => void;
  onOpenNewFileModal: () => void;
  onOpenUploadModal: () => void;
  onToggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  files,
  versions,
  onSelectFile,
  onNavigateTab,
  onOpenNewFileModal,
  onOpenUploadModal,
  onToggleTheme,
  currentTheme,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.path.toLowerCase().includes(query.toLowerCase())
  );

  const filteredVersions = versions.slice(0, 5).filter(
    (v) =>
      v.fileName.toLowerCase().includes(query.toLowerCase()) ||
      v.description.toLowerCase().includes(query.toLowerCase()) ||
      v.hash?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a file name, command, or revision..."
            className="w-full py-3 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none font-sans"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
          >
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
              ESC
            </span>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Actions
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewFileModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-sky-500" />
                  <span>Create New File</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUploadModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <UploadCloud className="w-4 h-4 text-emerald-500" />
                  <span>Upload Code Files</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Ingest</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab('versions');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>Open Versions History</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Audit Log</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  {currentTheme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-sky-400" />
                  )}
                  <span>Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'} Theme</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Appearance</span>
              </button>
            </div>
          </div>

          {/* Files */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Code Files ({filteredFiles.length})
            </div>
            <div className="space-y-0.5">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    onSelectFile(file.id);
                    onNavigateTab('codebase');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-neutral-800 dark:text-neutral-200 hover:bg-sky-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileIcon fileName={file.name} className="shrink-0" />
                    <span className="font-mono text-xs truncate">{file.path}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono tabular-nums shrink-0">
                    {file.lineCount} lines
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Versions */}
          {filteredVersions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Recent Version Revisions
              </div>
              <div className="space-y-0.5">
                {filteredVersions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onNavigateTab('versions');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {v.hash || v.id}
                      </span>
                      <span className="truncate">{v.description}</span>
                    </div>
                    <span className="capitalize text-[10px] text-neutral-400 shrink-0">
                      {v.action}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-[11px] text-neutral-400">
          <span>Navigate with <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
          <span>Open with <kbd className="font-mono">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
