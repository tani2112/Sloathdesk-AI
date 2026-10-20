import React from 'react';
import {
  FolderTree,
  FileEdit,
  Sparkles,
  HardDrive,
  FileCheck2,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  FolderOpen,
} from 'lucide-react';
import { SlothMascot, SlothMood } from '../components/SlothMascot';
import {
  ScanResponse,
  HealthResponse,
  CleanupScanResponse,
  HistoryBatchItem,
} from '../types';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  activeFolder: string;
  scanData: ScanResponse | null;
  healthData: HealthResponse | null;
  cleanupData: CleanupScanResponse | null;
  historyData: HistoryBatchItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onNavigate: (tab: NavTab) => void;
  onUndoBatch: (batchId: string) => void;
  slothMood: SlothMood;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeFolder,
  scanData,
  healthData,
  cleanupData,
  historyData,
  isLoading,
  onRefresh,
  onNavigate,
  onUndoBatch,
  slothMood,
}) => {
  const folderName = activeFolder.split('/').filter(Boolean).pop() || activeFolder;

  // Category visual tokens in vibrant yellow / amber / gold / lime shades (no blue)
  const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    Documents: { icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    Images: { icon: Image, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    Videos: { icon: Video, color: 'text-yellow-300', bg: 'bg-yellow-300/10' },
    Audio: { icon: Music, color: 'text-amber-300', bg: 'bg-amber-300/10' },
    Archives: { icon: Archive, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    Code: { icon: Code, color: 'text-lime-400', bg: 'bg-lime-400/10' },
    Other: { icon: Layers, color: 'text-zinc-400', bg: 'bg-zinc-800/40' },
  };

  const totalFiles = scanData?.total_files || 0;
  const totalOrganized = healthData?.stats?.total_organized_files || 0;
  const spaceUsedFormatted = scanData?.total_size_formatted || '0 B';
  const duplicateWasteFormatted = cleanupData?.total_duplicate_wasted_formatted || '0 B';
  const duplicateCount = cleanupData?.duplicate_groups?.reduce((acc, g) => acc + g.files.length, 0) || 0;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Hero Banner - Obsidian & Gold Glow */}
      <div className="relative overflow-hidden rounded-3xl sloth-card border border-[#2b2b36] p-6 lg:p-8 bg-gradient-to-r from-[#111116] via-[#0d0d10] to-[#14141a]">
        {/* Ambient Gold Radial Glows */}
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-black tracking-wide">
              <span>🦥 SLOTH-DESK AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            </div>

            <h2 className="text-2xl lg:text-3.5xl font-black tracking-tight text-white">
              Relax. Your files are in{' '}
              <span className="sloth-gradient-text">good hands.</span>
            </h2>

            <p className="text-zinc-300 text-sm max-w-xl leading-relaxed">
              Managing <span className="font-mono font-bold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">{folderName}</span>. 
              Let your sloth sort the clutter, intelligently rename files with local AI, and reclaim wasted gigabytes.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <button
                onClick={() => onNavigate('organizer')}
                className="sloth-btn-primary px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2"
              >
                <span>Organize Folder</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              <button
                onClick={() => onNavigate('cleanup')}
                className="sloth-btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Scan Duplicates</span>
              </button>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2.5 text-zinc-400 hover:text-yellow-400 rounded-xl hover:bg-[#1c1c24] border border-[#282834] transition-colors"
                title="Refresh stats"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-yellow-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sloth Mascot Widget */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => onNavigate('settings')}>
              <SlothMascot mood={slothMood} size={150} />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-yellow-300 bg-[#121217] px-3.5 py-1.5 rounded-full border border-yellow-400/30 shadow-sm">
                Barnaby is {slothMood === 'sleeping' ? 'napping 💤' : slothMood === 'tea' ? 'sipping tea ☕' : 'awake & chilling!'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Statistics Cards in Black & High-Contrast Yellow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Files */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#252530] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Files in Folder
            </span>
            <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tracking-tight">{totalFiles}</span>
            <span className="text-xs text-zinc-400 ml-2">items</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1">
            <span>Directory:</span>
            <span className="font-mono text-yellow-300 truncate font-semibold">{folderName}</span>
          </div>
        </div>

        {/* Space Used */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#252530] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Space Used
            </span>
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tracking-tight">
              {spaceUsedFormatted}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
            <span>Indexed on local disk</span>
          </div>
        </div>

        {/* Files Organized */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#252530] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Files Organized
            </span>
            <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tracking-tight">
              {totalOrganized}
            </span>
            <span className="text-xs text-zinc-400 ml-2">all-time</span>
          </div>
          <div className="mt-2 text-[11px] text-yellow-400 flex items-center gap-1 font-semibold">
            <span>Reversible SQLite history</span>
          </div>
        </div>

        {/* Cleanup Suggestions */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#252530] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Duplicate Waste
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tracking-tight">
              {duplicateWasteFormatted}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
            <span>{duplicateCount} duplicate copies detected</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution & AI Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 sloth-card p-6 border border-[#252530] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Folder Category Breakdown</h3>
              <p className="text-xs text-zinc-400">
                File distribution across primary document & media categories
              </p>
            </div>
            <button
              onClick={() => onNavigate('organizer')}
              className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
            >
              <span>Auto-Sort</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {Object.entries(scanData?.categories || {}).map(([catName, summary]) => {
              const conf = categoryConfig[catName] || categoryConfig.Other;
              const Icon = conf.icon;
              return (
                <div
                  key={catName}
                  className="p-3.5 rounded-xl bg-[#0d0d10] border border-[#202028] flex items-start gap-3 hover:border-yellow-400/40 transition-colors"
                >
                  <div className={`p-2.5 rounded-lg ${conf.bg} ${conf.color} shrink-0 border border-yellow-400/10`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-200 block truncate">
                      {catName}
                    </span>
                    <span className="text-sm font-black text-white block mt-0.5">
                      {summary.count}
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      {summary.total_size_formatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Model Status Card */}
        <div className="sloth-card p-6 border border-[#252530] rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">Local AI Engine</h3>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  healthData?.ai?.is_running && healthData?.ai?.active
                    ? 'bg-yellow-400 text-black shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {healthData?.ai?.is_running && healthData?.ai?.active ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Powered by Ollama with open-weight models on your machine.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-[#0d0d10] border border-[#202028] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Model:</span>
                <span className="font-bold text-yellow-300 font-mono">
                  {healthData?.ai?.selected_model || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Endpoint:</span>
                <span className="font-mono text-zinc-300 text-[11px] truncate max-w-[140px]">
                  {healthData?.ai?.url || 'http://127.0.0.1:11434'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Privacy:</span>
                <span className="text-yellow-400 font-bold">100% Local (Zero Cloud)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('settings')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#17171d] hover:bg-[#22222a] text-xs font-bold text-yellow-300 border border-yellow-400/30 flex items-center justify-center gap-2 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-yellow-400" />
              <span>Configure AI Models</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Preview */}
      <div className="sloth-card p-6 border border-[#252530] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">Recent Activity</h3>
            <p className="text-xs text-zinc-400">
              Safe reversible operations logged in SQLite
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {historyData.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No operations logged yet. Run your first organization or rename batch above!
          </div>
        ) : (
          <div className="space-y-2.5">
            {historyData.slice(0, 3).map((item) => (
              <div
                key={item.batch_id}
                className="p-3.5 rounded-xl bg-[#0d0d10] border border-[#202028] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      item.batch_type === 'ORGANIZE'
                        ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                        : item.batch_type === 'RENAME'
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        : 'bg-orange-400/10 text-orange-400 border border-orange-400/20'
                    }`}
                  >
                    {item.batch_type === 'ORGANIZE' ? (
                      <FolderTree className="w-4 h-4" />
                    ) : item.batch_type === 'RENAME' ? (
                      <FileEdit className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-200">
                        {item.description}
                      </span>
                      {item.undone && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          Undone
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      {item.total_files} file(s) • {item.timestamp_formatted}
                    </span>
                  </div>
                </div>

                {!item.undone && (
                  <button
                    onClick={() => onUndoBatch(item.batch_id)}
                    className="px-3 py-1.5 rounded-lg bg-[#181820] hover:bg-yellow-400 hover:text-black text-yellow-400 border border-yellow-400/30 text-xs font-bold transition-all shrink-0"
                  >
                    Undo
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
