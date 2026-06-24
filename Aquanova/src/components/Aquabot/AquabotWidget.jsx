// @ts-nocheck
// src/components/Aquabot/AquabotWidget.jsx
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAquabot } from './hooks/useAquabot';

// ── Indicador de escritura ────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[85%]">
      <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#1361C5] to-[#0D448A] flex items-center justify-center shrink-0 shadow-sm">
        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ── Botones de descarga de reporte ───────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL ?? '';

function ReportDownloadButtons({ report }) {
  const base = `${API_URL}/chat/report/${report.id}`;
  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
      <p className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="#0D448A" className="w-4 h-4 shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 9v-3h-2v3H7l5 5 5-5h-3z"/>
        </svg>
        {report.title}
      </p>
      <div className="flex gap-2">
        <a
          href={`${base}/pdf`}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D448A] text-white rounded-lg text-xs font-medium hover:bg-[#1361C5] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
            <path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.84v6h5.66V9h3.84L12 2z"/>
          </svg>
          Descargar PDF
        </a>
        <a
          href={`${base}/xlsx`}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="#16a34a" className="w-3.5 h-3.5">
            <path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.84v6h5.66V9h3.84L12 2z"/>
          </svg>
          Descargar Excel
        </a>
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5">El enlace expira en 1 hora</p>
    </div>
  );
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────

function MessageBubble({ message }) {
  const isUser      = message.role === 'user';
  const isError     = message.role === 'error';
  const isAssistant = message.role === 'assistant';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-[#0D448A] text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[82%] text-sm leading-relaxed shadow-sm break-words">
          {message.content}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-end gap-2 max-w-[85%]">
        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="#ef4444" className="w-4 h-4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-red-700 shadow-sm break-words">
          {message.content}
        </div>
      </div>
    );
  }

  if (isAssistant) {
    return (
      <div className="flex items-end gap-2 max-w-[88%]">
        <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#1361C5] to-[#0D448A] flex items-center justify-center shrink-0 shadow-sm">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M17.5 12a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12 2a1 1 0 0 1 1 1v1.07A9.003 9.003 0 0 1 20.93 11H22a1 1 0 1 1 0 2h-1.07A9.003 9.003 0 0 1 13 20.93V22a1 1 0 1 1-2 0v-1.07A9.003 9.003 0 0 1 3.07 13H2a1 1 0 1 1 0-2h1.07A9.003 9.003 0 0 1 11 3.07V2a1 1 0 0 1 1-1z"/>
          </svg>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-800 shadow-sm leading-relaxed break-words
          prose prose-sm max-w-none
          prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
          prose-strong:text-gray-900 prose-code:text-[#0D448A] prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded
          prose-table:text-xs prose-th:bg-gray-50 prose-th:font-semibold
          prose-headings:text-gray-900 prose-headings:font-semibold">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          {message.report && <ReportDownloadButtons report={message.report} />}
        </div>
      </div>
    );
  }

  return null;
}

// ── Panel del chat (redimensionable) ─────────────────────────────────────────

const MIN_W = 280;
const MAX_W = 760;
const MIN_H = 360;
const MAX_H = 900;
const DEFAULT_W = 360;
const DEFAULT_H = 520;

