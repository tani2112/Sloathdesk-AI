import React, { useState } from 'react';
import {
  FileEdit,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  RefreshCw,
  Play,
  FileText,
  ArrowRight,
  ShieldCheck,
  Settings2,
} from 'lucide-react';
import { api } from '../services/api';
import { RenameProposal } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface RenamerPageProps {
  activeFolder: string;
  onRefreshStats: () => void;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export const RenamerPage: React.FC<RenamerPageProps> = ({
  activeFolder,
  onRefreshStats,
  showToast,
}) => {
  const [namingStyle, setNamingStyle] = useState<'kebab-case' | 'snake_case' | 'Title_Case'>('kebab-case');
  const [proposals, setProposals] = useState<RenameProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const folderName = activeFolder.split('/').filter(Boolean).pop() || activeFolder;

  const handleFetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await api.previewRename(activeFolder, undefined, true, namingStyle);
      setProposals(res.proposals);
      setAiUsed(res.ai_used);
      if (res.proposals.length === 0) {
        showToast('info', 'No files found', 'No files in folder to rename.');
      } else {
        showToast(
          'success',
          res.ai_used ? 'AI Suggestions Generated' : 'Heuristic Names Generated',
          `Generated proposals for ${res.proposals.length} files.`
        );
      }
    } catch (err: any) {
      showToast('error', 'Failed generating proposals', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelectAll = (select: boolean) => {
    setProposals((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const handleToggleItem = (index: number) => {
    setProposals((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleEditProposedName = (index: number, newName: string) => {
    setProposals((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, proposed_name: newName } : p))
    );
  };

  const selectedCount = proposals.filter((p) => p.selected).length;

  const handleExecuteRenames = async () => {
    if (selectedCount === 0) return;
    setIsExecuting(true);
    try {
      const res = await api.executeRename(activeFolder, proposals);
      if (res.success_count > 0) {
        showToast('success', 'Files Renamed!', `Successfully renamed ${res.success_count} file(s).`);
        setShowConfirmModal(false);
        setProposals([]);
        onRefreshStats();
      }
      if (res.failed_count > 0) {
        showToast('warning', 'Some renames failed', res.errors.join(', '));
      }
    } catch (err: any) {
      showToast('error', 'Rename batch failed', err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">AI File Renamer</h2>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                aiUsed
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
              }`}
            >
              {aiUsed ? 'Ollama AI Enabled' : 'Content & Metadata Aware'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Replace messy names like <span className="text-slate-300 font-mono">IMG_2026_01.pdf</span> with descriptive titles based on real file contents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Naming Style Selector */}
          <div className="flex items-center bg-[#151c2e] border border-[#23304c] rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Settings2 className="w-3 h-3" /> Style:
            </span>
            {(['kebab-case', 'snake_case', 'Title_Case'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setNamingStyle(style)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  namingStyle === style
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          <button
            onClick={handleFetchProposals}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Reading & Analyzing...' : 'Generate AI Names'}</span>
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="p-4 rounded-2xl bg-[#121929] border border-[#202c44] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Extension Preservation:</span> Original file extensions (e.g. <span className="font-mono text-teal-300">.pdf, .py, .docx</span>) are strictly kept intact. You can preview, edit any suggestion inline, or uncheck items before applying changes.
        </div>
      </div>

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <div className="sloth-card p-12 border border-[#23304c] rounded-2xl text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileEdit className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No active proposals</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Click &quot;Generate AI Names&quot; to inspect document contents and generate smart rename suggestions.
            </p>
          </div>
          <button
            onClick={handleFetchProposals}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
          >
            {isLoading ? 'Thinking...' : 'Analyze Folder Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-[#131b2b] border border-[#23304c] p-3 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleSelectAll(true)}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => handleToggleSelectAll(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Deselect All
              </button>
              <span className="text-slate-400 ml-2">
                Selected: <strong className="text-white">{selectedCount}</strong> / {proposals.length}
              </span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedCount === 0 || isExecuting}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold rounded-lg shadow-md disabled:opacity-40 flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Apply {selectedCount} Renames</span>
            </button>
          </div>

          {/* Table of Proposals */}
          <div className="sloth-card border border-[#23304c] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[#1b253b]">
              {proposals.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    item.selected ? 'bg-[#121929]' : 'bg-[#0d1320] opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleItem(idx)}
                      className="mt-1 text-slate-400 hover:text-white shrink-0"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400 line-through">
                          {item.original_name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <div className="flex-1 min-w-[200px]">
                          <input
                            type="text"
                            value={item.proposed_name}
                            onChange={(e) => handleEditProposedName(idx, e.target.value)}
                            className="w-full bg-[#0a0e17] border border-[#2a3854] rounded-lg px-2.5 py-1 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                      </div>

                      {item.reason && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span>{item.reason}</span>
                        </div>
                      )}

                      {item.preview_snippet && (
                        <div className="text-[10px] text-slate-500 font-mono bg-[#090d16] p-2 rounded border border-[#182236] truncate">
                          Excerpt: &quot;{item.preview_snippet}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Batch Rename"
        description={`SlothDesk AI is about to rename ${selectedCount} file(s) in ${folderName}.`}
        confirmLabel="Rename Files"
        isLoading={isExecuting}
        details={proposals
          .filter((p) => p.selected)
          .slice(0, 10)
          .map((p) => `${p.original_name} → ${p.proposed_name}`)}
        onConfirm={handleExecuteRenames}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
