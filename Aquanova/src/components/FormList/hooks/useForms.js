// src/components/FormList/hooks/useForms.js
import { useState, useEffect, useCallback } from 'react';
import { formService } from '../../../services/formService';
import { submissionService } from '../../../services/submissionService';
import * as XLSX from 'xlsx'; // Importamos la librería

export function useForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formService.getAll();
      setForms(data.forms || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los formularios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      if (query) {
        const results = await formService.search(query);
        setForms(results.forms);
      } else {
        loadForms();
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar formularios.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este formulario?")) return;
    try {
      await formService.delete(id);
      setForms((prevForms) => prevForms.filter((f) => f.id !== id));
    } catch (err) {
      alert("Error al eliminar el formulario");
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

      // 1. EXPORTACIÓN JSON (Crudo)
      if (format === 'json') {
        const fileContent = JSON.stringify(data, null, 2);
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
            row[questionKey] = answer; 
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
    forms, loading, error, reload: loadForms, handleSearch, handleDelete, handleExport
  };
}