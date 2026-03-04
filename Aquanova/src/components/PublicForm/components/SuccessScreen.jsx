// src/components/PublicForm/components/SuccessScreen.jsx
import { useState } from 'react';
import { CheckCircleIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

/**
 * Pantalla de éxito que se muestra al completar el onboarding.
 *
 * @param {{ result: import('../context/PublicFormContext').OnboardingResult, giveaway: {points_per_referral: number, is_active: boolean} }} props
 */
function SuccessScreen({ result, giveaway }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result.share_link) return;
    navigator.clipboard.writeText(result.share_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      {/* Ícono de éxito */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircleIcon className="h-11 w-11 text-green-500" />
      </div>

      {/* Mensaje de bienvenida */}
      <div className="flex flex-col gap-1">
        <h2 className="font-work text-2xl font-bold text-gray-900">
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
      <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Tu enlace para compartir</p>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
          <span className="flex-1 truncate text-left text-xs text-gray-500">
            {result.share_link}
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
