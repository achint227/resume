/**
 * useResumeSelection Hook
 * Manages selectedResumeId state and selection operations
 * Requirements: 3.1
 */

import { useState, useCallback } from 'react';
import { Resume } from '../types/resume';

/**
 * Return type for useResumeSelection hook
 */
export interface UseResumeSelectionReturn {
  selectedResumeId: string;
  selectResume: (id: string) => void;
  resetSelection: () => void;
  getSelectedResume: (resumes: Resume[]) => Resume | undefined;
}

/**
 * Hook for managing resume selection state
 * @returns Object containing selection state and operations
 */
export function useResumeSelection(): UseResumeSelectionReturn {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  /**
   * Selects a resume by ID
   * @param id - The resume ID to select
   */
  const selectResume = useCallback((id: string): void => {
    setSelectedResumeId(id);
  }, []);

  /**
   * Resets the selection to empty state
   */
  const resetSelection = useCallback((): void => {
    setSelectedResumeId('');
  }, []);

  /**
   * Gets the currently selected resume from a list of resumes
   * @param resumes - Array of resumes to search
   * @returns The selected resume or undefined if not found
   */
  const getSelectedResume = useCallback(
    (resumes: Resume[]): Resume | undefined => {
      return resumes.find((resume) => resume._id === selectedResumeId);
    },
    [selectedResumeId]
  );

  return {
    selectedResumeId,
    selectResume,
    resetSelection,
    getSelectedResume,
  };
}
