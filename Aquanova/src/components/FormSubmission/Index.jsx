import React from 'react';
import FormSubmissionProvider from './context/FormSubmissionProvider';
import FormPreviewContent from '../FormPreview/components/containers/FormPreviewContent';

export default function FormSubmission() {
  return (
    <FormSubmissionProvider>
      <FormPreviewContent />
    </FormSubmissionProvider>
  );
}
