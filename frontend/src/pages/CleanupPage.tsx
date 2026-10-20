import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  HardDrive,
  Copy,
  Clock,
  FileCode,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Square,
  Play,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { CleanupScanResponse } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface CleanupPageProps {
  activeFolder: string;
  cleanupData: CleanupScanResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export const CleanupPage: React.FC<CleanupPageProps> = ({
  activeFolder,
  cleanupData,
  isLoading,
  onRefresh,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'duplicates' | 'large' | 'old' | 'temp'>('duplicates');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isCleaning, setIsCleaning] = useState(false);
  const [deletePermanently, setDeletePermanently] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const folderName = activeFolder.split('/').filter(Boolean).pop() || activeFolder;

  const toggleSelect = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleSelectAllDuplicatesCopies = () => {
    if (!cleanupData) return;
    const next = new Set<string>();
    cleanupData.duplicate_groups.forEach((group) => {
      group.files.slice(1).forEach((f) => next.add(f.path));
    });
    setSelectedPaths(next);
    showToast('info', 'Selected duplicate copies', `Selected ${next.size} redundant copy files.`);
  };

  const handleClearSelection = () => {
    setSelectedPaths(new Set());
  };

  const handleExecuteCleanup = async () => {
    if (selectedPaths.size === 0) return;
    setIsCleaning(true);
    try {
      const pathsArray = Array.from(selectedPaths);
      const res = await api.executeCleanup(activeFolder, pathsArray, deletePermanently);
      if (res.success_count > 0) {
        showToast(
          'success',
          deletePermanently ? 'Files Deleted' : 'Moved to Safe Trash',
          `Reclaimed ${res.reclaimed_formatted} across ${res.success_count} file(s).`
        );
        setShowConfirmModal(false);
        setSelectedPaths(new Set());
        onRefresh();
      }
      if (res.failed_count > 0) {
        showToast('warning', 'Some files could not be cleaned', res.errors.join(', '));
      }
    } catch (err: any) {
      showToast('error', 'Cleanup failed', err.message);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Lazy Cleanup Assistant</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-xs font-bold">
              Storage Reclaimer
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Detect duplicate files by SHA-256 hash, discover massive downloads, and sweep temporary junk in <span className="font-mono text-yellow-400 font-bold">{folderName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#141418] hover:bg-[#1d1d24] border border-[#262630] text-zinc-200 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-yellow-400' : ''}`} />
            <span>Rescan Cleanup</span>
          </button>

          {selectedPaths.size > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isCleaning}
              className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 ${
                deletePermanently
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'sloth-btn-primary'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Clean {selectedPaths.size} Selected Files</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice & Mode Toggle */}
      <div className="p-4 rounded-2xl bg-[#111116] border border-[#252530] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-yellow-400">Safe Trash Staging:</span> By default, cleanup moves files into a hidden <span className="font-mono text-yellow-300">.sloth_trash</span> directory within the folder. Nothing is lost permanently unless you choose to delete.
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-rose-300 font-bold cursor-pointer shrink-0 bg-rose-500/10 px-3.5 py-1.5 rounded-xl border border-rose-500/25">
          <input
            type="checkbox"
            checked={deletePermanently}
            onChange={(e) => setDeletePermanently(e.target.checked)}
            className="rounded bg-[#0a0a0d] border-rose-500 text-rose-500 focus:ring-0"
          />
          <span>Permanent Delete Mode</span>
        </label>
      </div>

      {/* Category Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#202028] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'duplicates'
              ? 'bg-yellow-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#14141a]'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicates ({cleanupData?.duplicate_groups.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('large')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'large'
              ? 'bg-yellow-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#14141a]'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Large Files ({cleanupData?.large_files.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('old')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'old'
              ? 'bg-yellow-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#14141a]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Old Downloads ({cleanupData?.old_files.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('temp')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'temp'
              ? 'bg-yellow-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#14141a]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Temp & Junk ({cleanupData?.temp_files.length || 0})</span>
        </button>
      </div>

      {/* Quick Select Bar */}
      {activeTab === 'duplicates' && cleanupData && cleanupData.duplicate_groups.length > 0 && (
        <div className="flex items-center justify-between bg-[#121217] border border-[#252530] p-3 rounded-xl text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllDuplicatesCopies}
              className="text-yellow-400 hover:text-yellow-300 font-extrabold"
            >
              Select All Redundant Copies
            </button>
            <span className="text-zinc-600">|</span>
            <button onClick={handleClearSelection} className="text-zinc-400 hover:text-zinc-200">
              Clear Selection
            </button>
          </div>
          <span className="text-zinc-400">
            Selected for cleanup: <strong className="text-yellow-400 font-bold">{selectedPaths.size}</strong> files
          </span>
        </div>
      )}

      {/* Tab 1: Duplicates */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          {!cleanupData || cleanupData.duplicate_groups.length === 0 ? (
            <div className="sloth-card p-12 border border-[#252530] rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-yellow-400 mx-auto" />
              <h3 className="text-base font-extrabold text-white">No duplicate files found!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Every file in this folder has unique cryptographic SHA-256 content.
              </p>
            </div>
          ) : (
            cleanupData.duplicate_groups.map((group, gIdx) => (
              <div key={gIdx} className="sloth-card border border-[#252530] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202028]">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">Duplicate Group #{gIdx + 1}</span>
                    <span className="text-yellow-400 font-bold">({group.size_formatted} each)</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-xs" title={group.file_hash}>
                    SHA256: {group.file_hash.substring(0, 16)}...
                  </span>
                </div>

                <div className="space-y-2">
                  {group.files.map((file, fIdx) => {
                    const isSelected = selectedPaths.has(file.path);
                    const isOriginal = fIdx === 0;
                    return (
                      <div
                        key={file.path}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-500/40 text-zinc-200'
                            : isOriginal
                            ? 'bg-[#0e0e12] border-[#22222a] text-zinc-300'
                            : 'bg-[#121217] border-[#252530] text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleSelect(file.path)}
                            className="text-zinc-400 hover:text-white shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-rose-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white truncate">{file.name}</span>
                              {isOriginal ? (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 font-bold">
                                  Primary / Keep
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold">
                                  Duplicate Copy
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono truncate block max-w-md">
                              {file.path}
                            </span>
                          </div>
                        </div>

                        <span className="text-zinc-400 text-[11px] shrink-0 font-mono">
                          {file.modified_formatted}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Large Files */}
      {activeTab === 'large' && (
        <div className="sloth-card border border-[#252530] rounded-2xl divide-y divide-[#1c1c24]">
          {!cleanupData || cleanupData.large_files.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No files over 50MB found in this folder.
            </div>
          ) : (
            cleanupData.large_files.map((file) => {
              const isSelected = selectedPaths.has(file.path);
              return (
                <div
                  key={file.path}
                  className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#121217]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => toggleSelect(file.path)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{file.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono truncate block">
                        {file.path}
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-yellow-400 shrink-0 text-sm">
                    {file.size_formatted}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Old Downloads */}
      {activeTab === 'old' && (
        <div className="sloth-card border border-[#252530] rounded-2xl divide-y divide-[#1c1c24]">
          {!cleanupData || cleanupData.old_files.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No files older than 30 days found in this folder.
            </div>
          ) : (
            cleanupData.old_files.map((file) => {
              const isSelected = selectedPaths.has(file.path);
              return (
                <div
                  key={file.path}
                  className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#121217]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => toggleSelect(file.path)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{file.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono truncate block">
                        {file.path}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-zinc-200 block font-bold">{file.size_formatted}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">{file.modified_formatted}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Temp Files */}
      {activeTab === 'temp' && (
        <div className="sloth-card border border-[#252530] rounded-2xl divide-y divide-[#1c1c24]">
          {!cleanupData || cleanupData.temp_files.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No temporary or broken download files (.tmp, .crdownload, .part) found!
            </div>
          ) : (
            cleanupData.temp_files.map((file) => {
              const isSelected = selectedPaths.has(file.path);
              return (
                <div
                  key={file.path}
                  className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#121217]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => toggleSelect(file.path)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{file.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono truncate block">
                        {file.path}
                      </span>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold shrink-0">{file.size_formatted}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Confirm Cleanup Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title={deletePermanently ? 'Permanently Delete Files?' : 'Move Files to Safe Trash?'}
        description={
          deletePermanently
            ? `WARNING: You are about to PERMANENTLY delete ${selectedPaths.size} file(s). This cannot be undone.`
            : `SlothDesk AI will move ${selectedPaths.size} file(s) into the safe .sloth_trash folder. You can recover them at any time.`
        }
        confirmLabel={deletePermanently ? 'Permanently Delete' : 'Move to Trash'}
        isDestructive={deletePermanently}
        isLoading={isCleaning}
        details={Array.from(selectedPaths).slice(0, 8)}
        onConfirm={handleExecuteCleanup}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
