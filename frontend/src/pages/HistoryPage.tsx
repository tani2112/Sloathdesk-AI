import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  FileEdit,
  Trash2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { HistoryBatchItem } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface HistoryPageProps {
  historyData: HistoryBatchItem[];
  onUndoBatch: (batchId: string) => void;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ historyData, onUndoBatch, showToast }) => {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [undoTarget, setUndoTarget] = useState<HistoryBatchItem | null>(null);

  const toggleExpand = (batchId: string) => {
    setExpandedBatch((prev) => (prev === batchId ? null : batchId));
  };

  const handleConfirmUndo = () => {
    if (undoTarget) {
      onUndoBatch(undoTarget.batch_id);
      setUndoTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Activity History & Undo</h2>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
            SQLite Audit Trail
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Review every organization, AI rename, and cleanup operation. Revert supported batches safely with automatic conflict detection.
        </p>
      </div>

      {/* Reversibility Banner */}
      <div className="p-4 rounded-2xl bg-[#121929] border border-[#202c44] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Conflict-Protected Undo:</span> When rolling back an operation, SlothDesk AI verifies that the original location has not been taken by a newly created file. If a conflict is detected, the operation halts safely without overwriting.
        </div>
      </div>

      {/* History List */}
      {historyData.length === 0 ? (
        <div className="sloth-card p-12 border border-[#23304c] rounded-2xl text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No activity recorded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              File operations will appear here automatically once you organize, rename, or clean up folders.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {historyData.map((item) => {
            const isExpanded = expandedBatch === item.batch_id;
            const canUndo = !item.undone;

            let badgeColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
            let Icon = FolderTree;
            if (item.batch_type === 'RENAME') {
              badgeColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
              Icon = FileEdit;
            } else if (item.batch_type === 'CLEANUP') {
              badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
              Icon = Trash2;
            }

            return (
              <div
                key={item.batch_id}
                className="sloth-card border border-[#23304c] rounded-2xl overflow-hidden transition-all"
              >
                {/* Batch Header */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111726]">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleExpand(item.batch_id)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className={`p-2 rounded-xl border ${badgeColor} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{item.description}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border uppercase tracking-wider bg-slate-800 text-slate-300 border-slate-700">
                          {item.batch_type}
                        </span>
                        {item.undone && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                            Undone / Reverted
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {item.timestamp_formatted}
                        </span>
                        <span>•</span>
                        <span>{item.total_files} file(s) affected</span>
                        <span className="font-mono text-[11px] text-slate-500 truncate max-w-xs">
                          {item.folder_path}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canUndo && (
                    <button
                      onClick={() => setUndoTarget(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#182234] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#273852] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo Batch</span>
                    </button>
                  )}
                </div>

                {/* Expanded Operations Details */}
                {isExpanded && (
                  <div className="p-4 bg-[#0c121e] border-t border-[#1e293b] space-y-2 text-xs">
                    <h5 className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Recorded File Changes:
                    </h5>
                    {item.operations.length === 0 ? (
                      <p className="text-slate-500 text-xs">No individual operations recorded.</p>
                    ) : (
                      <div className="divide-y divide-[#182236] font-mono text-[11px]">
                        {item.operations.map((op) => (
                          <div key={op.id} className="py-2 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1 truncate">
                              <span className="text-slate-400">{op.original_path}</span>
                              <span className="text-purple-400 mx-2">→</span>
                              <span className="text-teal-300">{op.new_path || '(deleted)'}</span>
                            </div>
                            <span className="text-slate-500 shrink-0 uppercase text-[10px]">
                              {op.operation_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Undo Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(undoTarget)}
        title="Undo Batch Operation?"
        description={`SlothDesk AI will restore up to ${undoTarget?.total_files} file(s) from "${undoTarget?.description}" back to their original names and locations.`}
        confirmLabel="Restore Files"
        details={undoTarget?.operations.slice(0, 6).map((op) => `${op.new_path} → ${op.original_path}`)}
        onConfirm={handleConfirmUndo}
        onCancel={() => setUndoTarget(null)}
      />
    </div>
  );
};
