import React, { useState, useEffect } from 'react';
import { X, GitMerge, Check, Box, AlertCircle } from 'lucide-react';
import { CodeSpace } from '../../types';

interface MergeCodeSpacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeSpaces: CodeSpace[];
  onMergeToGroup: (groupTitle: string, groupDescription: string, selectedIds: string[]) => void;
}

export const MergeCodeSpacesModal: React.FC<MergeCodeSpacesModalProps> = ({
  isOpen,
  onClose,
  codeSpaces,
  onMergeToGroup,
}) => {
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGroupTitle(`Group ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`);
      setGroupDescription('');
      setSelectedIds(codeSpaces.slice(0, 2).map((c) => c.id));
      setError('');
    }
  }, [isOpen, codeSpaces]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (error) setError('');
  };

  const handleSelectAll = () => {
    if (selectedIds.length === codeSpaces.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(codeSpaces.map((c) => c.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleTrimmed = groupTitle.trim();
    if (!titleTrimmed) {
      setError('Please provide a Group Title');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Please select at least one CodeSpace to group');
      return;
    }

    onMergeToGroup(titleTrimmed, groupDescription.trim(), selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-sans"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Merge CodeSpaces into Group
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Group and manage related workspaces together
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group Metadata */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Group Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupTitle}
                onChange={(e) => {
                  setGroupTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Core Services, Micro-frontends, Release A"
                className="w-full h-8.5 px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Group Description <span className="text-neutral-400 dark:text-neutral-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Short description of this group..."
                className="w-full h-8.5 px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
              />
            </div>
          </div>

          {/* Selection List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Select CodeSpaces to Group ({selectedIds.length} of {codeSpaces.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {selectedIds.length === codeSpaces.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-100 dark:divide-neutral-800">
              {codeSpaces.map((cs) => {
                const isSelected = selectedIds.includes(cs.id);
                return (
                  <div
                    key={cs.id}
                    onClick={() => toggleSelect(cs.id)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/60 dark:bg-sky-950/30'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#0284c7] border-[#0284c7] text-white'
                            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                        <div>
                          <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            <span>{cs.name}</span>
                            {cs.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 font-mono">
                                Default
                              </span>
                            )}
                          </div>
                          {cs.description && (
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                              {cs.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      {cs.files ? cs.files.length : 0} files
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              disabled={selectedIds.length === 0}
              className="h-8.5 px-4 flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Create Merged Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
