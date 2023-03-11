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






function MyForm() {

  const [resumes, setResumes] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedResumeId, setSelectedResumeId] = useState("")

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
      const response = await downloadResume(selectedResumeId)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${getResumeById(selectedResumeId).name}.pdf`);
      link.setAttribute("target", "_blank");
      link.click();
    } catch (error) {
      console.error(error);
    }
  };


  const getResumeById = (id) => {
    return resumes.find((resume) => resume._id === id) || {};
  };
  return (
    <div style={{ margin: '2rem auto', maxWidth: 600 }}>
      <select
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
      />
      {formSubmitted ? (
        <div>
          <p>{successMessage}</p>

        </div>
      ) : null}

      {selectedResumeId && (
        <button class="btn btn-info undefined" onClick={handleDownloadClick}>Download</button>
      )}

    </div >


  );
}

export default MyForm;
