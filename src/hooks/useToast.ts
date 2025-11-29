/**
 * useToast Hook
 * Manages toast notification state and operations
 * Requirements: 4.4
 */

import { useState, useCallback } from 'react';

/**
 * Toast notification data structure
 */
export interface Toast {
  id: number;
  message: string;
  isError: boolean;
}

/**
 * Return type for useToast hook
 */
export interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, isError?: boolean) => void;
  dismissToast: (id: string | number) => void;
}

/**
 * Hook for managing toast notifications
 * @param duration - Duration in milliseconds before toast auto-dismisses (default: 3000)
 * @returns Object containing toasts array and toast operations
 */
export function useToast(duration: number = 3000): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Shows a new toast notification
   * @param message - The message to display
   * @param isError - Whether this is an error toast (default: false)
   */
  const showToast = useCallback(
    (message: string, isError: boolean = false): void => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, isError }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    },
    [duration]
  );

  /**
   * Dismisses a toast by ID
   * @param id - The toast ID to dismiss
   */
  const dismissToast = useCallback((id: string | number): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
