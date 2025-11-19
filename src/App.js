import React, { useState, useEffect } from 'react';
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";

import formSchema from './form-schema.json';
import user from './user.json'
import { getAllResumes, createResume, downloadResume, copyResume } from './resume';

import applyPagination from 'rjsf-tabs'

async function fetchResumes() {
  try {
    const data = await getAllResumes()
    return data
  } catch (error) {
    console.error(error);
    return [user]
  }
}

const uiSchema = {
  basic_info: {
    "nav": "Basic Information",
    summary: {
      "ui:widget": "textarea",
      "ui:options": {
        rows: 7
      }
    }
  },
  education: {
    "nav": "Education",
    items: {
      info: {
        "ui:options": {
          label: false
        },
        items: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 3,
            label: false
          }
        }
      }
    }
  },
  projects: {
    "nav": "Academic Projects",
    items: {
      description: {
        "ui:options": {
          label: false
        },
        items: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 5,
            label: false
          }
        }
      },
      tools: {
        "ui:field": "tagsField"
      }
    }
  },
  experiences: {
    "nav": "Work Experience",
    items: {
      company: {
        "ui:options": {
          label: true
        }
      },
      title: {
        "ui:options": {
          label: true
        }
      },
      projects: {
        "ui:field": "hiddenLabelArray",
        items: {
          details: {
            "ui:options": {
              label: false
            },
            items: {
              "ui:widget": "textarea",
              "ui:options": {
                rows: 10,
                label: false
              }
            }
          },
          tools: {
            "ui:field": "tagsField"
          }
        }
      }
    }
  }
};

let FormWithNav = applyPagination(Form)

// Wrapper for tags field
function TagsFieldWrapper(props) {
  // Don't show label if it's already shown by the form (like for keywords at top level)
  const showLabel = props.schema.title && !props.name;
  
  return (
    <div className="form-group">
      {showLabel && <label className="control-label">{props.schema.title}</label>}
      <TagsWidget 
        value={props.formData} 
        onChange={props.onChange}
      />
    </div>
  );
}

// Hidden label array field (for projects in experiences)
function HiddenLabelArrayField(props) {
  const ArrayField = props.registry.fields.ArrayField;
  return (
    <div style={{ marginTop: '10px' }}>
      <ArrayField {...props} />
    </div>
  );
}

