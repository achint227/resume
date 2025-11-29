/**
 * useTemplateConfig Hook
 * Manages selectedTemplate and sectionOrder state
 * Provides moveSectionUp, moveSectionDown functions
 * Requirements: 3.2
 */

import { useState, useCallback, useEffect } from 'react';
import { Template, SectionOrder } from '../types';
import { DEFAULT_SECTION_ORDER } from '../constants/defaults';

/**
 * Return type for useTemplateConfig hook
 */
export interface UseTemplateConfigReturn {
  selectedTemplate: string;
  sectionOrder: SectionOrder[];
  order: string;
  setSelectedTemplate: (template: string) => void;
  setSectionOrder: (order: SectionOrder[]) => void;
  moveSectionUp: (index: number) => void;
  moveSectionDown: (index: number) => void;
  resetTemplateConfig: () => void;
}

/**
 * Hook for managing template selection and section ordering
 * @param templates - Available templates to select from
 * @returns Object containing template config state and operations
 */
export function useTemplateConfig(templates: Template[] = []): UseTemplateConfigReturn {
  const [selectedTemplate, setSelectedTemplateState] = useState<string>('');
  const [sectionOrder, setSectionOrderState] = useState<SectionOrder[]>(DEFAULT_SECTION_ORDER);
  const [order, setOrder] = useState<string>('pwe');

  // Set default template when templates are loaded
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplateState(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  /**
   * Sets the selected template
   * @param template - Template ID to select
   */
  const setSelectedTemplate = useCallback((template: string): void => {
    setSelectedTemplateState(template);
  }, []);

  /**
   * Sets the section order
   * @param newOrder - New section order array
   */
  const setSectionOrder = useCallback((newOrder: SectionOrder[]): void => {
    setSectionOrderState(newOrder);
    setOrder(newOrder.map((s) => s.key).join(''));
  }, []);

  /**
   * Moves a section up in the order
   * @param index - Index of section to move up
   */
  const moveSectionUp = useCallback((index: number): void => {
    if (index === 0) return;
    setSectionOrderState((prev) => {
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setOrder(newOrder.map((s) => s.key).join(''));
      return newOrder;
    });
  }, []);

  /**
   * Moves a section down in the order
   * @param index - Index of section to move down
   */
  const moveSectionDown = useCallback((index: number): void => {
    setSectionOrderState((prev) => {
      if (index === prev.length - 1) return prev;
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setOrder(newOrder.map((s) => s.key).join(''));
      return newOrder;
    });
  }, []);

  /**
   * Resets template config to default state
   */
  const resetTemplateConfig = useCallback((): void => {
    setSectionOrderState(DEFAULT_SECTION_ORDER);
    setOrder('pwe');
    if (templates.length > 0) {
      setSelectedTemplateState(templates[0].id);
    } else {
      setSelectedTemplateState('');
    }
  }, [templates]);

  return {
    selectedTemplate,
    sectionOrder,
    order,
    setSelectedTemplate,
    setSectionOrder,
    moveSectionUp,
    moveSectionDown,
    resetTemplateConfig,
  };
}
