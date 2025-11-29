import React from 'react';
import type { FieldProps, RJSFSchema, StrictRJSFSchema, FormContextType } from '@rjsf/utils';

/**
 * Props interface for HiddenLabelArrayField
 * Extends the standard RJSF FieldProps
 */
export interface HiddenLabelArrayFieldProps<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType
> extends FieldProps<T, S, F> {
  registry: FieldProps<T, S, F>['registry'];
}

/**
 * HiddenLabelArrayField - A custom field component for react-jsonschema-form
 * that renders an ArrayField with hidden labels and additional top margin.
 * 
 * This component is useful for nested array fields where the default label
 * would be redundant or visually cluttered.
 * 
 * Features:
 * - Wraps the standard ArrayField from the registry
 * - Adds top margin for visual separation
 * - Passes through all props to the underlying ArrayField
 */
function HiddenLabelArrayField<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType
>(props: HiddenLabelArrayFieldProps<T, S, F>): React.ReactElement {
  const ArrayField = props.registry.fields.ArrayField;
  
  return (
    <div style={{ marginTop: '10px' }}>
      <ArrayField {...props} />
    </div>
  );
}

export default HiddenLabelArrayField;
