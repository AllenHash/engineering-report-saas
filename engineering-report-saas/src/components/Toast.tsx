'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // 如果没有provider，返回默认实现（防止崩溃）
    const defaultShow = (type: ToastType, message: string) => {
      console.log(`[Toast:${type}]`, message);
    };
    return {
      showToast: defaultShow,
      showSuccess: (msg: string) => defaultShow('success', msg),
      showError: (msg: string) => defaultShow('error', msg),
      showInfo: (msg: string) => defaultShow('info', msg),
      showWarning: (msg: string) => defaultShow('warning', msg),
    };
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // 4秒后自动移除
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((message: string) => showToast('success', message), [showToast]);
  const showError = useCallback((message: string) => showToast('error', message), [showToast]);
  const showInfo = useCallback((message: string) => showToast('info', message), [showToast]);
  const showWarning = useCallback((message: string) => showToast('warning', message), [showToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/90',
          icon: 'text-white',
        };
      case 'error':
        return {
          bg: 'bg-red-500/90',
          icon: 'text-white',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/90',
          icon: 'text-white',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/90',
          icon: 'text-white',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const styles = getStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`${styles.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] animate-slide-in`}
            >
              <span className={styles.icon}>{getIcon(toast.type)}</span>
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}