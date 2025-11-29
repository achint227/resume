/**
 * Hooks Barrel Export
 * Provides a single entry point for all hook exports
 * Requirements: 1.4
 */

// Resume Data Hook
export { useResumeData } from './useResumeData';
export type { UseResumeDataReturn } from './useResumeData';

// Resume Selection Hook
export { useResumeSelection } from './useResumeSelection';
export type { UseResumeSelectionReturn } from './useResumeSelection';

// Template Config Hook
export { useTemplateConfig } from './useTemplateConfig';
export type { UseTemplateConfigReturn } from './useTemplateConfig';

// Resume Metadata Hook
export { useResumeMetadata } from './useResumeMetadata';
export type { UseResumeMetadataReturn } from './useResumeMetadata';

// Toast Hook
export { useToast } from './useToast';
export type { Toast, UseToastReturn } from './useToast';

// Theme Hook
export { useTheme } from './useTheme';
