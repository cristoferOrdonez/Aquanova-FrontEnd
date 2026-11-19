import { apiRequest, getAuthHeaders } from './apiClient';
import { formService } from './formService';

/**
 * Sistema de referidos por campaña.
 * Spec: SPEC_REFERIDOS_POR_CAMPANA.md (contratos CO-01 … CO-13).
 *
 * Varios contratos dependen de endpoints que el backend aún no expone. Cada uno
 * intenta primero la ruta definida en la spec y, si responde 404, deriva el dato
 * de los endpoints actuales. Cuando el backend implemente su parte, el fallback
 * deja de ejecutarse sin tocar los componentes.
 */

// ── Utilidades ────────────────────────────────────────────────────────────────

/** El endpoint aún no existe en este backend → corresponde usar el fallback. */
const isMissingEndpoint = (err) => err?.status === 404 || err?.status === 501;

/**
 * Ejecuta `preferred`; si el endpoint no existe todavía, ejecuta `fallback`.
 * Cualquier otro error (401, 403, 500, red) se propaga: un fallo real no debe
 * quedar enmascarado como "backend viejo".
 */
async function withFallback(preferred, fallback) {
  try {
    return await preferred();
  } catch (err) {
    if (!isMissingEndpoint(err)) throw err;
    return fallback();
  }
}

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** processed / total × 100, redondeado a un decimal. Sin submissions ⇒ 0. */
function conversionRate(processed, total) {
  const t = toNumber(total);
  if (t === 0) return 0;
  return Math.round((toNumber(processed) / t) * 1000) / 10;
}

/**
 * RN-07 — activas primero, ordenadas por actividad; luego las inactivas.
 * Desempate final por título para que el orden sea estable entre recargas.
 */
function sortCampaigns(campaigns) {
  return [...campaigns].sort((a, b) => {
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    const diff = toNumber(b.total_referrals) - toNumber(a.total_referrals);
    if (diff !== 0) return diff;
    return String(a.form_title ?? '').localeCompare(String(b.form_title ?? ''), 'es');
  });
}

/**
 * CO-06 — arma el link de referido de una campaña.
 *
 * Se construye en el cliente a propósito. `buildReferralUrl` del backend
 * (giveawayController.js) produce `/formulario?ref=` o `/formulario/{uuid}?ref=`,
 * y ninguna de las dos resuelve: la ruta pública es `/formulario/:formKey` y se
 * busca por slug (`forms.key`). Ver D-1 y D-2 en la spec.
 *
 * @param {string} formKey - slug de la campaña (`forms.key`), NO el uuid
 * @param {string} referralCode - código del referente
 * @param {string} [origin] - origen a usar; por defecto el del navegador
 * @returns {string|null} URL absoluta, o null si falta algún dato
 */
export function buildReferralUrl(formKey, referralCode, origin) {
  if (!formKey || !referralCode) return null;
  const base = (origin ?? window.location.origin).replace(/\/$/, '');
  return `${base}/formulario/${encodeURIComponent(formKey)}?ref=${encodeURIComponent(referralCode)}`;
}

/**
 * Normaliza una fila de campaña a la forma que consumen los componentes,
 * venga del endpoint nuevo o de `/giveaways/metrics/per-form`.
 */
function normalizeCampaign(row, formsById = new Map()) {
  const form = formsById.get(row.form_id);
  return {
    form_id: row.form_id,
    // `per-form` no devuelve el slug; se completa cruzando con GET /forms
    form_key: row.form_key ?? form?.key ?? null,
    form_title: row.form_title ?? form?.title ?? 'Campaña sin título',
    is_active: Boolean(row.is_active),
    points_per_referral: toNumber(row.points_per_referral),
    max_points_per_user: row.max_points_per_user ?? null,
    total_referrals: toNumber(row.total_referrals),
    processed_referrals: toNumber(row.processed_referrals),
    pending_referrals: toNumber(row.pending_referrals),
    total_points_distributed: toNumber(row.total_points_distributed),
    active_referrers: toNumber(row.active_referrers),
    conversion_rate: row.conversion_rate != null
      ? toNumber(row.conversion_rate)
      : conversionRate(row.processed_referrals, row.total_referrals),
  };
}

