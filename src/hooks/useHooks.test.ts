/**
 * **Feature: codebase-refactor, Property 5: Hook State Independence**
 * **Validates: Requirements 3.5**
 * 
 * *For any* sequence of state updates across the refactored hooks 
 * (useResumeSelection, useTemplateConfig, useResumeMetadata, useResumeData), 
 * updates SHALL complete without triggering infinite re-render loops or 
 * circular dependency errors.
 */

import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useResumeSelection } from './useResumeSelection';
import { useTemplateConfig } from './useTemplateConfig';
import { useResumeMetadata } from './useResumeMetadata';
import { Template, SectionOrder } from '../types';

describe('Hook State Independence', () => {
  const mockTemplates: Template[] = [
    { id: 'template1', name: 'Template 1' },
    { id: 'template2', name: 'Template 2' },
    { id: 'template3', name: 'Template 3' },
  ];

  /**
   * Property: For any sequence of selection operations, the useResumeSelection
   * hook should complete updates without errors
   */
  it('useResumeSelection should handle any sequence of select/reset operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({ type: fc.constant('select'), id: fc.string() }),
            fc.record({ type: fc.constant('reset') })
          ),
          { minLength: 1, maxLength: 20 }
        ),
        (operations) => {
          const { result } = renderHook(() => useResumeSelection());
          
          // Execute all operations without throwing
          operations.forEach((op) => {
            act(() => {
              if (op.type === 'select' && 'id' in op) {
                result.current.selectResume(op.id);
              } else {
                result.current.resetSelection();
              }
            });
          });

          // Verify final state is consistent
          const lastOp = operations[operations.length - 1];
          if (lastOp.type === 'reset') {
            expect(result.current.selectedResumeId).toBe('');
          } else if (lastOp.type === 'select' && 'id' in lastOp) {
            expect(result.current.selectedResumeId).toBe(lastOp.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any sequence of template config operations, the useTemplateConfig
   * hook should complete updates without errors
   */
  it('useTemplateConfig should handle any sequence of template/section operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({ 
              type: fc.constant('setTemplate'), 
              template: fc.constantFrom('template1', 'template2', 'template3') 
            }),
            fc.record({ type: fc.constant('moveUp'), index: fc.integer({ min: 0, max: 2 }) }),
            fc.record({ type: fc.constant('moveDown'), index: fc.integer({ min: 0, max: 2 }) }),
            fc.record({ type: fc.constant('reset') })
          ),
          { minLength: 1, maxLength: 20 }
        ),
        (operations) => {
          const { result } = renderHook(() => useTemplateConfig(mockTemplates));
          
          // Execute all operations without throwing
          operations.forEach((op) => {
            act(() => {
              switch (op.type) {
                case 'setTemplate':
                  if ('template' in op) {
                    result.current.setSelectedTemplate(op.template);
                  }
                  break;
                case 'moveUp':
                  if ('index' in op) {
                    result.current.moveSectionUp(op.index);
                  }
                  break;
                case 'moveDown':
                  if ('index' in op) {
                    result.current.moveSectionDown(op.index);
                  }
                  break;
                case 'reset':
                  result.current.resetTemplateConfig();
                  break;
              }
            });
          });

          // Verify state is consistent (section order always has 3 items)
          expect(result.current.sectionOrder).toHaveLength(3);
          expect(result.current.order).toHaveLength(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any sequence of metadata operations, the useResumeMetadata
   * hook should complete updates without errors
   */
  it('useResumeMetadata should handle any sequence of metadata operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({ type: fc.constant('setKeywords'), keywords: fc.array(fc.string()) }),
            fc.record({ type: fc.constant('setName'), name: fc.string() }),
            fc.record({ type: fc.constant('reset') }),
            fc.record({ 
              type: fc.constant('initialize'), 
              keywords: fc.array(fc.string()), 
              name: fc.string() 
            })
          ),
          { minLength: 1, maxLength: 20 }
        ),
        (operations) => {
          const { result } = renderHook(() => useResumeMetadata());
          
          // Execute all operations without throwing
          operations.forEach((op) => {
            act(() => {
              switch (op.type) {
                case 'setKeywords':
                  if ('keywords' in op) {
                    result.current.setKeywords(op.keywords);
                  }
                  break;
                case 'setName':
                  if ('name' in op) {
                    result.current.setResumeName(op.name);
                  }
                  break;
                case 'reset':
                  result.current.resetMetadata();
                  break;
                case 'initialize':
                  if ('keywords' in op && 'name' in op) {
                    result.current.initializeFromResume(op.keywords, op.name);
                  }
                  break;
              }
            });
          });

          // Verify state is consistent (keywords is always an array, name is always a string)
          expect(Array.isArray(result.current.keywords)).toBe(true);
          expect(typeof result.current.resumeName).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any interleaved sequence of operations across all hooks,
   * all hooks should complete updates independently without affecting each other
   */
  it('all hooks should operate independently without circular dependencies', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({ hook: fc.constant('selection'), action: fc.constant('select'), id: fc.string() }),
            fc.record({ hook: fc.constant('selection'), action: fc.constant('reset') }),
            fc.record({ hook: fc.constant('template'), action: fc.constant('setTemplate'), template: fc.string() }),
            fc.record({ hook: fc.constant('template'), action: fc.constant('moveUp'), index: fc.integer({ min: 0, max: 2 }) }),
            fc.record({ hook: fc.constant('template'), action: fc.constant('moveDown'), index: fc.integer({ min: 0, max: 2 }) }),
            fc.record({ hook: fc.constant('metadata'), action: fc.constant('setKeywords'), keywords: fc.array(fc.string()) }),
            fc.record({ hook: fc.constant('metadata'), action: fc.constant('setName'), name: fc.string() }),
            fc.record({ hook: fc.constant('metadata'), action: fc.constant('reset') })
          ),
          { minLength: 5, maxLength: 30 }
        ),
        (operations) => {
          // Render all hooks together
          const { result: selectionResult } = renderHook(() => useResumeSelection());
          const { result: templateResult } = renderHook(() => useTemplateConfig(mockTemplates));
          const { result: metadataResult } = renderHook(() => useResumeMetadata());

          // Execute interleaved operations
          operations.forEach((op) => {
            act(() => {
              switch (op.hook) {
                case 'selection':
                  if (op.action === 'select' && 'id' in op) {
                    selectionResult.current.selectResume(op.id);
                  } else if (op.action === 'reset') {
                    selectionResult.current.resetSelection();
                  }
                  break;
                case 'template':
                  if (op.action === 'setTemplate' && 'template' in op) {
                    templateResult.current.setSelectedTemplate(op.template);
                  } else if (op.action === 'moveUp' && 'index' in op) {
                    templateResult.current.moveSectionUp(op.index);
                  } else if (op.action === 'moveDown' && 'index' in op) {
                    templateResult.current.moveSectionDown(op.index);
                  }
                  break;
                case 'metadata':
                  if (op.action === 'setKeywords' && 'keywords' in op) {
                    metadataResult.current.setKeywords(op.keywords);
                  } else if (op.action === 'setName' && 'name' in op) {
                    metadataResult.current.setResumeName(op.name);
                  } else if (op.action === 'reset') {
                    metadataResult.current.resetMetadata();
                  }
                  break;
              }
            });
          });

          // Verify all hooks maintain valid state
          expect(typeof selectionResult.current.selectedResumeId).toBe('string');
          expect(Array.isArray(templateResult.current.sectionOrder)).toBe(true);
          expect(typeof templateResult.current.order).toBe('string');
          expect(Array.isArray(metadataResult.current.keywords)).toBe(true);
          expect(typeof metadataResult.current.resumeName).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});
