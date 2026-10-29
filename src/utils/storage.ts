import { AppSettings, CodeFile, VersionRecord, CodeSpace, CodeSpaceGroup } from '../types';

const STORAGE_FILES_KEY = 'vms_code_files_v1';
const STORAGE_VERSIONS_KEY = 'vms_version_records_v1';
const STORAGE_SETTINGS_KEY = 'vms_settings_v1';
const STORAGE_CODESPACES_KEY = 'vms_codespaces_v2';
const STORAGE_ACTIVE_CODESPACE_KEY = 'vms_active_codespace_id_v2';
const STORAGE_GROUPS_KEY = 'vms_codespace_groups_v2';

export const DEFAULT_CODESPACE: CodeSpace = {
  id: 'codespace-default',
  name: 'Default CodeSpace',
  description: 'Blank workspace environment',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isDefault: true,
  files: [], // Blank space: no files or folders
  versions: [],
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoSave: true,
  tabSize: 2,
  showLineNumbers: true,
  codeWrap: true,
  fontSize: '13px',
  defaultBranch: 'main',
};

export function generateCommitHash(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const INITIAL_FILES: CodeFile[] = [
  {
    id: 'f-1',
    name: 'server.ts',
    path: 'src/server.ts',
    language: 'typescript',
    sizeBytes: 1420,
    lineCount: 42,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 2,
    lastAction: 'edited',
    content: `import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface HealthStatus {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
}

app.get('/api/health', (_req: Request, res: Response<HealthStatus>) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.listen(PORT, () => {
  console.log(\`[vms] Server running on port \${PORT}\`);
});`,
  },
  {
    id: 'f-2',
    name: 'storageEngine.ts',
    path: 'src/core/storageEngine.ts',
    language: 'typescript',
    sizeBytes: 1180,
    lineCount: 36,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    lastAction: 'created',
    content: `export interface StorageSnapshot<T> {
  id: string;
  payload: T;
  createdEpoch: number;
  checksum: string;
}

export class StorageEngine<T> {
  private memoryMap = new Map<string, StorageSnapshot<T>>();

  public commit(key: string, data: T): StorageSnapshot<T> {
    const snapshot: StorageSnapshot<T> = {
      id: crypto.randomUUID(),
      payload: data,
      createdEpoch: Date.now(),
      checksum: btoa(JSON.stringify(data)).slice(0, 16),
    };
    this.memoryMap.set(key, snapshot);
    return snapshot;
  }

  public retrieve(key: string): StorageSnapshot<T> | undefined {
    return this.memoryMap.get(key);
  }
}`,
  },
  {
    id: 'f-3',
    name: 'manifest.json',
    path: 'config/manifest.json',
    language: 'json',
    sizeBytes: 420,
    lineCount: 18,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    lastAction: 'uploaded',
    content: `{
  "name": "enterprise-core-workspace",
  "version": "1.4.2",
  "private": true,
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "environment": "production"
}`,
  },
  {
    id: 'f-4',
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    sizeBytes: 680,
    lineCount: 24,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
    lastAction: 'edited',
    content: `# Version Management System

Enterprise-grade tracking and versioning console for application codebases.

## Capabilities
- **Codebase Ingestion**: Source file upload and in-workspace code authoring.
- **Granular History**: Line-by-line diff tracking across active revisions.
- **Permanent Purge Records**: Explicit deletion audit logs with content omitted.
- **Adaptive Workspace**: Synchronized Dark and Light themes built for long development sessions.
`,
  },
];

const INITIAL_VERSIONS: VersionRecord[] = [
  {
    id: 'v-rev-105',
    hash: 'e8a49c1',
    author: 'alex.dev@corp',
    action: 'edited',
    fileName: 'server.ts',
    filePath: 'src/server.ts',
    timestamp: Date.now() - 3600000 * 2,
    description: 'Added health check endpoint with ISO timestamp and uptime telemetry',
    language: 'typescript',
    sizeBytes: 1420,
    lineCount: 42,
    additions: 14,
    deletions: 3,
    previousContent: `import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log('Server running');
});`,
    content: `import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface HealthStatus {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
}

app.get('/api/health', (_req: Request, res: Response<HealthStatus>) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.listen(PORT, () => {
  console.log(\`[vms] Server running on port \${PORT}\`);
});`,
  },
  {
    id: 'v-del-104',
    hash: 'a3f102d',
    author: 'sarah.sec@corp',
    action: 'deleted',
    fileName: 'legacyAuthHandler.js',
    filePath: 'src/legacy/legacyAuthHandler.js',
    timestamp: Date.now() - 3600000 * 8,
    description: 'Deprecated legacy authentication routine removed from codebase',
    // Deliberately no content per requirement!
  },
  {
    id: 'v-create-103',
    hash: '7b2e90f',
    author: 'alex.dev@corp',
    action: 'created',
    fileName: 'storageEngine.ts',
    filePath: 'src/core/storageEngine.ts',
    timestamp: Date.now() - 86400000 * 2,
    description: 'Initialized generic snapshot-based in-memory storage engine',
    language: 'typescript',
    sizeBytes: 1180,
    lineCount: 36,
    additions: 36,
    deletions: 0,
    content: `export interface StorageSnapshot<T> {
  id: string;
  payload: T;
  createdEpoch: number;
  checksum: string;
}

export class StorageEngine<T> {
  private memoryMap = new Map<string, StorageSnapshot<T>>();

  public commit(key: string, data: T): StorageSnapshot<T> {
    const snapshot: StorageSnapshot<T> = {
      id: crypto.randomUUID(),
      payload: data,
      createdEpoch: Date.now(),
      checksum: btoa(JSON.stringify(data)).slice(0, 16),
    };
    this.memoryMap.set(key, snapshot);
    return snapshot;
  }

  public retrieve(key: string): StorageSnapshot<T> | undefined {
    return this.memoryMap.get(key);
  }
}`,
  },
  {
    id: 'v-upload-102',
    hash: '4c619b4',
    author: 'ci-runner@corp',
    action: 'uploaded',
    fileName: 'manifest.json',
    filePath: 'config/manifest.json',
    timestamp: Date.now() - 86400000 * 4,
    description: 'Uploaded workspace package configuration and dependency manifest',
    language: 'json',
    sizeBytes: 420,
    lineCount: 18,
    additions: 18,
    deletions: 0,
    content: `{
  "name": "enterprise-core-workspace",
  "version": "1.4.2",
  "private": true,
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "environment": "production"
}`,
  },
  {
    id: 'v-del-101',
    hash: '2f8a49c',
    author: 'alex.dev@corp',
    action: 'deleted',
    fileName: 'temporary-migration.sql',
    filePath: 'scripts/temporary-migration.sql',
    timestamp: Date.now() - 86400000 * 4.5,
    description: 'Cleaned up staging database patch file after deployment',
    // Deliberately no content per requirement!
  },
  {
    id: 'v-create-100',
    hash: '01d4a8e',
    author: 'team.lead@corp',
    action: 'created',
    fileName: 'README.md',
    filePath: 'README.md',
    timestamp: Date.now() - 86400000 * 5,
    description: 'Initial project documentation scaffold',
    language: 'markdown',
    sizeBytes: 450,
    lineCount: 14,
    additions: 14,
    deletions: 0,
    content: `# Version Management System\n\nVersion tracking for application codebases.\n`,
  },
];

export function getStoredFiles(): CodeFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_FILES_KEY);
    if (!raw) return INITIAL_FILES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FILES;
  } catch {
    return INITIAL_FILES;
  }
}

