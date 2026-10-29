import JSZip from 'jszip';
import { detectLanguage } from './storage';

export interface ExtractedZipFile {
  name: string;
  path: string;
  content: string;
  language: string;
  sizeBytes: number;
  lineCount: number;
}

export interface ZipExtractionProgress {
  phase: 'reading' | 'analyzing' | 'extracting' | 'complete' | 'error';
  percent: number;
  currentFileName?: string;
  filesExtracted: number;
  totalFiles: number;
  foldersCount: number;
}

/**
 * Checks if a path is macOS/Windows metadata garbage
 */
function isIgnoredSystemPath(path: string): boolean {
  const parts = path.split('/');
  return (
    parts.some((p) => p.startsWith('__MACOSX') || p === '.DS_Store' || p === 'Thumbs.db')
  );
}

/**
 * Reads a ZIP file and extracts all directories, subdirectories, and code files.
 * Provides granular progress updates for fluid UI animation.
 */
export async function extractZipArchive(
  file: File | Blob,
  targetPrefix: string = '',
  onProgress?: (progress: ZipExtractionProgress) => void
): Promise<{ files: ExtractedZipFile[]; folders: string[] }> {
  onProgress?.({
    phase: 'reading',
    percent: 10,
    filesExtracted: 0,
    totalFiles: 0,
    foldersCount: 0,
  });

  const zip = new JSZip();
  let zipData: JSZip;
  try {
    zipData = await zip.loadAsync(file);
  } catch (err) {
    onProgress?.({
      phase: 'error',
      percent: 0,
      filesExtracted: 0,
      totalFiles: 0,
      foldersCount: 0,
    });
    throw new Error('Could not parse ZIP file. Please ensure the file is a valid .zip archive.');
  }

  onProgress?.({
    phase: 'analyzing',
    percent: 25,
    filesExtracted: 0,
    totalFiles: 0,
    foldersCount: 0,
  });

  // Collect and filter valid file entries
  const fileEntries: { zipEntry: JSZip.JSZipObject; relativePath: string }[] = [];
  const foldersSet = new Set<string>();

  const normalizedPrefix = targetPrefix.trim().replace(/^\/+/, '');
  const safePrefix = normalizedPrefix
    ? normalizedPrefix.endsWith('/')
      ? normalizedPrefix
      : `${normalizedPrefix}/`
    : '';

  zipData.forEach((relativePath, zipEntry) => {
    if (isIgnoredSystemPath(relativePath)) return;

    if (zipEntry.dir) {
      const cleanDir = relativePath.replace(/\/+$/, '');
      if (cleanDir) {
        foldersSet.add(`${safePrefix}${cleanDir}`);
      }
    } else {
      // It's a file
      const dirIndex = relativePath.lastIndexOf('/');
      if (dirIndex !== -1) {
        const dirPath = relativePath.substring(0, dirIndex);
        foldersSet.add(`${safePrefix}${dirPath}`);
      }
      fileEntries.push({ zipEntry, relativePath });
    }
  });

  const totalFiles = fileEntries.length;
  const extractedFiles: ExtractedZipFile[] = [];

  // Artificially space out progress slightly if zip is small to ensure smooth visual extraction animation
  for (let i = 0; i < totalFiles; i++) {
    const { zipEntry, relativePath } = fileEntries[i];
    const fileName = relativePath.split('/').pop() || relativePath;

    const percent = Math.round(30 + ((i + 1) / totalFiles) * 65);
    onProgress?.({
      phase: 'extracting',
      percent,
      currentFileName: relativePath,
      filesExtracted: i + 1,
      totalFiles,
      foldersCount: foldersSet.size,
    });

    try {
      const textContent = await zipEntry.async('text');
      const lines = textContent.split('\n').length;
      const sizeBytes = new Blob([textContent]).size;
      const fullPath = `${safePrefix}${relativePath}`;

      extractedFiles.push({
        name: fileName,
        path: fullPath,
        content: textContent,
        language: detectLanguage(fileName),
        sizeBytes,
        lineCount: lines,
      });

      // Brief yield if large archive to keep browser responsive and animations silky
      if (totalFiles > 10 && i % 8 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
    } catch (readErr) {
      console.warn(`Could not read file ${relativePath} as text:`, readErr);
    }
  }

  // Small delay at 100% to let user see extraction completion
  onProgress?.({
    phase: 'complete',
    percent: 100,
    filesExtracted: extractedFiles.length,
    totalFiles,
    foldersCount: foldersSet.size,
  });

  await new Promise((resolve) => setTimeout(resolve, 150));

  return {
    files: extractedFiles,
    folders: Array.from(foldersSet).sort(),
  };
}
