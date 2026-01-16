import { useId } from 'react'

export default function PasswordField({
  label = 'Contraseña:',
  value,
  onChange,
  disabled = false,
  showPassword = false,
  onToggleVisibility,
}) {
  const id = useId()

  return (
    <div className="flex flex-col group">
      <label
        htmlFor={id}
        className="
          text-sm font-semibold
          transition-all duration-300 ease-in-out
          group-hover:scale-[1.07]
          group-hover-:translate-y-1
        "
      >
        {label}
      </label>

      <div
        className="
          flex flex-row items-center
          border border-[#0000004d]
          bg-[#EDEDED]
          rounded-[10px]
          overflow-hidden
          transition-all duration-300 ease-in-out
          group-hover:scale-[1.03]
          group-hover:translate-y-1
          focus-within:bg-[#f0f0f0]
          focus-within:border-[#1361C5]
          focus-within:ring-4 focus-within:ring-[#1361C5]/20
          focus-within:shadow-lg
        "
      >
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder="Digite su contraseña"
          className="
            flex-1 bg-transparent text-center p-2 outline-none
            text-gray-700 placeholder-gray-500
          "
          value={value}
          onChange={onChange}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          className="
            bg-[#EDE5E5] px-3 h-10 flex items-center justify-center
            text-[#0000004d] hover:text-[#1361C5]
            transition-colors cursor-pointer outline-none
            border border-[#0000004d] border-y-0 border-r-0
            hover:bg-[#e7dfdf]
          "
          disabled={disabled}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00000082" width="24" height="24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00000082" width="24" height="24">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}