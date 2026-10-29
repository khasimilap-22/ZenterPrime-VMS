import JSZip from 'jszip';
import { CodeSpace } from '../types';

/**
 * Generates a clean filename safe for OS filesystems
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Downloads all files and folders of a CodeSpace as a .zip archive.
 * Preserves folder hierarchy specified in file.path.
 */
export async function downloadCodeSpaceZip(codeSpace: CodeSpace): Promise<void> {
  const zip = new JSZip();

  const files = codeSpace.files || [];

  if (files.length === 0) {
    // If empty codespace, create a friendly README so the zip is valid and informative
    const emptyNotice = `# ${codeSpace.name}\n\n${
      codeSpace.description || 'Blank workspace environment'
    }\n\nExported on: ${new Date().toLocaleString()}\nFiles count: 0\n\nThis CodeSpace was exported as a blank workspace. Add files in ZenterPrime VMS to populate it.`;
    zip.file('README.md', emptyNotice);
  } else {
    // Add all files with their relative directory paths
    for (const file of files) {
      // Normalize path: strip leading slashes
      const relativePath = file.path.replace(/^\/+/, '');
      zip.file(relativePath, file.content ?? '');
    }

    // Add metadata summary file
    const metaJson = {
      name: codeSpace.name,
      description: codeSpace.description || '',
      isDefault: Boolean(codeSpace.isDefault),
      fileCount: files.length,
      revisionCount: (codeSpace.versions || []).length,
      createdAt: new Date(codeSpace.createdAt).toISOString(),
      exportedAt: new Date().toISOString(),
      exportedBy: 'Alex Reed (Demo Account)',
    };
    zip.file('.codespace-manifest.json', JSON.stringify(metaJson, null, 2));
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Trigger browser download
  const blobUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  const safeName = sanitizeFileName(codeSpace.name || 'codespace');
  link.href = blobUrl;
  link.download = `${safeName}.zip`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}
