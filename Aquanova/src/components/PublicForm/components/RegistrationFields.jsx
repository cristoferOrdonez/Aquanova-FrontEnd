// src/components/PublicForm/components/RegistrationFields.jsx
import { usePublicFormContext } from '../hooks/usePublicFormContext';

const inputBase =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[var(--blue-buttons)] focus:ring-2 focus:ring-[var(--blue-buttons)]/20';

const errorBorder = 'border-red-400 focus:border-red-400 focus:ring-red-200';

/**
 * Sección de identificación del usuario.
 * Solo captura los dos campos mínimos obligatorios para el registro: nombre y número de documento.
 */
function RegistrationFields() {
  const { formData, registration, setRegistration, fieldErrors } = usePublicFormContext();
  const regFields = formData?.registration_fields || {};

  const nameLabel = regFields.name?.label || 'Nombre completo';
  const docLabel  = regFields.document_number?.label || 'Número de documento';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Tus datos
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          {nameLabel}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`${inputBase} ${fieldErrors.name ? errorBorder : ''}`}
          value={registration.name || ''}
          onChange={(e) => setRegistration('name', e.target.value)}
          autoComplete="off"
        />
        {fieldErrors.name && (
          <p className="text-xs text-red-500">{fieldErrors.name}</p>
        )}
      </div>

      {/* Número de documento */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          {docLabel}
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`${inputBase} ${fieldErrors.document_number ? errorBorder : ''}`}
          value={registration.document_number || ''}
          onChange={(e) => setRegistration('document_number', e.target.value)}
          autoComplete="off"
        />
        {fieldErrors.document_number && (
          <p className="text-xs text-red-500">{fieldErrors.document_number}</p>
        )}
      </div>
    </div>
  );
}

export default RegistrationFields;

