'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const bgColors: Record<ToastType, string> = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
  };

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium cursor-pointer"
      style={{
        background: bgColors[toast.type],
        animation: 'slideDown 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <span className="text-lg flex-shrink-0">{icons[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="text-white/70 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
