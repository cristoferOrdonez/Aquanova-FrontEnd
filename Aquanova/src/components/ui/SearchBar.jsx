import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SearchBar = ({
  placeholder = 'Buscar...',
  onSearch = () => {}, // Función del padre
  className = '',
  debounceDelay = 300,
  minQueryLength = 0,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  
  // REFS PARA EL CONTROL INTERNO
  const timeoutRef = useRef(null);          // Guarda el ID del temporizador
  const onSearchRef = useRef(onSearch);     // Guarda la función actual del padre
  const lastQueryRef = useRef('');          // Guarda lo último que se buscó para evitar repetidos

  // 1. Mantener onSearchRef actualizado siempre
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // 2. Limpieza al desmontar: Si el usuario se va de la página, cancelamos cualquier búsqueda pendiente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Lógica central de búsqueda (desacoplada de la renderización)
  const triggerSearch = (value, immediate = false) => {
    const trimmed = value.trim();

    // Validaciones
    if (trimmed.length > 0 && trimmed.length < minQueryLength) return;
    if (lastQueryRef.current === trimmed) return;

    // Actualizamos referencia
    lastQueryRef.current = trimmed;

    // Ejecutamos la búsqueda usando la Ref (seguro contra bucles)
    if (onSearchRef.current) {
      onSearchRef.current(trimmed);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // CANCELAR el temporizador anterior si el usuario sigue escribiendo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // CREAR nuevo temporizador (Debounce manual)
    timeoutRef.current = setTimeout(() => {
      triggerSearch(newValue);
    }, debounceDelay);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Si presiona Enter, CANCELAMOS el debounce pendiente y buscamos YA
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      triggerSearch(query, true);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Forzamos búsqueda vacía inmediata para resetear la lista
    if (lastQueryRef.current !== '') {
        lastQueryRef.current = ''; // Reseteamos el guardián
        if (onSearchRef.current) onSearchRef.current('');
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Barra de búsqueda"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}

          {isLoading ? (
            <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;