/** Índice form_id → {key, title}. Falla en silencio: el slug es opcional aquí. */
async function loadFormsIndex() {
  try {
    const res = await formService.getAll();
    const forms = res?.forms ?? [];
    return new Map(forms.map(f => [f.id, f]));
  } catch {
    return new Map();
  }
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const referralService = {
  // ═══ Alcance de campaña (admin / operador) ═════════════════════════════════

  /**
   * CO-01 — listarCampañasConSorteo().
   * Fallback: `/metrics/per-form` cruzado con `GET /forms` para obtener el slug
   * y con `conversion_rate` calculado en cliente.
   */
  async getCampaigns() {
    return withFallback(
      async () => {
        const res = await apiRequest('/giveaways/campaigns', { headers: getAuthHeaders() });
        const formsById = await loadFormsIndex();
        return {
          ok: true,
          source: 'campaigns',
          data: sortCampaigns((res.data ?? []).map(row => normalizeCampaign(row, formsById))),
        };
      },
      async () => {
        const [res, formsById] = await Promise.all([
          apiRequest('/giveaways/metrics/per-form', { headers: getAuthHeaders() }),
          loadFormsIndex(),
        ]);
        return {
          ok: true,
          source: 'per-form',
          data: sortCampaigns((res.data ?? []).map(row => normalizeCampaign(row, formsById))),
        };
      },
    );
  },

  /** CO-02 — obtenerMetricasDeCampaña(). Ya existe por campaña; sin fallback. */
  getCampaignMetrics(formId) {
    return apiRequest(`/giveaways/${formId}/metrics`, { headers: getAuthHeaders() });
  },

  /**
   * CO-03 — obtenerRankingDeCampaña().
   * Fallback: el leaderboard público de la campaña, que ya viene ordenado y
   * posicionado por campaña. Aporta menos columnas (sin `last_activity` ni
   * `referral_code`), por eso se marca `partial` para que la UI lo advierta.
   */
  async getCampaignRanking(formId, limit = 50) {
    return withFallback(
      async () => {
        const res = await apiRequest(
          `/giveaways/${formId}/ranking?limit=${limit}`,
          { headers: getAuthHeaders() },
        );
        return { ok: true, source: 'ranking', partial: false, data: res.data ?? [] };
      },
      async () => {
        const res = await apiRequest(`/giveaways/${formId}/leaderboard?limit=${limit}`);
        const data = (res.data ?? []).map(row => ({
          position: toNumber(row.position),
          user_id: row.user_id,
          name: row.name,
          referral_code: row.referral_code ?? null,
          total_points: toNumber(row.total_points),
          referrals_count: toNumber(row.referrals_count),
          successful_referrals: row.successful_referrals != null
            ? toNumber(row.successful_referrals)
            : null,
          last_activity: row.last_activity ?? null,
        }));
        return { ok: true, source: 'leaderboard', partial: true, data };
      },
    );
  },

  /**
   * CO-04 — obtenerActividadDeCampaña().
   * Fallback: la actividad global filtrada por `form_id`, que sí viene en la
   * respuesta. Se pide un `limit` mayor porque el filtrado ocurre en cliente y
   * de lo contrario una campaña poco activa quedaría fuera de la ventana.
   */
  async getCampaignActivity(formId, limit = 30) {
    return withFallback(
      async () => {
        const res = await apiRequest(
          `/giveaways/${formId}/activity?limit=${limit}`,
          { headers: getAuthHeaders() },
        );
        return { ok: true, source: 'activity', truncated: false, data: res.data ?? [] };
      },
      async () => {
        const globalLimit = Math.max(limit * 5, 150);
        const res = await apiRequest(
          `/giveaways/metrics/activity?limit=${globalLimit}`,
          { headers: getAuthHeaders() },
        );
        const all = res.data ?? [];
        const scoped = all.filter(item => item.form_id === formId);
        return {
          ok: true,
          source: 'activity-filtered',
          // La ventana global se llenó: puede haber actividad más antigua sin mostrar
          truncated: all.length >= globalLimit,
          data: scoped.slice(0, limit),
        };
      },
    );
  },

  // ═══ Alcance global (agregado — RN-05) ═════════════════════════════════════

  /** CO-13 — obtenerMetricasGlobales(). Siempre agregado sobre campañas. */
  async getGlobalOverview() {
    const res = await apiRequest('/giveaways/metrics/overview', { headers: getAuthHeaders() });
    return { ...res, is_aggregate: true };
  },

  getGlobalRanking(limit = 50) {
    return apiRequest(`/giveaways/metrics/ranking?limit=${limit}`, { headers: getAuthHeaders() });
  },

  getGlobalActivity(limit = 30) {
    return apiRequest(`/giveaways/metrics/activity?limit=${limit}`, { headers: getAuthHeaders() });
  },

  // ═══ Auditoría de referentes ═══════════════════════════════════════════════

  /**
   * CO-11 / CO-12 — perfil de un referente, opcionalmente acotado a campaña.
   * Fallback cuando el backend ignora `formId`: se filtra `recent_referrals` en
   * cliente por título de campaña y se recorta `by_giveaway` a esa campaña.
   */
  async getUserMetrics(userId, formId = null) {
    const qs = formId ? `?formId=${encodeURIComponent(formId)}` : '';
    const res = await apiRequest(
      `/giveaways/metrics/user/${userId}${qs}`,
      { headers: getAuthHeaders() },
    );
    if (!formId || !res?.data) return { ...res, scoped: Boolean(formId) };

    const byGiveaway = res.data.by_giveaway ?? [];
    const campaign = byGiveaway.find(g => g.form_id === formId);
    // Si el backend ya acotó, `by_giveaway` trae solo la campaña pedida
    const alreadyScoped = byGiveaway.length <= 1;
    if (alreadyScoped) return { ...res, scoped: true };

    return {
      ...res,
      scoped: true,
      data: {
        ...res.data,
        by_giveaway: campaign ? [campaign] : [],
        recent_referrals: (res.data.recent_referrals ?? [])
          .filter(r => r.form_title === campaign?.form_title),
      },
    };
  },

  // ═══ Perfil del referente (cualquier usuario autenticado) ══════════════════

  /** Perfil base: código de referido y acumulado global. */
  getReferralProfile() {
    return apiRequest('/users/me/referral-profile', { headers: getAuthHeaders() });
  },

  /**
   * CO-05 — obtenerMiPerfilDeReferido() con desglose por campaña.
   *
   * Fallback (DA-5 opción a — todas las campañas activas): el perfil global da
   * el código, `GET /forms` da las campañas activas con su slug, y el
   * leaderboard público de cada campaña da los puntos y la posición del usuario.
   * `per-form` no sirve aquí: exige rol admin/operador.
   *
   * @param {string} currentUserId - id del usuario en sesión, para ubicarlo en el leaderboard
   */
  async getMyCampaigns(currentUserId) {
    const profileRes = await this.getReferralProfile();
    const profile = profileRes?.data ?? {};

    // El backend nuevo ya devuelve el desglose por campaña
    if (Array.isArray(profile.campaigns)) {
      return {
        ok: true,
        source: 'profile-campaigns',
        referral_code: profile.referral_code,
        total_accumulated_points: toNumber(profile.total_accumulated_points),
        data: profile.campaigns.map(c => ({
          ...c,
          points_in_campaign: toNumber(c.points_in_campaign),
          referrals_in_campaign: toNumber(c.referrals_in_campaign),
          referral_url: c.referral_url
            ?? buildReferralUrl(c.form_key, profile.referral_code),
        })),
      };
    }

    const formsRes = await formService.getAll();
    const activeForms = (formsRes?.forms ?? []).filter(f => f.is_active && f.key);

    // Una campaña sin sorteo devuelve 404/vacío: se descarta, no es un error (RN-04)
    const campaigns = await Promise.all(activeForms.map(async (form) => {
      let myRow = null;
      let participants = 0;
      try {
        const board = await apiRequest(`/giveaways/${form.id}/leaderboard?limit=200`);
        const rows = board?.data ?? [];
        participants = rows.length;
        myRow = rows.find(r => r.user_id === currentUserId) ?? null;
      } catch (err) {
        if (!isMissingEndpoint(err)) throw err;
        return null;
      }
      return {
        form_id: form.id,
        form_key: form.key,
        form_title: form.title,
        is_active: true,
        points_in_campaign: toNumber(myRow?.total_points),
        referrals_in_campaign: toNumber(myRow?.referrals_count),
        position: myRow ? toNumber(myRow.position) : null,
        participants,
        referral_url: buildReferralUrl(form.key, profile.referral_code),
      };
    }));

    return {
      ok: true,
      source: 'derived',
      referral_code: profile.referral_code,
      total_accumulated_points: toNumber(profile.total_accumulated_points),
      data: campaigns.filter(Boolean),
    };
  },

  /**
   * CO-07 — QR de una campaña.
   *
   * Se genera en cliente: el endpoint del backend codifica una URL que no
   * resuelve (D-1/D-2). Cuando el backend construya el link con el slug, basta
   * con volver a delegar aquí.
   *
   * @returns {Promise<{referral_url: string, qr_data_url: string}>}
   */
  async getCampaignQR(formKey, referralCode) {
    const url = buildReferralUrl(formKey, referralCode);
    if (!url) throw new Error('La campaña no tiene un identificador público publicado.');

    const QRCode = (await import('qrcode')).default;
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: { dark: '#0c4a6e', light: '#ffffff' },
    });
    return { referral_url: url, qr_data_url: qrDataUrl };
  },

  /** Descarga el QR de una campaña como PNG. */
  async downloadCampaignQR(formKey, referralCode, formTitle) {
    const url = buildReferralUrl(formKey, referralCode);
    if (!url) throw new Error('La campaña no tiene un identificador público publicado.');

    const QRCode = (await import('qrcode')).default;
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 1024,
      color: { dark: '#0c4a6e', light: '#ffffff' },
    });

    const slug = String(formTitle ?? formKey)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${slug || 'campana'}-${referralCode}.png`;
    a.click();
  },

  // ═══ Público (sin auth) ════════════════════════════════════════════════════

  getPublicLeaderboard(formId, limit = 10) {
    return apiRequest(`/giveaways/${formId}/leaderboard?limit=${limit}`);
  },
};

/**
 * @deprecated El backend genera un link que no resuelve en este frontend.
 * Usar `getCampaignQR(formKey, referralCode)`. Se mantiene para no romper
 * consumidores externos mientras migran.
 */
export function getBackendReferralQR(formId) {
  const qs = formId ? `?formId=${formId}` : '';
  return apiRequest(`/users/me/referral-qr${qs}`, { headers: getAuthHeaders() });
}
