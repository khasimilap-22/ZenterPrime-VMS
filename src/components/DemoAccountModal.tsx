import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  HardDrive,
  UserCheck,
  FolderGit2,
  FileCode,
  Layers,
  RotateCcw,
  Box,
  Clock,
  Award,
  Trophy,
  ChevronRight,
  CheckCircle2,
  Check,
  Lock,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { DemoAvatar } from './DemoAvatar';
import { CodeSpace, CodeSpaceGroup } from '../types';
import { evaluateAchievements, getStoredStreakDays } from '../utils/achievements';

interface DemoAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  codespaces: CodeSpace[];
  groups: CodeSpaceGroup[];
  activeCodeSpaceName: string;
  onResetWorkspace: () => void;
}

export const DemoAccountModal: React.FC<DemoAccountModalProps> = ({
  isOpen,
  onClose,
  codespaces,
  groups,
  activeCodeSpaceName,
  onResetWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');

  if (!isOpen) return null;

  const totalFiles = codespaces.reduce((acc, cs) => acc + (cs.files?.length || 0), 0);
  const totalRevs = codespaces.reduce((acc, cs) => acc + (cs.versions?.length || 0), 0);
  const streakDays = getStoredStreakDays();

  const achievements = evaluateAchievements(codespaces, totalFiles, totalRevs, streakDays);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50">
          <div className="flex items-center gap-2">
            {activeTab === 'achievements' ? (
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {activeTab === 'overview' ? 'Enterprise Demo Account' : 'VMS Achievements'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Pills */}
            <div className="flex items-center bg-neutral-200/60 dark:bg-neutral-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('achievements')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'achievements'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>Achievements ({unlockedCount}/{achievements.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {activeTab === 'overview' ? (
            <>
              {/* User Profile Card with Deterministic Avatar */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
                <div className="relative">
                  <DemoAvatar size={60} showStatusIndicator className="shadow-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      Alex Reed
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3" />
                      Demo Mode Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Lead Software Architect · Enterprise Core Team
                  </p>
                  <p className="text-xs font-mono text-neutral-600 dark:text-neutral-300 mt-1">
                    alex.reed@demo.zentervms.io
                  </p>
                </div>
              </div>

              {/* Four Metric Cards (Slightly Bigger with Clickable Achievements Card) */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Card 1: CodeSpaces */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500">
                      <span className="text-[11px] font-medium">CodeSpaces</span>
                      <Box className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                        {codespaces.length}
                      </span>
                      <p className="text-[11px] text-neutral-400 mt-0.5">configured</p>
                    </div>
                  </div>

                  {/* Card 2: Total Files */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500">
                      <span className="text-[11px] font-medium">Total Files</span>
                      <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                        {totalFiles}
                      </span>
                      <p className="text-[11px] text-neutral-400 mt-0.5">source files</p>
                    </div>
                  </div>

                  {/* Card 3: Revisions */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500">
                      <span className="text-[11px] font-medium">Revisions</span>
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                        {totalRevs}
                      </span>
                      <p className="text-[11px] text-neutral-400 mt-0.5">commit logs</p>
                    </div>
                  </div>

                  {/* Card 4: Achievements (Clickable with view hint) */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('achievements')}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:to-neutral-900 border border-amber-300/80 dark:border-amber-500/40 shadow-2xs flex flex-col justify-between text-left hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
                    title="Click to view all unlocked and in-progress achievements"
                  >
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                      <span className="text-[11px] font-semibold flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        Achievements
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold font-mono text-amber-900 dark:text-amber-300">
                          {unlockedCount}
                        </span>
                        <span className="text-xs text-amber-700/80 dark:text-amber-400/80 font-mono">
                          / {achievements.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                        Click to view &rarr;
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Three Indicators */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                    Active Environment
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 font-mono">
                    {activeCodeSpaceName}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-neutral-400" />
                    Configured Groups
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 font-mono">
                    {groups.length} active
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" />
                    Auth Model
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Implicit Demo Session (No Login Required)
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Achievements View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    VMS Milestones &amp; Progression
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Unlock achievements by actively creating workspaces and maintaining reliable version streaks.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-medium font-mono shrink-0">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{streakDays} Day Streak</span>
                </div>
              </div>

              {/* Achievement List */}
              <div className="space-y-3">
                {achievements.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all duration-200 ${
                        item.unlocked
                          ? item.tier === 'bronze'
                            ? 'bg-amber-50/90 dark:bg-amber-950/35 border-amber-300 dark:border-amber-600/80 shadow-xs ring-1 ring-amber-400/25 dark:ring-amber-500/30'
                            : item.tier === 'silver'
                            ? 'bg-slate-50/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-500/80 shadow-xs ring-1 ring-slate-400/25 dark:ring-slate-500/30'
                            : item.tier === 'clean'
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-300 dark:border-emerald-600/80 shadow-xs ring-1 ring-emerald-400/25 dark:ring-emerald-500/30'
                            : 'bg-yellow-50/90 dark:bg-yellow-950/35 border-yellow-300 dark:border-yellow-600/80 shadow-xs ring-1 ring-yellow-400/25 dark:ring-yellow-500/30'
                          : 'bg-neutral-100/50 dark:bg-neutral-900/30 border border-dashed border-neutral-300/80 dark:border-neutral-800/80 opacity-55 filter blur-[0.35px] hover:blur-none hover:opacity-90 select-none'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Badge / Pending Icon Box */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            item.unlocked
                              ? item.tier === 'bronze'
                                ? 'bg-amber-600/15 text-amber-700 dark:text-amber-300 border-amber-600/30'
                                : item.tier === 'silver'
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                                : item.tier === 'clean'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                                : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/40'
                              : 'bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-400 dark:text-neutral-500 border-neutral-300/70 dark:border-neutral-700/60'
                          }`}
                        >
                          {item.unlocked ? (
                            item.tier === 'gold' || item.tier === 'clean' ? (
                              <Award className="w-5 h-5" />
                            ) : (
                              <Trophy className="w-5 h-5" />
                            )
                          ) : (
                            <Clock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 animate-pulse" />
                          )}
                        </div>

                        {/* Achievement Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-xs flex items-center gap-1.5 ${
                                item.unlocked
                                  ? 'font-bold text-neutral-900 dark:text-neutral-50'
                                  : 'font-semibold text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              <span>{item.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                                  item.unlocked
                                    ? item.tier === 'bronze'
                                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                                      : item.tier === 'silver'
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                                      : item.tier === 'clean'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                                      : 'bg-yellow-100 dark:bg-yellow-950/70 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                                }`}
                              >
                                {item.badgeLabel}
                              </span>
                            </h4>

                            {item.unlocked ? (
                              /* Ticked Checkmark Badge */
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs shrink-0">
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                                <span>Unlocked</span>
                              </span>
                            ) : (
                              /* Inactive / Pending Badge with Icon */
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700/80 shrink-0 font-mono">
                                <Clock className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                                <span>Pending ({item.progress} / {item.target})</span>
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs mt-1 leading-relaxed ${
                              item.unlocked
                                ? 'font-semibold text-neutral-800 dark:text-neutral-200'
                                : 'font-medium text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            &quot;{item.description}&quot;
                          </p>

                          <p
                            className={`text-[11px] mt-0.5 ${
                              item.unlocked
                                ? 'text-neutral-600 dark:text-neutral-400'
                                : 'text-neutral-400 dark:text-neutral-500'
                            }`}
                          >
                            {item.requirement}
                          </p>

                          {/* Progress Bar for Inactive / Pending Achievements */}
                          {!item.unlocked && (
                            <div className="w-full bg-neutral-200/80 dark:bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                              <div
                                className="bg-neutral-400 dark:bg-neutral-600 h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, Math.round((item.progress / item.target) * 100))}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to reset all CodeSpaces and files back to the factory initial state?'
                )
              ) {
                onResetWorkspace();
              }
            }}
            className="h-[35px] px-3 flex items-center gap-1.5 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-[35px] px-4 flex items-center justify-center rounded-md text-xs font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] transition-colors cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
