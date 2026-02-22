import React from 'react';
import FormSubmissionProvider from './context/FormSubmissionProvider';
import FormSubmissionContent from './components/containers/FormSubmissionContent';

export default function FormSubmission() {
  return (
    <FormSubmissionProvider>
      <FormSubmissionContent />
    </FormSubmissionProvider>
  );
}
