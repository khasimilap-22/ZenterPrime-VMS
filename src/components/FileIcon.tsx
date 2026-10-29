import React from 'react';
import { FileCode, FileJson, FileText, FileSpreadsheet, File } from 'lucide-react';

interface FileIconProps {
  fileName: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ fileName, className = 'w-4 h-4' }) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode className={`${className} text-sky-500`} />;
    case 'js':
    case 'jsx':
      return <FileCode className={`${className} text-amber-500`} />;
    case 'json':
      return <FileJson className={`${className} text-emerald-500`} />;
    case 'md':
      return <FileText className={`${className} text-indigo-500`} />;
    case 'css':
    case 'html':
      return <FileCode className={`${className} text-purple-500`} />;
    case 'sql':
      return <FileSpreadsheet className={`${className} text-orange-500`} />;
    default:
      return <File className={`${className} text-neutral-400`} />;
  }
};
