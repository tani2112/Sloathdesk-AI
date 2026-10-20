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
    <header className="h-16 border-b border-[#1f1f26] bg-[#09090b]/90 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-lg font-extrabold text-white tracking-tight">{title}</h2>
        <span className="text-zinc-600 hidden sm:inline">•</span>
        <button
          onClick={onOpenFolderModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141418] hover:bg-[#1c1c22] border border-[#2a2a35] text-xs font-mono text-zinc-300 hover:text-yellow-400 hover:border-yellow-400/40 transition-all truncate max-w-xs"
          title={`Active folder: ${activeFolder}`}
        >
          <Folder className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="truncate">{folderName}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Sloth mood toggle button */}
        <button
          onClick={onToggleMood}
          className="px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1c1c24] border border-[#262632] text-zinc-300 hover:text-yellow-300 transition-colors text-xs flex items-center gap-1.5"
          title="Give Barnaby a coffee break!"
        >
          <Coffee className="w-4 h-4 text-yellow-400" />
          <span className="hidden md:inline text-[11px] font-bold">Coffee Break</span>
        </button>

        {/* AI Status pill */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            aiStatus?.is_running && aiStatus?.active
              ? 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus?.is_running && aiStatus?.active
                ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
                : 'bg-zinc-600'
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
          className="p-2 text-zinc-400 hover:text-yellow-400 rounded-xl hover:bg-[#18181f] transition-colors"
          title="Refresh All Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-yellow-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
