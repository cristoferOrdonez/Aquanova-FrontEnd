import defaultImage from './../../../assets/images/humedal.jpg'
import FormStateElement from './FormStateElement'
import { TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline'

function FormCard({
  title = 'Título del formulario',
  description = 'Sin descripción disponible.',
  imageUrl,
  active = false,
  location = [],
  onAnswer,
  onPreview,
  onEdit,
  onDelete,
}) {
  const locationLabel =
    Array.isArray(location) && location.length > 0
      ? location.join(' | ')
      : 'Ubicación no definida'

  const activeLabel = active === true ? 'Activa' : active === false ? 'Inactiva' : String(active ?? 'Estado')

  return (
    <article
      className="
        group
        flex flex-col
        overflow-hidden
        w-full h-full
        bg-white
        border border-[var(--stroke-selectors-and-search-bars)]
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
          alt={`Portada: ${title}`}
          onError={(e) => {
            e.currentTarget.src = defaultImage
          }}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h2
          className="font-work text-xl font-semibold text-gray-900 line-clamp-2 leading-tight mb-3"
          title={title}
        >
          {title}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <FormStateElement formState="state" label={activeLabel} />
          <FormStateElement formState="location" label={locationLabel} />
        </div>

        <p className="text-sm text-[var(--gray-subtitles)] line-clamp-3 mb-6 flex-1">
          {description}
        </p>

        <div className="flex flex-col gap-3 mt-auto">
          <button
            type="button"
            onClick={onAnswer}
            aria-label="Contestar formulario"
            className="w-full py-2.5 rounded-full text-sm text-white font-semibold bg-[var(--blue-buttons)] hover:brightness-110 transition-all active:scale-95"
          >
            Contestar
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onPreview}
              aria-label="Vista previa del formulario"
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-[var(--green-buttons)] hover:brightness-110 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              <span>Vista previa</span>
            </button>

            <div className="flex justify-center sm:justify-end gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="p-2 rounded-full text-[var(--blue-buttons)] hover:bg-blue-100 transition-colors"
                aria-label="Editar formulario"
              >
                <PencilIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-full text-[var(--red-base)] hover:bg-red-100 transition-colors"
                aria-label="Eliminar formulario"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default FormCard