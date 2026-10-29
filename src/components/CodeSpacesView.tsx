import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Box,
  Pencil,
  Trash2,
  Pin,
  ArrowRight,
  GitMerge,
  FileCode,
  Clock,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  List,
  Calendar,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { CodeSpace, CodeSpaceGroup } from '../types';
import { formatTimeAgo } from '../utils/storage';
import { downloadCodeSpaceZip } from '../utils/zipExport';

interface CodeSpacesViewProps {
  codeSpaces: CodeSpace[];
  activeCodeSpaceId: string;
  groups: CodeSpaceGroup[];
  searchQuery: string;
  onSelectAndOpenCodeSpace: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (codeSpace: CodeSpace) => void;
  onOpenDeleteWarningModal: (codeSpace: CodeSpace) => void;
  onOpenMergeModal: () => void;
}

export const CodeSpacesView: React.FC<CodeSpacesViewProps> = ({
  codeSpaces,
  activeCodeSpaceId,
  groups,
  searchQuery,
  onSelectAndOpenCodeSpace,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDeleteWarningModal,
  onOpenMergeModal,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'recent' | 'grouped'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessName, setDownloadSuccessName] = useState<string | null>(null);

  const handleDownloadZip = async (cs: CodeSpace) => {
    try {
      setDownloadingId(cs.id);
      await downloadCodeSpaceZip(cs);
      setDownloadSuccessName(cs.name);
      setTimeout(() => {
        setDownloadSuccessName(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to download ZIP archive:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Collect all pinned IDs across groups
  const allPinnedIds = new Set<string>();
  const allGroupedIds = new Set<string>();
  groups.forEach((g) => {
    (g.pinnedIds || []).forEach((pid) => allPinnedIds.add(pid));
    (g.codespaceIds || []).forEach((cid) => allGroupedIds.add(cid));
  });

  // Calculate recent cutoff (within last 7 days)
  const recentCutoffMs = 7 * 24 * 60 * 60 * 1000;
  const isRecent = (cs: CodeSpace) => {
    const time = new Date(cs.updatedAt || cs.createdAt).getTime();
    return Date.now() - time < recentCutoffMs;
  };

  const countRecent = codeSpaces.filter((cs) => isRecent(cs)).length;
  const countGrouped = codeSpaces.filter((cs) => allGroupedIds.has(cs.id)).length;

  // Filter CodeSpaces by search and filter mode
  const filtered = codeSpaces.filter((cs) => {
    const matchesSearch =
      cs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cs.description && cs.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterMode === 'recent') {
      return isRecent(cs);
    }
    if (filterMode === 'grouped') {
      return allGroupedIds.has(cs.id);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] dark:bg-neutral-950 p-6 lg:p-8 font-sans transition-colors">
      {/* Top Filter & Actions Header — ALWAYS retained */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Active CodeSpaces
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {codeSpaces.length} workspace environment{codeSpaces.length === 1 ? '' : 's'} configured
            {searchQuery && ` · matching "${searchQuery}"`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Three Filter Buttons: All, Recent, Grouped */}
          <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              All ({codeSpaces.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('recent')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === 'recent'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Recent ({countRecent})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('grouped')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === 'grouped'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Grouped ({countGrouped})
            </button>
          </div>

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

          {/* Merge to Group Button */}
          {codeSpaces.length > 1 && (
            <button
              type="button"
              onClick={onOpenMergeModal}
              className="h-8.5 px-3 flex items-center gap-1.5 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
            >
              <GitMerge className="w-3.5 h-3.5 text-emerald-500" />
              <span>Merge CodeSpaces</span>
            </button>
          )}

          {/* Add New Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="h-8.5 px-3.5 flex items-center gap-1.5 rounded-md text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New CodeSpace</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Empty state or Grid/Table data */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl my-4 bg-white/40 dark:bg-neutral-900/40 transition-colors">
          <Folder
            className="w-16 h-16 stroke-[1.2] text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-4 tracking-tight">
            No CodeSpaces Found
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-md font-normal leading-relaxed">
            {searchQuery
              ? `No workspaces matched "${searchQuery}". Try searching with a different term.`
              : filterMode === 'recent'
              ? 'No CodeSpaces modified in the last 7 days.'
              : filterMode === 'grouped'
              ? 'No CodeSpaces currently assigned to a group. Use "Merge CodeSpaces" to organize them.'
              : 'Start creating your codespaces for managing projects and versions.'}
          </p>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="mt-5 h-9 px-4 flex items-center gap-1.5 rounded-md text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New CodeSpace</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* CodeSpaces Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cs) => {
            const isActive = cs.id === activeCodeSpaceId;
            const fileCount = cs.files ? cs.files.length : 0;
            const versionCount = cs.versions ? cs.versions.length : 0;
            const isPinned = allPinnedIds.has(cs.id);
            const memberGroups = groups.filter((g) => g.codespaceIds.includes(cs.id));

            return (
              <div
                key={cs.id}
                className={`group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-150 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-md ${
                  isActive
                    ? 'border-sky-500 dark:border-sky-500/80 ring-1 ring-sky-500/30'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Card Top: Name, Status & Action Icons */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Box className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {cs.name}
                          </h3>
                          {cs.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 font-mono">
                              Default
                            </span>
                          )}
                          {isPinned && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Download, Edit & Delete Hover Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadZip(cs);
                        }}
                        disabled={downloadingId === cs.id}
                        className="p-1 rounded text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer"
                        title="Download CodeSpace as ZIP"
                      >
                        {downloadingId === cs.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(cs)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit CodeSpace title & description"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenDeleteWarningModal(cs)}
                        className="p-1 rounded text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete CodeSpace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 min-h-[32px] leading-relaxed mb-3">
                    {cs.description || (
                      <span className="italic text-neutral-400 dark:text-neutral-500">
                        Blank workspace environment. No files created yet.
                      </span>
                    )}
                  </p>

                  {/* Group Tags if grouped */}
                  {memberGroups.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      {memberGroups.map((grp) => (
                        <span
                          key={grp.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        >
                          <Layers className="w-2.5 h-2.5" />
                          {grp.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Metadata and Launch Button */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-3 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-neutral-400" />
                        {fileCount} {fileCount === 1 ? 'file' : 'files'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {versionCount} {versionCount === 1 ? 'rev' : 'revs'}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {formatTimeAgo(cs.updatedAt || cs.createdAt)}
                    </span>
                  </div>

                  {/* Open Workspace Action & Download ZIP */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectAndOpenCodeSpace(cs.id)}
                      className={`flex-1 h-8.5 flex items-center justify-center gap-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 hover:bg-sky-100 dark:hover:bg-sky-900/40'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <span>{isActive ? 'Continue in Workspace' : 'Open Workspace'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadZip(cs);
                      }}
                      disabled={downloadingId === cs.id}
                      className="h-8.5 px-2.5 flex items-center justify-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-colors cursor-pointer text-xs font-medium shrink-0"
                      title="Download all folders & files as ZIP"
                    >
                      {downloadingId === cs.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">ZIP</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CodeSpaces Table View */
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium select-none">
                <tr>
                  <th className="py-3 px-4">Name &amp; Status</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4 text-center">Files</th>
                  <th className="py-3 px-4 text-center">Revisions</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map((cs) => {
                  const isActive = cs.id === activeCodeSpaceId;
                  const fileCount = cs.files ? cs.files.length : 0;
                  const versionCount = cs.versions ? cs.versions.length : 0;
                  const isPinned = allPinnedIds.has(cs.id);
                  const memberGroups = groups.filter((g) => g.codespaceIds.includes(cs.id));

                  return (
                    <tr
                      key={cs.id}
                      className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors group ${
                        isActive ? 'bg-sky-50/30 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      {/* Name & Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                            <Box className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {cs.name}
                              </span>
                              {cs.isDefault && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 font-mono">
                                  Default
                                </span>
                              )}
                              {isPinned && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-0.5">
                                  <Pin className="w-2.5 h-2.5" /> Pinned
                                </span>
                              )}
                            </div>
                            {isActive && (
                              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                                Active Workspace
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-xs text-neutral-600 dark:text-neutral-400 truncate">
                        {cs.description || (
                          <span className="italic text-neutral-400 dark:text-neutral-500">
                            Blank workspace
                          </span>
                        )}
                      </td>

                      {/* Group */}
                      <td className="py-3 px-4">
                        {memberGroups.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {memberGroups.map((grp) => (
                              <span
                                key={grp.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                              >
                                <Layers className="w-2.5 h-2.5" />
                                {grp.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Files */}
                      <td className="py-3 px-4 text-center font-mono text-neutral-700 dark:text-neutral-300">
                        {fileCount}
                      </td>

                      {/* Revisions */}
                      <td className="py-3 px-4 text-center font-mono text-neutral-700 dark:text-neutral-300">
                        {versionCount}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                        {formatTimeAgo(cs.updatedAt || cs.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectAndOpenCodeSpace(cs.id)}
                            className="h-7 px-2.5 flex items-center gap-1 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/50 dark:hover:text-sky-300 text-neutral-700 dark:text-neutral-300 transition-colors"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadZip(cs)}
                            disabled={downloadingId === cs.id}
                            className="h-7 px-2 flex items-center gap-1 rounded text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-neutral-200 dark:border-neutral-700 hover:border-sky-300 dark:hover:border-sky-700 transition-colors cursor-pointer"
                            title="Download CodeSpace as ZIP"
                          >
                            {downloadingId === cs.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-sky-600 dark:text-sky-400" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline text-[11px]">ZIP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(cs)}
                            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDeleteWarningModal(cs)}
                            className="p-1.5 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Download Success Floating Banner */}
      {downloadSuccessName && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-medium shadow-xl border border-emerald-500 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
          <span>&quot;{downloadSuccessName}&quot; code files and folders downloaded as ZIP</span>
        </div>
      )}
    </div>
  );
};
