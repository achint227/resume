/**
 * useResumeMetadata Hook
 * Manages keywords and resumeName state
 * Provides setKeywords, setResumeName, resetMetadata functions
 * Requirements: 3.3
 */

import { useState, useCallback } from 'react';

/**
 * Return type for useResumeMetadata hook
 */
export interface UseResumeMetadataReturn {
  keywords: string[];
  resumeName: string;
  setKeywords: (keywords: string[]) => void;
  setResumeName: (name: string) => void;
  resetMetadata: () => void;
  initializeFromResume: (keywords?: string[], name?: string) => void;
}

/**
 * Hook for managing resume metadata (keywords and name)
 * @returns Object containing metadata state and operations
 */
export function useResumeMetadata(): UseResumeMetadataReturn {
  const [keywords, setKeywordsState] = useState<string[]>([]);
  const [resumeName, setResumeNameState] = useState<string>('');

  /**
   * Sets the keywords array
   * @param newKeywords - Array of keywords to set
   */
  const setKeywords = useCallback((newKeywords: string[]): void => {
    setKeywordsState(newKeywords);
  }, []);

  /**
   * Sets the resume name
   * @param name - Name to set
   */
  const setResumeName = useCallback((name: string): void => {
    setResumeNameState(name);
  }, []);

  /**
   * Resets metadata to default empty state
   */
  const resetMetadata = useCallback((): void => {
    setKeywordsState([]);
    setResumeNameState('');
  }, []);

  /**
   * Initializes metadata from a resume object
   * @param resumeKeywords - Keywords from resume
   * @param name - Name from resume
   */
  const initializeFromResume = useCallback(
    (resumeKeywords?: string[], name?: string): void => {
      setKeywordsState(resumeKeywords || []);
      setResumeNameState(name || '');
    },
    []
  );

  return {
    keywords,
    resumeName,
    setKeywords,
    setResumeName,
    resetMetadata,
    initializeFromResume,
  };
}
