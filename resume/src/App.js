import React, { useState, useEffect } from 'react';
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";

import formSchema from './form-schema.json';
import user from './user.json'
import { getAllResumes, createResume } from './resume';



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


  const [formData, setFormData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const data = await fetchResumes()
      setFormData(data[0])
    }
    fetchData()
  }, []);

  function handleSubmit(data) {
    delete data.formData._id
    createResume(data.formData)
  }
  // function handleUpdate(formData) {
  //   console.log('Form submitted for update:', formData);
  // }

  return (
    <div style={{ margin: '2rem auto', maxWidth: 600 }}>

      <Form schema={formSchema}
        validator={validator}
        onSubmit={handleSubmit}
        formData={formData}
      >
        
      </Form >
    </div >


  );
}

export default MyForm;
