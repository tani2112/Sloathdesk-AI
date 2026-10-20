import React, { useState } from 'react';
import { Folder, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface FolderPickerModalProps {
  isOpen: boolean;
  currentFolder: string;
  defaultFolders: Array<{ label: string; path: string; exists: boolean }>;
  onSelectFolder: (folderPath: string) => void;
  onClose: () => void;
}

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  isOpen,
  currentFolder,
  defaultFolders,
  onSelectFolder,
  onClose,
}) => {
  const [customPath, setCustomPath] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndSelect = async (path: string) => {
    setIsValidating(true);
    setValidationError(null);
    try {
      const res = await api.validateFolder(path);
      if (res.valid) {
        onSelectFolder(res.path);
        onClose();
      } else {
        setValidationError(res.error || 'Invalid or inaccessible directory.');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Folder verification failed.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111116] border border-[#282834] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f1f26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-400/10 rounded-xl text-yellow-400 border border-yellow-400/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Select Working Folder</h3>
              <p className="text-xs text-zinc-400">Choose which directory SlothDesk AI should organize</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            Common User Folders
          </label>
          <div className="grid grid-cols-2 gap-2">
            {defaultFolders.map((f) => {
              const isSelected = currentFolder === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => handleValidateAndSelect(f.path)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-yellow-400/60 bg-yellow-400/15 text-white'
                      : 'border-[#202028] bg-[#0c0c0f] text-zinc-300 hover:border-yellow-400/30 hover:bg-[#14141a]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-sm font-bold block">{f.label}</span>
                    <span className="text-[11px] text-zinc-400 truncate block font-mono">{f.path}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-yellow-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Path Input */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            Or Custom Path
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="e.g. /home/user/my_folder or ~/Downloads"
              className="flex-1 bg-[#08080a] border border-[#262632] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-yellow-400 font-mono"
            />
            <button
              onClick={() => handleValidateAndSelect(customPath)}
              disabled={!customPath.trim() || isValidating}
              className="sloth-btn-primary px-5 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
            >
              {isValidating ? 'Checking...' : 'Open'}
            </button>
          </div>

          {validationError && (
            <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#1f1f26] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
