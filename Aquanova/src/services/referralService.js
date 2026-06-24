import { apiRequest, getAuthHeaders, getToken } from './apiClient';

const API_URL = import.meta.env.VITE_API_URL;

export const referralService = {
  // ── Admin metrics ─────────────────────────────────────────────────────────
  getOverview() {
    return apiRequest('/giveaways/metrics/overview', { headers: getAuthHeaders() });
  },
  getRanking(limit = 50) {
    return apiRequest(`/giveaways/metrics/ranking?limit=${limit}`, { headers: getAuthHeaders() });
  },
  getActivity(limit = 30) {
    return apiRequest(`/giveaways/metrics/activity?limit=${limit}`, { headers: getAuthHeaders() });
  },
  getPerForm() {
    return apiRequest('/giveaways/metrics/per-form', { headers: getAuthHeaders() });
  },
  getFormMetrics(formId) {
    return apiRequest(`/giveaways/${formId}/metrics`, { headers: getAuthHeaders() });
  },
  getUserMetrics(userId) {
    return apiRequest(`/giveaways/metrics/user/${userId}`, { headers: getAuthHeaders() });
  },

  // ── User profile & QR ─────────────────────────────────────────────────────
  getReferralProfile() {
    return apiRequest('/users/me/referral-profile', { headers: getAuthHeaders() });
  },
  getReferralQR(formId) {
    const qs = formId ? `?formId=${formId}` : '';
    return apiRequest(`/users/me/referral-qr${qs}`, { headers: getAuthHeaders() });
  },
  async downloadQRPng(referralCode, formId) {
    const qs = `format=png${formId ? `&formId=${formId}` : ''}`;
    const res = await fetch(`${API_URL}/users/me/referral-qr?${qs}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-referido-${referralCode}.png`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ── Public leaderboard (no auth required) ─────────────────────────────────
  getPublicLeaderboard(formId, limit = 10) {
    return apiRequest(`/giveaways/${formId}/leaderboard?limit=${limit}`);
  },
};