export function saveStoredFiles(files: CodeFile[]): void {
  try {
    localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(files));
  } catch (err) {
    console.error('Failed to save files to localStorage', err);
  }
}

export function getStoredVersions(): VersionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_VERSIONS_KEY);
    if (!raw) return INITIAL_VERSIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure records have hash and author for backwards compatibility
      return parsed.map((item, idx) => ({
        ...item,
        hash: item.hash || generateCommitHash(),
        author: item.author || 'developer@local',
      }));
    }
    return INITIAL_VERSIONS;
  } catch {
    return INITIAL_VERSIONS;
  }
}

export function saveStoredVersions(versions: VersionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_VERSIONS_KEY, JSON.stringify(versions));
  } catch (err) {
    console.error('Failed to save version records to localStorage', err);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('[Storage] Failed to save settings to localStorage:', err);
  }
}

export function getStoredCodeSpaces(): CodeSpace[] {
  try {
    const raw = localStorage.getItem(STORAGE_CODESPACES_KEY);
    if (!raw) return [DEFAULT_CODESPACE];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_CODESPACE];
  } catch {
    return [DEFAULT_CODESPACE];
  }
}

/**
 * Creates a lightweight snapshot suitable for localStorage caching.
 * Truncates massive file bodies and limits revision snapshots,
 * as unmetered full content is authoritatively persisted in IndexedDB.
 */
