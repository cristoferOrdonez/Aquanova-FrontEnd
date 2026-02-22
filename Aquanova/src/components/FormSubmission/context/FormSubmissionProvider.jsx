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

      // Build responses object: key = question label/title/id, value = string OR list of strings for multiple answers
      const schemaFields = form?.schema || form?.questions || form?.fields || [];
      let parsedFields = schemaFields;
      if (typeof parsedFields === 'string') {
        try { parsedFields = JSON.parse(parsedFields); } catch (e) { parsedFields = []; }
      }

      const responses = {};
      const usedLabels = {};
      const optionText = (opt) => {
        if (opt == null) return '';
        if (typeof opt === 'object') return opt.value || opt.label || opt.text || opt.name || '';
        return String(opt);
      };

      const findOptionText = (q, v) => {
        if (v == null) return '';
        const opts = q?.options || [];
        // try to match by id/_id/value/label
        for (const o of opts) {
          const oid = o?.id ?? o?._id ?? o?.value ?? o?.label ?? o;
          if (String(oid) === String(v)) return optionText(o);
        }
        // fallback: if v looks like a primitive string/number, return it
        return String(v);
      };

      (Array.isArray(parsedFields) ? parsedFields : []).forEach((q, idx) => {
        const baseLabel = q.label || q.title || `Pregunta ${idx + 1}`;
        const seen = usedLabels[baseLabel] || 0;
        usedLabels[baseLabel] = seen + 1;
        const qKey = seen > 0 ? `${baseLabel} (${seen + 1})` : baseLabel;
        const idKey = q.id || q._id || q.key || q.label || `field_${idx}`;
        const raw = answers[idKey];
        console.log('Mapping question -> answers lookup', { idx, idKey, qKey, raw });

        if (Array.isArray(raw)) {
          responses[qKey] = raw.map((v) => {
            // map stored ids/values to visible text when possible
            return v == null ? '' : findOptionText(q, v);
          });
        } else if (raw && typeof raw === 'object') {
          // file or complex object -> prefer name, then previewUrl, else JSON
          responses[qKey] = raw.name || raw.previewUrl || JSON.stringify(raw);
        } else {
          // scalar: try to resolve against options (ids -> visible text)
          responses[qKey] = raw != null ? findOptionText(q, raw) : '';
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
