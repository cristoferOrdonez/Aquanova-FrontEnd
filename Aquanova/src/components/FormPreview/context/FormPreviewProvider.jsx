import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formService } from '../../../services/formService';
import { FormPreviewContext } from './FormPreviewContext';

export default function FormPreviewProvider({ children }) {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [viewMode, setViewMode] = useState('mobile');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await formService.getById(id);
        if ((response && (response.success || response.ok)) && response.data) {
          setForm(response.data);
        } else if (response && response.data && response.data.id) {
          setForm(response.data);
        } else if (response && response.id && (response.title || response.fields || response.questions)) {
          setForm(response);
        } else if (response && response.form) {
          setForm(response.form);
        } else {
          console.warn('Respuesta inesperada al obtener formulario:', response);
          setError('Error al obtener el formulario: Formato de respuesta no reconocido');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión o formulario no encontrado');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchForm();
  }, [id]);

  const handleHeaderRemove = (e) => {
    e && e.stopPropagation && e.stopPropagation();
    setForm(prev => ({ ...(prev || {}), imageUrl: null }));
  };

  const handleHeaderReplace = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...(prev || {}), imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, optionId, checked) => {
    setAnswers(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) return { ...prev, [questionId]: [...currentValues, optionId] };
      return { ...prev, [questionId]: currentValues.filter(id => id !== optionId) };
    });
  };

  return (
    <FormPreviewContext.Provider value={{
      form,
      loading,
      error,
      answers,
      viewMode,
      setViewMode,
      handleHeaderRemove,
      handleHeaderReplace,
      handleInputChange,
      handleCheckboxChange,
    }}>
      {children}
    </FormPreviewContext.Provider>
  );
}
