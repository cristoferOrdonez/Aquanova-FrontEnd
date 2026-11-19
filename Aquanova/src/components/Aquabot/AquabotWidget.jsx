// @ts-nocheck
// src/components/Aquabot/AquabotWidget.jsx
import { Children, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAquabot } from './hooks/useAquabot';

// ── Paleta del asistente ──────────────────────────────────────────────────────
// Navy profundo para el header, naranja de acento (--orange-base) para la
// identidad del bot y azul medio para los mensajes del usuario.

const NAVY        = '#16294A';
const NAVY_SOFT   = '#1E3860';
const NAVY_TEXT   = '#1B2C4A';
const ORANGE      = '#DD7A31';
const ORANGE_DARK = '#C4681E';
const USER_BLUE   = '#4E85C6';
const BOT_BG      = '#E8EFF7';

// ── Resaltado de cifras dentro del markdown ──────────────────────────────────
// Divide las cadenas de texto y envuelve los números en naranja, como en el
// diseño de referencia ("224 predios", "46", "1,5 familias").

const NUM_SPLIT = /(\d+(?:[.,]\d+)*\s?%?)/g;

function highlightNumbers(children) {
  return Children.map(children, (child, idx) => {
    if (typeof child !== 'string') return child;
    const parts = child.split(NUM_SPLIT);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <span key={`${idx}-${i}`} className="font-semibold text-[#DD7A31]">{part}</span>
        : part
    );
  });
}

// Renderers del markdown (no hay plugin de typography instalado, así que el
// estilo de cada nodo se define aquí de forma explícita).
const MD_COMPONENTS = {
  p:  ({ children }) => <p className="my-1 first:mt-0 last:mb-0">{highlightNumbers(children)}</p>,
  strong: ({ children }) => (
    <strong className="font-bold text-[#16294A]">{highlightNumbers(children)}</strong>
  ),
  em: ({ children }) => <em className="italic">{highlightNumbers(children)}</em>,
  ul: ({ children }) => <ul className="my-1.5 pl-4 list-disc marker:text-[#DD7A31] space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 pl-4 list-decimal marker:text-[#DD7A31] space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{highlightNumbers(children)}</li>,
  h1: ({ children }) => <h1 className="text-sm font-bold text-[#16294A] mt-2 mb-1 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold text-[#16294A] mt-2 mb-1 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[13px] font-semibold text-[#16294A] mt-2 mb-1 first:mt-0">{children}</h3>,
  a:  ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer"
       className="text-[#1361C5] underline underline-offset-2 hover:text-[#0D448A]">{children}</a>
  ),
  code: ({ children }) => (
    <code className="bg-white/70 text-[#0D448A] px-1 py-0.5 rounded text-[12px] font-mono">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-white/70 rounded-lg p-2 my-1.5 overflow-x-auto text-[12px]">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#DD7A31]/40 pl-2 my-1.5 text-[#1B2C4A]/80">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-[12px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left font-semibold text-[#16294A] bg-white/70 px-2 py-1 border-b border-[#16294A]/10">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1 border-b border-[#16294A]/5 align-top">{highlightNumbers(children)}</td>
  ),
  hr: () => <hr className="my-2 border-[#16294A]/10" />,
};

// ── Marca del bot (círculo naranja con la "A") ───────────────────────────────

function BotAvatar({ size = 40, className = '' }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 text-white font-bold select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background: `linear-gradient(145deg, ${ORANGE}, ${ORANGE_DARK})`,
      }}
    >
      A
    </div>
  );
}

// ── Indicador de escritura ────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex">
      <div
        className="rounded-r-xl px-4 py-3 max-w-[85%]"
        style={{ background: BOT_BG, borderLeft: `4px solid ${ORANGE}` }}
      >
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DD7A31] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#DD7A31] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#DD7A31] animate-bounce [animation-delay:300ms]" />
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
    <div className="mt-3 pt-3 border-t border-[#16294A]/10">
      <p className="text-xs font-semibold text-[#16294A] mb-2 flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill={ORANGE} className="w-4 h-4 shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 9v-3h-2v3H7l5 5 5-5h-3z"/>
        </svg>
        {report.title}
      </p>
      <div className="flex gap-2">
        <a
          href={`${base}/pdf`}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold bg-[#DD7A31] hover:bg-[#C4681E] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
            <path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.84v6h5.66V9h3.84L12 2z"/>
          </svg>
          Descargar PDF
        </a>
        <a
          href={`${base}/xlsx`}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#16294A]/15 text-[#16294A] text-xs font-semibold hover:border-[#DD7A31] hover:text-[#C4681E] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="#16a34a" className="w-3.5 h-3.5">
            <path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.84v6h5.66V9h3.84L12 2z"/>
          </svg>
          Descargar Excel
        </a>
      </div>
      <p className="text-[10px] text-[#16294A]/40 mt-1.5">El enlace expira en 1 hora</p>
    </div>
  );
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────

