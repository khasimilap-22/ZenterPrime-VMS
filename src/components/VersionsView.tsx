import React, { useState } from 'react';
import {
  History,
  UploadCloud,
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  RotateCcw,
  Clock,
  FileCode,
  ShieldCheck,
  X,
  Copy,
  Check,
  GitCommit,
  GitBranch,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
} from 'lucide-react';
import { VersionFilterTab, VersionRecord, VersionActionType } from '../types';
import { computeLineDiff } from '../utils/diff';
import { renderHighlightedCode } from '../utils/syntaxHighlight';

interface VersionsViewProps {
  versions: VersionRecord[];
  onRestoreVersion: (record: VersionRecord) => void;
}

export const VersionsView: React.FC<VersionsViewProps> = ({ versions, onRestoreVersion }) => {
  const [activeTab, setActiveTab] = useState<VersionFilterTab>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<VersionRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Tab counts
  const countAll = versions.length;
  const countUploaded = versions.filter((v) => v.action === 'uploaded').length;
  const countCreated = versions.filter((v) => v.action === 'created').length;
  const countEdited = versions.filter((v) => v.action === 'edited').length;
  const countDeleted = versions.filter((v) => v.action === 'deleted').length;

  const tabs: { key: VersionFilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: countAll },
    { key: 'uploaded', label: 'Uploaded', count: countUploaded },
    { key: 'created', label: 'Created', count: countCreated },
    { key: 'edited', label: 'Edited', count: countEdited },
    { key: 'deleted', label: 'Deleted', count: countDeleted },
  ];

  // Filtering
  const filteredVersions = versions
    .filter((v) => {
      if (activeTab === 'all') return true;
      return v.action === activeTab;
    })
    .filter((v) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.fileName.toLowerCase().includes(q) ||
        v.filePath.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        (v.hash && v.hash.toLowerCase().includes(q))
      );
    });

  const handleCopyHash = async (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 1800);
    } catch (err) {
      console.error('Failed to copy hash', err);
    }
  };

  const getActionBadge = (action: VersionActionType) => {
    switch (action) {
      case 'uploaded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <UploadCloud className="w-3.5 h-3.5" />
            Uploaded
          </span>
        );
      case 'created':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
            <PlusCircle className="w-3.5 h-3.5" />
            Created
          </span>
        );
      case 'edited':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Edit3 className="w-3.5 h-3.5" />
            Edited
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <Trash2 className="w-3.5 h-3.5" />
            Deleted
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900 transition-colors">
      {/* Real Product Audit Log Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-sky-500" />
              <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Codebase Version Control &amp; Audit Log
              </h2>
              <span className="flex items-center gap-1 text-xs font-mono text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800">
                <GitBranch className="w-3.5 h-3.5 text-sky-500" />
                main
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Immutable revision history across all uploaded, created, edited, and permanently purged assets.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by hash, file, note..."
                className="w-full h-[35px] pl-9 pr-3 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
              />
            </div>

            {/* View Mode Switcher: Table vs Grid */}
            <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 text-xs shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 5 Requested Sub-Tabs: All, Uploaded, Created, Edited, Deleted */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/50 dark:bg-neutral-800/60 rounded-lg w-fit select-none flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-[30px] flex items-center gap-2 px-3 text-[13px] font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`font-mono text-xs tabular-nums px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredVersions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            <History className="w-9 h-9 mb-2.5 text-neutral-400 dark:text-neutral-600" />
            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
              No version records found
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-sm">
              {searchQuery
                ? 'No revisions matched your query. Try searching by file name or action.'
                : `There are currently no recorded events in the "${activeTab}" category.`}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Structured Table View */
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[13px] text-neutral-600 dark:text-neutral-400 font-medium select-none">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4 font-mono">Commit</th>
                    <th className="py-3 px-4">File Name &amp; Path</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Changes</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredVersions.map((record) => {
                    const isDeleted = record.action === 'deleted';
                    const displayHash = record.hash || record.id.slice(-7);
                    const dateStr = new Date(record.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedVersion(record)}
                        className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group ${
                          isDeleted ? 'bg-rose-50/15 dark:bg-rose-950/10' : ''
                        }`}
                      >
                        {/* Action Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getActionBadge(record.action)}
                        </td>

                        {/* Commit Hash */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => handleCopyHash(displayHash, e)}
                            className="flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                            title="Click to copy commit hash"
                          >
                            <GitCommit className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{displayHash}</span>
                            {copiedHash === displayHash && (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </button>
                        </td>

                        {/* File Name & Path */}
                        <td className="py-3 px-4 min-w-[180px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                              {record.fileName}
                            </span>
                            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate">
                              ({record.filePath})
                            </span>
                          </div>
                          {record.author && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              by <span className="font-mono">{record.author}</span>
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 max-w-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {record.description}
                        </td>

                        {/* Changes / Diff */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {!isDeleted && record.additions !== undefined ? (
                            <span className="font-mono text-xs tabular-nums">
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                +{record.additions}
                              </span>{' '}
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                -{record.deletions || 0}
                              </span>
                            </span>
                          ) : isDeleted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-rose-600 dark:text-rose-400 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Purged
                            </span>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400 font-mono text-xs">
                          {dateStr}
                        </td>

                        {/* Action CTA */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVersion(record);
                            }}
                            className="inline-flex items-center gap-1.5 h-[30px] px-3 text-[13px] font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                          >
                            <span>{isDeleted ? 'View Record' : 'Inspect'}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVersions.map((record) => {
              const isDeleted = record.action === 'deleted';
              const displayHash = record.hash || record.id.slice(-7);
              const dateStr = new Date(record.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedVersion(record)}
                  className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-neutral-900 shadow-xs hover:shadow-md ${
                    isDeleted
                      ? 'border-neutral-200 dark:border-neutral-800 hover:border-rose-400 dark:hover:border-rose-800/80'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div>
                    {/* Card Top: Action & Hash */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      {getActionBadge(record.action)}

                      <button
                        type="button"
                        onClick={(e) => handleCopyHash(displayHash, e)}
                        className="flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                        title="Copy commit hash"
                      >
                        <GitCommit className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{displayHash}</span>
                        {copiedHash === displayHash && (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </button>
                    </div>

                    {/* File Name & Path */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                        <h3 className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {record.fileName}
                        </h3>
                      </div>
                      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5 pl-5.5">
                        {record.filePath}
                      </p>
                    </div>

                    {/* Commit Description */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 min-h-[40px] leading-relaxed mb-3">
                      {record.description}
                    </p>
                  </div>

                  {/* Card Bottom: Metadata and Inspect button */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {!isDeleted && record.additions !== undefined ? (
                        <span className="font-mono tabular-nums shrink-0">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            +{record.additions}
                          </span>{' '}
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            -{record.deletions || 0}
                          </span>
                        </span>
                      ) : isDeleted ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-rose-600 dark:text-rose-400 font-medium shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" /> Purged
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono">—</span>
                      )}
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 dark:text-neutral-400 font-mono text-xs truncate">{dateStr}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVersion(record);
                      }}
                      className="h-[30px] px-3 inline-flex items-center text-[13px] font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer shrink-0"
                    >
                      {isDeleted ? 'View' : 'Inspect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail / Popup Inspector Modal */}
      {selectedVersion && (
        <VersionDetailModal
          record={selectedVersion}
          onClose={() => setSelectedVersion(null)}
          onRestore={() => {
            onRestoreVersion(selectedVersion);
            setSelectedVersion(null);
          }}
        />
      )}
    </div>
  );
};

// Modal for Version Inspector:
// - For DELETED: Pops out what file was deleted without insider content.
// - For EDITED: High-precision line-by-line diff with chunk markers.
// - For CREATED / UPLOADED: Clean source viewer with copy & rollback.
interface VersionDetailModalProps {
  record: VersionRecord;
  onClose: () => void;
  onRestore: () => void;
}

const VersionDetailModal: React.FC<VersionDetailModalProps> = ({
  record,
  onClose,
  onRestore,
}) => {
  const [copied, setCopied] = useState(false);
  const isDeleted = record.action === 'deleted';
  const isEdited = record.action === 'edited';
  const displayHash = record.hash || record.id.slice(-7);

  const handleCopyCode = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-detail-title"
        className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {isDeleted ? (
                <Trash2 className="w-5 h-5 text-rose-500" />
              ) : isEdited ? (
                <Edit3 className="w-5 h-5 text-amber-500" />
              ) : (
                <FileCode className="w-5 h-5 text-sky-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 id="version-detail-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {isDeleted ? 'Deletion Record' : `Revision: ${record.fileName}`}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  commit {displayHash}
                </span>
              </div>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                {record.filePath} · {new Date(record.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Audit Note Box */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">Commit Note: </span>
            {record.description}
          </div>

          {/* DELETED ACTION HANDLING:
              "Specifically for deleted actions, make them inside the history means they just popups out what file was deleted. Do not try to show the file deleted or it’s insider content. File name is enough for showing deletions as records." */}
          {isDeleted ? (
            <div className="p-6 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Deleted File Tombstone Record
                </h4>
                <div className="mt-2 inline-block px-3 py-1 font-mono text-sm font-bold bg-white dark:bg-neutral-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg shadow-2xs">
                  {record.fileName}
                </div>
                <p className="font-mono text-[13px] text-neutral-600 dark:text-neutral-400 mt-2">
                  Repository Location: {record.filePath}
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-left text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Compliance &amp; Data Purge Certificate
                </p>
                <p>
                  As mandated by system protocol, all interior lines and content of deleted files are permanently expunged. Only the file name, target path, timestamp, and audit record are retained to verify code removal.
                </p>
              </div>
            </div>
          ) : isEdited && record.previousContent !== undefined ? (
            /* EDITED ACTION: Professional diff comparison */
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Revision Diff
                </span>
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  <span className="text-emerald-600 dark:text-emerald-400">+ additions</span>
                  <span className="text-rose-600 dark:text-rose-400">- deletions</span>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden font-mono text-[13px] bg-neutral-50 dark:bg-neutral-950 max-h-96 overflow-y-auto">
                <div className="px-3 py-1.5 bg-neutral-200/50 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 text-xs border-b border-neutral-200 dark:border-neutral-800">
                  @@ -1,{record.previousContent.split('\n').length} +1,{record.content?.split('\n').length} @@
                </div>
                {computeLineDiff(record.previousContent, record.content || '').map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start px-3 py-0.5 leading-6 select-text ${
                      line.type === 'added'
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                        : line.type === 'removed'
                        ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/30 dark:hover:bg-neutral-800/30'
                    }`}
                  >
                    <span className="w-6 shrink-0 text-neutral-400 select-none text-right pr-2">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1">
                      {line.content || ' '}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* CREATED / UPLOADED: Snapshot viewer */
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Revision Content Snapshot
                </span>
                <span className="font-mono text-neutral-500 dark:text-neutral-400 text-xs tabular-nums">
                  {record.lineCount || (record.content?.split('\n').length ?? 0)} lines
                </span>
              </div>

              <pre className="vscode-code p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[13px] font-mono overflow-x-auto max-h-96 whitespace-pre leading-6">
                {renderHighlightedCode(
                  record.content || '// Empty content',
                  record.fileName,
                  record.language
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div>
            {!isDeleted && record.content && (
              <button
                type="button"
                onClick={() => handleCopyCode(record.content)}
                className="h-[35px] px-3 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[35px] px-3.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-md transition-colors cursor-pointer"
            >
              Close
            </button>
            {!isDeleted && record.content && (
              <button
                type="button"
                onClick={onRestore}
                className="h-[35px] px-4 flex items-center gap-1.5 text-sm font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] rounded-md transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore Revision</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
