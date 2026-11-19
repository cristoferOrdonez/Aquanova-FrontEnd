import { apiRequest } from './apiClient';

export const authService = {
  async login({ document_number, password }) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { document_number, password },
    });
    if (response.ok && response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  saveSession({ token, user }) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser() {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return localStorage.getItem('user') !== null;
  }
};