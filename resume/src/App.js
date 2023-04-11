import React, { useState, useEffect } from 'react';
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";

import formSchema from './form-schema.json';
import user from './user.json'
import { getAllResumes, createResume, downloadResume } from './resume';



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
    summary: {
      "ui:widget": "textarea",
      "ui:options": {
        rows: 7
      }
    }
  },
  projects: {
    items: {
      description: {
        items: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 5
          }
        }
      }
    }
  },
  experiences: {
    items: {
      projects: {
        items: {
          details: {
            items: {
              "ui:widget": "textarea",
              "ui:options": {
                rows: 10
              }
            }
          }
        }
      }

    }
  }
};



function MyForm() {

  const [resumes, setResumes] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("moderncv")
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchData() {
      const data = await fetchResumes()
      setResumes(data)
    }
    fetchData()
  }, []);

  function handleSubmit(data) {
    delete data.formData._id
    createResume(data.formData)
    setFormSubmitted(true);
    setSuccessMessage("Form submitted successfully, Reloading the page!");
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  }

  const handleDownloadClick = async () => {
    try {
      const response = await downloadResume(selectedResumeId, selectedTemplate)
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
    } catch (error) {
      setError("Error downloading resume: " + error.message);
    }
  };
  const handleCloseError = () => {
    setError("");
  };

  const getResumeById = (id) => {
    return resumes.find((resume) => resume._id === id) || {};
  };
  return (
    <div class="panel panel-default panel-body" style={{ margin: '2rem auto', maxWidth: 900 }}>
      <select class="form-control"
        value={selectedResumeId}
        onChange={(e) => setSelectedResumeId(e.target.value)}
      >
        <option value="">Select a resume</option>
        {resumes.map((resume) => (
          <option key={resume._id} value={resume._id}>
            {resume._id}
          </option>
        ))}
      </select>
      <Form schema={formSchema}
        validator={validator}
        onSubmit={handleSubmit}
        formData={getResumeById(selectedResumeId)}
        uiSchema={uiSchema}
      />
      <br></br>
      {formSubmitted ? (
        <div>
          <p>{successMessage}</p>

        </div>
      ) : null}

      {selectedResumeId && (
        <div class="panel panel-default panel-body">
          <select class="form-control" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
            <option value="moderncv">ModernCV</option>
            <option value="russel">Russel</option>
            <option value="resume">Resume</option>
          </select>
          <br></br>
          <button class="btn btn-info undefined" onClick={handleDownloadClick}>Download</button>

          {error && (
            <div className="error">
              {error}<br></br><button class="btn btn-danger array-item-remove" title="Remove" onClick={handleCloseError}><i class="glyphicon glyphicon-remove"></i></button>
            </div>
          )}
        </div>
      )}

    </div >


  );
}

export default MyForm;
