import React, { useState } from 'react';
import { Sun, Moon, Palette, Code, Database, RotateCcw, Check, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { AppSettings, ThemeMode } from '../types';
import { DemoAvatar } from './DemoAvatar';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetWorkspace: () => void;
  fileCount: number;
  versionCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetWorkspace,
  fileCount,
  versionCount,
}) => {
  const [activeSection, setActiveSection] = useState<'appearance' | 'editor' | 'storage'>('appearance');
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleThemeChange = (theme: ThemeMode) => {
    onUpdateSettings({ theme });
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-neutral-900 font-sans transition-colors">
      {/* Settings Navigation Sidebar */}
      <div className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 p-4 space-y-1 select-none">
        <div className="px-3 py-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Preferences
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('appearance')}
          className={`w-full h-[35px] flex items-center gap-2.5 px-3 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
            activeSection === 'appearance'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs border border-neutral-200 dark:border-neutral-800 dark:hover:bg-neutral-800'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
          }`}
        >
          <Palette className="w-4 h-4 text-sky-500" />
          <span>Appearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('editor')}
          className={`w-full h-[35px] flex items-center gap-2.5 px-3 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
            activeSection === 'editor'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs border border-neutral-200 dark:border-neutral-800 dark:hover:bg-neutral-800'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
          }`}
        >
          <Code className="w-4 h-4 text-emerald-500" />
          <span>Editor &amp; Layout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('storage')}
          className={`w-full h-[35px] flex items-center gap-2.5 px-3 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
            activeSection === 'storage'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs border border-neutral-200 dark:border-neutral-800 dark:hover:bg-neutral-800'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
          }`}
        >
          <Database className="w-4 h-4 text-amber-500" />
          <span>Storage &amp; Data</span>
        </button>
      </div>

      {/* Settings Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        {/* APPEARANCE SECTION */}
        {activeSection === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Appearance Settings
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Select your preferred interface theme. Switching modes transforms the palette across all views and modals.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Interface Theme
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dark Theme Option */}
                <div
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.theme === 'dark'
                      ? 'border-sky-500 bg-neutral-900 shadow-md ring-2 ring-sky-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      <Moon className="w-4 h-4 text-amber-400" />
                      <span>Dark Theme</span>
                    </div>
                    {settings.theme === 'dark' && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-sky-500">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Dark Theme Preview Simulation Box */}
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2 text-[10px] font-mono select-none">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 text-neutral-400">
                      <span className="text-neutral-200">Version Management</span>
                      <span className="text-sky-400">v-rev-105</span>
                    </div>
                    <div className="text-neutral-400">
                      <span className="text-purple-400">const</span> engine = <span className="text-amber-300">&quot;VMS&quot;</span>;
                    </div>
                    <div className="text-emerald-400">+ 42 lines committed</div>
                  </div>

                  <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed">
                    Deep charcoal slate canvas with high-contrast text designed for low-fatigue coding.
                  </p>
                </div>

                {/* Light Theme Option */}
                <div
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.theme === 'light'
                      ? 'border-sky-500 bg-white shadow-md ring-2 ring-sky-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Theme</span>
                    </div>
                    {settings.theme === 'light' && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-sky-600">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Light Theme Preview Simulation Box */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2 text-[10px] font-mono select-none">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 text-neutral-500">
                      <span className="text-neutral-800 font-semibold">Version Management</span>
                      <span className="text-sky-600">v-rev-105</span>
                    </div>
                    <div className="text-neutral-600">
                      <span className="text-blue-600">const</span> engine = <span className="text-emerald-600">&quot;VMS&quot;</span>;
                    </div>
                    <div className="text-emerald-700 font-medium">+ 42 lines committed</div>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
                    Crisp paper-white canvas with clean typography and subtle borders for daylight environments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDITOR SECTION */}
        {activeSection === 'editor' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Editor &amp; Layout Preferences
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Customize line numbering, indentation rules, and typography in the active code workspace.
              </p>
            </div>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              {/* Show Line Numbers */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Line Numbers Gutter
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Show vertical line numbering alongside source code in the editor
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showLineNumbers}
                  onChange={(e) => onUpdateSettings({ showLineNumbers: e.target.checked })}
                  className="w-4 h-4 accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Word Wrap */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Soft Word Wrapping
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Wrap overly long code lines instead of requiring horizontal scrolling
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.codeWrap}
                  onChange={(e) => onUpdateSettings({ codeWrap: e.target.checked })}
                  className="w-4 h-4 accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Tab Size */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Tab Indentation Size
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Number of spaces inserted when pressing Tab key
                  </p>
                </div>
                <select
                  value={settings.tabSize}
                  onChange={(e) => onUpdateSettings({ tabSize: Number(e.target.value) })}
                  className="h-[35px] px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-sans"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Editor Typography Scale
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Monospace font sizing for the code workspace
                  </p>
                </div>
                <select
                  value={settings.fontSize || '13px'}
                  onChange={(e) => onUpdateSettings({ fontSize: e.target.value as '12px' | '13px' | '14px' })}
                  className="h-[35px] px-3 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-sans"
                >
                  <option value="12px">Compact (12px)</option>
                  <option value="13px">Default (13px)</option>
                  <option value="14px">Comfortable (14px)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STORAGE SECTION */}
        {activeSection === 'storage' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Workspace Storage &amp; Seed State
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Monitor storage utilization, verify IndexedDB persistence, and manage workspace state.
              </p>
            </div>

            {/* Demo User Account Card */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <DemoAvatar size={48} showStatusIndicator className="shadow-xs" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Alex Reed
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3" />
                      Demo Account
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Lead Software Architect · alex.reed@demo.zentervms.io
                  </p>
                </div>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline font-mono text-[11px]">
                Implicit Session Active
              </span>
            </div>

            {/* IndexedDB Persistence Status Card */}
            <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold text-sky-950 dark:text-sky-200">
                    Primary Engine: IndexedDB (ZenterPrime_VMS_IndexedDB)
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected &amp; Preserving Data
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                All CodeSpaces, files, versions, and groups are saved to browser-native IndexedDB. Reloading or closing tabs will not erase any created work.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xs">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Active Code Files</span>
                <p className="text-2xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {fileCount}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xs">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Logged Versions</span>
                <p className="text-2xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {versionCount}
                </p>
              </div>
            </div>

            <div className="p-4 border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                Reset to Initial Demonstration State
              </h4>
              <p className="text-xs text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
                Resetting will restore initial codebase sample files and reset version histories to factory defaults.
              </p>
              {resetConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetWorkspace();
                      setResetConfirm(false);
                    }}
                    className="h-[35px] px-3.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Confirm Full Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetConfirm(false)}
                    className="h-[35px] px-3 text-xs text-neutral-600 dark:text-neutral-400 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setResetConfirm(true)}
                  className="h-[35px] flex items-center gap-1.5 px-3.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Workspace Data</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
