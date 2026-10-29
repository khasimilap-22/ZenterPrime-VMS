import React, { useState, useEffect, useCallback } from 'react';
import { Plus, UploadCloud, FolderCode, Command, ChevronLeft, ArrowLeft, Download } from 'lucide-react';
import { CodeFile, AppSettings, CodeSpace, CodeSpaceGroup } from '../types';
import { FileTree } from './FileTree';
import { EditorTabs } from './EditorTabs';
import { CodeEditor } from './CodeEditor';
import { NewFileModal } from './NewFileModal';
import { UploadModal } from './UploadModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { CodeSpaceSelector } from './codespaces/CodeSpaceSelector';
import { SessionRestoredTag } from './SessionRestoredTag';
import { getNewFileDraft, clearNewFileDraft, NewFileDraft } from '../utils/draftStorage';
import { downloadCodeSpaceZip } from '../utils/zipExport';

interface CodebaseExplorerProps {
  files: CodeFile[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  settings: AppSettings;
  onCreateFile: (name: string, path: string, content: string, description: string) => void;
  onUploadFiles: (
    files: { name: string; path: string; content: string; language: string; sizeBytes: number; lineCount: number }[],
    description: string
  ) => void;
  onSaveFileContent: (fileId: string, content: string, note: string) => void;
  onDeleteFile: (fileId: string, reason: string) => void;
  onNavigateToVersions: () => void;
  onOpenCommandPalette: () => void;
  activeCodeSpaceName?: string;
  codeSpaces: CodeSpace[];
  activeCodeSpaceId: string;
  groups: CodeSpaceGroup[];
  onSelectCodeSpace: (id: string) => void;
  onOpenCreateCodeSpaceModal: () => void;
  onOpenEditCodeSpaceModal: (cs: CodeSpace) => void;
  onOpenDeleteCodeSpaceWarningModal: (cs: CodeSpace) => void;
  onOpenMergeCodeSpacesModal: () => void;
  onOpenGroupEditorModal: (group: CodeSpaceGroup) => void;
  onBackToCodeSpaces: () => void;
}

export const CodebaseExplorer: React.FC<CodebaseExplorerProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  settings,
  onCreateFile,
  onUploadFiles,
  onSaveFileContent,
  onDeleteFile,
  onNavigateToVersions,
  onOpenCommandPalette,
  activeCodeSpaceName,
  codeSpaces,
  activeCodeSpaceId,
  groups,
  onSelectCodeSpace,
  onOpenCreateCodeSpaceModal,
  onOpenEditCodeSpaceModal,
  onOpenDeleteCodeSpaceWarningModal,
  onOpenMergeCodeSpacesModal,
  onOpenGroupEditorModal,
  onBackToCodeSpaces,
}) => {
  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    return files.slice(0, 3).map((f) => f.id);
  });
  const [unsavedMap, setUnsavedMap] = useState<{ [key: string]: boolean }>({});
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CodeFile | null>(null);

  // Restore new file draft if previous session was interrupted
  const [restoredDraft, setRestoredDraft] = useState<NewFileDraft | null>(() => {
    return getNewFileDraft(activeCodeSpaceId);
  });

  useEffect(() => {
    setRestoredDraft(getNewFileDraft(activeCodeSpaceId));
  }, [activeCodeSpaceId, isNewModalOpen]);

  // Filter openFileIds when files change (e.g. switching codespaces)
  useEffect(() => {
    setOpenFileIds((prev) => {
      const valid = prev.filter((id) => files.some((f) => f.id === id));
      if (valid.length === 0 && files.length > 0) {
        return [files[0].id];
      }
      return valid;
    });
  }, [files]);

  // Sync open files if a file was selected externally (e.g. from command palette)
  useEffect(() => {
    if (selectedFileId) {
      setOpenFileIds((prev) => (prev.includes(selectedFileId) ? prev : [...prev, selectedFileId]));
    }
  }, [selectedFileId]);

  const handleSelectFile = (fileId: string) => {
    setOpenFileIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    onSelectFile(fileId);
  };

  const handleCloseTab = (fileIdToClose: string) => {
    const nextOpen = openFileIds.filter((id) => id !== fileIdToClose);
    setOpenFileIds(nextOpen);

    if (selectedFileId === fileIdToClose) {
      if (nextOpen.length > 0) {
        onSelectFile(nextOpen[nextOpen.length - 1]);
      } else {
        const remaining = files.filter((f) => f.id !== fileIdToClose);
        if (remaining.length > 0) {
          onSelectFile(remaining[0].id);
          setOpenFileIds([remaining[0].id]);
        }
      }
    }
  };

  const handleDirtyChange = useCallback((fileId: string, isDirty: boolean) => {
    setUnsavedMap((prev) => {
      if (prev[fileId] === isDirty) return prev;
      return { ...prev, [fileId]: isDirty };
    });
  }, []);

  const openFiles = files.filter((f) => openFileIds.includes(f.id));
  const activeFile = files.find((f) => f.id === selectedFileId) || openFiles[0] || files[0] || null;

  const currentCodeSpace =
    codeSpaces.find((c) => c.id === activeCodeSpaceId) || codeSpaces[0];

  const handleExportZip = () => {
    if (currentCodeSpace) {
      downloadCodeSpaceZip(currentCodeSpace);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900 font-sans">
      {/* Sub Header: CodeSpace Selector & Quick Switch */}
      <div className="h-[52.5px] shrink-0 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToCodeSpaces}
            style={{ height: '25px' }}
            className="flex items-center gap-1 px-2 h-[25px] rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Return to all CodeSpaces"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>CodeSpaces</span>
          </button>

          <span className="text-neutral-300 dark:text-neutral-700">/</span>

          {/* CodeSpace Selector Dropdown */}
          <CodeSpaceSelector
            codeSpaces={codeSpaces}
            activeCodeSpaceId={activeCodeSpaceId}
            groups={groups}
            onSelectCodeSpace={onSelectCodeSpace}
            onOpenCreateModal={onOpenCreateCodeSpaceModal}
            onOpenEditModal={onOpenEditCodeSpaceModal}
            onOpenDeleteWarningModal={onOpenDeleteCodeSpaceWarningModal}
            onOpenMergeModal={onOpenMergeCodeSpacesModal}
            onOpenGroupEditorModal={onOpenGroupEditorModal}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400">
            {files.length} file{files.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={handleExportZip}
            className="flex items-center gap-1 h-[25px] px-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
            title="Download this CodeSpace as a ZIP archive"
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span>Export ZIP</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToVersions}
            className="text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline px-1 py-0.5"
          >
            History &rarr;
          </button>
        </div>
      </div>

      {/* Golden Session Restored Banner if an uncommitted new file draft exists */}
      {restoredDraft && !isNewModalOpen && (
        <div className="h-[35px] shrink-0 flex items-center justify-between px-3 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/25 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
          <SessionRestoredTag
            size="30px"
            onDismiss={() => setRestoredDraft(null)}
            onDiscardDraft={() => {
              clearNewFileDraft(activeCodeSpaceId);
              setRestoredDraft(null);
            }}
          />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-mono hidden sm:inline truncate max-w-xs">
              Draft: {restoredDraft.filePath || 'New File'}
            </span>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="h-[30px] px-2.5 flex items-center gap-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <span>Resume File Creation</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Hierarchical File Tree */}
        <FileTree
          files={files}
          selectedFileId={activeFile?.id || null}
          onSelectFile={handleSelectFile}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onDeleteRequest={(file) => setFileToDelete(file)}
          activeCodeSpaceName={activeCodeSpaceName}
          onExportZip={handleExportZip}
        />

        {/* Right Pane: Multi-Tab Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
          {openFiles.length > 0 && (
            <EditorTabs
              openFiles={openFiles}
              activeFileId={activeFile?.id || null}
              onSelectTab={handleSelectFile}
              onCloseTab={handleCloseTab}
              unsavedMap={unsavedMap}
            />
          )}

          {activeFile ? (
            <CodeEditor
              key={activeFile.id}
              file={activeFile}
              settings={settings}
              onSave={onSaveFileContent}
              onDeleteRequest={(file) => setFileToDelete(file)}
              onDirtyChange={handleDirtyChange}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 bg-white dark:bg-neutral-900 select-none">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-4">
                <FolderCode className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                No Open Files in Workspace
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed">
                Open a file from the explorer on the left, press <kbd className="font-mono px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-[10px]">⌘K</kbd> to quick-search, or upload new code assets.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Upload Code</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <Command className="w-3.5 h-3.5" />
                  <span>Command Menu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creation, Upload, and Deletion Modals */}
      <NewFileModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setRestoredDraft(getNewFileDraft(activeCodeSpaceId));
        }}
        onCreate={(name, path, content, desc) => {
          onCreateFile(name, path, content, desc);
          setRestoredDraft(null);
        }}
        codeSpaceId={activeCodeSpaceId}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={onUploadFiles}
        activeCodeSpace={currentCodeSpace}
        onExportZip={handleExportZip}
      />

      {fileToDelete && (
        <DeleteConfirmModal
          file={fileToDelete}
          isOpen={!!fileToDelete}
          onClose={() => setFileToDelete(null)}
          onConfirm={(id, reason) => {
            onDeleteFile(id, reason);
            handleCloseTab(id);
            setFileToDelete(null);
          }}
        />
      )}
    </div>
  );
};
