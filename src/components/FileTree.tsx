import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  UploadCloud,
  Search,
  Trash2,
  Download,
  FileCode,
  FilePlus,
} from 'lucide-react';
import { CodeFile } from '../types';
import { FileIcon } from './FileIcon';
import { formatBytes, formatTimeAgo } from '../utils/storage';

interface FileTreeProps {
  files: CodeFile[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onOpenNewModal: () => void;
  onOpenUploadModal: () => void;
  onDeleteRequest: (file: CodeFile) => void;
  activeCodeSpaceName?: string;
}

interface TreeNode {
  name: string;
  fullPath: string;
  isFolder: boolean;
  file?: CodeFile;
  children?: { [key: string]: TreeNode };
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  onOpenNewModal,
  onOpenUploadModal,
  onDeleteRequest,
  activeCodeSpaceName,
}) => {
  const [search, setSearch] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<{ [key: string]: boolean }>({});

  const toggleFolder = (folderPath: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  // Build hierarchical file tree structure
  const rootTree = useMemo(() => {
    const root: { [key: string]: TreeNode } = {};

    files.forEach((file) => {
      const parts = file.path.split('/');
      let currentLevel = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = index === parts.length - 1;

        if (isLast) {
          currentLevel[part] = {
            name: part,
            fullPath: file.path,
            isFolder: false,
            file,
          };
        } else {
          if (!currentLevel[part]) {
            currentLevel[part] = {
              name: part,
              fullPath: currentPath,
              isFolder: true,
              children: {},
            };
          }
          currentLevel = currentLevel[part].children!;
        }
      });
    });

    return root;
  }, [files]);

  const renderTree = (nodes: { [key: string]: TreeNode }, depth = 0) => {
    const sortedKeys = Object.keys(nodes).sort((a, b) => {
      const nodeA = nodes[a];
      const nodeB = nodes[b];
      if (nodeA.isFolder && !nodeB.isFolder) return -1;
      if (!nodeA.isFolder && nodeB.isFolder) return 1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((key) => {
      const node = nodes[key];

      if (node.isFolder) {
        const isCollapsed = collapsedFolders[node.fullPath];
        const childCount = Object.keys(node.children || {}).length;

        // If search is active and no children match, skip
        if (search) {
          const hasMatch = JSON.stringify(node.children)
            .toLowerCase()
            .includes(search.toLowerCase());
          if (!hasMatch) return null;
        }

        return (
          <div key={node.fullPath} className="select-none">
            <button
              type="button"
              onClick={() => toggleFolder(node.fullPath)}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-left font-mono group h-[30px]"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
              )}
              {isCollapsed ? (
                <Folder className="w-3.5 h-3.5 shrink-0 text-sky-500" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5 shrink-0 text-sky-500" />
              )}
              <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
                {node.name}
              </span>
              <span className="text-[10px] text-neutral-400 ml-auto opacity-0 group-hover:opacity-100 font-mono">
                {childCount}
              </span>
            </button>

            {!isCollapsed && node.children && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      // File Node
      const file = node.file!;
      if (search && !file.path.toLowerCase().includes(search.toLowerCase())) {
        return null;
      }

      const isSelected = selectedFileId === file.id;

      return (
        <div
          key={file.id}
          onClick={() => onSelectFile(file.id)}
          className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors text-xs select-none h-[30px] ${
            isSelected
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          style={{ paddingLeft: `${depth * 12 + 18}px` }}
        >
          <div className="flex items-center gap-2 truncate pr-2 min-w-0">
            <FileIcon fileName={file.name} className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono text-xs truncate">
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Status letter flag */}
            {file.lastAction === 'edited' && (
              <span className="text-[10px] font-mono font-bold text-amber-500 px-1" title="Modified revision">
                M
              </span>
            )}
            {file.lastAction === 'uploaded' && (
              <span className="text-[10px] font-mono font-bold text-emerald-500 px-1" title="Uploaded asset">
                U
              </span>
            )}
            {file.lastAction === 'created' && (
              <span className="text-[10px] font-mono font-bold text-sky-500 px-1" title="Created asset">
                C
              </span>
            )}

            {/* Quick action delete */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(file);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-rose-500 rounded transition-opacity"
              title={`Delete ${file.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-72 shrink-0 flex flex-col h-full bg-neutral-50/70 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      {/* Explorer Top Toolbar */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Explorer
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenNewModal}
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors"
              title="New File (N)"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenUploadModal}
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors"
              title="Upload Code Files"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
            </button>
          </div>
        </div>

        {/* Quick Filter */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repository..."
            className="w-full box-border h-[35px] pl-8 pr-2.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
          />
        </div>
      </div>

      {/* Hierarchical Tree Body */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {files.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-400">
            <FileCode className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p>No files in repository</p>
          </div>
        ) : (
          renderTree(rootTree)
        )}
      </div>

      {/* Explorer Footer Status */}
      <div className="px-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-950/40 text-[11px] text-neutral-400 flex items-center justify-between h-[40px]">
        <span className="font-mono tabular-nums">{files.length} active files</span>
        <span>codespace: <span className="font-mono text-neutral-600 dark:text-neutral-300">{activeCodeSpaceName || 'Default'}</span></span>
      </div>
    </div>
  );
};
