import { FC } from 'react';

/**
 * Represents a single toast notification
 */
export interface ToastItem {
  /** Unique identifier for the toast */
  id: string | number;
  /** Message to display in the toast */
  message: string;
  /** Whether this is an error toast (true) or success toast (false) */
  isError?: boolean;
}

/**
 * Props for Toast component
 */
export interface ToastProps {
  /** Array of toast notifications to display */
  toasts: ToastItem[];
  /** Callback when a toast is dismissed */
  onDismiss: (id: string | number) => void;
}

/**
 * Toast component displays a stack of notification messages.
 * Supports both success and error variants with dismiss functionality.
 *
 * @example
 * <Toast
 *   toasts={[{ id: 1, message: 'Saved!', isError: false }]}
 *   onDismiss={(id) => removeToast(id)}
 * />
 */
const Toast: FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`toast ${toast.isError ? 'toast-error' : 'toast-success'}`}
          style={{ transform: `translateY(${index * 70}px)` }}
          role="alert"
          aria-live={toast.isError ? 'assertive' : 'polite'}
        >
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            type="button"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
