export interface NewFileDraft {
  codeSpaceId: string;
  filePath: string;
  content: string;
  description: string;
  timestamp: number;
}

const NEW_FILE_DRAFT_PREFIX = 'vms_draft_new_file_';
const FILE_EDIT_DRAFT_PREFIX = 'vms_draft_file_edit_';
const DRAFT_SESSION_RESTORED_KEY = 'vms_draft_session_restored_tag_';

export function saveNewFileDraft(
  codeSpaceId: string,
  data: { filePath: string; content: string; description: string }
): void {
  try {
    const key = `${NEW_FILE_DRAFT_PREFIX}${codeSpaceId}`;
    // If empty or default placeholder with no user changes, don't store useless drafts
    if (!data.content && !data.filePath) {
      localStorage.removeItem(key);
      return;
    }
    const draft: NewFileDraft = {
      codeSpaceId,
      filePath: data.filePath,
      content: data.content,
      description: data.description,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (err) {
    console.warn('[DraftStorage] Failed to save new file draft:', err);
  }
}

export function getNewFileDraft(codeSpaceId: string): NewFileDraft | null {
  try {
    const key = `${NEW_FILE_DRAFT_PREFIX}${codeSpaceId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: NewFileDraft = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.warn('[DraftStorage] Failed to get new file draft:', err);
    return null;
  }
}

export function clearNewFileDraft(codeSpaceId: string): void {
  try {
    const key = `${NEW_FILE_DRAFT_PREFIX}${codeSpaceId}`;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('[DraftStorage] Failed to clear new file draft:', err);
  }
}

export function saveFileEditDraft(fileId: string, content: string): void {
  try {
    const key = `${FILE_EDIT_DRAFT_PREFIX}${fileId}`;
    localStorage.setItem(key, JSON.stringify({ content, timestamp: Date.now() }));
  } catch (err) {
    console.warn('[DraftStorage] Failed to save file edit draft:', err);
  }
}

export function getFileEditDraft(fileId: string): string | null {
  try {
    const key = `${FILE_EDIT_DRAFT_PREFIX}${fileId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.content === 'string' ? parsed.content : null;
  } catch (err) {
    console.warn('[DraftStorage] Failed to get file edit draft:', err);
    return null;
  }
}

export function clearFileEditDraft(fileId: string): void {
  try {
    const key = `${FILE_EDIT_DRAFT_PREFIX}${fileId}`;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('[DraftStorage] Failed to clear file edit draft:', err);
  }
}
