import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormSubmissionContext from './FormSubmissionContext';
import { formService } from '../../../services/formService';
import { submissionsService } from '../../../services/submissionsService';
import cloudinaryService from '../../../services/cloudinaryService';

export default function FormSubmissionProvider({ children }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { current, total, percent, fileName }

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
      const attachments = [];

      // Procesar cada campo del schema
      for (const q of parsedFields) {
        const idx = parsedFields.indexOf(q);
        // IMPORTANTE: Usar q.key como clave de la respuesta (igual que el flujo público)
        const responseKey = q.key ?? String(q.id ?? `field_${idx}`);
        const idKey = q.id || q._id || q.key || q.label || `field_${idx}`;
        const raw = answers[idKey];

        if (raw === undefined || raw === null || raw === '') continue;

        // Si es un archivo o array de archivos, subirlo a Cloudinary
        if (raw instanceof File || (Array.isArray(raw) && raw.length > 0 && raw[0] instanceof File)) {
          try {
            const files = Array.isArray(raw) ? raw : [raw];
            const validFiles = files.filter(f => f instanceof File);

            if (validFiles.length > 0) {
              console.log(`Subiendo ${validFiles.length} archivo(s) para "${responseKey}"...`);
              const urls = await cloudinaryService.uploadMultipleFiles(
                validFiles,
                'submissions',
                (progress) => {
                  setUploadProgress({
                    ...progress,
                    fieldLabel: responseKey,
                  });
                }
              );

              // Agregar al array de attachments
              attachments.push({
                field_key: q.key ?? idKey,
                media_urls: urls,
              });

              console.log(`${validFiles.length} archivo(s) subidos exitosamente para "${responseKey}"`);
            }
          } catch (uploadError) {
            console.error(`Error al subir archivo(s) para "${responseKey}":`, uploadError);
            throw new Error(`No se pudo subir el archivo "${responseKey}". ${uploadError.message}`);
          }
        } else if (raw && typeof raw === 'object' && raw.file instanceof File) {
          // Caso especial: objeto con estructura { name, previewUrl, file } del FileUploadField
          try {
            console.log(`Subiendo archivo para "${responseKey}"...`);
            const urls = await cloudinaryService.uploadMultipleFiles(
              [raw.file],
              'submissions',
              (progress) => {
                setUploadProgress({
                  ...progress,
                  fieldLabel: responseKey,
                });
              }
            );

            // Agregar al array de attachments
            attachments.push({
              field_key: q.key ?? idKey,
              media_urls: urls,
            });

            console.log(`Archivo subido exitosamente para "${responseKey}"`);
          } catch (uploadError) {
            console.error(`Error al subir archivo para "${responseKey}":`, uploadError);
            throw new Error(`No se pudo subir el archivo "${responseKey}". ${uploadError.message}`);
          }
        } else if (Array.isArray(raw)) {
          // checkbox: mapear ids/valores a texto visible de la opción
          responses[responseKey] = raw.map(id => {
            if (Array.isArray(q.options)) {
              const opt = q.options.find(o => (o.id ?? o) == id || (o.value ?? o) === id);
              return opt ? (opt.value ?? opt) : id;
            }
            return id;
          });
        } else if (raw && typeof raw === 'object' && !(raw instanceof File)) {
          // objeto complejo (que no sea File)
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
      }

      // Construir payload como JSON
      const payload = {
        form_id: formId,
        neighborhood_id: derivedNeighborhood,
        responses,
      };

      // Agregar attachments si hay archivos
      if (attachments.length > 0) {
        payload.attachments = attachments;
      }

      // Agregar location si existe
      if (location) {
        payload.location = location;
      }

      console.log('Submitting payload', payload);

      const res = await submissionsService.submit(payload);
      // On success navigate to list or show success toast
      navigate('/forms');
      return res;
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null); // Resetear progreso al finalizar
    }
  };

  return (
    <FormSubmissionContext.Provider value={{ form, loading, error, answers, setAnswer, submit, isSubmitting, uploadProgress }}>
      {children}
    </FormSubmissionContext.Provider>
  );
}
