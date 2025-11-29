import React, { useState } from 'react';
import type { ArrayFieldTemplateProps, ArrayFieldTemplateItemType } from '@rjsf/utils';

/**
 * Props interface for CollapsibleArrayFieldTemplate
 * Extends the standard RJSF ArrayFieldTemplateProps
 */
export interface CollapsibleArrayFieldTemplateProps extends ArrayFieldTemplateProps {}

/**
 * Collapsed state tracking for array items
 */
interface CollapsedState {
  [key: number]: boolean;
}

/**
 * Form data structure for array items (used for title extraction)
 */
interface ItemFormData {
  university?: string;
  title?: string;
  company?: string;
  [key: string]: unknown;
}

/**
 * Gets a display title for an array item based on its form data
 */
function getItemTitle(item: ArrayFieldTemplateItemType): string {
  const childProps = item.children as React.ReactElement<{ formData?: ItemFormData }>;
  const formData = childProps?.props?.formData;
  if (!formData) return `Item ${item.index + 1}`;
  if (formData.university) return formData.university;
  if (formData.title && !formData.company) return formData.title;
  if (formData.company && formData.title) return `${formData.title} - ${formData.company}`;
  if (formData.company) return formData.company;
  return `Item ${item.index + 1}`;
}

/**
 * CollapsibleArrayFieldTemplate - A custom array field template for react-jsonschema-form
 * that provides collapsible sections for complex array items and inline display for simple arrays.
 * 
 * Features:
 * - Collapsible items with expand/collapse toggle
 * - Smart title extraction from form data
 * - Reorder controls (move up/down)
 * - Remove item functionality
 * - Add new item button
 * - Special handling for bullet/string arrays (non-collapsible)
 */
function CollapsibleArrayFieldTemplate(props: CollapsibleArrayFieldTemplateProps): React.ReactElement {
  const [collapsed, setCollapsed] = useState<CollapsedState>(() => {
    const initial: CollapsedState = {};
    props.items.forEach((item) => {
      initial[item.index] = true;
    });
    return initial;
  });


  // Check if this is a simple string/bullet array (non-collapsible)
  const isBulletArray = props.items.length > 0 && (() => {
    const childProps = props.items[0].children as React.ReactElement<{ schema?: { type?: string } }>;
    return childProps?.props?.schema?.type === 'string';
  })();

  const toggleCollapse = (index: number): void => {
    setCollapsed(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Render simple bullet arrays without collapse functionality
  if (isBulletArray) {
    return (
      <div className="array-field">
        {props.items.map((item) => (
          <div key={item.key} style={{ marginBottom: '10px' }}>
            {item.children}
          </div>
        ))}
        {props.canAdd && (
          <button
            className="btn btn-info btn-sm"
            onClick={props.onAddClick}
            style={{ marginTop: '5px' }}
          >
            Add Item
          </button>
        )}
      </div>
    );
  }

  // Render collapsible array items
  return (
    <div className="array-field">
      {props.items.map((item) => {
        const isCollapsed = collapsed[item.index];
        const title = getItemTitle(item);
        return (
          <div key={item.key} className="array-item-collapsible">
            <div
              className={`array-item-header ${!isCollapsed ? 'expanded' : ''}`}
              onClick={() => toggleCollapse(item.index)}
            >
              <div className="array-item-title">
                <span className="array-item-toggle">{isCollapsed ? '+' : '−'}</span>
                <strong>{title}</strong>
              </div>
              <div className="array-item-toolbox">
                {item.hasMoveUp && (
                  <button
                    className="btn btn-default btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onReorderClick(item.index, item.index - 1)();
                    }}
                  >
                    ↑
                  </button>
                )}
                {item.hasMoveDown && (
                  <button
                    className="btn btn-default btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onReorderClick(item.index, item.index + 1)();
                    }}
                  >
                    ↓
                  </button>
                )}
                {item.hasRemove && (
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onDropIndexClick(item.index)();
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {!isCollapsed && (
              <div className="array-item-content">{item.children}</div>
            )}
          </div>
        );
      })}
      {props.canAdd && (
        <button
          className="btn btn-info btn-block"
          onClick={props.onAddClick}
          style={{ marginTop: '10px' }}
        >
          Add {props.title}
        </button>
      )}
    </div>
  );
}

export default CollapsibleArrayFieldTemplate;
