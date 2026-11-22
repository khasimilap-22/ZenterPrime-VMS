import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  Trash2,
  X,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import { CodeSpace, ThemeMode } from '../types';
import {
  CLI_LOCATION,
  PROJECT_TEMPLATES,
  ProjectTemplateDefinition,
  matchProjectTemplate,
  getTemplateFolders,
} from '../utils/projectTemplates';

interface TerminalCLIProps {
  theme: ThemeMode;
  codeSpaces: CodeSpace[];
  onScaffoldProject: (template: ProjectTemplateDefinition) => CodeSpace;
  onOpenCodeSpace: (codeSpaceId: string) => void;
}

type TerminalEntryKind =
  | 'welcome'
  | 'project-catalog'
  | 'project-created'
  | 'codespace-list'
  | 'help'
  | 'info'
  | 'error';

interface TerminalEntry {
  id: string;
  command?: string;
  kind: TerminalEntryKind;
  timestamp: string;
  message?: string;
  createdCodeSpace?: {
    id: string;
    name: string;
    templateCommand: string;
    folders: string[];
    filePaths: string[];
  };
  listedCodeSpaces?: {
    id: string;
    name: string;
    fileCount: number;
  }[];
}

const KNOWN_COMMANDS = [
  'create project',
  ...PROJECT_TEMPLATES.map((t) => t.command),
  'help',
  'list',
  'ls',
  'pwd',
  'clear',
];

function formatTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const TerminalCLI: React.FC<TerminalCLIProps> = ({
  theme,
  codeSpaces,
  onScaffoldProject,
  onOpenCodeSpace,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(340);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: 'init-welcome',
      kind: 'welcome',
      timestamp: formatTime(),
      message: `Connected to ${CLI_LOCATION} — Type "create project" to scaffold a new project CodeSpace or "help" for commands.`,
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(340);

  // Focus input when opening terminal
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll to latest command output
  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [entries, isOpen]);

  // Global keyboard shortcut Ctrl+` to toggle bottom CLI
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Drag-to-resize panel height
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = startYRef.current - e.clientY;
      const maxH = Math.min(window.innerHeight * 0.65, 620);
      const nextHeight = Math.max(200, Math.min(maxH, startHeightRef.current + delta));
      setPanelHeight(nextHeight);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const executeCommand = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
    const time = formatTime();
    const id = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    setCommandHistory((prev) => {
      const filtered = prev.filter((c) => c !== trimmed);
      return [trimmed, ...filtered].slice(0, 50);
    });
    setHistoryIndex(-1);
    setInputValue('');

    // Clear command
    if (normalized === 'clear' || normalized === 'cls') {
      setEntries([]);
      return;
    }

    // Print working directory
    if (normalized === 'pwd') {
      setEntries((prev) => [
        ...prev,
        {
          id,
          command: trimmed,
          kind: 'info',
          timestamp: time,
          message: CLI_LOCATION,
        },
      ]);
      return;
    }

    // Help command
    if (normalized === 'help' || normalized === '?') {
      setEntries((prev) => [
        ...prev,
        {
          id,
          command: trimmed,
          kind: 'help',
          timestamp: time,
        },
      ]);
      return;
    }

    // List existing codespaces
    if (normalized === 'list' || normalized === 'ls') {
      setEntries((prev) => [
        ...prev,
        {
          id,
          command: trimmed,
          kind: 'codespace-list',
          timestamp: time,
          listedCodeSpaces: codeSpaces.map((cs) => ({
            id: cs.id,
            name: cs.name,
            fileCount: cs.files.length,
          })),
        },
      ]);
      return;
    }

    // Open codespace by name
    if (normalized.startsWith('open ')) {
      const targetQuery = trimmed.slice(5).trim().toLowerCase();
      const matched = codeSpaces.find(
        (cs) =>
          cs.name.toLowerCase() === targetQuery ||
          cs.name.toLowerCase().includes(targetQuery)
      );
      if (matched) {
        onOpenCodeSpace(matched.id);
        setEntries((prev) => [
          ...prev,
          {
            id,
            command: trimmed,
            kind: 'info',
            timestamp: time,
            message: `Opened CodeSpace "${matched.name}" in Codebase Explorer.`,
          },
        ]);
      } else {
        setEntries((prev) => [
          ...prev,
          {
            id,
            command: trimmed,
            kind: 'error',
            timestamp: time,
            message: `No CodeSpace found matching "${trimmed.slice(5).trim()}". Run "list" to view available CodeSpaces.`,
          },
        ]);
      }
      return;
    }

    // Main command: "create project"
    if (normalized === 'create project' || normalized === 'create') {
      setEntries((prev) => [
        ...prev,
        {
          id,
          command: trimmed,
          kind: 'project-catalog',
          timestamp: time,
        },
      ]);
      return;
    }

    // Project template creation commands (e.g. create vanilla js, create react typescript, create flutter, etc.)
    const matchedTemplate = matchProjectTemplate(normalized);
    if (matchedTemplate) {
      const created = onScaffoldProject(matchedTemplate);
      const folders = getTemplateFolders(matchedTemplate);
      const filePaths = created.files.map((f) => f.path);

      setEntries((prev) => [
        ...prev,
        {
          id,
          command: trimmed,
          kind: 'project-created',
          timestamp: time,
          createdCodeSpace: {
            id: created.id,
            name: created.name,
            templateCommand: matchedTemplate.command,
            folders,
            filePaths,
          },
        },
      ]);
      return;
    }

    // Unknown command
    setEntries((prev) => [
      ...prev,
      {
        id,
        command: trimmed,
        kind: 'error',
        timestamp: time,
        message: `Command not recognized: "${trimmed}". Type "create project" to view project scaffolding commands, or "help" for all commands.`,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputValue);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(nextIndex);
      setInputValue(commandHistory[nextIndex]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex]);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const query = inputValue.trim().toLowerCase();
      if (!query) return;
      const match = KNOWN_COMMANDS.find((cmd) => cmd.startsWith(query));
      if (match) {
        setInputValue(match);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleRunSuggestedCommand = (cmd: string) => {
    setIsOpen(true);
    executeCommand(cmd);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`shrink-0 w-full z-40 border-t transition-colors ${
        isLight
          ? 'bg-white border-neutral-200 text-neutral-900'
          : 'bg-neutral-950 border-neutral-800 text-neutral-100'
      }`}
    >
      {/* Expanded Terminal Drawer */}
      {isOpen && (
        <div
          style={{ height: `${panelHeight}px` }}
          className={`flex flex-col w-full ${
            isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-neutral-100'
          }`}
        >
          {/* Resize Handle */}
          <div
            onMouseDown={startResize}
            title="Drag to resize terminal"
            className={`h-1.5 w-full cursor-ns-resize transition-colors shrink-0 ${
              isLight
                ? 'bg-neutral-100 hover:bg-sky-500/40'
                : 'bg-neutral-900 hover:bg-sky-500/40'
            }`}
          />

          {/* Terminal Header */}
          <div
            className={`flex items-center justify-between px-4 h-[38px] border-b shrink-0 ${
              isLight
                ? 'bg-neutral-50 border-neutral-200'
                : 'bg-neutral-900 border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Terminal
                className={`w-4 h-4 shrink-0 ${
                  isLight ? 'text-sky-600' : 'text-sky-400'
                }`}
              />
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                VMS Terminal
              </span>
              <span
                className={`text-xs font-mono truncate hidden sm:inline ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                {CLI_LOCATION}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleRunSuggestedCommand('create project')}
                className={`h-[26px] px-2.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                }`}
              >
                create project
              </button>

              <button
                type="button"
                onClick={() => setEntries([])}
                title="Clear terminal output"
                className={`h-[26px] px-2 flex items-center gap-1 text-xs rounded-md transition-colors cursor-pointer ${
                  isLight
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize terminal (Esc)"
                className={`h-[26px] w-[26px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  isLight
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Output Stream */}
          <div
            onClick={() => inputRef.current?.focus()}
            className={`flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed space-y-3 cursor-text ${
              isLight ? 'bg-white' : 'bg-neutral-950'
            }`}
          >
            {entries.map((entry) => (
              <div key={entry.id} className="space-y-1.5">
                {/* Executed Command Line Echo */}
                {entry.command && (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className={`font-medium select-none ${
                        isLight ? 'text-sky-700' : 'text-sky-400'
                      }`}
                    >
                      {CLI_LOCATION}
                    </span>
                    <span
                      className={`font-semibold ${
                        isLight ? 'text-neutral-900' : 'text-neutral-100'
                      }`}
                    >
                      {entry.command}
                    </span>
                    <span
                      className={`ml-auto text-xs tabular-nums ${
                        isLight ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {entry.timestamp}
                    </span>
                  </div>
                )}

                {/* Welcome / Info Message */}
                {(entry.kind === 'welcome' || entry.kind === 'info') && entry.message && (
                  <div
                    className={`pl-1 ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}
                  >
                    {entry.message}
                  </div>
                )}

                {/* Error Message */}
                {entry.kind === 'error' && entry.message && (
                  <div
                    className={`flex items-start gap-2 pl-1 ${
                      isLight ? 'text-rose-700' : 'text-rose-400'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{entry.message}</span>
                  </div>
                )}

                {/* Help Reference */}
                {entry.kind === 'help' && (
                  <div
                    className={`rounded-md border p-3 space-y-2 ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-200'
                        : 'bg-neutral-900/70 border-neutral-800'
                    }`}
                  >
                    <div
                      className={`text-xs font-sans font-semibold ${
                        isLight ? 'text-neutral-700' : 'text-neutral-300'
                      }`}
                    >
                      Available VMS CLI Commands
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[13px]">
                      {[
                        { cmd: 'create project', desc: 'Show all project scaffolding commands' },
                        { cmd: 'list', desc: 'List all CodeSpaces in demo-user' },
                        { cmd: 'open <name>', desc: 'Open a CodeSpace in Codebase Explorer' },
                        { cmd: 'pwd', desc: 'Display current execution path' },
                        { cmd: 'clear', desc: 'Clear terminal output' },
                      ].map((row) => (
                        <div key={row.cmd} className="flex items-baseline gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!row.cmd.includes('<')) {
                                handleRunSuggestedCommand(row.cmd);
                              } else {
                                setInputValue('open ');
                                inputRef.current?.focus();
                              }
                            }}
                            className={`font-semibold text-left hover:underline cursor-pointer shrink-0 ${
                              isLight ? 'text-sky-700' : 'text-sky-400'
                            }`}
                          >
                            {row.cmd}
                          </button>
                          <span
                            className={`font-sans text-xs ${
                              isLight ? 'text-neutral-600' : 'text-neutral-400'
                            }`}
                          >
                            {row.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* "create project" Output List */}
                {entry.kind === 'project-catalog' && (
                  <div
                    className={`rounded-md border overflow-hidden ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-200'
                        : 'bg-neutral-900/60 border-neutral-800'
                    }`}
                  >
                    <div
                      className={`px-3 py-2 border-b flex items-center justify-between ${
                        isLight
                          ? 'bg-neutral-100/70 border-neutral-200'
                          : 'bg-neutral-900 border-neutral-800'
                      }`}
                    >
                      <span
                        className={`font-sans text-xs font-semibold ${
                          isLight ? 'text-neutral-800' : 'text-neutral-200'
                        }`}
                      >
                        Project Templates — Run any command below to create a scaffolded CodeSpace
                      </span>
                      <span
                        className={`font-sans text-xs ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}
                      >
                        Click a command or type it below
                      </span>
                    </div>

                    <div
                      className={`divide-y ${
                        isLight ? 'divide-neutral-200/80' : 'divide-neutral-800/80'
                      }`}
                    >
                      {PROJECT_TEMPLATES.map((tpl) => (
                        <div
                          key={tpl.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunSuggestedCommand(tpl.command);
                          }}
                          className={`px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 transition-colors cursor-pointer group ${
                            isLight
                              ? 'hover:bg-sky-50/70'
                              : 'hover:bg-sky-500/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                            <span
                              className={`font-sans text-xs font-medium shrink-0 w-44 ${
                                isLight ? 'text-neutral-700' : 'text-neutral-300'
                              }`}
                            >
                              {tpl.codeSpaceName}
                            </span>
                            <code
                              className={`text-[13px] font-semibold whitespace-nowrap ${
                                isLight ? 'text-sky-700' : 'text-sky-400'
                              }`}
                            >
                              {tpl.command}
                            </code>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`font-sans text-xs hidden lg:inline ${
                                isLight ? 'text-neutral-500' : 'text-neutral-400'
                              }`}
                            >
                              {tpl.stack} · {tpl.files.length} files
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 font-sans text-xs font-medium opacity-75 group-hover:opacity-100 ${
                                isLight ? 'text-sky-700' : 'text-sky-400'
                              }`}
                            >
                              Run
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created Project Confirmation & File Structure */}
                {entry.kind === 'project-created' && entry.createdCodeSpace && (
                  <div
                    className={`rounded-md border p-3 space-y-2.5 ${
                      isLight
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-emerald-950/25 border-emerald-900/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isLight ? 'text-emerald-600' : 'text-emerald-400'
                          }`}
                        />
                        <span
                          className={`font-sans text-sm font-semibold ${
                            isLight ? 'text-emerald-900' : 'text-emerald-300'
                          }`}
                        >
                          Created CodeSpace: {entry.createdCodeSpace.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCodeSpace(entry.createdCodeSpace!.id);
                        }}
                        className={`h-[28px] px-3 inline-flex items-center gap-1.5 rounded-md font-sans text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isLight
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Open CodeSpace</span>
                      </button>
                    </div>

                    <div
                      className={`text-xs font-sans ${
                        isLight ? 'text-neutral-700' : 'text-neutral-300'
                      }`}
                    >
                      Location:{' '}
                      <span className="font-mono">
                        {CLI_LOCATION}
                        {entry.createdCodeSpace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </span>{' '}
                      · {entry.createdCodeSpace.folders.length} folders ·{' '}
                      {entry.createdCodeSpace.filePaths.length} boilerplate files
                    </div>

                    <div
                      className={`rounded border px-3 py-2 text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 ${
                        isLight
                          ? 'bg-white border-emerald-200/80 text-neutral-700'
                          : 'bg-neutral-950/70 border-neutral-800 text-neutral-300'
                      }`}
                    >
                      {entry.createdCodeSpace.filePaths.map((fp) => (
                        <div key={fp} className="truncate">
                          <span
                            className={isLight ? 'text-emerald-600 mr-1.5' : 'text-emerald-400 mr-1.5'}
                          >
                            +
                          </span>
                          {fp}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Listed CodeSpaces */}
                {entry.kind === 'codespace-list' && entry.listedCodeSpaces && (
                  <div
                    className={`rounded-md border p-3 space-y-1.5 ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-200'
                        : 'bg-neutral-900/60 border-neutral-800'
                    }`}
                  >
                    <div
                      className={`font-sans text-xs font-semibold mb-1 ${
                        isLight ? 'text-neutral-700' : 'text-neutral-300'
                      }`}
                    >
                      CodeSpaces in {CLI_LOCATION} ({entry.listedCodeSpaces.length})
                    </div>
                    {entry.listedCodeSpaces.length === 0 ? (
                      <div className="text-xs text-neutral-500">No CodeSpaces found.</div>
                    ) : (
                      entry.listedCodeSpaces.map((cs) => (
                        <div
                          key={cs.id}
                          className="flex items-center justify-between gap-3 text-xs py-0.5"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCodeSpace(cs.id);
                            }}
                            className={`font-medium hover:underline cursor-pointer text-left ${
                              isLight ? 'text-sky-700' : 'text-sky-400'
                            }`}
                          >
                            {cs.name}
                          </button>
                          <span
                            className={`tabular-nums ${
                              isLight ? 'text-neutral-500' : 'text-neutral-400'
                            }`}
                          >
                            {cs.fileCount} files
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollEndRef} />
          </div>

          {/* Active Command Input Row with Exact Left Prompt Location */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeCommand(inputValue);
            }}
            className={`flex items-center gap-2 px-4 h-[42px] border-t shrink-0 font-mono text-[13px] ${
              isLight
                ? 'bg-neutral-50 border-neutral-200'
                : 'bg-neutral-900 border-neutral-800'
            }`}
          >
            <span
              className={`font-semibold select-none shrink-0 ${
                isLight ? 'text-sky-700' : 'text-sky-400'
              }`}
            >
              {CLI_LOCATION}
            </span>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="create project"
              spellCheck={false}
              autoComplete="off"
              aria-label="VMS CLI Command Input"
              className={`flex-1 min-w-0 bg-transparent border-none outline-none font-mono text-[13px] cursor-text ${
                isLight
                  ? 'text-neutral-900 placeholder-neutral-400 caret-neutral-900'
                  : 'text-neutral-100 placeholder-neutral-500 caret-sky-400'
              }`}
            />

            <button
              type="submit"
              className="h-[26px] px-2.5 inline-flex items-center gap-1 rounded-md font-sans text-xs font-medium transition-colors cursor-pointer shrink-0 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white"
            >
              <span>Run</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* Persistent Bottom CLI Dock Bar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[34px] px-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
          isOpen ? 'border-t' : ''
        } ${
          isLight
            ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
            : 'bg-neutral-900 hover:bg-neutral-800/80 border-neutral-800 text-neutral-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Terminal
            className={`w-3.5 h-3.5 shrink-0 ${
              isLight ? 'text-sky-600' : 'text-sky-400'
            }`}
          />
          <span
            className={`font-mono text-xs font-semibold truncate ${
              isLight ? 'text-sky-700' : 'text-sky-400'
            }`}
          >
            {CLI_LOCATION}
          </span>
          <span
            className={`text-xs truncate hidden sm:inline ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            {isOpen
              ? 'Terminal active — type "create project" or press Esc to minimize'
              : 'Click to open VMS Command Line Interface'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span
            className={`hidden md:inline font-mono ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            Ctrl+`
          </span>
          {isOpen ? (
            <ChevronDown
              className={`w-4 h-4 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}
            />
          ) : (
            <ChevronUp
              className={`w-4 h-4 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}
            />
          )}
        </div>
      </button>
    </div>
  );
};
