import React, { useState } from 'react';
import {
  FolderTree,
  Play,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { OrganizePreviewResponse, PlannedMove } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface OrganizerPageProps {
  activeFolder: string;
  onRefreshStats: () => void;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export const OrganizerPage: React.FC<OrganizerPageProps> = ({
  activeFolder,
  onRefreshStats,
  showToast,
}) => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [previewData, setPreviewData] = useState<OrganizePreviewResponse | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customDescription, setCustomDescription] = useState('Organized folder by category');

  const folderName = activeFolder.split('/').filter(Boolean).pop() || activeFolder;

  const handleGeneratePreview = async () => {
    setIsPreviewing(true);
    try {
      const data = await api.previewOrganize(activeFolder);
      setPreviewData(data);
      if (data.planned_moves.length === 0) {
        showToast('info', 'Folder is already clean', 'No unorganized top-level files were found.');
      } else {
        showToast('success', 'Preview generated', `Found ${data.planned_moves.length} file(s) ready to organize.`);
      }
    } catch (err: any) {
      showToast('error', 'Preview failed', err.message);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExecuteMoves = async () => {
    if (!previewData || previewData.planned_moves.length === 0) return;
    setIsExecuting(true);
    try {
      const res = await api.executeOrganize(
        activeFolder,
        previewData.planned_moves,
        customDescription
      );
      if (res.success_count > 0) {
        showToast(
          'success',
          'Files organized successfully!',
          `Moved ${res.success_count} file(s) into category folders safely.`
        );
        setShowConfirmModal(false);
        setPreviewData(null);
        onRefreshStats();
      }
      if (res.failed_count > 0) {
        showToast('warning', 'Some files had issues', res.errors.join(', '));
      }
    } catch (err: any) {
      showToast('error', 'Organization failed', err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredMoves =
    previewData?.planned_moves.filter((move) => {
      if (categoryFilter === 'ALL') return true;
      return move.category === categoryFilter;
    }) || [];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Smart File Organizer</h2>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-semibold">
              Dry-Run Safe
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Sort scattered files in <span className="text-purple-300 font-mono font-medium">{folderName}</span> into structured category folders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePreview}
            disabled={isPreviewing}
            className="px-4 py-2.5 rounded-xl bg-[#182132] hover:bg-[#202c42] border border-[#2b3a54] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>{isPreviewing ? 'Analyzing...' : 'Generate Preview'}</span>
          </button>

          {previewData && previewData.planned_moves.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isExecuting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Organize {previewData.planned_moves.length} Files</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#121929] border border-[#202c44] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Sloth File Guarantee:</span> Files are never overwritten or deleted. If a file with the same name already exists in the destination folder, SlothDesk AI automatically renames the incoming file (e.g. <span className="font-mono text-purple-300">file (1).pdf</span>). You can undo this entire batch at any time from Activity History.
        </div>
      </div>

      {/* Preview Section */}
      {!previewData ? (
        <div className="sloth-card p-12 border border-[#23304c] rounded-2xl text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FolderTree className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No preview active</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Click &quot;Generate Preview&quot; to inspect which category folders will be created and how files will be organized.
            </p>
          </div>
          <button
            onClick={handleGeneratePreview}
            disabled={isPreviewing}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
          >
            {isPreviewing ? 'Scanning...' : 'Scan & Preview Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" />
              Filter by Category:
            </span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter === 'ALL'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#151c2d] text-slate-400 hover:text-white border border-[#23304c]'
              }`}
            >
              All ({previewData.planned_moves.length})
            </button>
            {previewData.affected_categories.map((cat) => {
              const count = previewData.planned_moves.filter((m) => m.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-teal-600 text-white'
                      : 'bg-[#151c2d] text-slate-400 hover:text-white border border-[#23304c]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Planned Moves Table */}
          <div className="sloth-card border border-[#23304c] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Planned Moves Preview</h4>
                <span className="text-xs text-slate-400">
                  Showing {filteredMoves.length} of {previewData.planned_moves.length} planned moves
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1e293b] bg-[#0c121e] text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4 font-semibold">Source File</th>
                    <th className="py-3 px-4 font-semibold">Destination Folder</th>
                    <th className="py-3 px-4 font-semibold">Target File Name</th>
                    <th className="py-3 px-4 font-semibold">Status / Safety</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182236] text-xs">
                  {filteredMoves.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No files in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredMoves.map((move, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-200">
                          <div className="flex items-center gap-2 max-w-xs truncate">
                            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="truncate" title={move.source_filename}>
                              {move.source_filename}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#162134] border border-[#243452] text-teal-300 font-medium">
                            <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
                            {move.target_folder}/
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                          <span className="truncate block max-w-xs" title={move.target_filename}>
                            {move.target_filename}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {move.conflict_resolved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              Auto-renamed (Avoid Collision)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Safe Move
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Organization Batch"
        description={`SlothDesk AI is about to organize ${previewData?.planned_moves.length} file(s) in ${folderName}. Each file will be moved into its category folder.`}
        confirmLabel="Apply Organization"
        isLoading={isExecuting}
        details={previewData?.planned_moves.slice(0, 10).map((m) => `${m.source_filename} → ${m.target_folder}/${m.target_filename}`)}
        onConfirm={handleExecuteMoves}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
