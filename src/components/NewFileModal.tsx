import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, FileCode, WifiOff } from 'lucide-react';
import { detectLanguage } from '../utils/storage';
import {
  saveNewFileDraft,
  getNewFileDraft,
  clearNewFileDraft,
} from '../utils/draftStorage';
import { SessionRestoredTag } from './SessionRestoredTag';

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, path: string, content: string, description: string) => void;
  codeSpaceId?: string;
}

const DEFAULT_FILE_PATH = 'src/utils/helpers.ts';
const DEFAULT_CONTENT = '// New code file\nexport function helper() {\n  return true;\n}\n';
const DEFAULT_DESCRIPTION = 'Created new file inside workspace';

const TEMPLATES = [
  {
    label: 'TypeScript',
    fileName: 'service.ts',
    defaultPath: 'src/services/service.ts',
    content: `export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function executeTask(): Promise<ServiceResponse<{ executed: boolean }>> {
  return {
    success: true,
    data: { executed: true },
  };
}
`,
  },
  {
    label: 'React Component',
    fileName: 'Widget.tsx',
    defaultPath: 'src/components/Widget.tsx',
    content: `import React from 'react';

interface WidgetProps {
  title: string;
}

export const Widget: React.FC<WidgetProps> = ({ title }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-neutral-500">Component initialized.</p>
    </div>
  );
};
`,
  },
  {
    label: 'JSON Config',
    fileName: 'config.json',
    defaultPath: 'config/settings.json',
    content: `{\n  "version": "1.0.0",\n  "enabled": true,\n  "retries": 3\n}\n`,
  },
  {
    label: 'Empty File',
    fileName: 'script.ts',
    defaultPath: 'src/script.ts',
    content: '',
  },
];

export const NewFileModal: React.FC<NewFileModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  codeSpaceId = 'default',
}) => {
  const [filePath, setFilePath] = useState(DEFAULT_FILE_PATH);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [error, setError] = useState<string | null>(null);
  const [wasRestored, setWasRestored] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const activeId = codeSpaceId || 'default';
  const latestValuesRef = useRef({ filePath, content, description });
  latestValuesRef.current = { filePath, content, description };

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      // Immediately flush current draft on disconnect
      saveNewFileDraft(activeId, latestValuesRef.current);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeId]);

  // Load existing draft on open / mount
  useEffect(() => {
    if (isOpen) {
      const existingDraft = getNewFileDraft(activeId);
      if (existingDraft && (existingDraft.content !== undefined || existingDraft.filePath)) {
        setFilePath(existingDraft.filePath || DEFAULT_FILE_PATH);
        setContent(existingDraft.content ?? DEFAULT_CONTENT);
        setDescription(existingDraft.description || DEFAULT_DESCRIPTION);
        setWasRestored(true);
      }
    }
  }, [isOpen, activeId]);

  // Real-time persistence: auto-save draft to localStorage whenever fields change
  useEffect(() => {
    if (!isOpen) return;
    saveNewFileDraft(activeId, { filePath, content, description });
  }, [filePath, content, description, isOpen, activeId]);

  // Window unload listener (page reload, close tab, etc.)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isOpen) {
        saveNewFileDraft(activeId, latestValuesRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen, activeId]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setFilePath(tpl.defaultPath);
    setContent(tpl.content);
    setDescription(`Created ${tpl.fileName} from ${tpl.label} template`);
  };

  const handleDiscardDraft = () => {
    clearNewFileDraft(activeId);
    setFilePath(DEFAULT_FILE_PATH);
    setContent(DEFAULT_CONTENT);
    setDescription(DEFAULT_DESCRIPTION);
    setWasRestored(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPath = filePath.trim().replace(/^\/+/, '');
    if (!cleanPath) {
      setError('File path cannot be empty.');
      return;
    }
    const fileName = cleanPath.split('/').pop() || cleanPath;
    if (!fileName.includes('.')) {
      setError('Please provide a file extension (e.g. .ts, .js, .json, .md).');
      return;
    }

    // Clear saved draft once created successfully
    clearNewFileDraft(activeId);
    setWasRestored(false);

    onCreate(fileName, cleanPath, content, description.trim() || 'Created new code file');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-file-title"
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="new-file-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Create New Code File
                </h3>
                {!isOnline && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <WifiOff className="w-3 h-3" />
                    Offline Draft Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Define path, template, and initial contents. Draft is auto-saved locally.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Golden Tag: Previous Session Restored Successfully */}
        {wasRestored && (
          <div className="px-5 pt-3.5 pb-0">
            <SessionRestoredTag
              size="35px"
              className="w-full justify-between"
              onDiscardDraft={handleDiscardDraft}
              onDismiss={() => setWasRestored(false)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                File Path &amp; Name <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Templates:</span>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => handleApplyTemplate(t)}
                    className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={filePath}
                onChange={(e) => {
                  setFilePath(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. src/auth/tokenValidator.ts"
                className="w-full h-8.5 pl-8 pr-3 text-xs font-mono bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
              <FileCode className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              Detected language: <span className="font-mono text-neutral-700 dark:text-neutral-300">{detectLanguage(filePath)}</span>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Initial Code Content
              </label>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Auto-saved to draft
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y"
              placeholder="// Write or paste initial file code..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Creation Note / Version Summary
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Initialized token validator routine"
              className="w-full h-8.5 px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              {wasRestored && (
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="h-8.5 px-3 text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-amber-500/10 rounded-md transition-colors cursor-pointer"
                >
                  Discard Restored Draft
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-8.5 px-3.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-md transition-colors cursor-pointer"
              >
                Close (Keep Draft)
              </button>
              <button
                type="submit"
                className="h-8.5 px-4 flex items-center gap-1.5 text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] rounded-md transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Create File</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
