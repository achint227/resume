import { FC } from 'react';

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Message to display below the spinner */
  message?: string;
  /** Additional CSS class names */
  className?: string;
  /** Size variant of the spinner */
  size?: 'small' | 'medium' | 'large';
}

/**
 * LoadingSpinner component displays a loading indicator with an optional message.
 * Used to indicate that content is being loaded or an operation is in progress.
 *
 * @example
 * <LoadingSpinner message="Loading resumes..." />
 * <LoadingSpinner size="small" />
 */
const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  className = '',
  size = 'medium',
}) => {
  const sizeClass = size !== 'medium' ? `loading-spinner-${size}` : '';

  return (
    <div className={`loading-spinner-container ${className}`.trim()} role="status" aria-live="polite">
      <div className={`loading-spinner ${sizeClass}`.trim()} aria-hidden="true" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
