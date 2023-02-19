import React from 'react';
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";

import formSchema from './form-schema.json';


function MyForm() {
  function handleSubmit(formData) {
    console.log('Form submitted:', formData);
  }

  return (
    <Form schema={formSchema}
      validator={validator}
      onSubmit={handleSubmit}
    />

  );
}

export default MyForm;
