// src/components/PublicForm/components/GiveawayBanner.jsx

/**
 * Banner de incentivo del sorteo. Se muestra solo si giveaway.is_active === true.
 *
 * @param {{ points: number }} props
 */
function GiveawayBanner({ points }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] px-5 py-4 text-sm text-[#92610A]">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning)] text-white text-xs leading-none">✦</span>
      <p>
        Completa esta encuesta y gana{' '}
        <span className="font-semibold">{points} puntos</span> por cada persona
        que invites con tu enlace personal.
      </p>
    </div>
  );
}

export default GiveawayBanner;
