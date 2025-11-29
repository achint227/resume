/**
 * API Types
 * TypeScript interfaces for API request and response types
 */

import { Template } from './template';

/**
 * Error type categories for API errors
 */
export type ApiErrorType = 'network' | 'validation' | 'server' | 'unknown';

/**
 * Standardized API error structure
 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

/**
 * Response from GET /templates endpoint
 */
export interface TemplatesResponse {
  templates: Template[];
}

/**
 * Response from POST /resume endpoint
 */
export interface CreateResumeResponse {
  id: string;
}

/**
 * Response from GET /copy/:id/:template/:order endpoint
 */
export interface CopyResumeResponse {
  resume: string;
}
