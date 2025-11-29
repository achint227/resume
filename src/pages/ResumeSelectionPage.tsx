/**
 * ResumeSelectionPage Component
 * Page for selecting an existing resume or creating a new one
 * Requirements: 1.2, 4.4
 */

import React from 'react';
import { Resume } from '../types/resume';
import Toast from '../components/ui/Toast';
import type { ToastItem } from '../components/ui/Toast';

/**
 * Props interface for ResumeSelectionPage
 */
export interface ResumeSelectionPageProps {
  /** Array of available resumes */
  resumes: Resume[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Currently selected resume ID */
  selectedResumeId: string;
  /** Callback when a resume is selected */
  onSelectResume: (id: string) => void;
  /** Callback when creating a new resume */
  onCreateNew: () => void;
  /** Callback to retry fetching data */
  onRetry: () => void;
  /** Toast notifications to display */
  toasts: ToastItem[];
  /** Callback when a toast is dismissed */
  onDismissToast: (id: string | number) => void;
}

/**
 * ResumeSelectionPage - Page component for resume selection
 * 
 * Features:
 * - Display list of existing resumes in a dropdown
 * - Create new resume button
 * - Error handling with retry functionality
 * - Toast notifications
 */
function ResumeSelectionPage({
  resumes,
  error,
  selectedResumeId,
  onSelectResume,
  onCreateNew,
  onRetry,
  toasts,
  onDismissToast,
}: ResumeSelectionPageProps): React.ReactElement {
  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const resumeId = e.target.value;
    if (resumeId) {
      onSelectResume(resumeId);
    }
  };

  return (
    <div className="panel panel-default panel-body resume-panel">
      <h2>Select a Resume</h2>
      
      {error && (
        <div className="alert alert-warning">
          <strong>Offline Mode:</strong> Could not connect to server. Using local data.
          <button className="btn btn-link" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}
      
      <button
        className="btn btn-success btn-lg btn-block"
        onClick={onCreateNew}
      >
        Create New Resume
      </button>
      
      <br />
      
      <p style={{ textAlign: 'center' }} className="text-muted">
        or select an existing resume to edit
      </p>
      
      <select
        className="form-control"
        value={selectedResumeId}
        onChange={handleResumeChange}
      >
        <option value="">Select a resume</option>
        {resumes.map((resume) => (
          <option key={resume._id} value={resume._id}>
            {resume.name}
          </option>
        ))}
      </select>
      
      <Toast toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}

export default ResumeSelectionPage;
