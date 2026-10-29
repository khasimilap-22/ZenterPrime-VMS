import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  GripVertical,
  Pin,
  Pencil,
  Trash2,
  MinusCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import { CodeSpace, CodeSpaceGroup } from '../../types';

interface GroupEditorModalProps {
  isOpen: boolean;
  group: CodeSpaceGroup | null;
  codeSpaces: CodeSpace[];
  onClose: () => void;
  onSaveGroup: (updatedGroup: CodeSpaceGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditCodeSpace: (codeSpace: CodeSpace) => void;
  onDeleteCodeSpaceRequest: (codeSpace: CodeSpace) => void;
}

export const GroupEditorModal: React.FC<GroupEditorModalProps> = ({
  isOpen,
  group,
  codeSpaces,
  onClose,
  onSaveGroup,
  onDeleteGroup,
  onEditCodeSpace,
  onDeleteCodeSpaceRequest,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [pinNotice, setPinNotice] = useState<string | null>(null);
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);

  useEffect(() => {
    if (group && isOpen) {
      setTitle(group.name);
      setDescription(group.description || '');
      const validIds = group.codespaceIds.filter((id) =>
        codeSpaces.some((cs) => cs.id === id)
      );
      setOrderedIds(validIds);
      setPinnedIds(group.pinnedIds || []);
      setPinNotice(null);
      setIsAddPickerOpen(false);
    }
  }, [group, isOpen, codeSpaces]);

  if (!isOpen || !group) return null;

  // Pin toggle: maximum of 2 allowed
  const handleTogglePin = (id: string) => {
    setPinNotice(null);
    if (pinnedIds.includes(id)) {
      setPinnedIds((prev) => prev.filter((item) => item !== id));
    } else {
      if (pinnedIds.length >= 2) {
        setPinNotice('Maximum of 2 CodeSpaces can be pinned in a group.');
        setTimeout(() => setPinNotice(null), 3500);
        return;
      }
      setPinnedIds((prev) => [...prev, id]);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const nextList = [...orderedIds];
    const [movedItem] = nextList.splice(draggedIdx, 1);
    nextList.splice(index, 0, movedItem);
    setOrderedIds(nextList);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Manual move up/down
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedIds.length) return;
    const nextList = [...orderedIds];
    const [item] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, item);
    setOrderedIds(nextList);
  };

  // Removing from group vs deleting
  const handleRemoveFromGroup = (idToRemove: string) => {
    setOrderedIds((prev) => prev.filter((id) => id !== idToRemove));
    setPinnedIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  const handleAddCodeSpaceToGroup = (idToAdd: string) => {
    if (!orderedIds.includes(idToAdd)) {
      setOrderedIds((prev) => [...prev, idToAdd]);
    }
    setIsAddPickerOpen(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onSaveGroup({
      ...group,
      name: trimmedTitle,
      description: description.trim(),
      codespaceIds: orderedIds,
      pinnedIds: pinnedIds.filter((pid) => orderedIds.includes(pid)).slice(0, 2),
      updatedAt: Date.now(),
    });
    onClose();
  };

  const availableToAdd = codeSpaces.filter((cs) => !orderedIds.includes(cs.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Group Editor
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage group details, reorder workspaces, and pin priority items
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Group Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Group Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Group name"
                required
                className="w-full h-8.5 px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Group Description <span className="text-neutral-400 dark:text-neutral-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of this grouped collection..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans resize-none"
              />
            </div>
          </div>

          {/* CodeSpaces Section */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  CodeSpaces ({orderedIds.length})
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Drag to re-order. Pin up to 2 items. Removing unlinks from group; Deleting erases code files.
                </p>
              </div>

              {availableToAdd.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAddPickerOpen((prev) => !prev)}
                    className="flex items-center gap-1 h-7 px-2.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-neutral-800 rounded-md border border-sky-300 dark:border-sky-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add CodeSpace</span>
                  </button>

                  {isAddPickerOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1 z-30">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                        Select to add to group
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                        {availableToAdd.map((cs) => (
                          <button
                            key={cs.id}
                            type="button"
                            onClick={() => handleAddCodeSpaceToGroup(cs.id)}
                            className="w-full px-3 py-1.5 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{cs.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {cs.files ? cs.files.length : 0} files
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pin notification */}
            {pinNotice && (
              <div className="p-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-md flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{pinNotice}</span>
              </div>
            )}

            {/* CodeSpaces List */}
            {orderedIds.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                No CodeSpaces currently in this group. Use &quot;Add CodeSpace&quot; above.
              </div>
            ) : (
              <div className="space-y-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5 bg-neutral-50/50 dark:bg-neutral-950/50">
                {orderedIds.map((csId, index) => {
                  const cs = codeSpaces.find((c) => c.id === csId);
                  if (!cs) return null;
                  const isPinned = pinnedIds.includes(cs.id);
                  const isDragging = draggedIdx === index;
                  const isOver = dragOverIdx === index;

                  return (
                    <div
                      key={cs.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all select-none ${
                        isDragging
                          ? 'opacity-40 border-dashed border-sky-400 bg-sky-50/40 dark:bg-sky-950/40'
                          : isOver
                          ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      {/* Left: Drag Handle & Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Order index badge */}
                        <span className="w-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 text-center">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                              {cs.name}
                            </span>
                            {isPinned && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                <span>Pinned</span>
                              </span>
                            )}
                            {cs.isDefault && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 font-mono">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            {cs.files ? cs.files.length : 0} files &bull; {cs.versions ? cs.versions.length : 0} versions
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* Up/Down buttons */}
                        <div className="hidden sm:flex items-center mr-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveItem(index, 'up')}
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 transition-colors cursor-pointer"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === orderedIds.length - 1}
                            onClick={() => moveItem(index, 'down')}
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 transition-colors cursor-pointer"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Pin toggle button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePin(cs.id)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            isPinned
                              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                              : 'text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                          title={isPinned ? 'Unpin CodeSpace' : 'Pin CodeSpace (max 2)'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                        </button>

                        {/* Edit CodeSpace */}
                        <button
                          type="button"
                          onClick={() => onEditCodeSpace(cs)}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Edit CodeSpace title / description"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove from Group */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromGroup(cs.id)}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Remove from group (keeps CodeSpace)"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete CodeSpace */}
                        <button
                          type="button"
                          onClick={() => onDeleteCodeSpaceRequest(cs)}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Permanently delete CodeSpace & files"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Group Deletion and Save */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Disband group "${group.name}"? All CodeSpaces will remain safe.`)) {
                  onDeleteGroup(group.id);
                  onClose();
                }
              }}
              className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Group</span>
            </button>

            <div className="flex items-center gap-2">
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
                Save Group Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
