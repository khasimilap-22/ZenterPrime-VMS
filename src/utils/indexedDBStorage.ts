import { CodeSpace, CodeSpaceGroup, AppSettings } from '../types';

const DB_NAME = 'ZenterPrime_VMS_IndexedDB';
const DB_VERSION = 1;

const STORE_CODESPACES = 'codespaces';
const STORE_GROUPS = 'groups';
const STORE_KEYVAL = 'keyval';

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens or initializes the IndexedDB database.
 */
export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Object store for CodeSpaces (primary key: id)
      if (!db.objectStoreNames.contains(STORE_CODESPACES)) {
        db.createObjectStore(STORE_CODESPACES, { keyPath: 'id' });
      }

      // Object store for Groups (primary key: id)
      if (!db.objectStoreNames.contains(STORE_GROUPS)) {
        db.createObjectStore(STORE_GROUPS, { keyPath: 'id' });
      }

      // Object store for Key-Value pairs (e.g., activeCodeSpaceId, settings)
      if (!db.objectStoreNames.contains(STORE_KEYVAL)) {
        db.createObjectStore(STORE_KEYVAL, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Loads all CodeSpaces from IndexedDB.
 */
export async function idbGetCodeSpaces(): Promise<CodeSpace[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CODESPACES, 'readonly');
      const store = tx.objectStore(STORE_CODESPACES);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result;
        if (Array.isArray(results) && results.length > 0) {
          resolve(results as CodeSpace[]);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        console.error('Failed to read CodeSpaces from IndexedDB:', req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('idbGetCodeSpaces error:', err);
    return null;
  }
}

/**
 * Saves all CodeSpaces into IndexedDB (clears and re-inserts to keep in sync).
 */
export async function idbSaveCodeSpaces(codespaces: CodeSpace[]): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CODESPACES, 'readwrite');
      const store = tx.objectStore(STORE_CODESPACES);

      store.clear();
      for (const cs of codespaces) {
        store.put(cs);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.error('Failed to save CodeSpaces to IndexedDB:', tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    console.error('idbSaveCodeSpaces error:', err);
  }
}

/**
 * Loads all CodeSpace Groups from IndexedDB.
 */
export async function idbGetGroups(): Promise<CodeSpaceGroup[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_GROUPS, 'readonly');
      const store = tx.objectStore(STORE_GROUPS);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result;
        if (Array.isArray(results)) {
          resolve(results as CodeSpaceGroup[]);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        console.error('Failed to read Groups from IndexedDB:', req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('idbGetGroups error:', err);
    return null;
  }
}

/**
 * Saves all Groups into IndexedDB.
 */
export async function idbSaveGroups(groups: CodeSpaceGroup[]): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_GROUPS, 'readwrite');
      const store = tx.objectStore(STORE_GROUPS);

      store.clear();
      for (const group of groups) {
        store.put(group);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.error('Failed to save Groups to IndexedDB:', tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    console.error('idbSaveGroups error:', err);
  }
}

/**
 * Sets a key-value pair in IndexedDB.
 */
export async function idbSetKeyVal(key: string, value: any): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_KEYVAL, 'readwrite');
      const store = tx.objectStore(STORE_KEYVAL);
      store.put({ key, value });

      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.error(`Failed to set key "${key}" in IndexedDB:`, tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    console.error('idbSetKeyVal error:', err);
  }
}

/**
 * Gets a key-value pair from IndexedDB.
 */
export async function idbGetKeyVal<T = any>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_KEYVAL, 'readonly');
      const store = tx.objectStore(STORE_KEYVAL);
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result && 'value' in req.result) {
          resolve(req.result.value as T);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        console.error(`Failed to get key "${key}" from IndexedDB:`, req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('idbGetKeyVal error:', err);
    return null;
  }
}

/**
 * Clears all data from IndexedDB stores (for reset workspace).
 */
export async function idbClearAll(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_CODESPACES, STORE_GROUPS, STORE_KEYVAL], 'readwrite');
      tx.objectStore(STORE_CODESPACES).clear();
      tx.objectStore(STORE_GROUPS).clear();
      tx.objectStore(STORE_KEYVAL).clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('idbClearAll error:', err);
  }
}
