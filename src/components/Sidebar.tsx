import React from 'react';
import {
  Code2,
  Clock,
  Inbox,
  Settings,
  Menu,
  PanelLeftClose,
} from 'lucide-react';

export type MainNavTab = 'codespaces' | 'codebase' | 'versions' | 'groups' | 'settings';

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  codespaceCount: number;
  versionCount: number;
  groupCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggleExpand,
  activeTab,
  onSelectTab,
  codespaceCount,
  versionCount,
  groupCount,
}) => {
  const navItems: {
    id: MainNavTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'codespaces',
      label: 'CodeSpaces',
      icon: <Code2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
      count: codespaceCount,
    },
    {
      id: 'versions',
      label: 'Versions',
      icon: <Clock className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
      count: versionCount,
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: <Inbox className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
      count: groupCount,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
    },
  ];

  return (
    <aside
      className={`flex flex-col h-full shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-all duration-200 select-none ${
        isExpanded ? 'w-56 sm:w-60' : 'w-16'
      }`}
    >
      {/* Top Toggle Box - exactly aligns with TopBar height */}
      <div className="h-14 flex items-center px-3.5 border-b border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          aria-label={isExpanded ? 'Collapse navigation menu' : 'Expand navigation menu'}
          title={isExpanded ? 'Collapse menu' : 'Expand menu'}
        >
          {isExpanded ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Items List */}
      <nav className="flex-1 p-2.5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id || (item.id === 'codespaces' && activeTab === 'codebase');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full h-10 flex items-center rounded-md text-xs transition-colors cursor-pointer ${
                isExpanded ? 'px-3 gap-3 justify-start' : 'justify-center px-0'
              } ${
                isActive
                  ? 'border border-neutral-300 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 border border-transparent'
              }`}
              title={item.label}
            >
              {item.icon}

              {isExpanded && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate text-xs">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 ml-1">
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