function AquabotPanel({ state }) {
  const {
    messages, loading, unavailable,
    input, setInput, inputRef,
    send, reset, handleKeyDown, close,
  } = state;

  const bottomRef = useRef(null);
  /** @type {React.MutableRefObject<{startX:number,startY:number,startW:number,startH:number}|null>} */
  const resizing  = useRef(null);
  const [size, setSize] = useState({ width: DEFAULT_W, height: DEFAULT_H });

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Stable handlers stored in refs so addEventListener/removeEventListener use the same reference
  const onMouseMove = useRef(
    /**
     * @param {MouseEvent} e
     */
    function (e) {
      if (!resizing.current) return;
      const { startX, startY, startW, startH } = resizing.current;
      setSize({
        width:  Math.min(MAX_W, Math.max(MIN_W, startW + (startX - e.clientX))),
        height: Math.min(MAX_H, Math.max(MIN_H, startH + (startY - e.clientY))),
      });
    }
  );

  const onMouseUp = useRef(() => {
    resizing.current = null;
    window.removeEventListener('mousemove', onMouseMove.current);
    window.removeEventListener('mouseup',   onMouseUp.current);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  });

  const onTouchMove = useRef(
    /**
     * @param {TouchEvent} e
     */
    function (e) {
      if (!resizing.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const { startX, startY, startW, startH } = resizing.current;
      setSize({
        width:  Math.min(MAX_W, Math.max(MIN_W, startW + (startX - touch.clientX))),
        height: Math.min(MAX_H, Math.max(MIN_H, startH + (startY - touch.clientY))),
      });
    }
  );

  const onTouchEnd = useRef(() => {
    resizing.current = null;
    window.removeEventListener('touchmove', onTouchMove.current);
    window.removeEventListener('touchend',  onTouchEnd.current);
  });

  // Cleanup on unmount — capture ref values inside the effect to satisfy the linter
  useEffect(() => {
    const mm = onMouseMove.current;
    const mu = onMouseUp.current;
    const tm = onTouchMove.current;
    const te = onTouchEnd.current;
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup',   mu);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend',  te);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  const startResize = (/** @type {React.MouseEvent} */ e) => {
    e.preventDefault();
    resizing.current = { startX: e.clientX, startY: e.clientY, startW: size.width, startH: size.height };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nw-resize';
    window.addEventListener('mousemove', onMouseMove.current);
    window.addEventListener('mouseup',   onMouseUp.current);
  };

  const startResizeTouch = (/** @type {React.TouchEvent} */ e) => {
    const touch = e.touches[0];
    resizing.current = { startX: touch.clientX, startY: touch.clientY, startW: size.width, startH: size.height };
    window.addEventListener('touchmove', onTouchMove.current, { passive: false });
    window.addEventListener('touchend',  onTouchEnd.current);
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col bg-[#F8FAFC] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative"
      style={{
        width:     size.width,
        height:    size.height,
        maxWidth:  'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 96px)',
      }}
    >
      {/* Resize handle — top-left corner */}
      <div
        onMouseDown={startResize}
        onTouchStart={startResizeTouch}
        className="absolute top-1 left-1 w-6 h-6 z-20 flex items-center justify-center rounded cursor-nw-resize hover:bg-black/10 transition-colors group select-none"
        title="Arrastrar para redimensionar"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-30 group-hover:opacity-60 transition-opacity text-gray-600">
          <circle cx="1.5" cy="1.5" r="1.2" fill="currentColor"/>
          <circle cx="5"   cy="1.5" r="1.2" fill="currentColor"/>
          <circle cx="1.5" cy="5"   r="1.2" fill="currentColor"/>
          <circle cx="5"   cy="5"   r="1.2" fill="currentColor"/>
          <circle cx="1.5" cy="8.5" r="1.2" fill="currentColor"/>
          <circle cx="5"   cy="8.5" r="1.2" fill="currentColor"/>
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1361C5] to-[#0D448A] text-white shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M17.5 12a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12 2a1 1 0 0 1 1 1v1.07A9.003 9.003 0 0 1 20.93 11H22a1 1 0 1 1 0 2h-1.07A9.003 9.003 0 0 1 13 20.93V22a1 1 0 1 1-2 0v-1.07A9.003 9.003 0 0 1 3.07 13H2a1 1 0 1 1 0-2h1.07A9.003 9.003 0 0 1 11 3.07V2a1 1 0 0 1 1-1z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-none">Aquabot</p>
          <p className="text-white/70 text-xs mt-0.5">Asistente Aquanova · IA</p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Nueva conversación"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
          )}
          <button
            onClick={close}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Cerrar chat"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scroll-smooth min-h-0">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#1361C5] to-[#0D448A] flex items-center justify-center shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                <path d="M17.5 12a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12 2a1 1 0 0 1 1 1v1.07A9.003 9.003 0 0 1 20.93 11H22a1 1 0 1 1 0 2h-1.07A9.003 9.003 0 0 1 13 20.93V22a1 1 0 1 1-2 0v-1.07A9.003 9.003 0 0 1 3.07 13H2a1 1 0 1 1 0-2h1.07A9.003 9.003 0 0 1 11 3.07V2a1 1 0 0 1 1-1z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Hola, soy Aquabot</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Puedo responder preguntas sobre predios, censo, estadísticas del barrio y más.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {[
                '¿Cuántos predios hay censados?',
                '¿Qué formularios están activos?',
                '¿Cuántas familias tienen acceso al agua?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="text-xs text-left bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 hover:border-[#1361C5] hover:text-[#0D448A] hover:bg-blue-50 transition-colors w-full"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        {unavailable && (
          <div className="text-center text-xs text-gray-400 py-2">
            Chatbot temporalmente no disponible
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#1361C5] focus-within:ring-2 focus-within:ring-[#1361C5]/20 transition-all px-3 py-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={loading || unavailable}
            placeholder="Escribe tu pregunta…"
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed disabled:opacity-50 min-h-[22px] max-h-[96px] overflow-y-auto"
            style={{ height: '22px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || unavailable}
            className="w-8 h-8 rounded-lg bg-[#0D448A] text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1361C5] transition-colors"
            aria-label="Enviar"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 -rotate-45">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-1.5">
          Aquabot · Impulsado por Claude (Anthropic)
        </p>
      </div>
    </div>
  );
}

// ── Widget raíz (FAB arrastrable libremente + Panel) ─────────────────────────

const FAB_SIZE       = 56;
const PANEL_GAP      = 12;
const DRAG_THRESHOLD = 5;

export default function AquabotWidget() {
  const state = useAquabot();
  const { isOpen, toggle } = state;

  // Posición libre del FAB en la pantalla (esquina superior-izquierda del botón)
  const [fabPos, setFabPos] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth  - FAB_SIZE - 24 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight - FAB_SIZE - 24 : 600,
  }));

  const dragging = useRef(null);

  // ── Handlers estables (refs) ────────────────────────────────────────────────
  const onMM = useRef(function (e) {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    const dy = e.clientY - dragging.current.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragging.current.moved = true;
    }
    if (!dragging.current.moved) return;
    setFabPos({
      x: Math.max(0, Math.min(window.innerWidth  - FAB_SIZE, dragging.current.x0 + dx)),
      y: Math.max(0, Math.min(window.innerHeight - FAB_SIZE, dragging.current.y0 + dy)),
    });
  });

  const onMU = useRef(function () {
    if (!dragging.current) return;
    const { moved } = dragging.current;
    dragging.current = null;
    window.removeEventListener('mousemove', onMM.current);
    window.removeEventListener('mouseup',   onMU.current);
    document.body.style.userSelect = '';
    document.body.style.cursor     = '';
    if (!moved) toggle();
  });

  const onTM = useRef(function (e) {
    if (!dragging.current) return;
    e.preventDefault();
    const t  = e.touches[0];
    const dx = t.clientX - dragging.current.startX;
    const dy = t.clientY - dragging.current.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragging.current.moved = true;
    }
    if (!dragging.current.moved) return;
    setFabPos({
      x: Math.max(0, Math.min(window.innerWidth  - FAB_SIZE, dragging.current.x0 + dx)),
      y: Math.max(0, Math.min(window.innerHeight - FAB_SIZE, dragging.current.y0 + dy)),
    });
  });

  const onTE = useRef(function () {
    if (!dragging.current) return;
    const { moved } = dragging.current;
    dragging.current = null;
    window.removeEventListener('touchmove', onTM.current);
    window.removeEventListener('touchend',  onTE.current);
    if (!moved) toggle();
  });

  useEffect(() => {
    const mm = onMM.current, mu = onMU.current;
    const tm = onTM.current, te = onTE.current;
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup',   mu);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend',  te);
      document.body.style.userSelect = '';
      document.body.style.cursor     = '';
    };
  }, []);

  const startDrag = (e) => {
    dragging.current = { startX: e.clientX, startY: e.clientY, x0: fabPos.x, y0: fabPos.y, moved: false };
    document.body.style.userSelect = 'none';
    document.body.style.cursor     = 'grabbing';
    window.addEventListener('mousemove', onMM.current);
    window.addEventListener('mouseup',   onMU.current);
  };

  const startDragTouch = (e) => {
    const t = e.touches[0];
    dragging.current = { startX: t.clientX, startY: t.clientY, x0: fabPos.x, y0: fabPos.y, moved: false };
    window.addEventListener('touchmove', onTM.current, { passive: false });
    window.addEventListener('touchend',  onTE.current);
  };

  // ── Posición del panel relativa al FAB ─────────────────────────────────────
  const { x, y } = fabPos;
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  // El panel aparece arriba del FAB si el FAB está en la mitad inferior, y abajo si está arriba
  const showAbove = y > vh / 2;
  // El panel se alinea por la derecha si el FAB está en la mitad derecha, y por la izquierda si no
  const alignRight = x + FAB_SIZE > vw / 2;

  const panelLeft = alignRight
    ? Math.max(8, x + FAB_SIZE - 360)   // alinea el borde derecho del panel con el FAB
    : Math.min(x, vw - 360 - 8);        // alinea el borde izquierdo del panel con el FAB

  const panelStyle = showAbove
    ? { bottom: vh - y + PANEL_GAP }
    : { top:    y + FAB_SIZE + PANEL_GAP };

  const panelOrigin = `${showAbove ? 'origin-bottom' : 'origin-top'}-${alignRight ? 'right' : 'left'}`;

  return (
    <>
      {/* Panel */}
      <div
        style={{ position: 'fixed', left: panelLeft, zIndex: 50, ...panelStyle }}
        className={`transition-all duration-300 ease-out ${panelOrigin} ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <AquabotPanel state={state} />
      </div>

      {/* FAB arrastrable */}
      <div
        style={{ position: 'fixed', left: x, top: y, zIndex: 51, cursor: 'grab' }}
        onMouseDown={startDrag}
        onTouchStart={startDragTouch}
      >
        <button
          className={`
            w-14 h-14 rounded-full shadow-lg flex items-center justify-center
            transition-colors duration-300 select-none
            ${isOpen
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-linear-to-br from-[#1361C5] to-[#0D448A] hover:shadow-xl'
            }
          `}
          aria-label={isOpen ? 'Cerrar Aquabot' : 'Abrir Aquabot'}
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
            {isOpen ? (
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M17.5 12a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12 2a1 1 0 0 1 1 1v1.07A9.003 9.003 0 0 1 20.93 11H22a1 1 0 1 1 0 2h-1.07A9.003 9.003 0 0 1 13 20.93V22a1 1 0 1 1-2 0v-1.07A9.003 9.003 0 0 1 3.07 13H2a1 1 0 1 1 0-2h1.07A9.003 9.003 0 0 1 11 3.07V2a1 1 0 0 1 1-1z"/>
              </svg>
            )}
          </div>
        </button>
      </div>
    </>
  );
}
