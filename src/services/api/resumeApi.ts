/**
 * Resume API Service
 * Provides methods for interacting with resume-related API endpoints
 * with validation before requests and after responses.
 */

import { ApiClient, apiClient } from './client';
import {
  Resume,
  ResumeCreateInput,
  ResumeUpdateInput,
} from '../../types/resume';
import { CreateResumeResponse, CopyResumeResponse } from '../../types/api';
import { validateResumeData, validateApiResponse } from '../../utils/validation';
import { API_BASE_URL } from '../../constants/config';

/**
 * Resume API service interface
 */
export interface ResumeApi {
  getAll(signal?: AbortSignal): Promise<Resume[]>;
  getById(id: string, signal?: AbortSignal): Promise<Resume>;
  create(data: ResumeCreateInput, signal?: AbortSignal): Promise<CreateResumeResponse>;
  update(id: string, data: ResumeUpdateInput, signal?: AbortSignal): Promise<void>;
  download(id: string, template: string, order: string): Promise<Response>;
  copy(id: string, template: string, order: string, signal?: AbortSignal): Promise<CopyResumeResponse>;
}

/**
 * Creates a Resume API service instance
 * @param client - Optional ApiClient instance (defaults to shared instance)
 * @returns ResumeApi implementation
 */
export function createResumeApi(client: ApiClient = apiClient): ResumeApi {
  return {
    /**
     * Fetches all resumes from the API
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Promise resolving to array of Resume objects
     */
    async getAll(signal?: AbortSignal): Promise<Resume[]> {
      const response = await client.get<{ data: Array<Resume & { id?: string }> }>('/resume', signal);
      const resumes = response.data.data.map((r) => ({
        ...r,
        _id: r._id || r.id || '',
      }));
      validateApiResponse<Resume[]>(resumes, 'resumeArray');
      return resumes;
    },

    /**
     * Fetches a single resume by ID
     * @param id - The resume ID
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Promise resolving to Resume object
     */
    async getById(id: string, signal?: AbortSignal): Promise<Resume> {
      const response = await client.get<Resume>(`/resume/${id}`, signal);
      validateApiResponse<Resume>(response.data, 'resume');
      return response.data;
    },

    /**
     * Creates a new resume
     * @param data - The resume data to create
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Promise resolving to CreateResumeResponse with the new ID
     */
    async create(data: ResumeCreateInput, signal?: AbortSignal): Promise<CreateResumeResponse> {
      // Validate request data before sending
      validateResumeData(data);
      
      const response = await client.post<CreateResumeResponse, ResumeCreateInput>(
        '/resume',
        data,
        signal
      );
      validateApiResponse<CreateResumeResponse>(response.data, 'createResume');
      return response.data;
    },

    /**
     * Updates an existing resume
     * @param id - The resume ID to update
     * @param data - The updated resume data
     * @param signal - Optional AbortSignal for request cancellation
     */
    async update(id: string, data: ResumeUpdateInput, signal?: AbortSignal): Promise<void> {
      // Validate request data before sending
      validateResumeData(data);
      
      await client.put<void, ResumeUpdateInput>(`/resume/${id}`, data, signal);
    },

    /**
     * Downloads a resume as PDF
     * @param id - The resume ID
     * @param template - The template ID to use
     * @param order - The section order (e.g., "pwe")
     * @returns Promise resolving to Response object (for blob handling)
     */
    async download(id: string, template: string, order: string): Promise<Response> {
      // For download, we use native fetch to get the raw Response for blob handling
      const url = `${API_BASE_URL}/download/${id}/${template}/${order}`;
      return fetch(url);
    },

    /**
     * Copies a resume as LaTeX source
     * @param id - The resume ID
     * @param template - The template ID to use
     * @param order - The section order (e.g., "pwe")
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Promise resolving to CopyResumeResponse with LaTeX source
     */
    async copy(
      id: string,
      template: string,
      order: string,
      signal?: AbortSignal
    ): Promise<CopyResumeResponse> {
      const response = await client.get<CopyResumeResponse>(
        `/copy/${id}/${template}/${order}`,
        signal
      );
      validateApiResponse<CopyResumeResponse>(response.data, 'copyResume');
      return response.data;
    },
  };
}

/**
 * Default resume API service instance
 */
export const resumeApi = createResumeApi();
