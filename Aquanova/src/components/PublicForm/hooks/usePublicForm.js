// src/components/PublicForm/hooks/usePublicForm.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import publicFormService from '../../../services/publicFormService';
import cloudinaryService from '../../../services/cloudinaryService';

const getGeolocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 0 }
    );
  });

// Mapeo de etiquetas en español (usadas en el editor) a tipos en inglés (usados en FormFieldRenderer)
const TYPE_MAP = {
  'Opción multiple':             'radio',
  'Casillas de verificación':    'checkbox',
  'Lista desplegable':           'select',
  'Respuesta textual':           'textarea',
  'Numérico':                    'number',
  'Fecha':                       'date',
  'Cargar imagen':               'file',
  'Sólo texto (sin respuestas)': 'info',
  'Selector de Lote':            'lot_selector',
};

/**
 * Hook principal que gestiona todo el estado del formulario público.
 *
 * @returns {import('../context/PublicFormContext').PublicFormContextType}
 */
export const usePublicForm = () => {
  const { formKey } = useParams();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || null;

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null); // { current, total, percent, fileName }

  /** { [field.key]: string | number | string[] } */
  const [responses, setResponses] = useState({});
  /** { name, document_number } */
  const [registration, setRegistrations] = useState({
    name: '',
    document_number: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Cargar formulario ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!formKey) return;

    setLoading(true);
    setError(null);
    setErrorStatus(null);

    publicFormService
      .getByKey(formKey)
      .then((res) => {
        // Normalizar schema: garantizar que cada campo tenga `key` y `label`
        // El backend puede retornar `id`/`title` en lugar de `key`/`label`
        // El schema puede llegar como array (JSON nativo) o como string JSON (nueva versión tras edición)
        const raw = res.data?.schema;
        let rawSchema = [];
        if (typeof raw === 'string') {
          try { rawSchema = JSON.parse(raw); } catch { rawSchema = []; }
        } else if (Array.isArray(raw)) {
          rawSchema = raw;
        }
        const schema = rawSchema.map((field, i) => ({
          ...field,
          key: field.key ?? String(field.id ?? `field_${i}`),
          label: field.label ?? field.title ?? '',
          type: TYPE_MAP[field.type] ?? field.type,
        }));
        setFormData({ ...res.data, schema });

        // Inicializar respuestas vacías con el tipo correcto (omitir campos info)
        const initial = {};
        schema.forEach((field) => {
          if (field.type === 'info') return;
          if (field.type === 'checkbox') {
            initial[field.key] = [];
          } else if (field.type === 'file') {
            initial[field.key] = field.multiple !== false ? [] : null;
          } else if (field.type === 'range') {
            initial[field.key] = field.min ?? 0;
          } else if (field.type === 'lot_selector') {
            initial[field.key] = null; // lot_id es null hasta que se seleccione
          } else {
            initial[field.key] = '';
          }
        });
        setResponses(initial);

        // Inicializar registration (solo nombre y documento por requerimiento)
        setRegistrations({
          name: '',
          document_number: '',
          signature: null,
        });
      })
      .catch((err) => {
        setErrorStatus(err.status ?? null);
        if (err.status === 404) {
          setError('Este formulario ya no está disponible.');
        } else {
          setError('Ocurrió un error al cargar el formulario. Intenta de nuevo más tarde.');
        }
      })
      .finally(() => setLoading(false));
  }, [formKey]);

  // ── Setters ────────────────────────────────────────────────────────────────
  const setResponse = useCallback((key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setRegistration = useCallback((key, value) => {
    setRegistrations((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── Validación ─────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const errors = {};

    // Campos del schema
    (formData?.schema || []).forEach((field) => {
      if (!field.required) return;
      const val = responses[field.key];
      const isEmpty =
        val === '' ||
        val === null ||
        val === undefined ||
        (Array.isArray(val) && val.length === 0);
      if (isEmpty) errors[field.key] = 'Este campo es obligatorio.';
    });

    // Campos de registro fijos (solo nombre y documento correspondientes a los requerimientos)
    if (!registration.name?.trim()) errors.name = 'Este campo es obligatorio.';
    if (!registration.document_number?.trim()) errors.document_number = 'Este campo es obligatorio.';
    if (!registration.signature) errors.signature = 'Debes firmar antes de enviar el formulario.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, responses, registration]);

  // ── Envío ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setSubmitting(true);
    setFieldErrors({});

    try {
      const location = await getGeolocation();

      // Separar respuestas de archivos y respuestas normales
      const filteredResponses = {};

      // Procesar todas las respuestas
      for (const [key, value] of Object.entries(responses)) {
        const field = formData?.schema?.find((f) => f.key === key);
        if (!field || field.type === 'info') continue;

        const qLabel = field.label || field.title || field.key || key;

        // Si es un archivo o array de archivos, subirlo(s) a Cloudinary
        if (field.type === 'file') {
          const files = Array.isArray(value) ? value : (value ? [value] : []);
          const validFiles = files.filter(f => f instanceof File);

          if (validFiles.length > 0) {
            try {
              console.log(`Subiendo ${validFiles.length} archivo(s) para "${qLabel}" a Cloudinary...`);
              const urls = await cloudinaryService.uploadMultipleFiles(
                validFiles,
                'submissions',
                (progress) => {
                  setUploadProgress({
                    ...progress,
                    fieldLabel: qLabel,
                  });
                }
              );

              filteredResponses[qLabel] = urls;

              console.log(`${validFiles.length} archivo(s) de "${qLabel}" subidos exitosamente`);
            } catch (uploadError) {
              console.error(`Error al subir archivo(s) de "${qLabel}":`, uploadError);
              throw new Error(`No se pudo subir el(los) archivo(s) de "${qLabel}". ${uploadError.message}`);
            }
          }
        } else {
          // Respuesta normal (texto, número, etc.)
          filteredResponses[qLabel] = value;
        }
      }

      // Construir payload como JSON
      const payload = {
        form_key: formKey,
        neighborhood_id: formData.neighborhood_id,
        responses: filteredResponses,
        name: registration.name,
        document_number: registration.document_number,
      };

      // Si hay firma, subirla
      if (registration.signature instanceof File) {
        try {
          const signatureUrls = await cloudinaryService.uploadMultipleFiles(
            [registration.signature],
            'signatures',
            (progress) => {
              setUploadProgress({ ...progress, fieldLabel: 'Firma de usuario' });
            }
          );
          if (signatureUrls && signatureUrls.length > 0) {
            payload.responses['Firma Digital'] = signatureUrls[0];
          }
        } catch (uploadError) {
          throw new Error('No se pudo subir la firma. ' + uploadError.message);
        }
      }

      // Extraer lot_id si hay un campo lot_selector
      const lotSelectorField = formData?.schema?.find((f) => f.type === 'lot_selector');
      if (lotSelectorField) {
        const lotId = responses[lotSelectorField.key];
        if (lotId) {
          payload.lot_id = lotId;
        }
      }

      // Agregar campos opcionales solo si existen
      if (referralCode) payload.referral_code = referralCode;
      if (location) payload.location = location;

      let result;
      try {
        result = await publicFormService.onboarding(payload);
      } catch (submitError) {
        // Compatibilidad: algunos backends rechazan reuso de lot_id en 400.
        // Reintentamos sin lot_id para permitir múltiples respuestas del mismo predio.
        if (submitError?.status === 400 && payload.lot_id) {
          const retryPayload = { ...payload };
          delete retryPayload.lot_id;
          result = await publicFormService.onboarding(retryPayload);
        } else {
          throw submitError;
        }
      }

      // Guardar token y usuario en localStorage (login automático)
      if (result.token) localStorage.setItem('token', result.token);
      if (result.user) localStorage.setItem('user', JSON.stringify(result.user));

      setSuccessData(result);
    } catch (err) {
      if (err.status === 400) {
        setFieldErrors({
          _form: err?.data?.message || 'Por favor completa todos los campos requeridos correctamente.'
        });
      } else if (err.status === 404) {
        setFieldErrors({ _form: 'Este formulario ya no está disponible.' });
      } else if (err.status === 409) {
        setFieldErrors({ _form: '¿Ya tienes una cuenta? El documento o correo ya está registrado.' });
      } else if (err.message && err.message.includes('subir la imagen')) {
        setFieldErrors({ _form: err.message });
      } else {
        setFieldErrors({ _form: 'Ocurrió un error. Intenta de nuevo más tarde.' });
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(null); // Resetear progreso al finalizar
    }
  }, [formKey, formData, responses, registration, referralCode, validate]);

  return {
    formData,
    loading,
    error,
    errorStatus,
    submitting,
    successData,
    responses,
    registration,
    fieldErrors,
    uploadProgress,
    setResponse,
    setRegistration,
    handleSubmit,
  };
};
