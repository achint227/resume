import React from 'react';
import type { RJSFSchema } from '@rjsf/utils';
import TagsWidget from '../ui/TagsWidget';

/**
 * Props interface for TagsFieldWrapper
 * Based on RJSF FieldProps but simplified for tags use case
 */
export interface TagsFieldWrapperProps {
  schema: RJSFSchema & { title?: string };
  name: string;
  formData?: string[];
  onChange: (value: string[]) => void;
}

/**
 * TagsFieldWrapper - A custom field component for react-jsonschema-form
 * that wraps the TagsWidget to provide tag input functionality within forms.
 * 
 * Features:
 * - Conditional label display based on schema title and field name
 * - Integration with TagsWidget for tag management
 * - Proper form group styling
 */
function TagsFieldWrapper({ 
  schema, 
  name, 
  formData, 
  onChange 
}: TagsFieldWrapperProps): React.ReactElement {
  // Show label only if schema has a title and name is empty/falsy
  const showLabel = Boolean(schema.title && !name);
  
  return (
    <div className="form-group">
      {showLabel && (
        <label className="control-label">{schema.title}</label>
      )}
      <TagsWidget value={formData || []} onChange={onChange} />
    </div>
  );
}

export default TagsFieldWrapper;
