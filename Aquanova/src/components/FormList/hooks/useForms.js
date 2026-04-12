// src/components/FormList/hooks/useForms.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { formService } from '../../../services/formService';
import { submissionService } from '../../../services/submissionService';
import * as XLSX from 'xlsx'; // Importamos la librería

export const FORM_FILTER_OPTIONS = ['Todas', 'Activas', 'Inactivas'];

export function useForms() {
  const [allForms, setAllForms] = useState([]);
  /**
   * searchResults: null → no hay búsqueda activa (se usa allForms como base).
   *                array → resultados de la última búsqueda por API.
   */
  const [searchResults, setSearchResults] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Activas');

  // Ref para acceder siempre al activeFilter más reciente dentro de callbacks async
  const activeFilterRef = useRef('Activas');
  activeFilterRef.current = activeFilter;

  /** Aplica el filtro de estado sobre un array de formularios */
  const applyFilter = useCallback((list, filter) => {
    if (!filter || filter === 'Todas') return list;
    if (filter === 'Activas') return list.filter((f) => f.is_active);
    if (filter === 'Inactivas') return list.filter((f) => !f.is_active);
    return list;
  }, []);

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formService.getAll();
      const fetched = data.forms || [];
      setAllForms(fetched);
      setSearchResults(null);
      setForms(applyFilter(fetched, activeFilterRef.current));
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los formularios.');
    } finally {
      setLoading(false);
    }
  }, [applyFilter]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  /**
   * Búsqueda local sobre allForms para garantizar que todos los campos
   * (metadata, imagen, neighborhoods) estén siempre disponibles.
   * Filtra por title, description y nombre de barrio.
   */
  const handleSearch = useCallback((query) => {
    if (!query) {
      setSearchResults(null);
      setForms(applyFilter(allForms, activeFilterRef.current));
      return;
    }
    const lower = query.toLowerCase();
    const filtered = allForms.filter((form) =>
      (form.title || '').toLowerCase().includes(lower) ||
      (form.description || '').toLowerCase().includes(lower) ||
      (form.neighborhoods || []).some((n) =>
        (n.name || '').toLowerCase().includes(lower)
      )
    );
    setSearchResults(filtered);
    setForms(applyFilter(filtered, activeFilterRef.current));
  }, [allForms, applyFilter]);

  const handleFilter = useCallback((filter) => {
    setActiveFilter(filter);
    activeFilterRef.current = filter;
    // Base correcta: si hay búsqueda activa, filtrar sobre sus resultados;
    // si no, filtrar sobre la lista completa.
    const base = searchResults !== null ? searchResults : allForms;
    setForms(applyFilter(base, filter));
  }, [allForms, searchResults, applyFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm(
      '¿Estás seguro de que deseas desactivar este formulario?\n\n' +
      'El formulario no será eliminado, solo quedará inactivo y no aparecerá para los usuarios.'
    )) return;
    try {
      await formService.delete(id);
      // Soft delete: marcar como inactivo en las tres fuentes de verdad
      const updater = (list) =>
        list.map((f) => (f.id === id ? { ...f, is_active: false } : f));
      setAllForms(updater);
      setSearchResults((prev) => (prev !== null ? updater(prev) : null));
      setForms((prev) => applyFilter(updater(prev), activeFilterRef.current));
    } catch (err) {
      alert('Error al desactivar el formulario');
    }
  };

  // NUEVA LÓGICA DE EXPORTACIÓN SOPORTANDO JSON, CSV Y XLSX
  const handleExport = async (formId, format, formTitle) => {
    try {
      const response = await submissionService.getSubmissionsByFormId(formId);
      const data = response.data || [];

      if (data.length === 0) {
        alert("No hay respuestas para exportar en este formulario.");
        return;
      }

      const safeTitle = formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      // Encontrar el formulario en allForms para obtener el schema
      const form = allForms.find(f => f.id === formId);
      const schema = form?.metadata?.schema || [];
      const fieldMap = {};
      schema.forEach(field => {
        fieldMap[field.key || field.id] = field.label || field.title || field.key || field.id;
      });

      // 1. EXPORTACIÓN JSON
      if (format === 'json') {
        const transformedData = data.map(sub => {
          let responsesObj = typeof sub.responses === 'string' ? JSON.parse(sub.responses) : sub.responses;
          let newResponses = {};
          if (responsesObj) {
             Object.keys(responsesObj).forEach(key => {
               const qLabel = fieldMap[key] || key;
               newResponses[qLabel] = responsesObj[key];
             });
          }
          return { ...sub, responses: newResponses };
        });

        const fileContent = JSON.stringify(transformedData, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `export_${safeTitle}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // 2. PREPARAR DATOS PARA XLSX / CSV (Aplanar JSON)
      const flatData = data.map(sub => {
        // Datos base de la tabla submissions (¡Ahora más completos!)
        const row = {
          'ID Respuesta': sub.id,
          'Fecha Creación': new Date(sub.created_at).toLocaleString(),
          'Recolectado Por': sub.collected_by || 'Anónimo', // Nombre del usuario
          'Barrio': sub.neighborhood || 'Desconocido',      // Nombre del barrio
          'Estado': sub.status,
          'Latitud': sub.location_lat || 'N/A',
          'Longitud': sub.location_lng || 'N/A',
        };

        // Extraer dinámicamente cada pregunta del JSON responses
        let responsesObj = typeof sub.responses === 'string' ? JSON.parse(sub.responses) : sub.responses;
        
        if (responsesObj) {
          Object.keys(responsesObj).forEach(questionKey => {
            let answer = responsesObj[questionKey];
            if (typeof answer === 'object' && answer !== null) {
              answer = JSON.stringify(answer);
            }
            const qLabel = fieldMap[questionKey] || questionKey;
            row[qLabel] = answer; 
          });
        }

        return row;
      });

      // Crear hoja de cálculo con SheetJS
      const worksheet = XLSX.utils.json_to_sheet(flatData);

      // 3. EXPORTAR XLSX
      if (format === 'xlsx') {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Respuestas");
        XLSX.writeFile(workbook, `export_${safeTitle}.xlsx`);
      } 
      
      // 4. EXPORTAR CSV
      else if (format === 'csv') {
        // SheetJS convierte la hoja a CSV perfectamente, manejando comas y saltos de línea en las respuestas
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        // Agregamos BOM (\uFEFF) para que Excel reconozca las tildes y caracteres especiales (UTF-8)
        const blob = new Blob(["\uFEFF" + csvOutput], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `export_${safeTitle}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error("Error exportando:", error);
      alert("Hubo un error al exportar los datos.");
    }
  };

  return {
    forms, loading, error, reload: loadForms,
    handleSearch, handleDelete, handleExport,
    activeFilter, handleFilter,
  };
}