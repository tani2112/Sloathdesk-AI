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

  // Compute category icons & colors
  const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    Documents: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    Images: { icon: Image, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    Videos: { icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    Audio: { icon: Music, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    Archives: { icon: Archive, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    Code: { icon: Code, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    Other: { icon: Layers, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  };

  const totalFiles = scanData?.total_files || 0;
  const totalOrganized = healthData?.stats?.total_organized_files || 0;
  const spaceUsedFormatted = scanData?.total_size_formatted || '0 B';
  const duplicateWasteFormatted = cleanupData?.total_duplicate_wasted_formatted || '0 B';
  const duplicateCount = cleanupData?.duplicate_groups?.reduce((acc, g) => acc + g.files.length, 0) || 0;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl sloth-card border border-[#23304c] p-6 lg:p-8 bg-gradient-to-r from-[#141b2e] via-[#101726] to-[#121c2c]">
        {/* Glow behind sloth */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide">
              <span>🦥 SlothDesk AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Relax. Your files are in good hands.
            </h2>

            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Managing <span className="font-semibold text-teal-300 font-mono">{folderName}</span>. 
              Let local AI handle renaming, sorting chaos into clean folders, and freeing wasted storage while you kick back.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <button
                onClick={() => onNavigate('organizer')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Organize Folder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('cleanup')}
                className="px-4 py-2 bg-[#1a2336] hover:bg-[#23304c] text-slate-200 border border-[#2a3a5a] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan Duplicates</span>
              </button>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
                title="Refresh stats"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sloth Mascot Widget */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => onNavigate('settings')}>
              <SlothMascot mood={slothMood} size={150} />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-medium text-slate-400 bg-[#0d1320]/80 px-3 py-1 rounded-full border border-[#1e293b]">
                Barnaby is {slothMood === 'sleeping' ? 'napping 💤' : slothMood === 'tea' ? 'sipping tea ☕' : 'ready to help!'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Files */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#23304c] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Files in Folder
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{totalFiles}</span>
            <span className="text-xs text-slate-400 ml-2">items</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Folder:</span>
            <span className="font-mono text-slate-300 truncate">{folderName}</span>
          </div>
        </div>

        {/* Space Used */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#23304c] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Space Used
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {spaceUsedFormatted}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-teal-400 flex items-center gap-1">
            <span>Indexed on local disk</span>
          </div>
        </div>

        {/* Files Organized */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#23304c] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Files Organized
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalOrganized}
            </span>
            <span className="text-xs text-slate-400 ml-2">all-time</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-400 flex items-center gap-1">
            <span>Tracked in SQLite with undo</span>
          </div>
        </div>

        {/* Cleanup Suggestions */}
        <div className="sloth-card sloth-card-hover p-5 border border-[#23304c] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Duplicate Waste
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {duplicateWasteFormatted}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1">
            <span>{duplicateCount} duplicate copies detected</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution & AI Model Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 sloth-card p-6 border border-[#23304c] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Folder Category Breakdown</h3>
              <p className="text-xs text-slate-400">
                File distribution across primary document & media categories
              </p>
            </div>
            <button
              onClick={() => onNavigate('organizer')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
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
                  className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1e293b] flex items-start gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${conf.bg} ${conf.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-200 block truncate">
                      {catName}
                    </span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      {summary.count}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {summary.total_size_formatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Model Status Card (1 col) */}
        <div className="sloth-card p-6 border border-[#23304c] rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Local AI Engine</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  healthData?.ai?.is_running && healthData?.ai?.active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {healthData?.ai?.is_running && healthData?.ai?.active ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Powered by Ollama with open-weight models on your machine.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-[#0e1422] border border-[#1e293b] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Model:</span>
                <span className="font-semibold text-purple-300 font-mono">
                  {healthData?.ai?.selected_model || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Endpoint:</span>
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]">
                  {healthData?.ai?.url || 'http://127.0.0.1:11434'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Privacy:</span>
                <span className="text-emerald-400 font-medium">100% Local (Zero Cloud)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('settings')}
              className="w-full py-2 px-3 rounded-xl bg-[#1c2538] hover:bg-[#25324c] text-xs font-semibold text-slate-200 border border-[#2a3854] flex items-center justify-center gap-2 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Configure AI Models</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Preview */}
      <div className="sloth-card p-6 border border-[#23304c] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Assistant Activity</h3>
            <p className="text-xs text-slate-400">
              Safe reversible operations logged in SQLite
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {historyData.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No operations logged yet. Run your first organization or rename batch above!
          </div>
        ) : (
          <div className="space-y-2.5">
            {historyData.slice(0, 3).map((item) => (
              <div
                key={item.batch_id}
                className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1e293b] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      item.batch_type === 'ORGANIZE'
                        ? 'bg-blue-500/10 text-blue-400'
                        : item.batch_type === 'RENAME'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-amber-500/10 text-amber-400'
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
                      <span className="text-xs font-semibold text-slate-200">
                        {item.description}
                      </span>
                      {item.undone && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Undone
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {item.total_files} file(s) • {item.timestamp_formatted}
                    </span>
                  </div>
                </div>

                {!item.undone && (
                  <button
                    onClick={() => onUndoBatch(item.batch_id)}
                    className="px-3 py-1.5 rounded-lg bg-[#1a2336] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#283854] text-xs font-medium transition-colors shrink-0"
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
