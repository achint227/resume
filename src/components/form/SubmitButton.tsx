import React from 'react';
import type { SubmitButtonProps } from '@rjsf/utils';

/**
 * Props interface for SubmitButton
 * Extends the standard RJSF SubmitButtonProps
 */
export interface CustomSubmitButtonProps extends SubmitButtonProps {}

/**
 * SubmitButton - A custom submit button component for react-jsonschema-form
 * 
 * This component provides a styled submit button for saving resume data.
 * It follows the Bootstrap button styling conventions used throughout the app.
 * 
 * Features:
 * - Bootstrap-styled info button
 * - Clear "Save Resume" label
 * - Proper form submission handling
 */
function SubmitButton(_props: CustomSubmitButtonProps): React.ReactElement {
  return (
    <div>
      <button type="submit" className="btn btn-info">
        Save Resume
      </button>
    </div>
  );
}

export default SubmitButton;