function MessageBubble({ message }) {
  const isUser  = message.role === 'user';
  const isError = message.role === 'error';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="rounded-2xl px-5 py-3 max-w-[80%] text-[13px] text-white leading-relaxed break-words"
          style={{ background: USER_BLUE }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex">
        <div
          className="rounded-r-xl px-4 py-3 max-w-[88%] text-[13px] text-red-700 leading-relaxed break-words"
          style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444' }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex">
      <div
        className="rounded-r-xl px-4 py-3 max-w-[88%] text-[13px] leading-relaxed break-words"
        style={{ background: BOT_BG, borderLeft: `4px solid ${ORANGE}`, color: NAVY_TEXT }}
      >
        <ReactMarkdown components={MD_COMPONENTS}>{message.content}</ReactMarkdown>
        {message.report && <ReportDownloadButtons report={message.report} />}
      </div>
    </div>
  );
}

// ── Panel del chat (redimensionable) ─────────────────────────────────────────

const MIN_W = 300;
const MAX_W = 760;
const MIN_H = 380;
const MAX_H = 900;
const DEFAULT_W = 400;
const DEFAULT_H = 560;

// Nuevo tamaño a partir del arrastre, respetando la dirección de crecimiento
// (dirX/dirY) y el espacio disponible hasta el borde de la pantalla.
function nextSize({ startX, startY, startW, startH, dirX, dirY, maxW, maxH }, clientX, clientY) {
  return {
    width:  Math.min(maxW, Math.max(MIN_W, startW + dirX * (clientX - startX))),
    height: Math.min(maxH, Math.max(MIN_H, startH + dirY * (clientY - startY))),
  };
}

