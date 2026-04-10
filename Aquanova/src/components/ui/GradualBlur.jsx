import React from 'react';

/**
 * GradualBlur - Efecto de difuminado gradual en los bordes
 * Se usa típicamente en la parte superior de contenedores con scroll
 * para crear una transición visual suave.
 *
 * @param {string} position - 'top' | 'bottom' (default: 'top')
 * @param {string} className - Clases adicionales
 */
function GradualBlur({ position = 'top', className = '' }) {
  const isTop = position === 'top';

  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 z-10 h-24 ${
        isTop ? 'top-0' : 'bottom-0'
      } ${className}`}
      aria-hidden="true"
    >
      {/* Capas de blur graduales */}
      <div
        className={`absolute inset-0 ${
          isTop
            ? 'bg-gradient-to-b from-slate-100 via-slate-100/80 to-transparent'
            : 'bg-gradient-to-t from-slate-100 via-slate-100/80 to-transparent'
        }`}
      />
      <div
        className={`absolute inset-0 backdrop-blur-[1px] ${
          isTop
            ? '[mask-image:linear-gradient(to_bottom,black_0%,black_20%,transparent_100%)]'
            : '[mask-image:linear-gradient(to_top,black_0%,black_20%,transparent_100%)]'
        }`}
      />
      <div
        className={`absolute inset-0 backdrop-blur-[2px] ${
          isTop
            ? '[mask-image:linear-gradient(to_bottom,black_0%,transparent_50%)]'
            : '[mask-image:linear-gradient(to_top,black_0%,transparent_50%)]'
        }`}
      />
      <div
        className={`absolute inset-0 backdrop-blur-[4px] ${
          isTop
            ? '[mask-image:linear-gradient(to_bottom,black_0%,transparent_30%)]'
            : '[mask-image:linear-gradient(to_top,black_0%,transparent_30%)]'
        }`}
      />
    </div>
  );
}

export default GradualBlur;
