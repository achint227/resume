/**
 * API Services Barrel Export
 * Provides a single entry point for all API-related exports
 */

// API Client
export { ApiClient, apiClient } from './client';
export type { ApiClientConfig } from './client';

// Health API
export { createHealthApi, healthApi } from './healthApi';
export type { HealthApi, HealthResponse } from './healthApi';

// Resume API
export { createResumeApi, resumeApi } from './resumeApi';
export type { ResumeApi } from './resumeApi';

// Template API
export { createTemplateApi, templateApi } from './templateApi';
export type { TemplateApi } from './templateApi';
