/**
 * Template Types
 * TypeScript interfaces for template-related data models
 */

/**
 * Resume template definition
 */
export interface Template {
  id: string;
  name: string;
}

/**
 * Section ordering configuration for resume layout
 */
export interface SectionOrder {
  key: string;
  label: string;
}
