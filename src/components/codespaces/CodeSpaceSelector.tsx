import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Box,
  Plus,
  GitMerge,
  Pencil,
  Trash2,
  Check,
  Search,
  Pin,
  Layers,
  Settings2,
} from 'lucide-react';
import { CodeSpace, CodeSpaceGroup } from '../../types';

interface CodeSpaceSelectorProps {
  codeSpaces: CodeSpace[];
  activeCodeSpaceId: string;
  groups: CodeSpaceGroup[];
  onSelectCodeSpace: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (codeSpace: CodeSpace) => void;
  onOpenDeleteWarningModal: (codeSpace: CodeSpace) => void;
  onOpenMergeModal: () => void;
  onOpenGroupEditorModal: (group: CodeSpaceGroup) => void;
}

export const CodeSpaceSelector: React.FC<CodeSpaceSelectorProps> = ({
  codeSpaces,
  activeCodeSpaceId,
  groups,
  onSelectCodeSpace,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDeleteWarningModal,
  onOpenMergeModal,
  onOpenGroupEditorModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCodeSpace =
    codeSpaces.find((c) => c.id === activeCodeSpaceId) || codeSpaces[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filteredCodeSpaces = codeSpaces.filter((cs) =>
    cs.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Trigger Button: replaces the branch badge */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ height: '25px' }}
        className="flex items-center justify-between gap-1.5 px-2.5 h-[25px] min-w-[130px] max-w-[210px] rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors shadow-2xs group cursor-pointer"
        title={`Active CodeSpace: ${activeCodeSpace?.name || 'Default CodeSpace'}`}
      >
        <span className="text-xs font-medium truncate font-sans">
          {activeCodeSpace?.name || 'Default CodeSpace'}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 font-sans">
          {/* Top Search Input */}
          <div className="p-2.5 border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter CodeSpaces..."
                autoFocus
                className="w-full h-[30px] pl-8 pr-2.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
              />
            </div>
          </div>

          {/* CodeSpaces List & Groups View */}
          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {/* 1. Standalone CodeSpaces List */}
            <div className="p-1.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                CodeSpaces
              </div>

              {filteredCodeSpaces.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
                  No matching CodeSpaces found
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredCodeSpaces.map((cs) => {
                    const isActive = cs.id === activeCodeSpaceId;
                    return (
                      <div
                        key={cs.id}
                        className={`group/row flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-medium'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                        }`}
                        onClick={() => {
                          onSelectCodeSpace(cs.id);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                            {isActive ? (
                              <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            ) : (
                              <Box className="w-3.5 h-3.5 text-neutral-400 group-hover/row:text-neutral-600 dark:group-hover/row:text-neutral-300" />
                            )}
                          </div>
                          <span className="truncate">{cs.name}</span>
                          {cs.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 font-mono">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Hover Actions: Edit and Delete icons appear on hover */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 group-hover/row:hidden">
                            {cs.files ? cs.files.length : 0}f
                          </span>

                          <div className="hidden group-hover/row:flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onOpenEditModal(cs);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                              title="Edit CodeSpace title / description"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onOpenDeleteWarningModal(cs);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                              title="Delete CodeSpace"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Groups Section */}
            {groups.length > 0 && (
              <div className="p-1.5">
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Groups
                </div>

                <div className="space-y-1.5">
                  {groups.map((grp) => {
                    const memberCodeSpaces = grp.codespaceIds
                      .map((id) => codeSpaces.find((c) => c.id === id))
                      .filter((c): c is CodeSpace => Boolean(c));

                    return (
                      <div
                        key={grp.id}
                        className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/50 p-1.5"
                      >
                        {/* Group Header */}
                        <div
                          onClick={() => {
                            setIsOpen(false);
                            onOpenGroupEditorModal(grp);
                          }}
                          className="flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors group/grpHdr"
                          title="Click to open Group Editor"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Layers className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover/grpHdr:text-sky-600 dark:group-hover/grpHdr:text-sky-400">
                              {grp.name}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              ({memberCodeSpaces.length})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-neutral-400 group-hover/grpHdr:text-neutral-600 dark:group-hover/grpHdr:text-neutral-200">
                            <Settings2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </div>
                        </div>

                        {/* Member CodeSpaces inside Group */}
                        <div className="pl-2 mt-1 space-y-0.5 border-l-2 border-neutral-200 dark:border-neutral-800 ml-2">
                          {memberCodeSpaces.length === 0 ? (
                            <div className="px-2 py-1 text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                              No CodeSpaces in group
                            </div>
                          ) : (
                            memberCodeSpaces.map((cs) => {
                              const isActive = cs.id === activeCodeSpaceId;
                              const isPinned = grp.pinnedIds?.includes(cs.id);
                              return (
                                <div
                                  key={cs.id}
                                  className={`group/mem flex items-center justify-between px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                                    isActive
                                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-medium'
                                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                                  }`}
                                  onClick={() => {
                                    onSelectCodeSpace(cs.id);
                                    setIsOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {isPinned ? (
                                      <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
                                    )}
                                    <span className="truncate">{cs.name}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-mono text-neutral-400 group-hover/mem:hidden">
                                      {cs.files ? cs.files.length : 0}f
                                    </span>
                                    <div className="hidden group-hover/mem:flex items-center gap-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsOpen(false);
                                          onOpenEditModal(cs);
                                        }}
                                        className="p-0.5 text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                                        title="Edit CodeSpace"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsOpen(false);
                                          onOpenDeleteWarningModal(cs);
                                        }}
                                        className="p-0.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                                        title="Delete CodeSpace"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons at the Bottom */}
          <div className="p-2.5 border-t border-neutral-150 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 space-y-2">
            {/* 1. Create new CodeSpace */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateModal();
              }}
              className="w-full h-[35px] flex items-center justify-center gap-1.5 px-3 text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create new CodeSpace</span>
            </button>

            {/* 2. Merge CodeSpaces */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenMergeModal();
              }}
              className="w-full h-[35px] flex items-center justify-center gap-1.5 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 rounded-md transition-colors border border-neutral-300 dark:border-neutral-700 shadow-2xs cursor-pointer"
            >
              <GitMerge className="w-3.5 h-3.5 text-emerald-500" />
              <span>Merge CodeSpaces</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
