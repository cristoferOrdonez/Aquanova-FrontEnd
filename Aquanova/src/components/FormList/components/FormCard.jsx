// src/components/FormList/components/FormCard.jsx
import { useState, useRef, useEffect } from 'react'
import defaultImage from './../../../assets/images/humedal.jpg'
import FormStateElement from './FormStateElement'
import { authService } from './../../../services/authService'
import { normalizeShareLink } from './../../../services/shareLinkService'
import { TrashIcon, PencilIcon, EyeIcon, ArrowDownTrayIcon, ShareIcon, UserCircleIcon, CheckIcon } from '@heroicons/react/24/outline'

function copyTextFallback(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }

  document.body.removeChild(textarea)
  return copied
}

function FormCard({
  form,
  onAnswer = () => {},
  onPreview = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onExport = (format) => {}, // Nueva prop
}) {
  const {
    title = 'Título del formulario',
    description = 'Sin descripción disponible.',
    metadata,
    is_active,
    neighborhoods = [],
    created_by,
    key: formKey,
    share_link: backendShareLink,
  } = form

  // Prioridad del link a copiar:
  // 1) `share_link` del backend (si viene)
  // 2) fallback armado con `formKey`
  // Si el usuario autenticado tiene código de referido, se agrega `?ref=...`
  // cuando el link aún no lo trae.
  const user = authService.getUser() || {}
  const referralCode = user.referral_code || user.referralCode || user.ref_code || null
  const baseShareLink = backendShareLink || (formKey ? `/formulario/${formKey}` : null)
  const share_link = normalizeShareLink(baseShareLink, { formKey, referralCode })

  // La imagen de portada viene de Cloudinary dentro de metadata.
  // Guarda defensiva: si metadata llega como string (MySQL JSON column)
  // lo parseamos aquí también antes de acceder a .imagen.
  const parsedMetadata = (() => {
    if (!metadata) return null;
    if (typeof metadata === 'object') return metadata;
    try { return JSON.parse(metadata); } catch { return null; }
  })();
  const imageUrl = parsedMetadata?.imagen || null

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const location = neighborhoods.map((n) => n.name).filter(Boolean)
  const locationLabel = location.length > 0 ? location.join(' | ') : 'Ubicación no definida'
  // El API puede retornar is_active como booleano (true/false) o entero MySQL (1/0)
  const activeLabel = Boolean(is_active) ? 'Activa' : 'Inactiva'

  const handleExportClick = (format) => {
    setIsMenuOpen(false);
    onExport(format);
  }

  const handleShare = async () => {
    if (!share_link) return

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(share_link)
      } else {
        const copiedWithFallback = copyTextFallback(share_link)
        if (!copiedWithFallback) throw new Error('No se pudo copiar usando fallback')
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copiando link de referido:', error)
    }
  }

  return (
    <article className="group flex flex-col w-full h-full bg-white border border-[var(--stroke-selectors-and-search-bars)] rounded-2xl font-work shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300 text-center relative">
      <div className="relative h-48 overflow-hidden bg-gray-100 rounded-t-2xl">
        <img src={imageUrl || defaultImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Portada: ${title}`} onError={(e) => { e.currentTarget.src = defaultImage }} loading="lazy" />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h2 className="font-work text-xl font-semibold text-gray-900 line-clamp-2 leading-tight mb-3" title={title}>
          {title}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <FormStateElement formState="state" label={activeLabel} />
          <FormStateElement formState="location" label={locationLabel} />
        </div>

        <p className="text-sm text-[var(--gray-subtitles)] line-clamp-3 mb-3 flex-1">
          {description}
        </p>

        {created_by && (
          <div className="flex items-center justify-center gap-1.5 mb-5 text-xs text-gray-400">
            <UserCircleIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">Creado por: <span className="font-medium text-gray-500">{created_by}</span></span>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-auto">
          <button type="button" onClick={onAnswer} aria-label="Contestar formulario" className="w-full py-2.5 rounded-full text-sm text-white font-semibold bg-[var(--blue-buttons)] hover:brightness-110 transition-all active:scale-95">
            Contestar
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 relative">
            <button type="button" onClick={onPreview} aria-label="Vista previa del formulario" className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-[var(--green-buttons)] hover:brightness-110 transition-colors flex-1 min-w-[120px]">
              <EyeIcon className="w-4 h-4" />
              <span>Vista previa</span>
            </button>

            <div className="flex flex-wrap justify-center gap-2 items-center">
              
              {/* Contenedor del Botón de Exportación con Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Exportar datos"
                  title="Exportar datos"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>

                {isMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 text-sm overflow-hidden animate-fade-in">
                    <button 
                      onClick={() => handleExportClick('xlsx')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Exportar Excel
                    </button>
                    <button 
                      onClick={() => handleExportClick('csv')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Exportar CSV
                    </button>
                    <button 
                      onClick={() => handleExportClick('json')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Exportar JSON
                    </button>
                  </div>
                )}
              </div>

              <button type="button" onClick={onEdit} className="p-2 rounded-full text-[var(--blue-buttons)] hover:bg-blue-100 transition-colors" aria-label="Editar formulario">
                <PencilIcon className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!share_link}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Compartir formulario"
                  title={copied ? '¡Enlace copiado!' : 'Copiar enlace para compartir'}
                >
                  {copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ShareIcon className="h-5 w-5" />}
                </button>
              </div>

              <button type="button" onClick={onDelete} className="p-2 rounded-full text-[var(--red-base)] hover:bg-red-100 transition-colors" aria-label="Eliminar formulario">
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