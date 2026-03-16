import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormSubmissionContext from './FormSubmissionContext';
import { formService } from '../../../services/formService';
import { submissionsService } from '../../../services/submissionsService';

export default function FormSubmissionProvider({ children }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    formService
      .getById(id)
      .then((res) => {
        if (!mounted) return;
        const data = res?.data || res?.form || res;
        setForm(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Error cargando el formulario');
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [id]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const submit = async ({ neighborhood_id = null, location = null } = {}) => {
    const formId = (form && (form.id || form._id)) || id;
    if (!formId) throw new Error('Formulario no cargado');
    setIsSubmitting(true);
    try {
      // derive neighborhood_id from form if not provided
      const derivedNeighborhood = neighborhood_id || form?.neighborhood_id || (Array.isArray(form?.neighborhoods) && (form.neighborhoods[0]?.id || form.neighborhoods[0]?._id));

      // validate required pieces
      if (!derivedNeighborhood) throw new Error('Faltan datos: form_id, neighborhood_id o responses (falta id del barrio)');
      if (!answers || Object.keys(answers).length === 0) throw new Error('No hay respuestas para enviar');

      // Build responses: key = field.key (estandarizado), value = texto visible
      const schemaFields = form?.schema || form?.questions || form?.fields || [];
      let parsedFields = schemaFields;
      if (typeof parsedFields === 'string') {
        try { parsedFields = JSON.parse(parsedFields); } catch (e) { parsedFields = []; }
      }

      // Normalizar campos con fallback para formularios del formato antiguo
      parsedFields = (Array.isArray(parsedFields) ? parsedFields : []).map((field, i) => ({
        ...field,
        key: field.key ?? String(field.id ?? `field_${i}`),
        label: field.label ?? field.title ?? '',
      }));

      const responses = {};

      parsedFields.forEach((q, idx) => {
        const responseKey = q.label || q.title || (q.key ?? String(q.id ?? `field_${idx}`));
        const idKey = q.id || q._id || q.key || q.label || `field_${idx}`;
        const raw = answers[idKey];

        if (raw === undefined || raw === null || raw === '') return;

        if (Array.isArray(raw)) {
          // checkbox: mapear ids/valores a texto visible de la opción
          responses[responseKey] = raw.map(id => {
            if (Array.isArray(q.options)) {
              const opt = q.options.find(o => (o.id ?? o) == id || (o.value ?? o) === id);
              return opt ? (opt.value ?? opt) : id;
            }
            return id;
          });
        } else if (raw && typeof raw === 'object') {
          // archivo u objeto complejo
          responses[responseKey] = raw.name || raw.previewUrl || JSON.stringify(raw);
        } else if (['radio', 'select', 'Opción multiple', 'Lista desplegable'].includes(q.type)) {
          // radio/select: resolver id a texto visible
          if (Array.isArray(q.options)) {
            const opt = q.options.find(o => (o.id ?? o) == raw || (o.value ?? o) === raw);
            responses[responseKey] = opt ? (opt.value ?? opt) : raw;
          } else {
            responses[responseKey] = raw;
          }
        } else {
          responses[responseKey] = raw;
        }
      });

      const payload = {
        form_id: formId,
        neighborhood_id: derivedNeighborhood,
        responses,
      };
      if (location) payload.location = location;

      console.log('Submitting payload', payload);

      const res = await submissionsService.submit(payload);
      // On success navigate to list or show success toast
      navigate('/forms');
      return res;
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormSubmissionContext.Provider value={{ form, loading, error, answers, setAnswer, submit, isSubmitting }}>
      {children}
    </FormSubmissionContext.Provider>
  );
}
