import React, { useState } from 'react';
import {
  Inbox,
  Plus,
  GitMerge,
  Layers,
  Box,
  Pencil,
  Pin,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
} from 'lucide-react';
import { CodeSpace, CodeSpaceGroup } from '../types';
import { formatTimeAgo } from '../utils/storage';

interface GroupsViewProps {
  groups: CodeSpaceGroup[];
  codeSpaces: CodeSpace[];
  onOpenMergeModal: () => void;
  onOpenGroupEditorModal: (group: CodeSpaceGroup) => void;
  onSelectAndOpenCodeSpace: (id: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  codeSpaces,
  onOpenMergeModal,
  onOpenGroupEditorModal,
  onSelectAndOpenCodeSpace,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] dark:bg-neutral-950 p-6 lg:p-8 font-sans transition-colors">
      {/* Header — ALWAYS retained */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            CodeSpace Groups
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {groups.length} group{groups.length === 1 ? '' : 's'} defined
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher: Grid vs Table */}
          <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenMergeModal}
            className="h-8.5 px-3.5 flex items-center gap-1.5 rounded-md text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {groups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl my-4 bg-white/40 dark:bg-neutral-900/40 transition-colors">
          <Inbox
            className="w-16 h-16 stroke-[1.2] text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-4 tracking-tight">
            No CodeSpace Groups
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-md font-normal leading-relaxed">
            Organize related CodeSpaces together into manageable workspaces and feature sets.
          </p>
          <button
            type="button"
            onClick={onOpenMergeModal}
            className="mt-5 h-9 px-4 flex items-center gap-1.5 rounded-md text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] transition-colors shadow-2xs cursor-pointer"
          >
            <GitMerge className="w-3.5 h-3.5 stroke-[2]" />
            <span>Merge CodeSpaces into Group</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Groups Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {groups.map((group) => {
            const memberCodeSpaces = group.codespaceIds
              .map((id) => codeSpaces.find((cs) => cs.id === id))
              .filter((cs): cs is CodeSpace => Boolean(cs));

            const pinnedSet = new Set(group.pinnedIds || []);

            return (
              <div
                key={group.id}
                className="flex flex-col justify-between p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div>
                  {/* Group Top Info */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {group.name}
                        </h3>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {memberCodeSpaces.length} member codespace{memberCodeSpaces.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    {/* Edit Group Button */}
                    <button
                      type="button"
                      onClick={() => onOpenGroupEditorModal(group)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Manage Group</span>
                    </button>
                  </div>

                  {/* Group Description */}
                  {group.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-3 leading-relaxed">
                      {group.description}
                    </p>
                  )}

                  {/* Member CodeSpaces List */}
                  <div className="mt-3 space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
                      Grouped Workspaces
                    </div>
                    {memberCodeSpaces.length === 0 ? (
                      <div className="text-xs text-neutral-400 italic py-2">
                        No codespaces currently in this group.
                      </div>
                    ) : (
                      memberCodeSpaces.map((cs) => {
                        const isPinned = pinnedSet.has(cs.id);
                        return (
                          <div
                            key={cs.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-150 dark:border-neutral-800 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Box className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                {cs.name}
                              </span>
                              {isPinned && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-0.5">
                                  <Pin className="w-2.5 h-2.5" /> Pinned
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono text-neutral-400">
                                {cs.files ? cs.files.length : 0} files
                              </span>
                              <button
                                type="button"
                                onClick={() => onSelectAndOpenCodeSpace(cs.id)}
                                className="p-1 rounded text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                                title="Launch workspace"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Groups Table View */
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium select-none">
                <tr>
                  <th className="py-3 px-4">Group Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Member Workspaces</th>
                  <th className="py-3 px-4 text-center">Total CodeSpaces</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {groups.map((group) => {
                  const memberCodeSpaces = group.codespaceIds
                    .map((id) => codeSpaces.find((cs) => cs.id === id))
                    .filter((cs): cs is CodeSpace => Boolean(cs));

                  const pinnedSet = new Set(group.pinnedIds || []);

                  return (
                    <tr
                      key={group.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      {/* Group Name & Icon */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {group.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-xs text-neutral-600 dark:text-neutral-400 truncate">
                        {group.description || <span className="text-neutral-400">—</span>}
                      </td>

                      {/* Member Workspaces Chips */}
                      <td className="py-3 px-4 min-w-[200px]">
                        {memberCodeSpaces.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {memberCodeSpaces.map((cs) => {
                              const isPinned = pinnedSet.has(cs.id);
                              return (
                                <button
                                  key={cs.id}
                                  type="button"
                                  onClick={() => onSelectAndOpenCodeSpace(cs.id)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-neutral-700 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-sky-300 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                                  title={`Open "${cs.name}"`}
                                >
                                  <Box className="w-2.5 h-2.5 text-sky-500" />
                                  <span>{cs.name}</span>
                                  {isPinned && <Pin className="w-2.5 h-2.5 text-amber-500" />}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">No workspaces</span>
                        )}
                      </td>

                      {/* Count */}
                      <td className="py-3 px-4 text-center font-mono text-neutral-700 dark:text-neutral-300">
                        {memberCodeSpaces.length}
                      </td>

                      {/* Last Activity */}
                      <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px] whitespace-nowrap">
                        {formatTimeAgo(group.updatedAt || group.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenGroupEditorModal(group)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Manage Group</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
