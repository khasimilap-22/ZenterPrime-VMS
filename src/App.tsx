import React, { useState, useEffect } from 'react';
import {
  CodeFile,
  VersionRecord,
  AppSettings,
  CodeSpace,
  CodeSpaceGroup,
} from './types';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredCodeSpaces,
  saveStoredCodeSpaces,
  getStoredActiveCodeSpaceId,
  saveStoredActiveCodeSpaceId,
  getStoredCodeSpaceGroups,
  saveStoredCodeSpaceGroups,
  generateCommitHash,
  DEFAULT_CODESPACE,
} from './utils/storage';
import {
  idbGetCodeSpaces,
  idbSaveCodeSpaces,
  idbGetGroups,
  idbSaveGroups,
  idbGetKeyVal,
  idbSetKeyVal,
  idbClearAll,
} from './utils/indexedDBStorage';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CodeSpacesView } from './components/CodeSpacesView';
import { CodebaseExplorer } from './components/CodebaseExplorer';
import { VersionsView } from './components/VersionsView';
import { GroupsView } from './components/GroupsView';
import { SettingsView } from './components/SettingsView';
import { CommandPalette } from './components/CommandPalette';
import { DemoAccountModal } from './components/DemoAccountModal';
import { CreateEditCodeSpaceModal } from './components/codespaces/CreateEditCodeSpaceModal';
import { MergeCodeSpacesModal } from './components/codespaces/MergeCodeSpacesModal';
import { GroupEditorModal } from './components/codespaces/GroupEditorModal';
import { DeleteCodeSpaceWarningModal } from './components/codespaces/DeleteCodeSpaceWarningModal';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [codespaces, setCodespaces] = useState<CodeSpace[]>(() => getStoredCodeSpaces());
  const [activeCodeSpaceId, setActiveCodeSpaceId] = useState<string>(() => getStoredActiveCodeSpaceId());
  const [groups, setGroups] = useState<CodeSpaceGroup[]>(() => getStoredCodeSpaceGroups());
  const [isDemoAccountModalOpen, setIsDemoAccountModalOpen] = useState(false);

  // Navigation & Layout State matching reference screenshots
  const [currentTab, setCurrentTab] = useState<MainNavTab>('codespaces');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Modals state
  const [isCreateCodeSpaceModalOpen, setIsCreateCodeSpaceModalOpen] = useState(false);
  const [editingCodeSpace, setEditingCodeSpace] = useState<CodeSpace | null>(null);
  const [codeSpaceToDelete, setCodeSpaceToDelete] = useState<CodeSpace | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CodeSpaceGroup | null>(null);

  // Active CodeSpace resolution
  const activeCodeSpace =
    codespaces.find((c) => c.id === activeCodeSpaceId) || codespaces[0] || DEFAULT_CODESPACE;

  const files = activeCodeSpace.files || [];
  const versions = activeCodeSpace.versions || [];

  const [selectedFileId, setSelectedFileId] = useState<string | null>(() => {
    return files.length > 0 ? files[0].id : null;
  });

  // Apply theme to HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveStoredSettings(settings);
    idbSetKeyVal('settings', settings);
  }, [settings]);

  // Hydrate state from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    async function hydrateFromIndexedDB() {
      try {
        const [idbCodespaces, idbGroupsList, idbActiveId, idbSettings] = await Promise.all([
          idbGetCodeSpaces(),
          idbGetGroups(),
          idbGetKeyVal<string>('activeCodeSpaceId'),
          idbGetKeyVal<AppSettings>('settings'),
        ]);

        if (!isMounted) return;

        if (idbCodespaces && idbCodespaces.length > 0) {
          setCodespaces(idbCodespaces);
        } else {
          idbSaveCodeSpaces(codespaces);
        }

        if (idbGroupsList) {
          setGroups(idbGroupsList);
        } else {
          idbSaveGroups(groups);
        }

        if (idbActiveId) {
          setActiveCodeSpaceId(idbActiveId);
        } else {
          idbSetKeyVal('activeCodeSpaceId', activeCodeSpaceId);
        }

        if (idbSettings) {
          setSettings(idbSettings);
        } else {
          idbSetKeyVal('settings', settings);
        }
      } catch (err) {
        console.warn('IndexedDB initial hydration note:', err);
      }
    }
    hydrateFromIndexedDB();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist CodeSpaces to localStorage and IndexedDB
  useEffect(() => {
    saveStoredCodeSpaces(codespaces);
    idbSaveCodeSpaces(codespaces);
  }, [codespaces]);

  // Persist active CodeSpace ID
  useEffect(() => {
    saveStoredActiveCodeSpaceId(activeCodeSpaceId);
    idbSetKeyVal('activeCodeSpaceId', activeCodeSpaceId);
  }, [activeCodeSpaceId]);

  // Persist Groups
  useEffect(() => {
    saveStoredCodeSpaceGroups(groups);
    idbSaveGroups(groups);
  }, [groups]);

  // Global keyboard shortcuts (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Helper to update files and versions on the active CodeSpace
  const updateActiveCodeSpaceData = (
    nextFiles: CodeFile[],
    nextVersions: VersionRecord[]
  ) => {
    setCodespaces((prev) =>
      prev.map((cs) => {
        if (cs.id === activeCodeSpace.id) {
          return {
            ...cs,
            files: nextFiles,
            versions: nextVersions,
            updatedAt: Date.now(),
          };
        }
        return cs;
      })
    );
  };

  // 1. Create file handler
  const handleCreateFile = (name: string, path: string, content: string, description: string) => {
    const lines = content.split('\n').length;
    const size = new Blob([content]).size;
    const newFile: CodeFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      path,
      content,
      language: name.split('.').pop() || 'text',
      sizeBytes: size,
      lineCount: lines,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastAction: 'created',
    };

    const versionRecord: VersionRecord = {
      id: `v-create-${Date.now().toString().slice(-4)}`,
      hash: generateCommitHash(),
      author: 'developer@workspace',
      action: 'created',
      fileName: name,
      filePath: path,
      timestamp: Date.now(),
      description,
      language: newFile.language,
      sizeBytes: size,
      lineCount: lines,
      additions: lines,
      deletions: 0,
      content,
    };

    const nextFiles = [newFile, ...files];
    const nextVersions = [versionRecord, ...versions];
    updateActiveCodeSpaceData(nextFiles, nextVersions);
    setSelectedFileId(newFile.id);
  };

  // 2. Upload files handler
  const handleUploadFiles = (
    uploadedList: {
      name: string;
      path: string;
      content: string;
      language: string;
      sizeBytes: number;
      lineCount: number;
    }[],
    batchDescription: string
  ) => {
    const newFiles: CodeFile[] = [];
    const newVersions: VersionRecord[] = [];

    uploadedList.forEach((item, index) => {
      const fileId = `file-up-${Date.now()}-${index}`;
      const newFile: CodeFile = {
        id: fileId,
        name: item.name,
        path: item.path,
        content: item.content,
        language: item.language,
        sizeBytes: item.sizeBytes,
        lineCount: item.lineCount,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastAction: 'uploaded',
      };
      newFiles.push(newFile);

      newVersions.push({
        id: `v-upload-${Date.now().toString().slice(-4)}-${index + 1}`,
        hash: generateCommitHash(),
        author: 'developer@workspace',
        action: 'uploaded',
        fileName: item.name,
        filePath: item.path,
        timestamp: Date.now() + index,
        description: `${batchDescription} (${item.name})`,
        language: item.language,
        sizeBytes: item.sizeBytes,
        lineCount: item.lineCount,
        additions: item.lineCount,
        deletions: 0,
        content: item.content,
      });
    });

    const nextFiles = [...newFiles, ...files];
    const nextVersions = [...newVersions, ...versions];
    updateActiveCodeSpaceData(nextFiles, nextVersions);
    if (newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
    }
  };

  // 3. Edit & save file handler
  const handleSaveFileContent = (fileId: string, updatedContent: string, commitNote: string) => {
    const targetFile = files.find((f) => f.id === fileId);
    if (!targetFile) return;

    const previousContent = targetFile.content;
    const oldLines = previousContent.split('\n').length;
    const lines = updatedContent.split('\n').length;
    const size = new Blob([updatedContent]).size;

    const updatedFile: CodeFile = {
      ...targetFile,
      content: updatedContent,
      sizeBytes: size,
      lineCount: lines,
      updatedAt: Date.now(),
      lastAction: 'edited',
    };

    const versionRecord: VersionRecord = {
      id: `v-rev-${Date.now().toString().slice(-4)}`,
      hash: generateCommitHash(),
      author: 'developer@workspace',
      action: 'edited',
      fileName: targetFile.name,
      filePath: targetFile.path,
      timestamp: Date.now(),
      description: commitNote,
      language: targetFile.language,
      sizeBytes: size,
      lineCount: lines,
      additions: Math.max(0, lines - oldLines),
      deletions: Math.max(0, oldLines - lines),
      previousContent,
      content: updatedContent,
    };

    const nextFiles = files.map((f) => (f.id === fileId ? updatedFile : f));
    const nextVersions = [versionRecord, ...versions];
    updateActiveCodeSpaceData(nextFiles, nextVersions);
  };

  // 4. Delete file handler
  const handleDeleteFile = (fileId: string, reason: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    const deletionVersion: VersionRecord = {
      id: `v-del-${Date.now().toString().slice(-4)}`,
      hash: generateCommitHash(),
      author: 'developer@workspace',
      action: 'deleted',
      fileName: file.name,
      filePath: file.path,
      timestamp: Date.now(),
      description: reason,
    };

    const nextFiles = files.filter((f) => f.id !== fileId);
    const nextVersions = [deletionVersion, ...versions];
    updateActiveCodeSpaceData(nextFiles, nextVersions);

    if (selectedFileId === fileId) {
      setSelectedFileId(nextFiles.length > 0 ? nextFiles[0].id : null);
    }
  };

  // 5. Restore version handler
  const handleRestoreVersion = (record: VersionRecord) => {
    if (!record.content) return;

    const existingFile = files.find((f) => f.path === record.filePath);
    const lines = record.content.split('\n').length;
    const size = new Blob([record.content]).size;

    if (existingFile) {
      handleSaveFileContent(
        existingFile.id,
        record.content,
        `Restored from revision ${record.hash || record.id} (${record.fileName})`
      );
      setSelectedFileId(existingFile.id);
    } else {
      const restoredFile: CodeFile = {
        id: `file-restored-${Date.now()}`,
        name: record.fileName,
        path: record.filePath,
        content: record.content,
        language: record.language || 'text',
        sizeBytes: size,
        lineCount: lines,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastAction: 'created',
      };

      const restoreLog: VersionRecord = {
        id: `v-rev-${Date.now().toString().slice(-4)}`,
        hash: generateCommitHash(),
        author: 'developer@workspace',
        action: 'created',
        fileName: record.fileName,
        filePath: record.filePath,
        timestamp: Date.now(),
        description: `Restored ${record.fileName} from historic revision ${record.hash || record.id}`,
        language: record.language,
        sizeBytes: size,
        lineCount: lines,
        additions: lines,
        deletions: 0,
        content: record.content,
      };

      const nextFiles = [restoredFile, ...files];
      const nextVersions = [restoreLog, ...versions];
      updateActiveCodeSpaceData(nextFiles, nextVersions);
      setSelectedFileId(restoredFile.id);
    }

    setCurrentTab('codebase');
  };

  // Select CodeSpace
  const handleSelectCodeSpace = (id: string) => {
    setActiveCodeSpaceId(id);
    const target = codespaces.find((c) => c.id === id);
    if (target && target.files && target.files.length > 0) {
      setSelectedFileId(target.files[0].id);
    } else {
      setSelectedFileId(null);
    }
  };

  // Create CodeSpace
  const handleCreateCodeSpace = (
    name: string,
    description: string,
    cloneFromCurrent: boolean
  ) => {
    const newId = `cs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newCodeSpace: CodeSpace = {
      id: newId,
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
      files: cloneFromCurrent ? JSON.parse(JSON.stringify(files)) : [],
      versions: cloneFromCurrent ? JSON.parse(JSON.stringify(versions)) : [],
    };

    setCodespaces((prev) => [newCodeSpace, ...prev]);
    setActiveCodeSpaceId(newId);
    setSelectedFileId(newCodeSpace.files.length > 0 ? newCodeSpace.files[0].id : null);
    setCurrentTab('codebase');
  };

  // Edit CodeSpace
  const handleSaveEditCodeSpace = (name: string, description: string) => {
    if (!editingCodeSpace) return;
    const targetId = editingCodeSpace.id;
    setCodespaces((prev) =>
      prev.map((c) => (c.id === targetId ? { ...c, name, description, updatedAt: Date.now() } : c))
    );
    setEditingCodeSpace(null);
  };

  // Delete CodeSpace
  const handleConfirmDeleteCodeSpace = (id: string) => {
    // 1. Remove from all groups
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        codespaceIds: g.codespaceIds.filter((cid) => cid !== id),
        pinnedIds: g.pinnedIds ? g.pinnedIds.filter((pid) => pid !== id) : [],
      }))
    );

    // 2. Remove from codespaces list
    const remaining = codespaces.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      setCodespaces([]);
      setActiveCodeSpaceId('');
      setSelectedFileId(null);
      setCurrentTab('codespaces');
    } else {
      setCodespaces(remaining);
      if (activeCodeSpaceId === id) {
        const next = remaining[0];
        setActiveCodeSpaceId(next.id);
        setSelectedFileId(next.files && next.files.length > 0 ? next.files[0].id : null);
      }
    }
    setCodeSpaceToDelete(null);
  };

  // Merge CodeSpaces to Group
  const handleMergeToGroup = (
    groupTitle: string,
    groupDescription: string,
    selectedIds: string[]
  ) => {
    const newGroup: CodeSpaceGroup = {
      id: `grp-${Date.now()}`,
      name: groupTitle,
      description: groupDescription,
      codespaceIds: selectedIds,
      pinnedIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setCurrentTab('groups');
  };

  // Save Group updates (reorder, rename, pin)
  const handleSaveGroup = (updatedGroup: CodeSpaceGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
    setEditingGroup(null);
  };

  // Delete Group
  const handleDeleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setEditingGroup(null);
  };

  // Reset workspace
  const handleResetWorkspace = async () => {
    try {
      await idbClearAll();
    } catch (err) {
      console.error('Failed to clear IndexedDB:', err);
    }
    localStorage.removeItem('vms_codespaces_v2');
    localStorage.removeItem('vms_active_codespace_id_v2');
    localStorage.removeItem('vms_codespace_groups_v2');
    localStorage.removeItem('vms_code_files_v1');
    localStorage.removeItem('vms_version_records_v1');
    localStorage.removeItem('vms_settings_v1');
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased font-sans transition-colors">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
        activeTab={currentTab}
        onSelectTab={setCurrentTab}
        codespaceCount={codespaces.length}
        versionCount={versions.length}
        groupCount={groups.length}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar matching reference screenshot */}
        <TopBar
          currentTab={currentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
          onOpenCreateCodeSpaceModal={() => setIsCreateCodeSpaceModalOpen(true)}
          activeCodeSpaceName={activeCodeSpace.name}
          onBackToCodeSpaces={() => setCurrentTab('codespaces')}
          onOpenDemoAccountModal={() => setIsDemoAccountModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {currentTab === 'codespaces' && (
            <CodeSpacesView
              codeSpaces={codespaces}
              activeCodeSpaceId={activeCodeSpace.id}
              groups={groups}
              searchQuery={searchQuery}
              onSelectAndOpenCodeSpace={(id) => {
                handleSelectCodeSpace(id);
                setCurrentTab('codebase');
              }}
              onOpenCreateModal={() => setIsCreateCodeSpaceModalOpen(true)}
              onOpenEditModal={(cs) => setEditingCodeSpace(cs)}
              onOpenDeleteWarningModal={(cs) => setCodeSpaceToDelete(cs)}
              onOpenMergeModal={() => setIsMergeModalOpen(true)}
            />
          )}

          {currentTab === 'codebase' && (
            <CodebaseExplorer
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
              settings={settings}
              onCreateFile={handleCreateFile}
              onUploadFiles={handleUploadFiles}
              onSaveFileContent={handleSaveFileContent}
              onDeleteFile={handleDeleteFile}
              onNavigateToVersions={() => setCurrentTab('versions')}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              activeCodeSpaceName={activeCodeSpace.name}
              codeSpaces={codespaces}
              activeCodeSpaceId={activeCodeSpace.id}
              groups={groups}
              onSelectCodeSpace={handleSelectCodeSpace}
              onOpenCreateCodeSpaceModal={() => setIsCreateCodeSpaceModalOpen(true)}
              onOpenEditCodeSpaceModal={(cs) => setEditingCodeSpace(cs)}
              onOpenDeleteCodeSpaceWarningModal={(cs) => setCodeSpaceToDelete(cs)}
              onOpenMergeCodeSpacesModal={() => setIsMergeModalOpen(true)}
              onOpenGroupEditorModal={(grp) => setEditingGroup(grp)}
              onBackToCodeSpaces={() => setCurrentTab('codespaces')}
            />
          )}

          {currentTab === 'versions' && (
            <VersionsView
              versions={versions}
              onRestoreVersion={handleRestoreVersion}
            />
          )}

          {currentTab === 'groups' && (
            <GroupsView
              groups={groups}
              codeSpaces={codespaces}
              onOpenMergeModal={() => setIsMergeModalOpen(true)}
              onOpenGroupEditorModal={(grp) => setEditingGroup(grp)}
              onSelectAndOpenCodeSpace={(id) => {
                handleSelectCodeSpace(id);
                setCurrentTab('codebase');
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetWorkspace={handleResetWorkspace}
              fileCount={files.length}
              versionCount={versions.length}
            />
          )}
        </main>
      </div>

      {/* Global Quick Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        versions={versions}
        onSelectFile={setSelectedFileId}
        onNavigateTab={(tab) => {
          if (tab === 'codebase' || tab === 'versions' || tab === 'settings') {
            setCurrentTab(tab);
          }
        }}
        onOpenNewFileModal={() => {
          setCurrentTab('codebase');
        }}
        onOpenUploadModal={() => {
          setCurrentTab('codebase');
        }}
        onToggleTheme={handleToggleTheme}
        currentTheme={settings.theme}
      />

      {/* CodeSpace Creation Modal */}
      <CreateEditCodeSpaceModal
        isOpen={isCreateCodeSpaceModalOpen}
        onClose={() => setIsCreateCodeSpaceModalOpen(false)}
        onSave={(name, desc, clone) => handleCreateCodeSpace(name, desc, clone)}
        activeCodeSpaceName={activeCodeSpace.name}
      />

      {/* CodeSpace Edit Modal */}
      {editingCodeSpace && (
        <CreateEditCodeSpaceModal
          isOpen={!!editingCodeSpace}
          onClose={() => setEditingCodeSpace(null)}
          editingCodeSpace={editingCodeSpace}
          onSave={(name, desc) => handleSaveEditCodeSpace(name, desc)}
        />
      )}

      {/* CodeSpace Deletion Warning Modal (Erases code files) */}
      <DeleteCodeSpaceWarningModal
        isOpen={!!codeSpaceToDelete}
        codeSpace={codeSpaceToDelete}
        onClose={() => setCodeSpaceToDelete(null)}
        onConfirm={handleConfirmDeleteCodeSpace}
      />

      {/* Merge CodeSpaces Modal */}
      <MergeCodeSpacesModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        codeSpaces={codespaces}
        onMergeToGroup={handleMergeToGroup}
      />

      {/* Group Editor Modal */}
      {editingGroup && (
        <GroupEditorModal
          isOpen={!!editingGroup}
          group={editingGroup}
          codeSpaces={codespaces}
          onClose={() => setEditingGroup(null)}
          onSaveGroup={handleSaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onEditCodeSpace={(cs) => setEditingCodeSpace(cs)}
          onDeleteCodeSpaceRequest={(cs) => setCodeSpaceToDelete(cs)}
        />
      )}

      {/* Demo Account Profile & Storage Modal */}
      <DemoAccountModal
        isOpen={isDemoAccountModalOpen}
        onClose={() => setIsDemoAccountModalOpen(false)}
        codespaces={codespaces}
        groups={groups}
        activeCodeSpaceName={activeCodeSpace.name}
        onResetWorkspace={handleResetWorkspace}
      />
    </div>
  );
}
