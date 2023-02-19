import React from 'react';
import Form from 'react-jsonschema-form';
import formSchema from './form-schema.json';

function MyForm() {
  function handleSubmit(formData) {
    console.log('Form submitted:', formData);
  }

  return (
    <Form
      schema={formSchema}
      onSubmit={handleSubmit}
    />
  );
}

export default MyForm;
