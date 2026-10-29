import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { CodeFile } from '../types';

interface DeleteConfirmModalProps {
  file: CodeFile;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fileId: string, reason: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  file,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('Deleted file from repository codebase');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(file.id, reason.trim() || 'Deleted file from repository codebase');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="delete-modal-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Confirm File Deletion
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Removal and audit tombstone record
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs leading-relaxed text-rose-800 dark:text-rose-300">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-semibold mb-1">Permanent Code Removal</p>
                <p>
                  You are about to delete <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{file.path}</span>. This file will be removed from your active codebase.
                </p>
                <p className="mt-2 text-rose-700/90 dark:text-rose-300/90">
                  Per system protocol, a deletion record will be registered in the <span className="font-medium underline">Versions &gt; Deleted</span> log showing only the file name and timestamp. Insider content will not be retained or shown.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Deletion Reason / Audit Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Deprecated module, replaced with new storage core"
              className="w-full h-8.5 px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="h-8.5 px-3.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-8.5 px-4 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-md transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Deletion</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
