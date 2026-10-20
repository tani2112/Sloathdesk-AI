import React from 'react';
import { Folder, RefreshCw, Cpu, Coffee, Sparkles } from 'lucide-react';
import { OllamaStatusResponse } from '../types';
import { SlothMood } from './SlothMascot';

interface HeaderProps {
  title: string;
  activeFolder: string;
  onOpenFolderModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  aiStatus: OllamaStatusResponse | null;
  slothMood: SlothMood;
  onToggleMood: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  activeFolder,
  onOpenFolderModal,
  onRefresh,
  isLoading,
  aiStatus,
  slothMood,
  onToggleMood,
}) => {
  const folderName = activeFolder.split('/').filter(Boolean).pop() || activeFolder;

  return (
    <header className="h-16 border-b border-[#1a2336] bg-[#0b0f17]/80 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <button
          onClick={onOpenFolderModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121929] hover:bg-[#182236] border border-[#22304c] text-xs font-mono text-slate-300 hover:text-white transition-colors truncate max-w-xs"
          title={`Active folder: ${activeFolder}`}
        >
          <Folder className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">{folderName}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Sloth mood toggle button */}
        <button
          onClick={onToggleMood}
          className="p-2 rounded-xl bg-[#131b2b] hover:bg-[#1a253b] border border-[#23304c] text-slate-300 hover:text-amber-300 transition-colors text-xs flex items-center gap-1.5"
          title="Give Barnaby a coffee break!"
        >
          <Coffee className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline text-[11px] font-medium">Coffee Break</span>
        </button>

        {/* AI Status pill */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
            aiStatus?.is_running && aiStatus?.active
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus?.is_running && aiStatus?.active
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px]">
            {aiStatus?.is_running && aiStatus?.active ? aiStatus.selected_model : 'Offline Fallback'}
          </span>
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          title="Refresh All Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
