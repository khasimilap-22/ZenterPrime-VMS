import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  FolderArchive,
  Folder,
  Loader2,
  Download,
  Layers,
  Sparkles,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { detectLanguage, formatBytes } from '../utils/storage';
import { extractZipArchive, ExtractedZipFile, ZipExtractionProgress } from '../utils/zipImport';
import { CodeSpace } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    files: {
      name: string;
      path: string;
      content: string;
      language: string;
      sizeBytes: number;
      lineCount: number;
    }[],
    description: string
  ) => void;
  activeCodeSpace?: CodeSpace;
  onExportZip?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  activeCodeSpace,
  onExportZip,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'zip'>('upload');
  const [stagedFiles, setStagedFiles] = useState<ExtractedZipFile[]>([]);
  const [description, setDescription] = useState('Uploaded code files to workspace');
  const [targetDir, setTargetDir] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ZIP extraction animation and progress state
  const [isExtractingZip, setIsExtractingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<ZipExtractionProgress | null>(null);
  const [zipArchiveName, setZipArchiveName] = useState<string>('');
  const [discoveredFolders, setDiscoveredFolders] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process standard code files
  const processRegularFiles = async (fileList: FileList | File[]) => {
    setIsReading(true);
    setErrorMessage(null);
    const newStaged: ExtractedZipFile[] = [];

    const prefix = targetDir.trim().replace(/^\/+/, '');
    const safePrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // If user dropped or selected a ZIP file in regular mode, route to ZIP extractor
      if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')) {
        await processZipFile(file);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`Skipped ${file.name}: File exceeds 10MB limit.`);
        continue;
      }

      try {
        const text = await readFileAsText(file);
        const lines = text.split('\n').length;
        const relativePath = (file as any).webkitRelativePath || `${safePrefix}${file.name}`;

        newStaged.push({
          name: file.name,
          path: relativePath,
          content: text,
          language: detectLanguage(file.name),
          sizeBytes: file.size,
          lineCount: lines,
        });
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }

    setStagedFiles((prev) => [...prev, ...newStaged]);
    setIsReading(false);
  };

  // Process and extract ZIP archive with live progress animation
  const processZipFile = async (zipFile: File) => {
    setIsExtractingZip(true);
    setErrorMessage(null);
    setZipArchiveName(zipFile.name);
    setZipProgress({
      phase: 'reading',
      percent: 5,
      filesExtracted: 0,
      totalFiles: 0,
      foldersCount: 0,
    });

    try {
      const result = await extractZipArchive(zipFile, targetDir, (prog) => {
        setZipProgress({ ...prog });
      });

      if (result.files.length === 0) {
        setErrorMessage(`Archive "${zipFile.name}" contained no readable code files.`);
        setIsExtractingZip(false);
        return;
      }

      setStagedFiles(result.files);
      setDiscoveredFolders(result.folders);
      setDescription(`Imported ${result.files.length} file(s) from ${zipFile.name}`);
      setActiveTab('zip');
    } catch (err: any) {
      console.error('Failed to extract ZIP:', err);
      setErrorMessage(err.message || 'Failed to extract ZIP archive.');
    } finally {
      setIsExtractingZip(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const zipFile = files.find((f) => f.name.toLowerCase().endsWith('.zip') || f.type.includes('zip'));
      if (zipFile) {
        await processZipFile(zipFile);
      } else {
        await processRegularFiles(e.dataTransfer.files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processRegularFiles(e.target.files);
    }
  };

  const handleZipInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processZipFile(e.target.files[0]);
    }
  };

  const handleRemoveStaged = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearStaged = () => {
    setStagedFiles([]);
    setDiscoveredFolders([]);
    setZipArchiveName('');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0) {
      setErrorMessage('Please select or drop files or a ZIP archive to import.');
      return;
    }
    onUpload(
      stagedFiles,
      description.trim() || `Imported ${stagedFiles.length} file(s) across folders`
    );
    handleClearStaged();
    onClose();
  };

  const totalBytes = stagedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalLines = stagedFiles.reduce((acc, f) => acc + f.lineCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {activeTab === 'zip' || zipArchiveName ? (
                <FolderArchive className="w-4 h-4 stroke-[2]" />
              ) : (
                <UploadCloud className="w-4 h-4 stroke-[2]" />
              )}
            </div>
            <div>
              <h3 id="upload-modal-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {zipArchiveName ? `Import Archive: ${zipArchiveName}` : 'Import Code Files & ZIP Archives'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Extract full folder trees, insider files, or individual source assets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Export ZIP link if workspace available */}
            {onExportZip && (
              <button
                type="button"
                onClick={onExportZip}
                className="h-[30px] px-2.5 hidden sm:flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-sky-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                title="Download current workspace as ZIP"
              >
                <Download className="w-3.5 h-3.5 text-sky-500" />
                <span>Export Current as ZIP</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Extraction Animation State in Progress */}
          {isExtractingZip ? (
            <div className="p-8 border-2 border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/20 animate-pulse">
                  <FolderArchive className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 rounded-full p-1 shadow-md border border-neutral-200 dark:border-neutral-700">
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                </div>
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Extracting ZIP Archive
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate">
                  {zipArchiveName}
                </p>
                {zipProgress?.currentFileName && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-xs mx-auto">
                    &rarr; {zipProgress.currentFileName}
                  </p>
                )}
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-md space-y-1.5">
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${zipProgress?.percent || 15}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>
                    {zipProgress?.filesExtracted || 0} files extracted
                  </span>
                  <span>{zipProgress?.percent || 0}%</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Preserving folder hierarchies, nested paths, and file contents...
              </p>
            </div>
          ) : (
            <>
              {/* Dropzone with ZIP & File Selection Controls */}
              {stagedFiles.length === 0 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-500/70 bg-neutral-50/50 dark:bg-neutral-950/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    className="hidden"
                    onChange={handleZipInputChange}
                  />

                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FolderArchive className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Drop code files or a ZIP archive here
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                    ZIP archives will be automatically extracted, unpacking all insider folders and code files while preserving paths.
                  </p>

                  {/* Dual Action Buttons */}
                  <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => zipInputRef.current?.click()}
                      className="h-[35px] px-3.5 flex items-center gap-2 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Choose ZIP Archive (.zip)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-[35px] px-3.5 flex items-center gap-2 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-2xs cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Choose Individual Files</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Staged Archive Summary & File Tree Preview */
                <div className="space-y-4">
                  {/* Extracted Header Banner */}
                  <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        {zipArchiveName ? (
                          <FolderArchive className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {zipArchiveName ? `Extracted "${zipArchiveName}"` : 'Staged Files for Import'}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                            {stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                          {formatBytes(totalBytes)} total · {totalLines} lines
                          {discoveredFolders.length > 0 && ` across ${discoveredFolders.length} folders`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleClearStaged}
                        className="h-[30px] px-2.5 flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                        title="Discard staged files and choose another"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Discovered Folders List */}
                  {discoveredFolders.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Preserved Folder Structure ({discoveredFolders.length})
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap max-h-20 overflow-y-auto p-1.5 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        {discoveredFolders.map((folder) => (
                          <span
                            key={folder}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                          >
                            <Folder className="w-3 h-3 text-sky-500" />
                            <span>{folder}/</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Staged File List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Extracted Insider Files ({stagedFiles.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => zipInputRef.current?.click()}
                        className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        + Add another ZIP
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
                      {stagedFiles.map((file, idx) => (
                        <div
                          key={`${file.path}-${idx}`}
                          className="flex items-center justify-between p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <FileCode className="w-4 h-4 text-sky-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100 truncate block">
                                {file.path}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5 font-mono">
                                <span className="capitalize">{file.language}</span>
                                <span>·</span>
                                <span>{formatBytes(file.sizeBytes)}</span>
                                <span>·</span>
                                <span>{file.lineCount} lines</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStaged(idx)}
                            className="p-1 text-neutral-400 hover:text-rose-500 rounded transition-colors cursor-pointer shrink-0"
                            title={`Remove ${file.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Commit Note and Target Directory inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Target Folder Prefix (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetDir}
                    onChange={(e) => setTargetDir(e.target.value)}
                    placeholder="e.g. packages/ or imported/ (leave blank for root)"
                    className="w-full h-[35px] px-3 text-xs font-mono bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Import Note / Version Summary
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Imported service module from release zip"
                    className="w-full h-[35px] px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              {stagedFiles.length > 0 && (
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                  {stagedFiles.length} file(s) staged for commit
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-[35px] px-3.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={stagedFiles.length === 0 || isExtractingZip || isReading}
                className="h-[35px] px-4 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {stagedFiles.length > 0
                    ? `Import ${stagedFiles.length} Files & Record Versions`
                    : 'Import Files'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
