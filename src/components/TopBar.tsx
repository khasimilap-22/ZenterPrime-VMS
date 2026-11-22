import React from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  ChevronLeft,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { MainNavTab } from './Sidebar';
import { DemoAvatar } from './DemoAvatar';

interface TopBarProps {
  currentTab: MainNavTab;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenCreateCodeSpaceModal: () => void;
  activeCodeSpaceName?: string;
  onBackToCodeSpaces?: () => void;
  onOpenDemoAccountModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onOpenCreateCodeSpaceModal,
  activeCodeSpaceName,
  onBackToCodeSpaces,
  onOpenDemoAccountModal,
}) => {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors select-none">
      {/* Left Area: Context / Navigation Indicator */}
      <div className="flex items-center gap-3 min-w-[140px]">
        {currentTab === 'codebase' ? (
          <button
            type="button"
            onClick={onBackToCodeSpaces}
            className="h-[30px] flex items-center gap-1.5 px-2.5 rounded-md text-[13px] font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Return to CodeSpaces Overview"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>CodeSpaces</span>
            <span className="text-neutral-400 dark:text-neutral-600">/</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-semibold truncate max-w-[180px]">
              {activeCodeSpaceName || 'Workspace'}
            </span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {currentTab === 'codespaces'
                ? 'CodeSpaces'
                : currentTab === 'versions'
                ? 'Version History'
                : currentTab === 'groups'
                ? 'CodeSpace Groups'
                : 'Settings'}
            </span>
          </div>
        )}
      </div>

      {/* Center Area: Centered Rounded Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search CodeSpaces"
            className="w-full h-[35px] pl-9 pr-3 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Right Area: + New CodeSpace button, Theme Toggle & Avatar */}
      <div className="flex items-center gap-3 min-w-[140px] justify-end">
        {/* Blue Primary Button */}
        <button
          type="button"
          onClick={onOpenCreateCodeSpaceModal}
          className="h-[35px] px-3.5 flex items-center gap-1.5 rounded-md text-sm font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New CodeSpace</span>
        </button>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle dark / light mode"
          className={`w-[35px] h-[35px] flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-amber-400'
              : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-700" />
          )}
        </button>

        {/* Demo Account Avatar with Green Accent Border */}
        <button
          type="button"
          onClick={onOpenDemoAccountModal}
          className="w-[35px] h-[35px] rounded-md p-0.5 border border-emerald-500/80 dark:border-emerald-400/80 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs cursor-pointer hover:ring-2 hover:ring-emerald-400/50 transition-all"
          title="Demo Account (Alex Reed) — Click to view profile & storage"
          aria-label="Demo Account Profile"
        >
          <DemoAvatar size={30} />
        </button>
      </div>
    </header>
  );
};
