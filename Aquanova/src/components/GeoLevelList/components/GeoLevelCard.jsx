import React from 'react';
import defaultImage from '../../../assets/images/humedal.jpg';
import FormStateElement from '../../FormList/components/FormStateElement';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const GeoLevelCard = ({ neighborhood }) => {
  const { name, code, metadata, parent_id } = neighborhood;

  const type = metadata?.type || 'N/A';
  const description = metadata?.description || 'Sin descripción disponible.';
  const imageUrl = metadata?.images?.[0];

  const typeLabel = type === 'N/A' ? type : `${String(type).charAt(0).toUpperCase()}${String(type).slice(1)}`;

  const onEdit = () => {
    // Lógica de edición se añadirá más adelante
    console.log('Edit action triggered for:', name);
  };

  const onDelete = () => {
    // Lógica de eliminación se añadirá más adelante
    console.log('Delete action triggered for:', name);
  };

  const getTypeFormState = (type) => {
    if (type === 'localidad') {
      return 'warning'; // Orange
    }
    if (type === 'barrio') {
      return 'active'; // Green
    }
    return 'location'; // Default gray
  };

  return (
    <article
      className="
        group
        flex flex-col
        overflow-hidden
        w-full h-full
        bg-white
        border border-(--stroke-selectors-and-search-bars)
        rounded-2xl
        font-work
        shadow-md hover:shadow-xl
        transition-all hover:-translate-y-1 duration-300
        text-center
      "
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl || defaultImage}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={`Imagen de: ${name}`}
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h2 className="font-work text-xl font-semibold text-gray-900 line-clamp-2 leading-tight mb-3" title={name}>
          {name}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <FormStateElement formState={getTypeFormState(type)} label={typeLabel} />
          {type === 'barrio' && parent_id && (
            <FormStateElement formState="location" label={`Localidad: ${parent_id.substring(0, 8)}...`} />
          )}
        </div>

        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Código:</span> {code}
        </p>

        <p className="text-sm text-(--gray-subtitles) line-clamp-3 mb-6 flex-1">{description}</p>

        <div className="flex justify-center sm:justify-end gap-1 mt-auto pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-full text-(--blue-buttons) hover:bg-blue-100 transition-colors"
            aria-label="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-full text-(--red-base) hover:bg-red-100 transition-colors"
            aria-label="Eliminar"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default GeoLevelCard;