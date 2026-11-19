// src/components/Login/components/SignInSection.jsx
import Logo from './../../../assets/images/logo_frog.png'
import PasswordField from './PasswordField'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

function SignInSection({
  showPassword,
  documentNumber,
  password,
  loading,
  error,
  setDocumentNumber,
  setPassword,
  togglePasswordVisibility,
  cedulaInputOnInput,
  cedulaInputOnKeyDown,
  submit
}) {

  return (
    <GlassCard className="w-full max-w-sm mx-4">
      <GlassCardHeader>
        <div className="flex flex-col items-center gap-4">
          <img src={Logo} width={100} height={100} className='shrink-0' alt='Logo' />
          <GlassCardTitle className="text-center text-2xl">Aquavisor</GlassCardTitle>
          <GlassCardDescription className="text-center text-white/90">
            Accede al portal de servicios de visualización de predios y creación de formularios.
          </GlassCardDescription>
        </div>
      </GlassCardHeader>

      <GlassCardContent>
        <form onSubmit={submit}>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="document" className="text-white">Cédula</Label>
              <Input
                id="document"
                type="text"
                placeholder="Digite su cédula"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                onInput={cedulaInputOnInput}
                onKeyDown={cedulaInputOnKeyDown}
                disabled={loading}
                className="bg-white/90 border-white/40 text-[#0a1628] placeholder:text-[#0a1628]/60 rounded-lg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pe-12 bg-white/90 border-white/40 text-[#0a1628] placeholder:text-[#0a1628]/60 rounded-lg"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-[#0a1628]/70 hover:text-[#0a1628] transition-colors"
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-300 font-medium" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
          </div>
        </form>
      </GlassCardContent>

      <GlassCardFooter className="flex-col gap-3 pt-2">
        <Button
          type="submit"
          onClick={submit}
          disabled={loading}
          className="w-full bg-[var(--blue-buttons)] hover:bg-[var(--blue-buttons)]/90 text-white text-base font-semibold rounded-xl py-6"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </GlassCardFooter>
    </GlassCard>
  )
}

export default SignInSection
