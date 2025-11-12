import { create } from 'zustand';
import type { ToastType } from '../components/common/Toast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, type, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message, duration) => {
    useToastStore.getState().addToast(message, 'success', duration);
  },

  error: (message, duration) => {
    useToastStore.getState().addToast(message, 'error', duration);
  },

  warning: (message, duration) => {
    useToastStore.getState().addToast(message, 'warning', duration);
  },

  info: (message, duration) => {
    useToastStore.getState().addToast(message, 'info', duration);
  },
}));

// Hook para usar o toast
export const useToast = () => {
  const { success, error, warning, info } = useToastStore();

  return {
    success,
    error,
    warning,
    info,
  };
};
