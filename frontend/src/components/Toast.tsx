import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.15)]';
        let bgClass = 'bg-[#121216]';
        let icon = <Info className="w-5 h-5 text-yellow-400" />;

        if (toast.type === 'success') {
          borderClass = 'border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]';
          icon = <CheckCircle2 className="w-5 h-5 text-yellow-400" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/50';
          icon = <XCircle className="w-5 h-5 text-rose-400" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border ${borderClass} ${bgClass} text-zinc-100 transition-all duration-300 transform translate-y-0`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-extrabold tracking-wide text-white">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-zinc-300 mt-0.5 break-words line-clamp-2">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
