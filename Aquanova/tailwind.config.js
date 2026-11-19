/**
 * Tailwind CSS v4.
 * Los design tokens (colores, tipografías, breakpoints) se declaran en
 * `src/index.css` mediante `@theme` y `:root`, que es la vía idiomática en v4.
 * Este archivo sólo deja constancia explícita de las rutas de contenido como
 * red de seguridad; la detección automática del plugin @tailwindcss/vite ya
 * las cubre.
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
}
