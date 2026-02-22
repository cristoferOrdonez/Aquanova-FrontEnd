import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService } from '../../../services/formService';
import { submissionService } from '../../../services/submissionService';
import { FormPreviewContext } from '../../FormPreview/context/FormPreviewContext';

export default function FormSubmissionProvider({ children }) {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleSubmit = async (opts = {}) => {
    if (!form || !form.id) {
      alert('Formulario no cargado');
      return;
    }

    const payload = {
      form_id: form.id || form._id || id,
      neighborhood_id: opts.neighborhood_id || null,
      responses: answers || {},
      location: opts.location || null,
    };

    try {
      setLoading(true);
      const res = await submissionService.create(payload);
      if ((res && (res.ok || res.success))) {
        alert(res.message || 'Respuestas guardadas exitosamente');
        navigate('/forms');
      } else {
        alert('Envío completado (respuesta inesperada)');
        navigate('/forms');
      }
    } catch (err) {
      console.error('Error al enviar respuestas', err);
      alert(err?.message || 'Error al enviar respuestas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPreviewContext.Provider value={{
      form,
      loading,
      error,
      answers,
      viewMode,
      setViewMode,
      handleInputChange,
      handleCheckboxChange,
      handleSubmit,
    }}>
      {children}
    </FormPreviewContext.Provider>
  );
}
