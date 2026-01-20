import { useRef, useState } from 'react';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';

export function useHeaderControls() {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPublishOn, setIsPublishOn] = useState(false);
  const [title, setTitle] = useState(FORM_CREATION_CONFIG.defaultFormTitle);
  const [description, setDescription] = useState('');

  const handleFile = (file) => {
    if (file && file.type && file.type.startsWith && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // keep behaviour simple for now
      // callers (UI) can validate file types if desired
      alert(FORM_CREATION_CONFIG.imageInvalidAlert);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDivClick = () => {
    if (!imagePreview && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget && e.currentTarget.contains && e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplaceImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleOpenNewTab = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (imagePreview) {
      const newWindow = window.open();
      if (newWindow) newWindow.document.writeln(`<img src="${imagePreview}" style="max-width:100%;" />`);
    }
  };

  const togglePublish = () => setIsPublishOn(prev => !prev);

  return {
    fileInputRef,
    imagePreview,
    setImagePreview,
    isDragging,
    setIsDragging,
    isPublishOn,
    setIsPublishOn,
    title,
    setTitle,
    description,
    setDescription,
    handleFile,
    handleInputChange,
    handleDivClick,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleRemoveImage,
    handleReplaceImage,
    handleOpenNewTab,
    togglePublish,
  };
}

export default useHeaderControls;
