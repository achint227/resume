/**
 * API Client
 * Centralized HTTP client with configurable base URL, default headers,
 * request cancellation support, and standardized error handling.
 */

import { ApiError, ApiResponse } from '../../types/api';
import { classifyError } from '../../utils/errorHandling';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../../constants/config';

/**
 * Configuration options for the API client
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

/**
 * Default configuration for the API client
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};

/**
 * API Client class for making HTTP requests with standardized error handling
 * and request cancellation support.
 */
export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      defaultHeaders: {
        ...DEFAULT_CONFIG.defaultHeaders,
        ...config.defaultHeaders,
      },
    };
  }

  /**
   * Makes a GET request to the specified path
   * @param path - The API endpoint path
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Promise resolving to ApiResponse with the response data
   */
  async get<T>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, signal);
  }


  /**
   * Makes a POST request to the specified path
   * @param path - The API endpoint path
   * @param data - The request body data
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Promise resolving to ApiResponse with the response data
   */
  async post<T, D>(path: string, data: D, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data, signal);
  }

  /**
   * Makes a PUT request to the specified path
   * @param path - The API endpoint path
   * @param data - The request body data
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Promise resolving to ApiResponse with the response data
   */
  async put<T, D>(path: string, data: D, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, data, signal);
  }

  /**
   * Makes a DELETE request to the specified path
   * @param path - The API endpoint path
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Promise resolving to ApiResponse with the response data
   */
  async delete<T>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, signal);
  }

  /**
   * Internal method to make HTTP requests with standardized error handling
   */
  private async request<T>(
    method: string,
    path: string,
    data?: unknown,
    signal?: AbortSignal
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    
    // Create timeout abort controller if no signal provided
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), this.config.timeout);
    
    // Combine user signal with timeout signal
    const combinedSignal = signal 
      ? this.combineAbortSignals(signal, timeoutController.signal)
      : timeoutController.signal;

    try {
      const response = await fetch(url, {
        method,
        headers: this.config.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw response;
      }

      // Handle empty responses (e.g., 204 No Content)
      const contentType = response.headers.get('content-type');
      let responseData: T;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = {} as T;
      }

      return {
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Re-throw AbortError for cancellation
      if (error instanceof DOMException && error.name === 'AbortError') {
        const apiError: ApiError = {
          type: 'network',
          message: 'Request was cancelled',
          originalError: error,
        };
        throw apiError;
      }
      
      // Classify and throw standardized error
      const apiError = classifyError(error);
      throw apiError;
    }
  }

  /**
   * Builds the full URL from the base URL and path
   */
  private buildUrl(path: string): string {
    const base = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  /**
   * Combines multiple AbortSignals into one
   */
  private combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
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
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();