// Custom widget for tools (tag-style input)
function TagsWidget(props) {
  const [inputValue, setInputValue] = useState('');
  const tags = props.value || [];

  const addTag = () => {
    if (inputValue.trim()) {
      props.onChange([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    props.onChange(newTags);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        marginBottom: '10px',
        minHeight: '40px',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        {tags.map((tag, index) => (
          <span
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              backgroundColor: '#337ab7',
              color: 'white',
              borderRadius: '3px',
              fontSize: '14px',
              gap: '6px'
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                lineHeight: '1',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type and press Enter"
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            flex: '1',
            minWidth: '150px',
            fontSize: '14px'
          }}
        />
      </div>
    </div>
  );
}

// Custom collapsible array field template
function CollapsibleArrayFieldTemplate(props) {
  // Initialize all items as collapsed by default
  const [collapsed, setCollapsed] = useState(() => {
    const initial = {};
    props.items.forEach((item) => {
      initial[item.index] = true;
    });
    return initial;
  });

  // Check if this is a bullet/text array (info, description, details)
  const isBulletArray = props.items.length > 0 && 
    props.items[0].children.props.schema.type === 'string';

  const toggleCollapse = (index) => {
    setCollapsed(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getItemTitle = (item) => {
    const formData = item.children.props.formData;
    if (!formData) return `Item ${item.index + 1}`;
    
    // Get a meaningful title based on the data
    if (formData.university) return formData.university;
    if (formData.title && !formData.company) return formData.title; // For projects
    if (formData.company && formData.title) return `${formData.title} - ${formData.company}`; // For experiences
    if (formData.company) return formData.company;
    return `Item ${item.index + 1}`;
  };

  // For bullet arrays, render without collapsible
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

  // For object arrays, render with collapsible
  return (
    <div className="array-field">
      {props.items.map((item) => {
        const isCollapsed = collapsed[item.index];
        const title = getItemTitle(item);
        
        return (
          <div key={item.key} className="array-item-collapsible" style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '10px',
            backgroundColor: '#fff'
          }}>
            <div 
              onClick={() => toggleCollapse(item.index)}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: isCollapsed ? 'none' : '1px solid #ddd'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{isCollapsed ? '+' : '−'}</span>
                <strong>{title}</strong>
              </div>
              <div className="array-item-toolbox" style={{ display: 'flex', gap: '5px' }}>
                {item.hasMoveUp && (
                  <button
                    className="btn btn-default btn-xs"
                    onClick={(e) => { e.stopPropagation(); item.onReorderClick(item.index, item.index - 1)(); }}
                  >
                    ↑
                  </button>
                )}
                {item.hasMoveDown && (
                  <button
                    className="btn btn-default btn-xs"
                    onClick={(e) => { e.stopPropagation(); item.onReorderClick(item.index, item.index + 1)(); }}
                  >
                    ↓
                  </button>
                )}
                {item.hasRemove && (
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={(e) => { e.stopPropagation(); item.onDropIndexClick(item.index)(); }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {!isCollapsed && (
              <div style={{ padding: '15px' }}>
                {item.children}
              </div>
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

function MyForm() {

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("moderncv")
  const [order, setOrder] = useState('pwe');
  const [sectionOrder, setSectionOrder] = useState([
    { key: 'p', label: 'Projects' },
    { key: 'w', label: 'Work Experience' },
    { key: 'e', label: 'Education' }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  async function fetchData() {
    const data = await fetchResumes()
    setResumes(data)
  }
  useEffect(() => {
    fetchData()
  }, []);

  async function handleSubmit(data) {
    try {
      delete data.formData._id
      // Add keywords to the form data
      data.formData.keywords = keywords;
      const { id } = await createResume(data.formData)

      showToast("Form submitted successfully!");
      setTimeout(() => {
        fetchData()
        setSelectedResumeId(id)
      }, 500);
    } catch (error) {
      showToast("Failed to save resume", true);
      console.error("Submit error:", error);
    }
  }

  const handleDownloadClick = async () => {
    try {
      showToast("Downloading resume...");
      const response = await downloadResume(selectedResumeId, selectedTemplate, order)
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      const contentType = response.headers.get("Content-Type")
      if (!contentType || !contentType.startsWith("application/pdf")) {
        throw new Error("The server did not send a PDF file")
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${getResumeById(selectedResumeId).name}.pdf`);
      link.setAttribute("target", "_blank");
      link.click();
      showToast("Resume downloaded successfully!");
    } catch (error) {
      showToast("Failed to download resume", true);
      console.error("Download error:", error);
    }
  };
  const handleCopyClick = async () => {
    try {
      showToast("Copying to clipboard...");
      const response = await copyResume(selectedResumeId, selectedTemplate, order)
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      
      const data = await response.json()
      navigator.clipboard.writeText(data.resume)
      showToast("Copied to clipboard!");
    } catch (error) {
      showToast("Failed to copy to clipboard", true);
      console.error("Copy error:", error);
    }
  };

  const getResumeById = (id) => {
    return resumes.find((resume) => resume._id === id) || {};
  };

  const handleEditClick = () => {
    if (selectedResumeId) {
      const resume = getResumeById(selectedResumeId);
      setKeywords(resume.keywords || []);
      // Parse order string to section order
      const orderMap = { p: 'Projects', w: 'Work Experience', e: 'Education' };
      const parsed = order.split('').map(key => ({ 
        key, 
        label: orderMap[key] || key 
      }));
      setSectionOrder(parsed);
      setIsEditing(true);
    }
  };

  const moveSectionUp = (index) => {
    if (index === 0) return;
    const newOrder = [...sectionOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSectionOrder(newOrder);
    setOrder(newOrder.map(s => s.key).join(''));
  };

  const moveSectionDown = (index) => {
    if (index === sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSectionOrder(newOrder);
    setOrder(newOrder.map(s => s.key).join(''));
  };

  const handleBackClick = () => {
    setIsEditing(false);
  };

  // Selection Page
  if (!isEditing) {
    return (
      <div class="panel panel-default panel-body" style={{ margin: '2rem auto', maxWidth: 900 }}>
        <h2>Select a Resume</h2>
        <select class="form-control"
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
        >
          <option value="">Select a resume</option>
          {resumes.map((resume) => (
            <option key={resume._id} value={resume._id}>
              {`${resume.name} - ${resume._id}`}
            </option>
          ))}
        </select>
        <br></br>
        {selectedResumeId && (
          <button class="btn btn-primary" onClick={handleEditClick}>
            Edit Resume
          </button>
        )}
      </div>
    );
  }

  // Editing Page
  return (
    <div class="panel panel-default panel-body" style={{ margin: '2rem auto', maxWidth: 900 }}>
      <button class="btn btn-default" onClick={handleBackClick}>
        ← Back to Selection
      </button>
      <h3>{getResumeById(selectedResumeId).name}</h3>
      
      <div class="panel panel-default panel-body">
        <h4>Template Selection</h4>
        <label htmlFor="templateSelect">Template:</label>
        <select id="templateSelect" class="form-control" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
          <option value="moderncv">ModernCV</option>
          <option value="russel">Russel</option>
          <option value="resume">Basic</option>
        </select>
        <br></br>
        <label>Section Order:</label>
        <div style={{ marginTop: '10px', marginBottom: '15px' }}>
          {sectionOrder.map((section, index) => (
            <div 
              key={section.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                marginBottom: '5px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <span style={{ flex: 1, fontWeight: '500' }}>
                {index + 1}. {section.label}
              </span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  className="btn btn-default btn-xs"
                  onClick={() => moveSectionUp(index)}
                  disabled={index === 0}
                  style={{ opacity: index === 0 ? 0.5 : 1 }}
                >
                  ↑
                </button>
                <button
                  className="btn btn-default btn-xs"
                  onClick={() => moveSectionDown(index)}
                  disabled={index === sectionOrder.length - 1}
                  style={{ opacity: index === sectionOrder.length - 1 ? 0.5 : 1 }}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
        <button class="btn btn-info undefined" onClick={handleDownloadClick}>Download</button>
        &nbsp;
        <button class="btn btn-info undefined" onClick={handleCopyClick}>Copy tex to clipboard</button>
      </div>

      <div class="panel panel-default panel-body" style={{ marginTop: '15px' }}>
        <h4>Keywords</h4>
        <TagsWidget 
          value={keywords} 
          onChange={setKeywords}
        />
      </div>
      
      <FormWithNav 
        schema={formSchema}
        validator={validator}
        onSubmit={handleSubmit}
        formData={getResumeById(selectedResumeId)}
        uiSchema={uiSchema}
        templates={{ ArrayFieldTemplate: CollapsibleArrayFieldTemplate }}
        fields={{ tagsField: TagsFieldWrapper, hiddenLabelArray: HiddenLabelArrayField }}
        onKeyPress={(event) => event.key === "Enter" && event.preventDefault()}
      />
      
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        {toasts.map((toast, index) => (
          <div 
            key={toast.id}
            style={{ 
              padding: '15px 20px',
              backgroundColor: toast.isError ? '#f44336' : '#4caf50',
              color: 'white',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              minWidth: '250px',
              marginBottom: '10px',
              animation: 'slideIn 0.3s ease-out, fadeOut 0.5s ease-out 2.5s forwards',
              transform: `translateY(${index * 70}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div >
  );
}

export default MyForm;
