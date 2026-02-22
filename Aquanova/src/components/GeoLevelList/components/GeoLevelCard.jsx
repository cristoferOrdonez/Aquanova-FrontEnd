import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultImage from '../../../assets/images/humedal.jpg';
import FormStateElement from '../../FormList/components/FormStateElement';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { GEOLEVEL_CONFIG } from '../config/geoLevelListConfig';

const GeoLevelCard = ({ neighborhood }) => {
  const { name, code, metadata, parent_id, parent_name, is_active } = neighborhood;
  const navigate = useNavigate();

  // `type` viene como campo top-level desde getById; en listados se infiere
  const rawType = neighborhood.type ?? metadata?.type ?? (parent_id ? 'Barrio' : 'Localidad');
  const type    = String(rawType).toLowerCase(); // normalizar a minúsculas internamente

  const description = metadata?.descripcion ?? metadata?.description ?? 'Sin descripción disponible.';
  const imageUrl    = metadata?.imagen ?? metadata?.images?.[0];
  // Maneja boolean (true/false) e integer MySQL (1/0)
  const active      = Boolean(is_active);

  const typeLabel = `${String(rawType).charAt(0).toUpperCase()}${String(rawType).slice(1).toLowerCase()}`;

  const onEdit = () => {
    if (neighborhood?.id) {
      navigate(GEOLEVEL_CONFIG.ROUTES.EDIT(neighborhood.id));
    }
  };

  const onDelete = () => {
    console.log('Delete action triggered for:', name);
  };

  const getTypeFormState = (t) => {
    const lower = String(t).toLowerCase();
    if (lower === 'localidad') return 'warning';
    if (lower === 'barrio')    return 'active';
    if (lower === 'ciudad')    return 'location';
    return 'location';
  };

  return (
    <article
      className={`
        group
        flex flex-col
        overflow-hidden
        w-full h-full
        bg-white
        border rounded-2xl font-work shadow-md
        hover:shadow-xl transition-all hover:-translate-y-1 duration-300
        text-center
        ${active
          ? 'border-(--stroke-selectors-and-search-bars)'
          : 'border-red-200 opacity-75'}
      `}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl || defaultImage}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={`Imagen de: ${name}`}
          onError={(e) => { e.currentTarget.src = defaultImage; }}
          loading="lazy"
        />
        {/* Badge activo / inactivo sobre la imagen */}
        <span
          className={`
            absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow
            ${active
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'}
          `}
        >
          {active ? 'Activo' : 'Inactivo'}
        </span>
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h2
          className="font-work text-xl font-semibold text-gray-900 line-clamp-2 leading-tight mb-3"
          title={name}
        >
          {name}
        </h2>

        {/* Badges de tipo + estado + padre */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {/* Tipo (barrio / localidad) */}
          <FormStateElement formState={getTypeFormState(type)} label={typeLabel} />

          {/* Estado activo / inactivo */}
          <FormStateElement
            formState={active ? 'active' : 'inactive'}
            label={active ? 'Activo' : 'Inactivo'}
          />

          {/* Padre: sólo si tiene parent_id */}
          {parent_id && (
            <FormStateElement
              formState="location"
              label={parent_name ? `↳ ${parent_name}` : `ID: ${String(parent_id).substring(0, 8)}…`}
            />
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