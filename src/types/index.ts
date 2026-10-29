export type VersionActionType = 'uploaded' | 'created' | 'edited' | 'deleted';

export type VersionFilterTab = 'all' | 'uploaded' | 'created' | 'edited' | 'deleted';

export type ThemeMode = 'light' | 'dark';

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  sizeBytes: number;
  lineCount: number;
  createdAt: number;
  updatedAt: number;
  lastAction: VersionActionType;
  isModified?: boolean;
}

export interface VersionRecord {
  id: string;
  hash: string;
  action: VersionActionType;
  fileName: string;
  filePath: string;
  timestamp: number;
  description: string;
  author: string;
  // Content is only stored for uploaded, created, or edited files.
  // Strictly undefined / omitted for deleted files as per requirements!
  content?: string;
  previousContent?: string;
  language?: string;
  sizeBytes?: number;
  lineCount?: number;
  additions?: number;
  deletions?: number;
}

export interface CodeSpace {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
  files: CodeFile[];
  versions: VersionRecord[];
}

export interface CodeSpaceGroup {
  id: string;
  name: string;
  description: string;
  codespaceIds: string[]; // ordered array for drag-and-drop
  pinnedIds: string[];    // up to 2 pinned codespace IDs
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: ThemeMode;
  autoSave: boolean;
  tabSize: number;
  showLineNumbers: boolean;
  codeWrap: boolean;
  fontSize: '12px' | '13px' | '14px';
  defaultBranch: string;
}

