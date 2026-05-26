import { apiRequest, getAuthHeaders } from './apiClient';

export async function sendChatMessage(message, history = []) {
  return apiRequest('/chat', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: { message, history },
  });
}
