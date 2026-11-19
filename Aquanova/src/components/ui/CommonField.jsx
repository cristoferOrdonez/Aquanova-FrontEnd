import React from 'react'

export default function CommonField({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onInput,
  onKeyDown,
  disabled,
  name,
  id,
  className = '',
  labelClass = '',
}) {
  return (
    <div className="flex flex-col gap-2 group">
      {label && (
        <label htmlFor={id} className={`text-sm font-semibold transition-all duration-300 ease-in-out group-hover:scale-[1.07] ${labelClass}`}>
          {label}
        </label>
      )}

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
        onInput={onInput}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={`
          border border-[#0000004d]
          bg-[#EDEDED]
          rounded-[10px]
          p-3 text-left outline-none
              transition-all duration-300 ease-in-out
          group-hover:scale-[1.03]
          group-hover:translate-y-1
          focus:bg-[#f0f0f0]
          focus:border-[#1361C5]
          focus:ring-4 focus:ring-[#1361C5]/20
          focus:shadow-lg
          
          /* --- Clases para ocultar las flechas numéricas --- */
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
          
          ${className}
        `}
      />
    </div>
  )
}