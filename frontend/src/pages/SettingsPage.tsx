import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  ShieldCheck,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Terminal,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { SystemSettings, OllamaStatusResponse } from '../types';

interface SettingsPageProps {
  settings: SystemSettings | null;
  aiStatus: OllamaStatusResponse | null;
  onRefreshStats: () => void;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  aiStatus,
  onRefreshStats,
  showToast,
}) => {
  const [ollamaUrl, setOllamaUrl] = useState(settings?.ollama_url || 'http://127.0.0.1:11434');
  const [selectedModel, setSelectedModel] = useState(settings?.selected_model || 'qwen2.5:1.5b');
  const [timeoutSec, setTimeoutSec] = useState(settings?.ai_timeout_seconds || 20);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings({
        ollama_url: ollamaUrl,
        selected_model: selectedModel,
        ai_timeout_seconds: Number(timeoutSec),
      });
      showToast('success', 'Settings saved', 'Configuration updated successfully.');
      onRefreshStats();
    } catch (err: any) {
      showToast('error', 'Failed saving settings', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      const res = await api.getAiStatus();
      if (res.is_running && res.active) {
        showToast('success', 'Ollama Connected!', `Detected ${res.available_models.length} model(s).`);
      } else if (res.is_running) {
        showToast('warning', 'Ollama is running, but no models found', 'Run "ollama pull qwen2.5:1.5b" to install one.');
      } else {
        showToast('error', 'Cannot connect to Ollama', res.error || 'Server not reachable.');
      }
      onRefreshStats();
    } catch (err: any) {
      showToast('error', 'Connection test failed', err.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black text-white tracking-tight">System & AI Settings</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-xs font-bold">
            Privacy & Engine
          </span>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Configure your local Ollama runtime, select open-weight models, and review offline isolation policies.
        </p>
      </div>

      {/* Ollama Connection & Model Selection */}
      <div className="sloth-card p-6 border border-[#252530] rounded-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#202028]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Local Ollama Engine</h3>
              <p className="text-xs text-zinc-400">Open-weight model inference running strictly on localhost</p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isChecking}
            className="px-3.5 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1d1d24] border border-[#262630] text-zinc-200 hover:text-yellow-400 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-yellow-400' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Status Pill */}
        <div className="p-3.5 rounded-xl bg-[#0e0e12] border border-[#202028] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                aiStatus?.is_running && aiStatus?.active
                  ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
                  : 'bg-zinc-600'
              }`}
            />
            <span className="text-xs font-bold text-zinc-200">
              {aiStatus?.is_running
                ? aiStatus.active
                  ? `Connected to Ollama (${aiStatus.available_models.length} model(s) installed)`
                  : 'Ollama is running, but no models are installed'
                : 'Ollama server is not running or not reachable'}
            </span>
          </div>

          {aiStatus?.is_running && aiStatus?.active && (
            <span className="text-[11px] font-black text-yellow-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Online
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ollama URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Ollama API URL</label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://127.0.0.1:11434"
              className="w-full bg-[#0a0a0d] border border-[#262632] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-yellow-400"
            />
            <span className="text-[11px] text-zinc-500 block">Default local endpoint for Ollama daemon</span>
          </div>

          {/* Active Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Select Model</label>
            {aiStatus?.available_models && aiStatus.available_models.length > 0 ? (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#0a0a0d] border border-[#262632] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 font-bold"
              >
                {aiStatus.available_models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} {m.size_formatted ? `(${m.size_formatted})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="e.g. qwen2.5:1.5b, llama3.2"
                className="w-full bg-[#0a0a0d] border border-[#262632] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-yellow-400"
              />
            )}
            <span className="text-[11px] text-zinc-500 block">
              Recommended: Qwen 2.5 (1.5B/3B/7B) or Llama 3.2
            </span>
          </div>

          {/* AI Timeout */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">AI Response Timeout (seconds)</label>
            <input
              type="number"
              value={timeoutSec}
              onChange={(e) => setTimeoutSec(Number(e.target.value))}
              min={5}
              max={120}
              className="w-full bg-[#0a0a0d] border border-[#262632] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-yellow-400"
            />
            <span className="text-[11px] text-zinc-500 block">
              Gracefully falls back to heuristics if model takes longer than this
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="sloth-btn-primary px-6 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Ollama Setup Instructions Guide */}
      {(!aiStatus?.is_running || !aiStatus?.active) && (
        <div className="sloth-card p-6 border border-yellow-400/30 bg-yellow-400/5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>How to install & start Ollama on Ubuntu</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            SlothDesk AI is currently using rule-based heuristics. To unlock full AI classification, document renaming, and natural language search:
          </p>
          <div className="bg-[#08080a] p-3 rounded-xl border border-[#24242e] font-mono text-xs text-yellow-300 space-y-1.5 overflow-x-auto">
            <div># 1. Install Ollama via official script:</div>
            <div className="text-white">curl -fsSL https://ollama.com/install.sh | sh</div>
            <div className="pt-2"># 2. Pull a fast, lightweight open-weight model:</div>
            <div className="text-white">ollama pull qwen2.5:1.5b</div>
            <div className="pt-2"># 3. Start Ollama service (if not already running):</div>
            <div className="text-white">ollama serve</div>
          </div>
        </div>
      )}

      {/* Open-Source Challenge Architecture Highlights */}
      <div className="sloth-card p-6 border border-[#252530] rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-extrabold text-sm">
          <BookOpen className="w-4 h-4 text-yellow-400" />
          <span>Slow & Steady Open-Source AI Challenge Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0e0e12] border border-[#202028] space-y-1">
            <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              100% Privacy-First & Offline
            </h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              No files, file names, or contents are ever sent to external cloud APIs or paid services. All inference executes locally on your CPU/GPU.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e12] border border-[#202028] space-y-1">
            <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              Zero Per-Request Fees
            </h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Using open-weight models (Qwen, Llama 3) eliminates costly subscription tokens and vendor lock-in.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e12] border border-[#202028] space-y-1">
            <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-yellow-400" />
              Replaceable Models
            </h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Switch freely between 1.5B parameters for ultra-low power laptops or 7B+ parameters for deeper reasoning.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e12] border border-[#202028] space-y-1">
            <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-yellow-400" />
              Graceful Offline Fallback
            </h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Even without an AI model running, file organization, duplicate detection, cleanup stats, and undo operations work flawlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
