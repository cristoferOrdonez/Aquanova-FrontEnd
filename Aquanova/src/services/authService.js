import { apiRequest } from './apiClient';

export const authService = {
  async login({ document_number, password }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { document_number, password },
    });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  saveSession({ token, user }) {
    localStorage.setItem('token', token);
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
};