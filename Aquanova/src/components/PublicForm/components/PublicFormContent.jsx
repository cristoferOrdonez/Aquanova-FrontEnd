// src/components/PublicForm/components/PublicFormContent.jsx
import defaultImage from '../../../assets/images/humedal.jpg';
import GiveawayBanner from './GiveawayBanner';
import FormFieldRenderer from './FormFieldRenderer';
import RegistrationFields from './RegistrationFields';
import SignaturePad from './SignaturePad';
import SuccessScreen from './SuccessScreen';
import { usePublicFormContext } from '../hooks/usePublicFormContext';

// ── Estados de carga / error ──────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--blue-buttons)]" />
        <p className="text-sm text-[var(--gray-subtitles)]">Cargando formulario…</p>
      </div>
    </div>
  );
}

function ErrorState({ status, message }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="text-5xl">{status === 404 ? '🔍' : '⚠️'}</div>
        <h2 className="font-work text-xl font-semibold text-gray-900">
          {status === 404 ? 'Formulario no encontrado' : 'Algo salió mal'}
        </h2>
        <p className="text-sm text-[var(--gray-subtitles)]">{message}</p>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

function PublicFormContent() {
  const {
    formData,
    loading,
    error,
    errorStatus,
    submitting,
    successData,
    fieldErrors,
    uploadProgress,
    handleSubmit,
    registration,
    setRegistration,
    clearCache,
  } = usePublicFormContext();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState status={errorStatus} message={error} />;
  if (!formData) return null;

  if (successData) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <SuccessScreen result={successData} giveaway={formData.giveaway} />
      </div>
    );
  }

  const coverImage = formData.metadata?.imagen || defaultImage;

  return (
    <div className="mx-auto max-w-xl px-4 pt-10 pb-20 md:pb-10">
      <div className="overflow-hidden rounded-2xl border border-[var(--stroke-selectors-and-search-bars)] bg-white shadow-md">

        {/* Imagen de portada */}
        <div className="h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={coverImage}
            alt={`Portada: ${formData.title}`}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.src = defaultImage; }}
          />
        </div>

        <div className="flex flex-col gap-6 p-6">

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h1 className="font-work text-2xl font-bold text-gray-900">{formData.title}</h1>
            <button
              type="button"
              onClick={clearCache}
              className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors shrink-0"
              title="Borrar progreso guardado en este dispositivo"
            >
              Reiniciar formulario
            </button>
          </div>

          {/* Banner de sorteo */}
          {formData.giveaway?.is_active && (
            <GiveawayBanner points={formData.giveaway.points_per_referral} />
          )}

          {/* Campos de registro — primero */}
          <RegistrationFields />

          {/* Preguntas del schema */}
          {(formData.schema || []).length > 0 && (
            <div className="flex flex-col gap-5">
              {formData.schema.map((field) => (
                <FormFieldRenderer key={field.key} field={field} />
              ))}
            </div>
          )}

          {/* Error global del formulario */}
          {fieldErrors._form && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fieldErrors._form}
            </div>
          )}

          {/* Barra de progreso de subida */}
          {uploadProgress && (
            <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-blue-800">
                <span className="font-medium">
                  {uploadProgress.fileName && `Subiendo: ${uploadProgress.fileName}`}
                  {!uploadProgress.fileName && 'Subiendo archivos...'}
                </span>
                <span className="font-semibold">
                  {uploadProgress.current}/{uploadProgress.total} ({uploadProgress.percent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full bg-[var(--blue-buttons)] transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
              {uploadProgress.fieldLabel && (
                <span className="text-xs text-blue-600">
                  Campo: {uploadProgress.fieldLabel}
                </span>
              )}
            </div>
          )}

          {/* Firma */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--stroke-selectors-and-search-bars)]">
            <SignaturePad
              error={fieldErrors.signature}
              onChange={(file) => setRegistration('signature', file)}
            />
          </div>

          {/* Botón enviar */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full py-3 text-sm font-semibold text-white bg-[var(--blue-buttons)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (uploadProgress ? 'Subiendo archivos…' : 'Enviando…') : 'Enviar encuesta'}
          </button>

        </div>
      </div>
    </div>
  );
}

export default PublicFormContent;
