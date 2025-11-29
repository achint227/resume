import { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Error context information captured by ErrorBoundary
 */
export interface ErrorContext {
  componentName?: string;
  operationType?: string;
  componentStack?: string;
  timestamp: Date;
}

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional name to identify which component/section this boundary wraps */
  componentName?: string;
  /** Optional fallback UI to render when an error occurs */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, context: ErrorContext) => void;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorContext: ErrorContext | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors in child components,
 * logs them, and displays a fallback UI. Enhanced to capture component stack
 * and contextual information about where the error occurred.
 * 
 * @example
 * <ErrorBoundary componentName="ResumeEditor" onError={logError}>
 *   <ResumeEditPage />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorContext: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }


  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName, onError } = this.props;

    // Build error context with component stack and contextual information
    const errorContext: ErrorContext = {
      componentName: componentName || 'Unknown',
      operationType: this.extractOperationType(error),
      componentStack: errorInfo.componentStack || undefined,
      timestamp: new Date(),
    };

    // Update state with error context
    this.setState({ errorContext });

    // Log error with context to console
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      context: errorContext,
      stack: error.stack,
    });

    // Call optional error callback
    if (onError) {
      onError(error, errorContext);
    }
  }

  /**
   * Extracts operation type from error message or name
   */
  private extractOperationType(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('fetch') || message.includes('network')) {
      return 'network';
    }
    if (message.includes('render') || message.includes('component')) {
      return 'render';
    }
    if (message.includes('state') || message.includes('hook')) {
      return 'state';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    
    return 'unknown';
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorContext: null,
    });
  };

  /**
   * Gets a user-friendly error message without technical details
   */
  private getUserFriendlyMessage(): string {
    const { error } = this.state;
    
    if (!error) {
      return 'An unexpected error occurred';
    }

    // Return a sanitized message without stack traces or technical jargon
    const message = error.message;
    
    // Check for common technical patterns and replace with friendly messages
    if (message.includes('TypeError') || message.includes('undefined')) {
      return 'Something went wrong while processing your request';
    }
    if (message.includes('NetworkError') || message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your connection.';
    }
    if (message.includes('SyntaxError')) {
      return 'There was a problem processing the data';
    }
    
    // If message looks technical (contains stack-like patterns), use generic message
    if (message.includes('at ') || message.includes('Error:') || /\d+:\d+/.test(message)) {
      return 'An unexpected error occurred';
    }
    
    return message;
  }

  render(): ReactNode {
    const { hasError, errorContext } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>{this.getUserFriendlyMessage()}</p>
            {errorContext?.componentName && errorContext.componentName !== 'Unknown' && (
              <p className="error-location">
                Error occurred in: {errorContext.componentName}
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={this.handleRetry}
              type="button"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
