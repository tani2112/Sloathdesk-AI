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

  const folderName = activeFolder.split('/').filter(Boolean).pop() || activeFolder;

  return (
    <aside className="w-64 bg-[#09090b] border-r border-[#1f1f26] flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1f1f26] flex items-center gap-3">
        <SlothMascot mood={slothMood} size={46} />
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base tracking-wide text-white">
              Sloth<span className="text-yellow-400">Desk</span>
            </h1>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-400 text-black uppercase tracking-wider shadow-sm">
              AI
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Lazy, local assistant</p>
        </div>
      </div>

      {/* Active Folder Selector Pill */}
      <div className="p-3 mx-3 my-2.5 bg-[#121216] border border-[#262630] rounded-xl flex items-center justify-between group hover:border-yellow-400/50 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
            <Folder className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Working Folder
            </span>
            <span
              className="text-xs font-semibold text-zinc-200 truncate block max-w-[120px]"
              title={activeFolder}
            >
              {folderName}
            </span>
          </div>
        </div>
        <button
          onClick={onOpenFolderModal}
          className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded-md hover:bg-yellow-400/10 transition-colors"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400/20 via-amber-400/15 to-transparent text-yellow-300 border-l-4 border-yellow-400 shadow-sm shadow-yellow-500/10'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#15151b]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-yellow-400' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Engine Status Card Footer */}
      <div className="p-3 border-t border-[#1f1f26] bg-[#070709]">
        <div className="p-2.5 rounded-xl bg-[#121216] border border-[#262630] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Cpu className="w-4 h-4 text-yellow-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    aiStatus?.is_running && aiStatus?.active
                      ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="text-[11px] font-bold text-zinc-200 truncate">
                  {aiStatus?.is_running && aiStatus?.active ? aiStatus.selected_model : 'Offline Fallback'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block truncate">
                {aiStatus?.is_running && aiStatus?.active ? 'Local AI Active' : 'Heuristics Only'}
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('settings')}
            className="text-[10px] text-yellow-400 hover:text-yellow-300 font-bold underline"
          >
            Config
          </button>
        </div>
      </div>
    </aside>
  );
};
