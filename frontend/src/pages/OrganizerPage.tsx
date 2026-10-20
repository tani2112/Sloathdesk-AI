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
            <h2 className="text-2xl font-black text-white tracking-tight">Smart File Organizer</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-xs font-bold">
              Dry-Run Safe
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Sort clutter in <span className="text-yellow-400 font-mono font-bold">{folderName}</span> into structured folders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePreview}
            disabled={isPreviewing}
            className="px-4 py-2.5 rounded-xl bg-[#141418] hover:bg-[#1d1d24] border border-[#262630] text-zinc-200 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Eye className="w-4 h-4 text-yellow-400" />
            <span>{isPreviewing ? 'Analyzing...' : 'Generate Preview'}</span>
          </button>

          {previewData && previewData.planned_moves.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isExecuting}
              className="sloth-btn-primary px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Organize {previewData.planned_moves.length} Files</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#111116] border border-[#252530] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-bold text-yellow-400">Sloth File Guarantee:</span> Files are never overwritten or deleted. If a file with the same name already exists in the destination folder, SlothDesk AI automatically appends an increment (e.g. <span className="font-mono text-yellow-300">report (1).pdf</span>). Undo is always available.
        </div>
      </div>

      {/* Preview Section */}
      {!previewData ? (
        <div className="sloth-card p-12 border border-[#252530] rounded-2xl text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
            <FolderTree className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">No preview active</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Click &quot;Generate Preview&quot; to inspect which category folders will be created and how files will be organized.
            </p>
          </div>
          <button
            onClick={handleGeneratePreview}
            disabled={isPreviewing}
            className="sloth-btn-primary px-5 py-2 rounded-xl text-xs font-bold"
          >
            {isPreviewing ? 'Scanning...' : 'Scan & Preview Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-yellow-400" />
              Filter by Category:
            </span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                categoryFilter === 'ALL'
                  ? 'bg-yellow-400 text-black shadow-sm'
                  : 'bg-[#141418] text-zinc-400 hover:text-white border border-[#252530]'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-yellow-400 text-black shadow-sm'
                      : 'bg-[#141418] text-zinc-400 hover:text-white border border-[#252530]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Planned Moves Table */}
          <div className="sloth-card border border-[#252530] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#202028] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white">Planned Moves Preview</h4>
                <span className="text-xs text-zinc-400">
                  Showing {filteredMoves.length} of {previewData.planned_moves.length} planned moves
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#202028] bg-[#0c0c0f] text-[11px] uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4 font-bold">Source File</th>
                    <th className="py-3 px-4 font-bold">Target Folder</th>
                    <th className="py-3 px-4 font-bold">Target File Name</th>
                    <th className="py-3 px-4 font-bold">Status / Safety</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181820] text-xs">
                  {filteredMoves.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">
                        No files in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredMoves.map((move, idx) => (
                      <tr key={idx} className="hover:bg-[#15151c] transition-colors">
                        <td className="py-3 px-4 font-medium text-zinc-200">
                          <div className="flex items-center gap-2 max-w-xs truncate">
                            <FileText className="w-4 h-4 text-yellow-400 shrink-0" />
                            <span className="truncate font-semibold" title={move.source_filename}>
                              {move.source_filename}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-zinc-300">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16161e] border border-[#2a2a38] text-yellow-300 font-bold">
                            <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
                            {move.target_folder}/
                          </span>
                        </td>

                        <td className="py-3 px-4 text-zinc-300 font-mono text-[11px]">
                          <span className="truncate block max-w-xs font-semibold text-zinc-200" title={move.target_filename}>
                            {move.target_filename}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {move.conflict_resolved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                              <AlertTriangle className="w-3 h-3" />
                              Auto-renamed (Avoid Collision)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded border border-yellow-400/20">
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