function AquabotPanel({ state, anchorRight, anchorAbove, availW, availH }) {
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
      setSize(nextSize(resizing.current, e.clientX, e.clientY));
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
      setSize(nextSize(resizing.current, touch.clientX, touch.clientY));
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

  // La esquina del handle es siempre la opuesta al borde anclado del panel:
  // si el panel está pegado a la derecha, arrastrar hacia la izquierda lo
  // agranda hacia la izquierda (y no hacia el lado contrario del cursor).
  // Clases literales: Tailwind no genera utilidades armadas en runtime
  const handleCorner = anchorAbove
    ? (anchorRight ? 'top-1 left-1'    : 'top-1 right-1')
    : (anchorRight ? 'bottom-1 left-1' : 'bottom-1 right-1');
  const handleCursor = anchorAbove
    ? (anchorRight ? 'nw-resize' : 'ne-resize')
    : (anchorRight ? 'sw-resize' : 'se-resize');

  // Snapshot del anclaje y del espacio libre al empezar el arrastre: los
  // handlers viven en refs creadas al montar y no verían las props nuevas.
  const beginResize = (clientX, clientY) => ({
    startX: clientX,
    startY: clientY,
    startW: size.width,
    startH: size.height,
    dirX:   anchorRight ? -1 : 1,
    dirY:   anchorAbove ? -1 : 1,
    maxW:   Math.max(MIN_W, Math.min(MAX_W, availW)),
    maxH:   Math.max(MIN_H, Math.min(MAX_H, availH)),
  });

  const startResize = (/** @type {React.MouseEvent} */ e) => {
    e.preventDefault();
    resizing.current = beginResize(e.clientX, e.clientY);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = handleCursor;
    window.addEventListener('mousemove', onMouseMove.current);
    window.addEventListener('mouseup',   onMouseUp.current);
  };

  const startResizeTouch = (/** @type {React.TouchEvent} */ e) => {
    const touch = e.touches[0];
    resizing.current = beginResize(touch.clientX, touch.clientY);
    window.addEventListener('touchmove', onTouchMove.current, { passive: false });
    window.addEventListener('touchend',  onTouchEnd.current);
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-2xl border border-[#16294A]/10 overflow-hidden relative"
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
        style={{ cursor: handleCursor }}
        className={`absolute ${handleCorner} w-6 h-6 z-20 flex items-center justify-center rounded ${anchorAbove ? 'hover:bg-white/10' : 'hover:bg-[#16294A]/10'} transition-colors group select-none`}
        title="Arrastrar para redimensionar"
      >
        <svg width="10" height="10" viewBox="0 0 10 10"
             className={`opacity-40 group-hover:opacity-80 transition-opacity ${anchorAbove ? 'text-white' : 'text-[#16294A]'}`}>
          <circle cx="1.5" cy="1.5" r="1.2" fill="currentColor"/>
          <circle cx="5"   cy="1.5" r="1.2" fill="currentColor"/>
          <circle cx="1.5" cy="5"   r="1.2" fill="currentColor"/>
          <circle cx="5"   cy="5"   r="1.2" fill="currentColor"/>
          <circle cx="1.5" cy="8.5" r="1.2" fill="currentColor"/>
          <circle cx="5"   cy="8.5" r="1.2" fill="currentColor"/>
        </svg>
      </div>

      {/* Header */}
      <div
        className="flex items-center gap-3 pl-8 pr-4 py-3.5 text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${NAVY_SOFT}, ${NAVY})` }}
      >
        <BotAvatar size={40} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] leading-none tracking-tight">AquaBot</p>
          <p className="text-white/60 text-[11px] mt-1 flex items-center gap-1.5">
            <span className="relative flex w-2 h-2 shrink-0">
              <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
            </span>
            {unavailable ? 'sin conexión con la base del censo' : 'conectado a la base del censo'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Nueva conversación"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
          )}
          <button
            onClick={close}
            className="w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Cerrar chat"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 scroll-smooth min-h-0 bg-white">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-2">
            <BotAvatar size={56} className="shadow-lg" />
            <div>
              <p className="font-bold text-[#16294A] text-sm">Hola, soy AquaBot</p>
              <p className="text-[#16294A]/60 text-xs mt-1 leading-relaxed">
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
                  className="text-xs text-left rounded-xl px-3.5 py-2.5 text-[#16294A]/75 bg-[#E8EFF7]/60 border border-transparent hover:border-[#DD7A31] hover:bg-[#E8EFF7] hover:text-[#16294A] transition-colors w-full"
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
          <div className="text-center text-xs text-[#16294A]/40 py-2">
            AquaBot temporalmente no disponible
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-1 bg-white">
        <div className="flex items-end gap-2 bg-white rounded-full border border-[#16294A]/12 focus-within:border-[#DD7A31] transition-colors pl-5 pr-1.5 py-1.5 shadow-sm">
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
            placeholder="Escriba su pregunta…"
            className="flex-1 bg-transparent text-[13px] text-[#16294A] placeholder-[#16294A]/35 outline-none resize-none leading-relaxed disabled:opacity-50 min-h-[22px] max-h-[96px] overflow-y-auto self-center py-2"
            style={{ height: '22px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || unavailable}
            className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#C4681E] transition-colors"
            style={{ background: ORANGE }}
            aria-label="Enviar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M5 12h13M13 6l6 6-6 6"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-[#16294A]/25 mt-2">
          AquaBot · Impulsado por Claude (Anthropic)
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

  // Se fija el borde que el resize NO debe mover: con el FAB a la derecha se
  // ancla `right`, de modo que al ensanchar el panel crece hacia la izquierda.
  const panelX = alignRight
    ? { right: Math.max(8, vw - x - FAB_SIZE) }   // borde derecho alineado con el FAB
    : { left:  Math.max(8, Math.min(x, vw - MIN_W - 8)) }; // borde izquierdo alineado con el FAB

  const panelY = showAbove
    ? { bottom: vh - y + PANEL_GAP }
    : { top:    y + FAB_SIZE + PANEL_GAP };

  // Espacio libre hasta el borde de pantalla desde la esquina anclada
  const availW = alignRight ? x + FAB_SIZE - 8 : vw - x - 8;
  const availH = showAbove ? y - PANEL_GAP - 8 : vh - y - FAB_SIZE - PANEL_GAP - 8;

  // Clases literales (Tailwind no detecta nombres construidos en runtime)
  const panelOrigin = showAbove
    ? (alignRight ? 'origin-bottom-right' : 'origin-bottom-left')
    : (alignRight ? 'origin-top-right'    : 'origin-top-left');

  return (
    <>
      {/* Panel */}
      <div
        style={{ position: 'fixed', zIndex: 50, ...panelX, ...panelY }}
        className={`transition-all duration-300 ease-out ${panelOrigin} ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <AquabotPanel
          state={state}
          anchorRight={alignRight}
          anchorAbove={showAbove}
          availW={availW}
          availH={availH}
        />
      </div>

      {/* FAB arrastrable */}
      <div
        style={{ position: 'fixed', left: x, top: y, zIndex: 51, cursor: 'grab' }}
        onMouseDown={startDrag}
        onTouchStart={startDragTouch}
      >
        <button
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 select-none text-white font-bold text-xl hover:shadow-xl"
          style={{
            background: isOpen
              ? `linear-gradient(135deg, ${NAVY_SOFT}, ${NAVY})`
              : `linear-gradient(145deg, ${ORANGE}, ${ORANGE_DARK})`,
          }}
          aria-label={isOpen ? 'Cerrar AquaBot' : 'Abrir AquaBot'}
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
            {isOpen ? (
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            ) : (
              <span className="leading-none">A</span>
            )}
          </div>
        </button>
      </div>
    </>
  );
}
