import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormSubmissionContext from './FormSubmissionContext';
import { formService } from '../../../services/formService';
import { submissionsService } from '../../../services/submissionsService';
import cloudinaryService from '../../../services/cloudinaryService';

const getGeolocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });

export default function FormSubmissionProvider({ children }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const CACHE_KEY = `aquanova_draft_${id}`;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Lazy Initialization: Leer del caché al iniciar el estado
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      return saved ? JSON.parse(saved).answers || {} : {};
    } catch (e) {
      console.warn('Error al cargar borrador de answers:', e);
      return {};
    }
  });

  const [signature, setSignature] = useState(() => {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      const signatureValue = saved ? JSON.parse(saved).signature : null;
      // Recuperamos la firma solo si es un string (Data URL / Base64)
      return typeof signatureValue === 'string' ? signatureValue : null;
    } catch (e) {
      console.warn('Error al cargar borrador de signature:', e);
      return null;
    }
  });

  const [signatureError, setSignatureError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { current, total, percent, fileName }

  // 2. Performance (Debounce): Persistir cambios con retardo para evitar bloqueos
  useEffect(() => {
    if (!id) return;

    const timeoutId = setTimeout(() => {
      // Regla Crítica: Filtrar objetos nativos que no son serializables (File, Blob, FileList)
      const cleanAnswers = Object.entries(answers).reduce((acc, [key, value]) => {
        const isNativeFile = (v) => 
          v instanceof File || 
          v instanceof Blob || 
          (typeof FileList !== 'undefined' && v instanceof FileList);
        
        const hasFile = (v) => {
          if (isNativeFile(v)) return true;
          if (Array.isArray(v)) return v.some(i => isNativeFile(i));
          if (v && typeof v === 'object') return isNativeFile(v.file);
          return false;
        };

        if (!hasFile(value)) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const cleanSignature = typeof signature === 'string' ? signature : null;

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        answers: cleanAnswers,
        signature: cleanSignature,
        updatedAt: new Date().toISOString()
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [answers, signature, CACHE_KEY, id]);

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

  const resolveLocation = async (overrideLocation) => {
    if (overrideLocation) return overrideLocation;
    return await getGeolocation();
  };

  const processFileUploads = async (parsedFields, currentAnswers, onProgress) => {
    const responses = {};

    for (const q of parsedFields) {
      const idx = parsedFields.indexOf(q);
      const responseKey = q.label || q.title || q.key || String(q.id ?? `field_${idx}`);
      const idKey = q.id || q._id || q.key || q.label || `field_${idx}`;
      const raw = currentAnswers[idKey];

      if (raw === undefined || raw === null || raw === '' || q.type === 'info') continue;

      // Caso 1: Array de archivos, un solo archivo nativo, o array de objetos { file: File }
      if (
        raw instanceof File || 
        (Array.isArray(raw) && raw.length > 0 && (raw[0] instanceof File || (raw[0] && typeof raw[0] === 'object' && raw[0].file instanceof File)))
      ) {
        try {
          const rawArray = Array.isArray(raw) ? raw : [raw];
          const validFiles = rawArray.map(item => item instanceof File ? item : item?.file).filter((f) => f instanceof File);

          if (validFiles.length > 0) {
            const urls = await cloudinaryService.uploadMultipleFiles(validFiles, 'submissions', (progress) => {
              onProgress({ ...progress, fieldLabel: responseKey });
            });
            responses[responseKey] = urls;
          }
        } catch (uploadError) {
          throw new Error(`No se pudo subir el archivo "${responseKey}". ${uploadError.message}`);
        }
      }
      // Caso 2: Estructura especial { file: File }
      else if (raw && typeof raw === 'object' && raw.file instanceof File) {
        try {
          const urls = await cloudinaryService.uploadMultipleFiles([raw.file], 'submissions', (progress) => {
            onProgress({ ...progress, fieldLabel: responseKey });
          });
          responses[responseKey] = urls;
        } catch (uploadError) {
          throw new Error(`No se pudo subir el archivo "${responseKey}". ${uploadError.message}`);
        }
      }
      // Caso 3: Array (checkboxes)
      else if (Array.isArray(raw)) {
        responses[responseKey] = raw.map((id) => {
          if (Array.isArray(q.options)) {
            const opt = q.options.find((o) => (o.id ?? o) == id || (o.value ?? o) === id);
            return opt ? (opt.value ?? opt) : id;
          }
          return id;
        });
      }
      // Caso 4: Radio/Select
      else if (['radio', 'select', 'Opción multiple', 'Lista desplegable'].includes(q.type)) {
        if (Array.isArray(q.options)) {
          const opt = q.options.find((o) => (o.id ?? o) == raw || (o.value ?? o) === raw);
          responses[responseKey] = opt ? (opt.value ?? opt) : raw;
        } else {
          responses[responseKey] = raw;
        }
      }
      // Caso 5: Objeto genérico
      else if (raw && typeof raw === 'object' && !(raw instanceof File)) {
        responses[responseKey] = raw.name || raw.previewUrl || JSON.stringify(raw);
      }
      // Caso 6: Texto/Default
      else {
        responses[responseKey] = raw;
      }
    }
    return responses;
  };

  const processSignature = async (currentSignature, onProgress) => {
    if (!currentSignature) return null;

    if (currentSignature instanceof File) {
      try {
        const signatureUrls = await cloudinaryService.uploadMultipleFiles([currentSignature], 'signatures', (progress) => {
          onProgress({ ...progress, fieldLabel: 'Firma de usuario' });
        });
        return signatureUrls?.[0] || null;
      } catch (uploadError) {
        throw new Error('No se pudo subir la firma. ' + uploadError.message);
      }
    }

    if (typeof currentSignature === 'string' && currentSignature.startsWith('http')) {
      return currentSignature;
    }

    return null;
  };

  const submit = async ({ neighborhood_id = null, location = null } = {}) => {
    // 1. Validar firma
    if (!signature) {
      setSignatureError(true);
      throw new Error('Firma digital requerida');
    }
    setSignatureError(false);

    // 2. Preparar ID y estado
    const formId = (form && (form.id || form._id)) || id;
    if (!formId) throw new Error('Formulario no cargado');

    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      // 3. Obtener localización
      const geoLoc = await resolveLocation(location);

      // 4. Derivar barrio
      const derivedNeighborhood =
        neighborhood_id ||
        form?.neighborhood_id ||
        (Array.isArray(form?.neighborhoods) && (form.neighborhoods[0]?.id || form.neighborhoods[0]?._id));

      if (!derivedNeighborhood) {
        throw new Error('Faltan datos: No se pudo determinar el ID del barrio');
      }

      if (!answers || Object.keys(answers).length === 0) {
        throw new Error('No hay respuestas para enviar');
      }

      // 5. Normalizar campos del esquema
      const schemaFields = form?.schema || form?.questions || form?.fields || [];
      let parsedFields = Array.isArray(schemaFields) ? schemaFields : [];
      if (typeof schemaFields === 'string') {
        try {
          parsedFields = JSON.parse(schemaFields);
        } catch (e) {
          parsedFields = [];
        }
      }

      const normalizedFields = parsedFields.map((field, i) => ({
        ...field,
        key: field.key ?? String(field.id ?? `field_${i}`),
        label: field.label ?? field.title ?? '',
      }));

      // 6. Procesar respuestas y subidas paralelas
      const responses = await processFileUploads(normalizedFields, answers, setUploadProgress);

      // 7. Procesar firma
      const signatureUrl = await processSignature(signature, setUploadProgress);
      if (signatureUrl) {
        responses['Firma Digital'] = signatureUrl;
      }

      // 8. Construir payload
      const payload = {
        form_id: formId,
        neighborhood_id: derivedNeighborhood,
        responses,
        location: geoLoc,
      };

      // 9. Extraer lot_id si aplica
      const lotSelectorField = normalizedFields.find((f) => f.type === 'lot_selector');
      if (lotSelectorField) {
        const idKey = lotSelectorField.id || lotSelectorField._id || lotSelectorField.key || lotSelectorField.label;
        if (answers[idKey]) payload.lot_id = answers[idKey];
      }

      // 10. Envío final
      const res = await submissionsService.submit(payload);

      // 4. Limpieza post-envío: Eliminar borrador tras éxito
      localStorage.removeItem(CACHE_KEY);

      navigate('/forms');
      return res;
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };


  return (
    <FormSubmissionContext.Provider value={{ form, loading, error, answers, setAnswer, submit, isSubmitting, uploadProgress, signature, setSignature, signatureError, setSignatureError }}>
      {children}
    </FormSubmissionContext.Provider>
  );
}
