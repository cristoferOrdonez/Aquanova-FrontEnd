// src/services/chatService.js
import { apiRequest } from './apiClient';

/**
 * Envía un mensaje al chatbot Aquabot.
 *
 * @param {string} message - Pregunta del usuario
 * @param {Array<{role: string, content: string}>} history - Historial de turnos previos
 * @returns {Promise<{ ok: boolean, answer: string, history: Array, usage: object }>}
 */
export async function sendChatMessage(message, history = []) {
  return apiRequest('/chat', {
    method: 'POST',
    body: { message, history },
  });
}
