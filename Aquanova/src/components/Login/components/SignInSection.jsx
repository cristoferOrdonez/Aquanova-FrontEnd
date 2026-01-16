import CommonField from './../../ui/CommonField'
import Logo from './../../../assets/images/logo_frog.png'
import PasswordField from './PasswordField'

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
    <form
      className="py-6 px-12 bg-[var(--bg-main)] h-screen flex flex-col text-center"
      onSubmit={submit}
    >
      <div className = "text-sm flex flex-row justify-end gap-2 mb-6">
        <span className="text-[#4E5A68]">¿Tiene algún inconveniente?</span>
        <span className="text-[#0D448A] hover:font-semibold hover:underline">Soporte técnico</span>
      </div>
      <div className="flex flex-1 flex-col justify-evenly">
        <div className="flex flex-row justify-center gap-4">
          <img src={Logo}  width={150} height={150} className='shrink-0 ' alt='Logo' />
          <div className="max-w-xs flex flex-col justify-center gap-3">
            <span className="text-xl font-semibold">El nombre de nuestra GRAN APP</span>
            <span className="text-[#4E5A68] text-base">
              Accede al portal de servicios de visualización de predios y creación de formularios.
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-8">
          <CommonField
            label="Cédula:"
            placeholder="Digite su cédula"
            type="number"
            onInput={cedulaInputOnInput}
            onKeyDown={cedulaInputOnKeyDown}
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            disabled={loading}
          />

          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            showPassword={showPassword}
            onToggleVisibility={togglePasswordVisibility}
          />

          {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

          <button
            className="
              w-full bg-[var(--blue-buttons)]
              text-lg p-3 rounded-[10px] text-white font-semibold
              transition-all duration-300 ease-in-out
              hover:scale-[1.03]
              hover:opacity-95
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            type="submit"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <div className="flex flex-row justify-between w-full mt-3">
            <span className="text-sm text-[#0D448A] hover:font-semibold hover:underline cursor-pointer">Recuperar Contraseña o Usuario</span>
            <div className="flex flex-row gap-2">
              <span className="text-sm text-[#4E5A68]">¿Eres nuevo?</span>
              <span className="text-sm text-[#0D448A] hover:font-semibold hover:underline cursor-pointer">Regístrate</span>
            </div>
          </div>
        </div>  

      </div>
    </form>
  )
}

export default SignInSection