import { idbGetKeyVal, idbSetKeyVal } from './indexedDBStorage';

const STORAGE_FOLDER_STATES_KEY = 'vms_codespace_folder_states_v1';
const IDB_FOLDER_STATES_KEY = 'codespaceFolderStates';
export const FOLDER_STATES_HYDRATED_EVENT = 'vms-folder-states-hydrated';

export type FolderCollapsedMap = Record<string, boolean>;
export type AllCodeSpaceFolderStates = Record<string, FolderCollapsedMap>;

let memoryFolderStates: AllCodeSpaceFolderStates | null = null;

function readLocalStorageFolderStates(): AllCodeSpaceFolderStates {
  try {
    const raw = localStorage.getItem(STORAGE_FOLDER_STATES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as AllCodeSpaceFolderStates;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Reads all persisted CodeSpace folder states synchronously from memory or localStorage.
 */
export function getAllFolderStates(): AllCodeSpaceFolderStates {
  if (memoryFolderStates !== null) {
    return memoryFolderStates;
  }
  memoryFolderStates = readLocalStorageFolderStates();
  return memoryFolderStates;
}

/**
 * Persists all folder states to memory, localStorage (instant sync read), and IndexedDB.
 */
function persistAllFolderStates(allStates: AllCodeSpaceFolderStates): void {
  memoryFolderStates = allStates;
  try {
    localStorage.setItem(STORAGE_FOLDER_STATES_KEY, JSON.stringify(allStates));
  } catch (err) {
    console.warn('[FolderState] Failed to save folder states to localStorage:', err);
  }
  idbSetKeyVal(IDB_FOLDER_STATES_KEY, allStates).catch((err) => {
    console.warn('[FolderState] Failed to save folder states to IndexedDB:', err);
  });
}

/**
 * Gets the exact collapsed/open folder map for a specific CodeSpace.
 * Value `true` means closed (collapsed); `false` means opened (expanded).
 */
export function getCodeSpaceFolderState(codeSpaceId: string): FolderCollapsedMap {
  if (!codeSpaceId) return {};
  const all = getAllFolderStates();
  const state = all[codeSpaceId];
  return state && typeof state === 'object' ? { ...state } : {};
}

/**
 * Saves the exact collapsed/open folder map for a specific CodeSpace.
 */
export function saveCodeSpaceFolderState(
  codeSpaceId: string,
  collapsedMap: FolderCollapsedMap
): void {
  if (!codeSpaceId) return;
  const all = { ...getAllFolderStates() };
  all[codeSpaceId] = { ...collapsedMap };
  persistAllFolderStates(all);
}

/**
 * Removes persisted folder state when a CodeSpace is deleted.
 */
export function clearCodeSpaceFolderState(codeSpaceId: string): void {
  if (!codeSpaceId) return;
  const all = { ...getAllFolderStates() };
  if (codeSpaceId in all) {
    delete all[codeSpaceId];
    persistAllFolderStates(all);
  }
}

/**
 * Clears all persisted folder states (used on workspace reset).
 */
export function clearAllCodeSpaceFolderStates(): void {
  memoryFolderStates = {};
  try {
    localStorage.removeItem(STORAGE_FOLDER_STATES_KEY);
  } catch {
    // ignore
  }
  idbSetKeyVal(IDB_FOLDER_STATES_KEY, {}).catch(() => {
    // ignore
  });
}

/**
 * Hydrates folder states from IndexedDB into memory and localStorage.
 * Dispatches an event if state was updated so any mounted FileTree syncs immediately.
 */
export async function hydrateFolderStatesFromIDB(): Promise<boolean> {
  try {
    const idbStates = await idbGetKeyVal<AllCodeSpaceFolderStates>(IDB_FOLDER_STATES_KEY);
    if (!idbStates || typeof idbStates !== 'object') return false;

    const currentStates = getAllFolderStates();
    const merged: AllCodeSpaceFolderStates = { ...idbStates };

    for (const [csId, localMap] of Object.entries(currentStates)) {
      merged[csId] = { ...(merged[csId] || {}), ...localMap };
    }

    const updated = JSON.stringify(merged) !== JSON.stringify(currentStates);
    memoryFolderStates = merged;

    if (updated) {
      try {
        localStorage.setItem(STORAGE_FOLDER_STATES_KEY, JSON.stringify(merged));
      } catch {
        // ignore quota errors; memory + IndexedDB already hold authoritative state
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(FOLDER_STATES_HYDRATED_EVENT));
      }
    }

    return updated;
  } catch (err) {
    console.warn('[FolderState] IndexedDB hydration note:', err);
    return false;
  }
}
