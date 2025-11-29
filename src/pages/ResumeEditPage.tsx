/**
 * ResumeEditPage Component
 * Page for editing resume content with form, template selection, and metadata
 * Requirements: 1.2, 4.4
 */

import React, { useState } from 'react';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';
import applyPagination from 'rjsf-tabs';
import type { IChangeEvent } from '@rjsf/core';
import type { RJSFSchema, RegistryFieldsType } from '@rjsf/utils';

import { Resume } from '../types/resume';
import { Template, SectionOrder } from '../types/template';
import formSchema from '../form-schema.json';
import {
  CollapsibleArrayFieldTemplate,
  TagsFieldWrapper,
  HiddenLabelArrayField,
  SubmitButton,
} from '../components/form';
import TagsWidget from '../components/ui/TagsWidget';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import type { ToastItem } from '../components/ui/Toast';

// Cast form schema to RJSFSchema type
const typedFormSchema = formSchema as unknown as RJSFSchema;

/**
 * UI Schema for react-jsonschema-form
 */
const uiSchema = {
  basic_info: {
    nav: 'Basic Information',
    'ui:title': ' ',
    summary: {
      'ui:widget': 'textarea',
      'ui:options': { rows: 7 },
    },
  },
  education: {
    nav: 'Education',
    items: {
      info: {
        'ui:options': { label: false },
        items: {
          'ui:widget': 'textarea',
          'ui:options': { rows: 3, label: false },
        },
      },
    },
  },
  projects: {
    nav: 'Academic Projects',
    items: {
      description: {
        'ui:options': { label: false },
        items: {
          'ui:widget': 'textarea',
          'ui:options': { rows: 5, label: false },
        },
      },
      tools: { 'ui:field': 'tagsField' },
    },
  },
  experiences: {
    nav: 'Work Experience',
    items: {
      company: { 'ui:options': { label: true } },
      title: { 'ui:options': { label: true } },
      projects: {
        'ui:field': 'hiddenLabelArray',
        items: {
          details: {
            'ui:options': { label: false },
            items: {
              'ui:widget': 'textarea',
              'ui:options': { rows: 10, label: false },
            },
          },
          tools: { 'ui:field': 'tagsField' },
        },
      },
    },
  },
};

const FormWithNav = applyPagination(Form);

/**
 * Props interface for ResumeEditPage
 */
export interface ResumeEditPageProps {
  /** Array of available resumes for selection dropdown */
  resumes: Resume[];
  /** Currently selected resume data */
  resume: Resume | undefined;
  /** Currently selected resume ID */
  selectedResumeId: string;
  /** Available templates */
  templates: Template[];
  /** Currently selected template ID */
  selectedTemplate: string;
  /** Current section order configuration */
  sectionOrder: SectionOrder[];
  /** Keywords for the resume */
  keywords: string[];
  /** Resume name */
  resumeName: string;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Toast notifications to display */
  toasts: ToastItem[];
  /** Callback when form is submitted */
  onSubmit: (data: Record<string, unknown>, saveAsNew: boolean) => Promise<void>;
  /** Callback to download resume */
  onDownload: () => Promise<void>;
  /** Callback to copy resume to clipboard */
  onCopy: () => Promise<void>;
  /** Callback when template changes */
  onTemplateChange: (template: string) => void;
  /** Callback to move section up */
  onSectionUp: (index: number) => void;
  /** Callback to move section down */
  onSectionDown: (index: number) => void;
  /** Callback when keywords change */
  onKeywordsChange: (keywords: string[]) => void;
  /** Callback when resume name changes */
  onNameChange: (name: string) => void;
  /** Callback when a different resume is selected */
  onSelectResume: (id: string) => void;
  /** Callback to reset selection (create new) */
  onResetSelection: () => void;
  /** Callback when a toast is dismissed */
  onDismissToast: (id: string | number) => void;
}

/**
 * ResumeEditPage - Page component for editing resume content
 * 
 * Features:
 * - Resume selection dropdown
 * - Resume name input
 * - Template selection with section ordering
 * - Keywords management
 * - Form with collapsible sections
 * - Save, Download, Copy functionality
 * - Save as New option
 */
