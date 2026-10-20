import React from 'react';
import {
  LayoutDashboard,
  FolderTree,
  FileEdit,
  Search,
  Sparkles,
  History,
  Settings,
  Cpu,
  Folder,
} from 'lucide-react';
import { SlothMascot, SlothMood } from './SlothMascot';
import { OllamaStatusResponse } from '../types';

export type NavTab =
  | 'dashboard'
  | 'organizer'
  | 'renamer'
  | 'search'
  | 'cleanup'
  | 'history'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeFolder: string;
  onOpenFolderModal: () => void;
  aiStatus: OllamaStatusResponse | null;
  slothMood: SlothMood;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeFolder,
  onOpenFolderModal,
  aiStatus,
  slothMood,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'organizer' as NavTab, label: 'Smart Organizer', icon: FolderTree },
    { id: 'renamer' as NavTab, label: 'AI Renamer', icon: FileEdit },
    { id: 'search' as NavTab, label: 'Find My Files', icon: Search },
    { id: 'cleanup' as NavTab, label: 'Cleanup Assistant', icon: Sparkles },
    { id: 'history' as NavTab, label: 'Activity History', icon: History },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  // Folder name display
  const folderName = activeFolder.split('/').filter(Boolean).pop() || activeFolder;

  return (
    <aside className="w-64 bg-[#0d1320] border-r border-[#1a2336] flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1a2336] flex items-center gap-3">
        <SlothMascot mood={slothMood} size={46} />
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base tracking-wide text-white">SlothDesk</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">Lazy, local assistant</p>
        </div>
      </div>

      {/* Active Folder Selector Pill */}
      <div className="p-3 mx-3 my-2 bg-[#131b2c] border border-[#23304c] rounded-xl flex items-center justify-between group hover:border-purple-500/40 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Folder className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Target Folder
            </span>
            <span
              className="text-xs font-medium text-slate-200 truncate block max-w-[120px]"
              title={activeFolder}
            >
              {folderName}
            </span>
          </div>
        </div>
        <button
          onClick={onOpenFolderModal}
          className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 px-2 py-1 rounded-md hover:bg-purple-500/10 transition-colors"
        >
          Change
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/25 to-teal-500/15 text-white border border-purple-500/40 shadow-sm shadow-purple-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Engine Status Card Footer */}
      <div className="p-3 border-t border-[#1a2336] bg-[#0b0f17]/60">
        <div className="p-2.5 rounded-xl bg-[#131b2c] border border-[#23304c] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    aiStatus?.is_running && aiStatus?.active
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="text-[11px] font-semibold text-slate-200 truncate">
                  {aiStatus?.is_running && aiStatus?.active ? aiStatus.selected_model : 'Offline Fallback'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                {aiStatus?.is_running && aiStatus?.active ? 'Local Ollama Ready' : 'Heuristics Only'}
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('settings')}
            className="text-[10px] text-slate-400 hover:text-purple-300 font-medium underline"
          >
            Config
          </button>
        </div>
      </div>
    </aside>
  );
};
