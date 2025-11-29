/**
 * Health API Service
 * Provides health check functionality for the backend API
 */

import { API_BASE_URL, CONNECTION_TIMEOUT } from '../../constants/config';

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
}

/**
 * Health API interface
 */
export interface HealthApi {
  check(signal?: AbortSignal): Promise<boolean>;
}

/**
 * Creates a Health API service instance
 * Uses a simple fetch without Content-Type header to avoid CORS preflight
 * @returns HealthApi instance
 */
export function createHealthApi(): HealthApi {
  return {
    /**
     * Checks if the backend API is healthy
     * Uses a simple GET request without custom headers to avoid CORS preflight
     * @param signal - Optional AbortSignal for request cancellation
     * @returns true if healthy, false otherwise
     */
    async check(signal?: AbortSignal): Promise<boolean> {
      // Create timeout controller
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), CONNECTION_TIMEOUT);

      // Combine signals if provided
      const combinedSignal = signal
        ? combineAbortSignals(signal, timeoutController.signal)
        : timeoutController.signal;

      try {
        // Simple GET request without Content-Type header to avoid CORS preflight
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          signal: combinedSignal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return false;
        }

        // If we get a 200 OK, the backend is healthy
        // We already checked response.ok above, so just return true
        // Optionally try to parse the response body
        try {
          await response.json(); // Consume the body
        } catch {
          // Ignore JSON parsing errors - 200 OK is enough
        }
        return true;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    },
  };
}

/**
 * Combines multiple AbortSignals into one
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}

/**
 * Default health API instance
 */
export const healthApi = createHealthApi();