function ResumeEditPage({
  resumes,
  resume,
  selectedResumeId,
  templates,
  selectedTemplate,
  sectionOrder,
  keywords,
  resumeName,
  isSaving,
  toasts,
  onSubmit,
  onDownload,
  onCopy,
  onTemplateChange,
  onSectionUp,
  onSectionDown,
  onKeywordsChange,
  onNameChange,
  onSelectResume,
  onResetSelection,
  onDismissToast,
}: ResumeEditPageProps): React.ReactElement {
  const [saveAsNew, setSaveAsNew] = useState(false);

  const handleSubmit = async (data: IChangeEvent): Promise<void> => {
    await onSubmit(data.formData as Record<string, unknown>, saveAsNew);
    setSaveAsNew(false);
  };

  const handleSaveAsNew = (): void => {
    if (resumeName.trim()) {
      setSaveAsNew(true);
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  const handleResumeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const resumeId = e.target.value;
    if (resumeId) {
      onSelectResume(resumeId);
    } else {
      onResetSelection();
    }
    setSaveAsNew(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <div className="panel panel-default panel-body resume-panel">
      {/* Resume Selection */}
      <div className="panel panel-default panel-body">
        <h4>Resume Selection</h4>
        <select
          className="form-control"
          value={selectedResumeId}
          onChange={handleResumeSelectChange}
        >
          <option value="">Create New Resume</option>
          {resumes.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Resume Name */}
      <div className="panel panel-default panel-body resume-section">
        <h4>Resume Name</h4>
        <input
          type="text"
          className="form-control"
          placeholder="Enter resume name (e.g., Software Engineer Resume)"
          value={resumeName}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      {/* Template Selection - only shown when editing existing resume */}
      {selectedResumeId && (
        <div className="panel panel-default panel-body">
          <h4>Template Selection</h4>
          <label htmlFor="templateSelect">Template:</label>
          <select
            id="templateSelect"
            className="form-control"
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <br />
          <label>Section Order:</label>
          <div style={{ marginTop: '10px', marginBottom: '15px' }}>
            {sectionOrder.map((section, index) => (
              <div key={section.key} className="section-order-item">
                <span className="section-order-label">
                  {index + 1}. {section.label}
                </span>
                <div className="section-order-buttons">
                  <button
                    className="btn btn-default btn-xs"
                    onClick={() => onSectionUp(index)}
                    disabled={index === 0}
                    style={{ opacity: index === 0 ? 0.5 : 1 }}
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-default btn-xs"
                    onClick={() => onSectionDown(index)}
                    disabled={index === sectionOrder.length - 1}
                    style={{ opacity: index === sectionOrder.length - 1 ? 0.5 : 1 }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-info" onClick={onDownload}>
            Download
          </button>
          &nbsp;
          <button className="btn btn-info" onClick={onCopy}>
            Copy tex to clipboard
          </button>
        </div>
      )}

      {/* Keywords */}
      <div className="panel panel-default panel-body resume-section">
        <h4>Keywords</h4>
        <TagsWidget value={keywords} onChange={onKeywordsChange} />
      </div>

      {/* Loading indicator */}
      {isSaving && <LoadingSpinner message="Saving..." />}

      {/* Resume Form */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <div onKeyDown={handleKeyDown}>
        <FormWithNav
          schema={typedFormSchema}
          validator={validator}
          onSubmit={handleSubmit}
          formData={resume || {}}
          uiSchema={uiSchema}
          templates={{
            ArrayFieldTemplate: CollapsibleArrayFieldTemplate,
            ButtonTemplates: { SubmitButton },
          }}
          fields={{
            tagsField: TagsFieldWrapper,
            hiddenLabelArray: HiddenLabelArrayField,
          } as unknown as RegistryFieldsType}
          disabled={isSaving}
        />
      </div>

      {/* Save as New option - only shown when editing existing resume */}
      {selectedResumeId && (
        <div className="resume-section">
          {!saveAsNew ? (
            <button
              className="btn btn-warning"
              onClick={() => setSaveAsNew(true)}
            >
              Save as New Resume
            </button>
          ) : (
            <div className="panel panel-default panel-body">
              <h4>Save as New Resume</h4>
              <p className="text-muted">
                This will create a copy of the current resume with the name
                you've entered above.
              </p>
              <button
                className="btn btn-success"
                onClick={handleSaveAsNew}
                disabled={!resumeName.trim()}
              >
                Confirm Save as New
              </button>
              &nbsp;
              <button
                className="btn btn-default"
                onClick={() => setSaveAsNew(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <Toast toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}

export default ResumeEditPage;
