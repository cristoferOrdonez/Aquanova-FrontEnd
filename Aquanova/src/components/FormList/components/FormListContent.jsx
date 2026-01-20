import React from 'react';
import { useFormListContext } from '../hooks/useFormListContext';
import FormCard from './FormCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import SearchBar from '../../ui/SearchBar';
import { useNavigate } from 'react-router-dom';

/**
 * Componente para renderizar el estado del contenido de la lista de formularios.
 * Maneja los estados de carga, error, vacío y la lista de formularios.
 */
const ContentRenderer = ({ loading, error, forms, reload, handleDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-lg text-[var(--blue-buttons)] font-semibold animate-pulse">
          Cargando formularios...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>{error}</p>
        <button onClick={reload} className="text-blue-500 underline mt-2">Intentar de nuevo</button>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <p className="col-span-full text-center text-gray-500 py-10">
        No hay formularios creados aún.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
      {forms.map((form) => (
        <FormCard
          key={form.id || form._id}
          form={form}
          onDelete={() => handleDelete(form.id || form._id)}
          onEdit={() => console.log('Ir a editar', form.id)}
          onAnswer={() => console.log('Ir a responder', form.id)}
          onPreview={() => console.log('Vista previa', form.id)}
        />
      ))}
    </div>
  );
};

function FormListContent() {
  const { forms, loading, error, reload, handleSearch, handleDelete } = useFormListContext();
  const navigate = useNavigate();

  return (
    <div className="p-4 m-7">
      <div className="flex flex-row flex-1 items-center gap-5 mb-5">
        <SearchBar 
            onSearch={handleSearch} 
            isLoading={loading}
        />

        <button
          type="button"
          onClick={() => navigate('/form_creation')}
          className="flex flex-row gap-3 whitespace-nowrap bg-[var(--blue-buttons)] rounded-4xl font-work text-white justify-center items-center p-3 hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="h-10 w-10"/>
          Nueva campaña
        </button>
      </div>

      <div className="content-area">
        <ContentRenderer {...{ loading, error, forms, reload, handleDelete }} />
      </div>
    </div>
  );
}

export default FormListContent;
