import React from 'react';
import { X } from 'lucide-react';
import { CodeFile } from '../types';
import { FileIcon } from './FileIcon';

interface EditorTabsProps {
  openFiles: CodeFile[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  unsavedMap: { [key: string]: boolean };
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  openFiles,
  activeFileId,
  onSelectTab,
  onCloseTab,
  unsavedMap,
}) => {
  if (openFiles.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/80 scrollbar-none select-none">
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId;
        const isUnsaved = unsavedMap[file.id];

        return (
          <div
            key={file.id}
            onClick={() => onSelectTab(file.id)}
            className={`group flex items-center gap-2 px-3 text-xs border-r border-neutral-200 dark:border-neutral-800 cursor-pointer transition-colors shrink-0 h-[30px] ${
              isActive
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium border-t-2 border-t-sky-500'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <FileIcon fileName={file.name} className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono text-xs">{file.name}</span>

            {/* Dirty indicator or close button */}
            <div className="flex items-center ml-1">
              {isUnsaved ? (
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block group-hover:hidden" />
              ) : null}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                className={`p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${
                  isUnsaved ? 'hidden group-hover:inline-flex' : 'inline-flex'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
