// src/components/Login/Index.jsx
import LoginImg from './../../assets/images/login-background.webp'
import Logo from './../../assets/images/logo_aquanova.png'
import SignInSection from './components/SignInSection'
import { useLoginForm } from './hooks/useLoginForm'

function Index() {
  const loginForm = useLoginForm()

  return (
    <div className="w-screen h-screen flex font-sans bg-[var(--surface-app)] overflow-hidden">
      {/* ── Panel de marca (split izquierdo) — sólo escritorio ── */}
      <aside className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] shrink-0 overflow-hidden">
        {/* Fotografía territorial de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${LoginImg})` }}
          aria-hidden="true"
        />
        {/* Overlay degradado Azul Abisal → Verde Musgo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(11,57,84,0.94) 0%, rgba(11,57,84,0.82) 45%, rgba(107,124,92,0.80) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Contenido de marca */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="Aquanova"
              className="h-12 w-12 rounded-full object-cover bg-white/95 ring-2 ring-white/50 shadow-lg p-0.5"
            />
            <span className="font-display font-extrabold text-2xl tracking-tight">Aquanova</span>
          </div>

          <div className="flex flex-col items-start gap-6 max-w-md">
            <img
              src={Logo}
              alt="Mascota Aquanova"
              className="h-40 w-40 rounded-full object-cover bg-white/95 ring-4 ring-white/40 shadow-2xl p-1"
            />
            <h1 className="font-display font-extrabold text-4xl xl:text-5xl leading-tight">
              Inteligencia territorial e hídrica
            </h1>
            <p className="text-white/85 text-lg leading-relaxed">
              Explora, censa y analiza el territorio con la claridad de Aquanova,
              diseñada para el trabajo en campo.
            </p>
          </div>

          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Aquanova · Plataforma de gestión territorial
          </p>
        </div>
      </aside>

      {/* ── Panel del formulario (split derecho / tarjeta centrada en móvil) ── */}
      <main className="relative flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        {/* Fondo sutil para móvil/tablet (sin el panel de marca a la izquierda) */}
        <div
          className="absolute inset-0 lg:hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${LoginImg})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(11,57,84,0.92) 0%, rgba(107,124,92,0.80) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-md">
          <SignInSection {...loginForm} />
        </div>
      </main>
    </div>
  )
}

export default Index
