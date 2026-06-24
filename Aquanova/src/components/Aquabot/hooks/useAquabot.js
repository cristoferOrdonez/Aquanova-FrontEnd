// src/components/Aquabot/hooks/useAquabot.js
import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../../../services/chatService';

/**
 * @typedef {{ id: string, role: 'user'|'assistant'|'error', content: string }} ChatMessage
 */

export function useAquabot() {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState(/** @type {ChatMessage[]} */ ([]));
  const [history, setHistory]   = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const inputRef = useRef(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) setTimeout(() => inputRef.current?.focus(), 80);
      return !prev;
    });
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setHistory([]);
    setInput('');
    setUnavailable(false);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = /** @type {ChatMessage} */ ({
      id:      crypto.randomUUID(),
      role:    'user',
      content: text,
    });

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage(text, history);

      if (!data.ok) {
        throw Object.assign(new Error(data.message || 'Error del chatbot'), { status: 503 });
      }

      setHistory(data.history);
      setMessages(prev => [
        ...prev,
        {
          id:      crypto.randomUUID(),
          role:    'assistant',
          content: data.answer,
          report:  data.report  ?? null,
          charts:  data.charts  ?? null,
        },
      ]);
    } catch (err) {
      const status = err.status ?? 0;

      let errorText;
      if (status === 503) {
        setUnavailable(true);
        errorText = 'El chatbot no está disponible en este momento.';
      } else if (status === 429) {
        errorText = 'Demasiadas consultas. Espera un momento e intenta de nuevo.';
      } else {
        errorText = 'Ocurrió un error. Intenta de nuevo.';
      }

      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'error', content: errorText },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, history, loading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }, [send]);

  return {
    isOpen, open, close, toggle,
    messages, history,
    input, setInput,
    loading, unavailable,
    inputRef,
    send, reset, handleKeyDown,
  };
}
