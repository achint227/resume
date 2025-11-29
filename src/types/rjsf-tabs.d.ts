/**
 * Type declarations for rjsf-tabs module
 * This module provides pagination/tabs functionality for react-jsonschema-form
 */

declare module 'rjsf-tabs' {
  import type { ComponentType } from 'react';
  import type { FormProps } from '@rjsf/core';

  /**
   * Higher-order component that adds tab/pagination navigation to a Form component
   * @param FormComponent - The base Form component from @rjsf/core
   * @returns A new Form component with tab navigation capabilities
   */
  function applyPagination<T = unknown, S = unknown, F = unknown>(
    FormComponent: ComponentType<FormProps<T, S, F>>
  ): ComponentType<FormProps<T, S, F>>;

  export default applyPagination;
}
