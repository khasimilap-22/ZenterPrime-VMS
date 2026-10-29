import React from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

interface SessionRestoredTagProps {
  onDismiss?: () => void;
  size?: '30px' | '35px';
  onDiscardDraft?: () => void;
  className?: string;
  showDismiss?: boolean;
}

export const SessionRestoredTag: React.FC<SessionRestoredTagProps> = ({
  onDismiss,
  size = '30px',
  onDiscardDraft,
  className = '',
  showDismiss = true,
}) => {
  const heightClass = size === '35px' ? 'h-[35px]' : 'h-[30px]';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${heightClass} inline-flex items-center gap-2 px-3 rounded-md bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/35 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 font-sans text-xs font-medium shadow-2xs select-none animate-in fade-in zoom-in-95 duration-200 ${className}`}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-semibold tracking-tight whitespace-nowrap">
          Previous Session Restored Successfully
        </span>
      </div>

      {onDiscardDraft && (
        <button
          type="button"
          onClick={onDiscardDraft}
          className="ml-1 text-[11px] underline text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium cursor-pointer"
          title="Discard this draft and start fresh"
        >
          Discard Draft
        </button>
      )}

      {showDismiss && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-0.5 p-0.5 rounded text-amber-600/70 hover:text-amber-900 dark:text-amber-400/80 dark:hover:text-amber-200 hover:bg-amber-500/20 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
          title="Dismiss notice"
          aria-label="Dismiss restored session tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
