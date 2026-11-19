// src/components/PublicForm/components/SuccessScreen.jsx
import { useState } from 'react';
import { CheckCircleIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import mascot from '../../../assets/images/logo_aquanova.png';

/**
 * Pantalla de éxito que se muestra al completar el onboarding.
 *
 * @param {{ result: import('../context/PublicFormContext').OnboardingResult, giveaway: {points_per_referral: number, is_active: boolean} }} props
 */
// Construye el share link usando el origen real del navegador + la ruta del
// formulario actual, para que coincida con el dominio donde está desplegado.
// Fallback: share_link del backend (puede ser incorrecto si FRONTEND_URL
// no está configurada en el servidor).
function buildShareLink(result) {
  if (!result.referral_code) return result.share_link ?? null;
  const origin   = import.meta.env.VITE_FRONTEND_URL ?? window.location.origin;
  const formPath = window.location.pathname; // /formulario/:formKey — ya estamos aquí
  return `${origin}${formPath}?ref=${result.referral_code}`;
}

function SuccessScreen({ result, giveaway }) {
  const [copied, setCopied] = useState(false);
  const shareLink = buildShareLink(result);

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      {/* Mascota Aquanova + ícono de éxito */}
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-success-soft)] ring-4 ring-[var(--color-success)]/15 overflow-hidden">
          <img src={mascot} alt="Aquanova" className="h-20 w-20 object-cover" draggable={false} />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md">
          <CheckCircleIcon className="h-8 w-8 text-[var(--color-success)]" />
        </span>
      </div>

      {/* Mensaje de bienvenida */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold text-[var(--text-strong)]">
          ¡Registro exitoso, {result.user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-sm text-[var(--gray-subtitles)]">
          Tu encuesta fue enviada correctamente.
        </p>
      </div>

      {/* Notificación de reconciliación */}
      {result.reconciliation?.reconciled && (
        <div className="w-full rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-700">
          ✦ ¡Tu invitador ganó{' '}
          <span className="font-semibold">{result.reconciliation.points_awarded} puntos</span>{' '}
          gracias a ti!
        </div>
      )}

      {/* Recuadro del enlace para compartir */}
      {shareLink && (
      <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Tu enlace para compartir</p>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
          <span className="flex-1 truncate text-left text-xs text-gray-500">
            {shareLink}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Copiar enlace"
            title={copied ? '¡Copiado!' : 'Copiar enlace'}
          >
            {copied
              ? <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
              : <ClipboardDocumentIcon className="h-5 w-5" />
            }
          </button>
        </div>

        {result.referral_code && (
          <p className="text-xs text-gray-400">
            Código de referido:{' '}
            <span className="font-semibold tracking-wider text-gray-600">
              {result.referral_code}
            </span>
          </p>
        )}
      </div>
      )}

      {/* Incentivo de puntos */}
      {giveaway?.is_active && (
        <p className="text-sm text-[var(--gray-subtitles)]">
          Por cada persona que llene el formulario con tu enlace, ganarás{' '}
          <span className="font-semibold text-gray-700">
            {giveaway.points_per_referral} puntos
          </span>.
        </p>
      )}
    </div>
  );
}

export default SuccessScreen;
