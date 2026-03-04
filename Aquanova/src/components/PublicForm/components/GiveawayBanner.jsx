// src/components/PublicForm/components/GiveawayBanner.jsx

/**
 * Banner de incentivo del sorteo. Se muestra solo si giveaway.is_active === true.
 *
 * @param {{ points: number }} props
 */
function GiveawayBanner({ points }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-800">
      <span className="mt-0.5 text-lg leading-none">✦</span>
      <p>
        Completa esta encuesta y gana{' '}
        <span className="font-semibold">{points} puntos</span> por cada persona
        que invites con tu enlace personal.
      </p>
    </div>
  );
}

export default GiveawayBanner;
