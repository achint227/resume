import { SectionOrder, Template } from '../types';

/**
 * Default section order for resume layout
 * Defines the initial ordering of resume sections
 */
export const DEFAULT_SECTION_ORDER: SectionOrder[] = [
  { key: 'p', label: 'Projects' },
  { key: 'w', label: 'Work Experience' },
  { key: 'e', label: 'Education' }
];

/**
 * Mapping of section keys to their display labels
 */
export const ORDER_MAP: Record<string, string> = {
  p: 'Projects',
  w: 'Work Experience',
  e: 'Education'
};

/**
 * Fallback templates used when API is unavailable
 */
export const FALLBACK_TEMPLATES: Template[] = [
  { id: 'moderncv', name: 'Modern CV' },
  { id: 'russel', name: 'Russell' },
  { id: 'resume', name: 'Resume' }
];
