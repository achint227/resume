/**
 * Error Handling Utilities
 * Functions for classifying errors, creating user-friendly messages,
 * and calculating retry delays with exponential backoff.
 */

import { ApiError } from '../types/api';

/**
 * Retry configuration for exponential backoff
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

/**
 * Classifies an error into one of the predefined categories.
 * 
 * Categories:
 * - 'network': Connection failures, fetch errors, timeouts
 * - 'validation': Client errors (4xx status codes), invalid data
 * - 'server': Server errors (5xx status codes)
 * - 'unknown': All other errors
 * 
 * @param error - The error to classify
 * @returns An ApiError object with type, message, and optional metadata
 */
export function classifyError(error: unknown): ApiError {
  // Handle AbortError (request cancellation)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      type: 'network',
      message: 'Request was cancelled',
      originalError: error,
    };
  }

  // Handle TypeError (typically network/fetch errors)
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed to fetch')
    ) {
      return {
        type: 'network',
        message: 'Unable to connect to server',
        originalError: error,
      };
    }
  }

  // Handle Response objects (HTTP errors)
  if (error instanceof Response) {
    const statusCode = error.status;
    
    if (statusCode >= 500) {
      return {
        type: 'server',
        message: 'Server error occurred',
        statusCode,
      };
    }
    
    if (statusCode >= 400) {
      return {
        type: 'validation',
        message: 'Invalid request',
        statusCode,
      };
    }
  }

  // Handle objects with status property (common error response pattern)
  if (
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  ) {
    const statusCode = (error as { status: number }).status;
    
    if (statusCode >= 500) {
      return {
        type: 'server',
        message: 'Server error occurred',
        statusCode,
      };
    }
    
    if (statusCode >= 400) {
      return {
        type: 'validation',
        message: 'Invalid request',
        statusCode,
      };
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for network-related error messages
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('connection')
    ) {
      return {
        type: 'network',
        message: 'Unable to connect to server',
        originalError: error,
      };
    }

    // Check for validation-related error messages
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return {
        type: 'validation',
        message: 'Invalid data provided',
        originalError: error,
      };
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred',
      originalError: error,
    };
  }

  // Default case for unknown error types
  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
    originalError: error instanceof Error ? error : undefined,
  };
}


/**
 * Creates a user-friendly error message from an ApiError.
 * 
 * The message is designed to be displayed to end users and avoids
 * technical jargon, stack traces, error codes, or internal identifiers.
 * 
 * @param error - The ApiError to convert to a user-friendly message
 * @returns A human-readable error message string
 */
export function createUserFriendlyMessage(error: ApiError): string {
  switch (error.type) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case 'validation':
      return 'The information provided is not valid. Please check your input and try again.';
    
    case 'server':
      return 'The server encountered an issue. Please try again later.';
    
    case 'unknown':
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Calculates the delay before a retry attempt using exponential backoff.
 * 
 * Formula: delay = min(baseDelay * 2^attempt, maxDelay)
 * 
 * This ensures that:
 * - Each subsequent retry waits longer than the previous one
 * - The delay never exceeds the maximum configured delay
 * - The delay grows exponentially to reduce server load during outages
 * 
 * @param attempt - The current attempt number (0-indexed)
 * @param config - The retry configuration with base and max delays
 * @returns The delay in milliseconds before the next retry
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  // Ensure attempt is non-negative
  const safeAttempt = Math.max(0, attempt);
  
  // Calculate exponential delay: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, safeAttempt);
  
  // Cap at maxDelay
  return Math.min(exponentialDelay, config.maxDelayMs);
}

/**
 * Determines if an error is retryable.
 * 
 * Network and server errors are typically retryable, while
 * validation errors are not (they require user intervention).
 * 
 * @param error - The ApiError to check
 * @returns true if the error is retryable, false otherwise
 */
export function isRetryableError(error: ApiError): boolean {
  return error.type === 'network' || error.type === 'server';
}
