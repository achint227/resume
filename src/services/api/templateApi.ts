/**
 * Template API Service
 * Provides methods for interacting with template-related API endpoints
 * with validation after responses.
 */

import { ApiClient, apiClient } from './client';
import { Template } from '../../types/template';
import { TemplatesResponse } from '../../types/api';
import { validateApiResponse } from '../../utils/validation';

/**
 * Template API service interface
 */
export interface TemplateApi {
  getTemplates(signal?: AbortSignal): Promise<Template[]>;
}

/**
 * Creates a Template API service instance
 * @param client - Optional ApiClient instance (defaults to shared instance)
 * @returns TemplateApi implementation
 */
export function createTemplateApi(client: ApiClient = apiClient): TemplateApi {
  return {
    /**
     * Fetches all available templates from the API
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Promise resolving to array of Template objects
     */
    async getTemplates(signal?: AbortSignal): Promise<Template[]> {
      const response = await client.get<{ data: TemplatesResponse }>('/templates', signal);
      const templatesData = response.data.data;
      validateApiResponse<TemplatesResponse>(templatesData, 'templates');
      return templatesData.templates;
    },
  };
}

/**
 * Default template API service instance
 */
export const templateApi = createTemplateApi();
