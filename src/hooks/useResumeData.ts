/**
 * useResumeData Hook
 * Handles fetching resumes and templates from API
 * Manages loading and error states with refetch functionality
 * Requirements: 3.4
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Resume } from '../types/resume';
import { Template } from '../types/template';
import { resumeApi, templateApi, healthApi } from '../services/api';
import { FALLBACK_TEMPLATES } from '../constants/defaults';

/**
 * Return type for useResumeData hook
 */
export interface UseResumeDataReturn {
  resumes: Resume[];
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  refetch: () => Promise<void>;
}

/**
 * Normalize resume data to handle type mismatches (e.g., phone as number -> string)
 */
function normalizeResume(resume: Resume): Resume {
  if (resume.basic_info && typeof resume.basic_info.phone === 'number') {
    return {
      ...resume,
      basic_info: {
        ...resume.basic_info,
        phone: String(resume.basic_info.phone),
      },
    };
  }
  return resume;
}

/**
 * Helper to check if an error is an abort/cancellation error
 */
function isAbortError(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') {
    return true;
  }
  if (err instanceof DOMException && err.name === 'AbortError') {
    return true;
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const errObj = err as { message: string };
    if (errObj.message === 'Request was cancelled') {
      return true;
    }
  }
  return false;
}

/**
 * Hook for fetching and managing resume and template data from API
 * @param fallbackResumes - Optional fallback data when API is unavailable
 * @returns Object containing resumes, templates, loading/error states, and refetch function
 */
export function useResumeData(fallbackResumes: Resume[] = []): UseResumeDataReturn {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const fallbackResumesRef = useRef(fallbackResumes);
  // Track the current request ID to ignore stale responses (handles StrictMode)
  const currentRequestIdRef = useRef(0);

  const fetchResumes = useCallback(async (): Promise<Resume[]> => {
    const data = await resumeApi.getAll();
    return data.map(normalizeResume);
  }, []);

  const fetchTemplates = useCallback(async (): Promise<Template[]> => {
    const data = await templateApi.getTemplates();
    return data;
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [resumeData, templateData] = await Promise.all([
        fetchResumes(),
        fetchTemplates(),
      ]);
      setResumes(resumeData);
      setTemplates(templateData);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setResumes(fallbackResumesRef.current.map(normalizeResume));
      setTemplates(FALLBACK_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  }, [fetchResumes, fetchTemplates]);

  useEffect(() => {
    // Increment request ID - any previous request results will be ignored
    const requestId = ++currentRequestIdRef.current;

    const initializeData = async () => {
      setIsLoading(true);
      setError(null);

      // First check if backend is healthy (no abort signal - let it complete)
      const isHealthy = await healthApi.check();

      // Check if this request is still current
      if (requestId !== currentRequestIdRef.current) {
        return; // Stale request, ignore results
      }

      if (!isHealthy) {
        // Backend not available, use fallback data
        console.warn('Backend health check failed, using fallback data');
        setIsConnected(false);
        setResumes(fallbackResumesRef.current.map(normalizeResume));
        setTemplates(FALLBACK_TEMPLATES);
        setError('Unable to connect to server');
        setIsLoading(false);
        return;
      }

      // Backend is healthy, fetch data
      try {
        const [resumeData, templateData] = await Promise.all([
          fetchResumes(),
          fetchTemplates(),
        ]);

        // Check if this request is still current
        if (requestId !== currentRequestIdRef.current) {
          return; // Stale request, ignore results
        }

        setResumes(resumeData);
        setTemplates(templateData);
        setIsConnected(true);
      } catch (err) {
        // Check if this request is still current
        if (requestId !== currentRequestIdRef.current) {
          return; // Stale request, ignore results
        }

        if (isAbortError(err)) {
          return;
        }

        console.error('Failed to initialize data:', err);
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Failed to connect');
        setResumes(fallbackResumesRef.current.map(normalizeResume));
        setTemplates(FALLBACK_TEMPLATES);
      } finally {
        // Check if this request is still current before updating loading state
        if (requestId === currentRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    // No cleanup needed - we use request ID to ignore stale results
    // This prevents NS_BINDING_ABORTED errors
  }, [fetchResumes, fetchTemplates]);

  return {
    resumes,
    templates,
    isLoading,
    error,
    isConnected,
    refetch,
  };
}
