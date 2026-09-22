import React, { useEffect } from 'react';
import { RotateCcw, CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  subMessage?: string;
  onUndo?: () => void;
  onClose?: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  subMessage,
  onUndo,
  onClose,
  type = 'success',
  duration = 4000,
}) => {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const renderIcon = () => {
    switch (type) {
      case 'error':
        return (
          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'info':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
      case 'success':
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-stone-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {renderIcon()}
          <div className="min-w-0">
            <p className="text-sm font-bold text-stone-100 truncate">{message}</p>
            {subMessage && (
              <p className="text-xs text-stone-400 truncate">{subMessage}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onUndo && (
            <button
              onClick={() => {
                onUndo();
                if (onClose) onClose();
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 text-xs font-bold rounded-lg transition border border-stone-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Deshacer</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};