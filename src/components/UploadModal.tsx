import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { detectLanguage, formatBytes } from '../utils/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    files: { name: string; path: string; content: string; language: string; sizeBytes: number; lineCount: number }[],
    description: string
  ) => void;
}

interface StagedFile {
  name: string;
  path: string;
  content: string;
  language: string;
  sizeBytes: number;
  lineCount: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [description, setDescription] = useState('Uploaded code files to workspace');
  const [targetDir, setTargetDir] = useState('src/');
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFiles = async (fileList: FileList | File[]) => {
    setIsReading(true);
    setErrorMessage(null);
    const newStaged: StagedFile[] = [];

    const prefix = targetDir.trim().replace(/^\/+/, '');
    const safePrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`Skipped ${file.name}: File exceeds 5MB limit.`);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveStaged = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0) {
      setErrorMessage('Please select or drop at least one code file to upload.');
      return;
    }
    onUpload(stagedFiles, description.trim() || `Uploaded ${stagedFiles.length} file(s)`);
    setStagedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 id="upload-modal-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Upload Code Files
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Import source files into current workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Directory placement & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Folder Path
              </label>
              <input
                type="text"
                value={targetDir}
                onChange={(e) => setTargetDir(e.target.value)}
                placeholder="e.g. src/ or components/"
                className="w-full h-8.5 px-3 text-xs font-mono bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Upload Version Note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Imported authentication module"
                className="w-full h-8.5 px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>
          </div>

          {/* Drag & drop dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
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
            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              Drag &amp; drop source files here, or <span className="text-emerald-600 dark:text-emerald-400 underline">browse</span>
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
              Supports .ts, .js, .tsx, .json, .md, .py, .css, .html, .sql, and other source formats
            </p>
          </div>

          {/* Staged files preview */}
          {stagedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Ready to ingest ({stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'})
                </span>
                <button
                  type="button"
                  onClick={() => setStagedFiles([])}
                  className="text-neutral-400 hover:text-rose-500 text-[11px] transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                {stagedFiles.map((file, idx) => (
                  <div
                    key={`${file.path}-${idx}`}
                    className="flex items-center justify-between p-2 text-xs bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                      <FileCode className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {file.path}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5 font-mono">
                          <span>{file.language}</span>
                          <span>·</span>
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>·</span>
                          <span>{file.lineCount} lines</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStaged(idx);
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-500 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="h-8.5 px-3.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={stagedFiles.length === 0 || isReading}
              className="h-8.5 px-4 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Upload &amp; Record Versions</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
