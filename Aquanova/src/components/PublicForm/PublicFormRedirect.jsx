import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { formService } from '../../services/formService';

/**
 * Ruta de compatibilidad para QR ya distribuidos.
 *
 * Los QR antiguos codifican `/formulario?ref=CODE` (sin slug).
 * Este componente resuelve la campaña activa más reciente y redirige a
 * `/formulario/{slug}?ref=CODE`, conservando el query param de referido.
 *
 * Si no hay formularios activos, muestra un mensaje informativo.
 */
export default function PublicFormRedirect() {
  const [searchParams] = useSearchParams();
  const [targetSlug, setTargetSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    formService.getAll()
      .then(res => {
        const forms = (res?.forms ?? []).filter(f => f.is_active && f.key);
        // Formulario activo más reciente con slug publicado
        if (forms.length > 0) {
          setTargetSlug(forms[0].key);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Redireccionando…</p>
      </div>
    );
  }

  if (targetSlug) {
    const ref = searchParams.get('ref');
    const target = `/formulario/${encodeURIComponent(targetSlug)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
    return <Navigate to={target} replace />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-gray-600 text-lg">No hay formularios activos disponibles en este momento.</p>
      <p className="text-gray-400 text-sm">Si recibiste un código QR de invitación, es posible que la campaña haya finalizado.</p>
    </div>
  );
}
