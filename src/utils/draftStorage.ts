import { idbGetKeyVal, idbSetKeyVal } from './indexedDBStorage';

export interface NewFileDraft {
  codeSpaceId: string;
  filePath: string;
  content: string;
  description: string;
  timestamp: number;
}

interface FileEditDraft {
  content: string;
  timestamp: number;
}

const NEW_FILE_DRAFT_PREFIX = 'vms_draft_new_file_';
const FILE_EDIT_DRAFT_PREFIX = 'vms_draft_file_edit_';
const IDB_NEW_FILE_DRAFTS_KEY = 'vmsNewFileDrafts';
const IDB_FILE_EDIT_DRAFTS_KEY = 'vmsFileEditDrafts';

export const DRAFTS_HYDRATED_EVENT = 'vms-drafts-hydrated';

let memoryNewFileDrafts: Record<string, NewFileDraft> | null = null;
let memoryFileEditDrafts: Record<string, FileEditDraft> | null = null;

function readLocalNewFileDrafts(): Record<string, NewFileDraft> {
  const map: Record<string, NewFileDraft> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(NEW_FILE_DRAFT_PREFIX)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw) as NewFileDraft;
          const csId = k.slice(NEW_FILE_DRAFT_PREFIX.length);
          map[csId] = parsed;
        }
      }
    }
  } catch {
    // ignore storage read errors
  }
  return map;
}

function readLocalFileEditDrafts(): Record<string, FileEditDraft> {
  const map: Record<string, FileEditDraft> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(FILE_EDIT_DRAFT_PREFIX)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw) as FileEditDraft;
          if (typeof parsed?.content === 'string') {
            const fileId = k.slice(FILE_EDIT_DRAFT_PREFIX.length);
            map[fileId] = parsed;
          }
        }
      }
    }
  } catch {
    // ignore storage read errors
  }
  return map;
}

function getNewFileDraftsMap(): Record<string, NewFileDraft> {
  if (memoryNewFileDrafts === null) {
    memoryNewFileDrafts = readLocalNewFileDrafts();
  }
  return memoryNewFileDrafts;
}

function getFileEditDraftsMap(): Record<string, FileEditDraft> {
  if (memoryFileEditDrafts === null) {
    memoryFileEditDrafts = readLocalFileEditDrafts();
  }
  return memoryFileEditDrafts;
}

function persistNewFileDraftsToIDB(map: Record<string, NewFileDraft>): void {
  idbSetKeyVal(IDB_NEW_FILE_DRAFTS_KEY, map).catch((err) => {
    console.warn('[DraftStorage] Failed to save new file drafts to IndexedDB:', err);
  });
}

function persistFileEditDraftsToIDB(map: Record<string, FileEditDraft>): void {
  idbSetKeyVal(IDB_FILE_EDIT_DRAFTS_KEY, map).catch((err) => {
    console.warn('[DraftStorage] Failed to save file edit drafts to IndexedDB:', err);
  });
}

export function saveNewFileDraft(
  codeSpaceId: string,
  data: { filePath: string; content: string; description: string }
): void {
  const key = `${NEW_FILE_DRAFT_PREFIX}${codeSpaceId}`;
  const map = { ...getNewFileDraftsMap() };

  // If empty with no user changes, remove draft
  if (!data.content && !data.filePath) {
    delete map[codeSpaceId];
    memoryNewFileDrafts = map;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    persistNewFileDraftsToIDB(map);
    return;
  }

  const draft: NewFileDraft = {
    codeSpaceId,
    filePath: data.filePath,
    content: data.content,
    description: data.description,
    timestamp: Date.now(),
  };

  map[codeSpaceId] = draft;
  memoryNewFileDrafts = map;

  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // IndexedDB holds the authoritative persisted copy
  }
  persistNewFileDraftsToIDB(map);
}

export function getNewFileDraft(codeSpaceId: string): NewFileDraft | null {
  const map = getNewFileDraftsMap();
  return map[codeSpaceId] || null;
}

export function clearNewFileDraft(codeSpaceId: string): void {
  const key = `${NEW_FILE_DRAFT_PREFIX}${codeSpaceId}`;
  const map = { ...getNewFileDraftsMap() };
  delete map[codeSpaceId];
  memoryNewFileDrafts = map;

  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  persistNewFileDraftsToIDB(map);
}

export function saveFileEditDraft(fileId: string, content: string): void {
  const key = `${FILE_EDIT_DRAFT_PREFIX}${fileId}`;
  const entry: FileEditDraft = { content, timestamp: Date.now() };
  const map = { ...getFileEditDraftsMap(), [fileId]: entry };
  memoryFileEditDrafts = map;

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // IndexedDB holds the authoritative persisted copy
  }
  persistFileEditDraftsToIDB(map);
}

export function getFileEditDraft(fileId: string): string | null {
  const map = getFileEditDraftsMap();
  const entry = map[fileId];
  return typeof entry?.content === 'string' ? entry.content : null;
}

export function clearFileEditDraft(fileId: string): void {
  const key = `${FILE_EDIT_DRAFT_PREFIX}${fileId}`;
  const map = { ...getFileEditDraftsMap() };
  if (fileId in map) {
    delete map[fileId];
    memoryFileEditDrafts = map;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  persistFileEditDraftsToIDB(map);
}

export function clearAllDrafts(): void {
  memoryNewFileDrafts = {};
  memoryFileEditDrafts = {};
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(NEW_FILE_DRAFT_PREFIX) || k.startsWith(FILE_EDIT_DRAFT_PREFIX))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
  persistNewFileDraftsToIDB({});
  persistFileEditDraftsToIDB({});
}

/**
 * Hydrates new-file and file-edit drafts from IndexedDB on app startup.
 */
export async function hydrateDraftsFromIDB(): Promise<boolean> {
  try {
    const [idbNew, idbEdit] = await Promise.all([
      idbGetKeyVal<Record<string, NewFileDraft>>(IDB_NEW_FILE_DRAFTS_KEY),
      idbGetKeyVal<Record<string, FileEditDraft>>(IDB_FILE_EDIT_DRAFTS_KEY),
    ]);

    let updated = false;

    if (idbNew && typeof idbNew === 'object') {
      const current = getNewFileDraftsMap();
      const merged: Record<string, NewFileDraft> = { ...idbNew, ...current };
      if (JSON.stringify(merged) !== JSON.stringify(current)) {
        memoryNewFileDrafts = merged;
        updated = true;
      }
    }

    if (idbEdit && typeof idbEdit === 'object') {
      const current = getFileEditDraftsMap();
      const merged: Record<string, FileEditDraft> = { ...idbEdit, ...current };
      if (JSON.stringify(merged) !== JSON.stringify(current)) {
        memoryFileEditDrafts = merged;
        updated = true;
      }
    }

    if (updated && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DRAFTS_HYDRATED_EVENT));
    }

    return updated;
  } catch (err) {
    console.warn('[DraftStorage] IndexedDB hydration note:', err);
    return false;
  }
}