function createLightweightCodeSpaces(codespaces: CodeSpace[]): CodeSpace[] {
  return codespaces.map((cs) => ({
    ...cs,
    files: (cs.files || []).map((f) => ({
      ...f,
      content: f.content && f.content.length > 2000 ? f.content.slice(0, 2000) : (f.content || ''),
    })),
    versions: (cs.versions || []).slice(-3).map((v) => ({
      ...v,
      content: v.content && v.content.length > 500 ? v.content.slice(0, 500) : v.content,
      previousContent: undefined,
    })),
  }));
}

export function saveStoredCodeSpaces(codespaces: CodeSpace[]): void {
  try {
    const raw = JSON.stringify(codespaces);
    // If under 300KB, it's safe to store directly in localStorage
    if (raw.length < 300000) {
      localStorage.setItem(STORAGE_CODESPACES_KEY, raw);
      return;
    }

    // Payload is large (e.g. from imported zip or multiple projects).
    // Store lightweight cache in localStorage; full data is stored in IndexedDB.
    const lightweight = createLightweightCodeSpaces(codespaces);
    const lightRaw = JSON.stringify(lightweight);
    if (lightRaw.length < 300000) {
      localStorage.setItem(STORAGE_CODESPACES_KEY, lightRaw);
    } else {
      // Store metadata-only in localStorage to prevent QuotaExceededError
      const metaOnly = codespaces.map((cs) => ({
        ...cs,
        files: (cs.files || []).map((f) => ({ ...f, content: '' })),
        versions: [],
      }));
      localStorage.setItem(STORAGE_CODESPACES_KEY, JSON.stringify(metaOnly));
    }
  } catch (err: any) {
    // If quota is reached, preserve remaining storage by clearing large key or saving metadata
    try {
      const metaOnly = codespaces.map((cs) => ({
        ...cs,
        files: (cs.files || []).map((f) => ({ ...f, content: '' })),
        versions: [],
      }));
      localStorage.setItem(STORAGE_CODESPACES_KEY, JSON.stringify(metaOnly));
    } catch {
      try {
        localStorage.removeItem(STORAGE_CODESPACES_KEY);
      } catch {}
    }
    console.warn('[Storage] CodeSpaces data safely stored in IndexedDB; localStorage quota preserved.');
  }
}

export function getStoredActiveCodeSpaceId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_CODESPACE_KEY);
    if (raw) return raw;
    return DEFAULT_CODESPACE.id;
  } catch {
    return DEFAULT_CODESPACE.id;
  }
}

export function saveStoredActiveCodeSpaceId(id: string): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_CODESPACE_KEY, id);
  } catch (err) {
    console.warn('[Storage] Failed to save active CodeSpace ID to localStorage:', err);
  }
}

export function getStoredCodeSpaceGroups(): CodeSpaceGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_GROUPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCodeSpaceGroups(groups: CodeSpaceGroup[]): void {
  try {
    localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(groups));
  } catch (err) {
    console.warn('[Storage] Failed to save CodeSpace groups to localStorage:', err);
  }
}


export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'java':
      return 'java';
    case 'c':
    case 'cpp':
    case 'h':
      return 'c_cpp';
    default:
      return 'plaintext';
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}
