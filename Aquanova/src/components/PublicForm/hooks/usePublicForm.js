// src/components/PublicForm/hooks/usePublicForm.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import publicFormService from '../../../services/publicFormService';

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
  'Opción multiple': 'radio',
  'Casillas de verificación': 'checkbox',
  'Lista desplegable': 'select',
  'Respuesta textual': 'text',
  'Numérico': 'text',
  'Fecha': 'text',
  'Cargar imagen': 'text',
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

        // Inicializar respuestas vacías con el tipo correcto
        const initial = {};
        schema.forEach((field) => {
          initial[field.key] = field.type === 'checkbox' ? [] : field.type === 'range' ? (field.min ?? 0) : '';
        });
        setResponses(initial);
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

    // Campos de registro — solo name y document_number son obligatorios fijos
    if (!registration.name?.trim()) errors.name = 'Este campo es obligatorio.';
    if (!registration.document_number?.trim()) errors.document_number = 'Este campo es obligatorio.';

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

      const payload = {
        form_key: formKey,
        neighborhood_id: formData.neighborhood_id,
        responses,
        name: registration.name,
        document_number: registration.document_number,
        ...(referralCode ? { referral_code: referralCode } : {}),
        ...(location ? { location } : {}),
      };

      const result = await publicFormService.onboarding(payload);

      // Guardar token y usuario en localStorage (login automático)
      if (result.token) localStorage.setItem('token', result.token);
      if (result.user) localStorage.setItem('user', JSON.stringify(result.user));

      setSuccessData(result);
    } catch (err) {
      if (err.status === 400) {
        setFieldErrors({ _form: 'Por favor completa todos los campos requeridos correctamente.' });
      } else if (err.status === 404) {
        setFieldErrors({ _form: 'Este formulario ya no está disponible.' });
      } else if (err.status === 409) {
        setFieldErrors({ _form: '¿Ya tienes una cuenta? El documento o correo ya está registrado.' });
      } else {
        setFieldErrors({ _form: 'Ocurrió un error. Intenta de nuevo más tarde.' });
      }
    } finally {
      setSubmitting(false);
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
    setResponse,
    setRegistration,
    handleSubmit,
  };
};
