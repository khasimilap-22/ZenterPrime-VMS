import React, { useState, useEffect } from 'react';
import { X, Box, Copy, Plus } from 'lucide-react';
import { CodeSpace } from '../../types';

interface CreateEditCodeSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, cloneFromCurrent: boolean) => void;
  editingCodeSpace?: CodeSpace | null;
  activeCodeSpaceName?: string;
}

export const CreateEditCodeSpaceModal: React.FC<CreateEditCodeSpaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCodeSpace,
  activeCodeSpaceName,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cloneFromCurrent, setCloneFromCurrent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCodeSpace) {
      setName(editingCodeSpace.name);
      setDescription(editingCodeSpace.description || '');
      setCloneFromCurrent(false);
    } else {
      setName('');
      setDescription('');
      setCloneFromCurrent(false);
    }
    setError('');
  }, [editingCodeSpace, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please provide a name for the CodeSpace');
      return;
    }
    onSave(trimmed, description.trim(), cloneFromCurrent);
    onClose();
  };

  const isEditing = !!editingCodeSpace;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-sans"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {isEditing ? 'Edit CodeSpace' : 'Create New CodeSpace'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isEditing
                  ? 'Update title and description'
                  : 'Scaffold an isolated environment for your code'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              CodeSpace Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. feature/auth-service or experimentation"
              autoFocus
              className="w-full h-8.5 px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description <span className="text-neutral-400 dark:text-neutral-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose of this workspace environment..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans resize-none"
            />
          </div>

          {!isEditing && (
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Initial Contents
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCloneFromCurrent(false)}
                  className={`p-3 text-left border rounded-lg transition-all cursor-pointer ${
                    !cloneFromCurrent
                      ? 'border-sky-500 dark:border-sky-500 bg-sky-50/40 dark:bg-sky-950/30 ring-1 ring-sky-500/50'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    <Plus className="w-3.5 h-3.5 text-sky-500" />
                    <span>Blank Space</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Fresh workspace with no files or folders.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCloneFromCurrent(true)}
                  className={`p-3 text-left border rounded-lg transition-all cursor-pointer ${
                    cloneFromCurrent
                      ? 'border-sky-500 dark:border-sky-500 bg-sky-50/40 dark:bg-sky-950/30 ring-1 ring-sky-500/50'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    <Copy className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Branch Active</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    Copy from {activeCodeSpaceName || 'current'}.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
              className="h-8.5 px-4 text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create CodeSpace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
