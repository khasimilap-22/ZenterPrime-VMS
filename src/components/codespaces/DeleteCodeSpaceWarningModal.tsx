import React from 'react';
import { AlertTriangle, Trash2, X, FileCode, History } from 'lucide-react';
import { CodeSpace } from '../../types';

interface DeleteCodeSpaceWarningModalProps {
  isOpen: boolean;
  codeSpace: CodeSpace | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteCodeSpaceWarningModal: React.FC<DeleteCodeSpaceWarningModalProps> = ({
  isOpen,
  codeSpace,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !codeSpace) return null;

  const fileCount = codeSpace.files ? codeSpace.files.length : 0;
  const versionCount = codeSpace.versions ? codeSpace.versions.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/60 rounded-xl shadow-2xl overflow-hidden font-sans"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Header with Danger Accent */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 dark:border-red-950/80 bg-red-50/60 dark:bg-red-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-950 dark:text-red-200">
                Delete CodeSpace
              </h3>
              <p className="text-xs text-red-700/80 dark:text-red-400/80">
                Permanent deletion confirmation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
              {codeSpace.name}
            </span>
            ?
          </div>

          {/* Warning Callout */}
          <div className="p-3.5 bg-red-500/10 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-700 dark:text-red-300 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-red-800 dark:text-red-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Destructive Action: Code Files Will Be Erased</span>
            </div>
            <p className="text-[11px] leading-relaxed text-red-600 dark:text-red-300/90">
              Deleting this CodeSpace will permanently wipe all code files and revision history inside it. This action is irreversible.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-neutral-400" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{fileCount}</span>
                <span className="text-neutral-500 dark:text-neutral-400 ml-1">file{fileCount === 1 ? '' : 's'} lost</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-neutral-400" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{versionCount}</span>
                <span className="text-neutral-500 dark:text-neutral-400 ml-1">version{versionCount === 1 ? '' : 's'} lost</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="h-[35px] px-3.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(codeSpace.id);
                onClose();
              }}
              className="h-[35px] px-4 flex items-center gap-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permanently Delete CodeSpace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
