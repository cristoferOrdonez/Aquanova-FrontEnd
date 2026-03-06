import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultImage from '../../../assets/images/humedal.jpg';
import FormStateElement from '../../FormList/components/FormStateElement';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { GEOLEVEL_CONFIG } from '../config/geoLevelListConfig';
import { neighborhoodService } from '../../../services/neighborhoodService';
import { useGeoLevelListContext } from '../hooks/useGeoLevelListContext';

const GeoLevelCard = ({ neighborhood }) => {
  const { name, code, metadata, parent_id, parent_name, is_active } = neighborhood;
  const navigate = useNavigate();
  const { refetch } = useGeoLevelListContext();

  // `type` viene del servicio (inferido de parent_id en listado, o del backend en detalle)
  const rawType = neighborhood.type ?? (parent_id ? 'Barrio' : 'Localidad');
  const type = String(rawType).toLowerCase(); // normalizar a minúsculas internamente

  const description = metadata?.descripcion ?? 'Sin descripción disponible.';
  // metadata.imagen es URL de Cloudinary (res.cloudinary.com) según documentación del endpoint
  const imageUrl = metadata?.imagen;
  // Maneja boolean (true/false) e integer MySQL (1/0)
  const active = Boolean(is_active);

  const typeLabel = `${String(rawType).charAt(0).toUpperCase()}${String(rawType).slice(1).toLowerCase()}`;

  const onEdit = () => {
    if (neighborhood?.id) {
      navigate(GEOLEVEL_CONFIG.ROUTES.EDIT(neighborhood.id));
    }
  };

  /**
   * Elimina el barrio/localidad tras confirmación del usuario.
   * La imagen asociada se elimina automáticamente de Cloudinary.
   * ⚠️ No se puede eliminar si tiene sub-barrios (hijos) asociados.
   */
  const onDelete = async () => {
    if (!neighborhood?.id) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${name}"?\nEsta acción no se puede deshacer y la imagen se eliminará de Cloudinary.`
    );
    if (!confirmed) return;

    try {
      const res = await neighborhoodService.delete(neighborhood.id);
      const msg = res?.message || 'Barrio eliminado exitosamente';
      alert(msg);
      // Refrescar la lista
      if (refetch) refetch();
    } catch (err) {
      const errorMsg = err?.message || err?.data?.message || 'Error al eliminar';
      alert(errorMsg);
    }
  };

  const getTypeFormState = (t) => {
    const lower = String(t).toLowerCase();
    if (lower === 'localidad') return 'warning';
    if (lower === 'barrio') return 'active';
    if (lower === 'ciudad') return 'location';
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

        <div className="flex-1 mb-6 h-[60px]">
          <p className="text-sm text-[var(--gray-subtitles)] line-clamp-3 overflow-hidden text-ellipsis" title={description}>
            {description || 'Sin descripción'}
          </p>
        </div>

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