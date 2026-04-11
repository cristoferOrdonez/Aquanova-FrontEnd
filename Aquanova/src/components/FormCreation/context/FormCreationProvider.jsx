import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  QuestionListContext,
  EditingSectionContext,
  OptionsListContext,
  TypeSelectorContext,
  CreationControlsContext,
  HeaderContext,
  NeighborhoodSelectorContext,
  EditModeContext,
} from './FormCreationContext';

import { useQuestionList } from '../hooks/useQuestionList';
import { useEditingSection } from '../hooks/useEditingSection';
import { useOptionsList } from '../hooks/useOptionsList';
import { useTypeSelector } from '../hooks/useTypeSelector';
import { useCreationControls } from '../hooks/useCreationControls';
import { useHeaderControls } from '../hooks/useHeaderControls';
import { useNeighborhoodSelector } from '../hooks/useNeighborhoodSelector';
import { formService } from '../../../services/formService';
import { neighborhoodService } from '../../../services/neighborhoodService';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';

// Mapeo de etiquetas en español (UI) a tipos estandarizados (backend)
const LABEL_TO_TYPE = {
  'Opción multiple':             'radio',
  'Casillas de verificación':    'checkbox',
  'Lista desplegable':           'select',
  'Respuesta textual':           'textarea',
  'Numérico':                    'number',
  'Fecha':                       'date',
  'Cargar imagen':               'file',
  'Sólo texto (sin respuestas)': 'info',
  'Selector de Lote':            'lot_selector',
};

// Mapeo inverso: tipos estandarizados (backend) → etiquetas en español (UI)
const TYPE_TO_LABEL = {
  'radio':        'Opción multiple',
  'checkbox':     'Casillas de verificación',
  'select':       'Lista desplegable',
  'textarea':     'Respuesta textual',
  'number':       'Numérico',
  'date':         'Fecha',
  'file':         'Cargar imagen',
  'info':         'Sólo texto (sin respuestas)',
  'lot_selector': 'Selector de Lote',
};

/**
 * Provider que encapsula los múltiples contexts de FormCreation
 * Cada contexto proviene de un hook especializado (separación de responsabilidades)
 * Soporta modo creación (sin :id) y modo edición (con :id en la ruta)
 */
export function FormCreationProvider({ children }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Estado de carga para modo edición
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [editLoadError, setEditLoadError] = useState(null);

  const questionList = useQuestionList();
  const editingSection = useEditingSection();
  const optionsList = useOptionsList();
  const typeSelector = useTypeSelector();
  const creationControls = useCreationControls();
  const headerControls = useHeaderControls();
  const neighborhoodSelector = useNeighborhoodSelector();

  // ── Cargar datos existentes cuando estamos en modo edición ──
  useEffect(() => {
    let mounted = true;

    const loadEditData = async () => {
      if (!isEditMode || !id) return;
      setIsLoadingEdit(true);
      setEditLoadError(null);

      try {
        const response = await formService.getById(id);
        const formData = response?.data ?? response;

        if (!mounted) return;

        // Pre-poblar título y descripción
        headerControls.setTitle(formData.title || FORM_CREATION_CONFIG.defaultFormTitle);
        headerControls.setDescription(formData.description || '');

        // Pre-poblar estado activo/publicado
        if (formData.is_active !== undefined) {
          headerControls.setIsPublishOn(formData.is_active === 1 || formData.is_active === true);
        }

        // Pre-poblar el schema de preguntas
        // El schema puede venir como array (JSON nativo de MySQL) o como string JSON
        let schema = formData.schema;
        if (typeof schema === 'string') {
          try { schema = JSON.parse(schema); } catch { schema = []; }
        }

        if (Array.isArray(schema) && schema.length > 0) {
          const parsedQuestions = schema
            .filter(item => item.type !== 'image') // compatibilidad con esquemas legacy
            .map((item, idx) => ({
              id: item.id || `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              key: item.key ?? String(item.id ?? `field_${idx}`),
              title: item.label || item.title || FORM_CREATION_CONFIG.defaultQuestionLabel,
              label: item.label || item.title || FORM_CREATION_CONFIG.defaultQuestionLabel,
              // Convertir tipo estandarizado (inglés) a etiqueta española para la UI
              type: TYPE_TO_LABEL[item.type] ?? item.type ?? FORM_CREATION_CONFIG.defaultType,
              required: !!item.required,
              options: Array.isArray(item.options)
                ? item.options.map((o, oi) => {
                    if (o !== null && typeof o === 'object') {
                      return { id: o.id ?? (Date.now() + oi), value: o.value ?? o.label ?? '' };
                    }
                    return { id: Date.now() + oi, value: String(o ?? '') };
                  })
                : [],
            }));

          questionList.setQuestions(parsedQuestions);

          // En modo edición, desactivar el panel de creación para que las preguntas
          // cargadas se muestren sin blur/opacidad
          creationControls.setIsCreationOn(false);
        }

        // Pre-poblar la imagen desde metadata (Cloudinary)
        if (formData.metadata?.imagen) {
          headerControls.setImagePreview(formData.metadata.imagen);
        }

        // Pre-poblar el barrio (neighborhood)
        // El backend envía neighborhood_id (string UUID), hacemos request para obtener el nombre.
        // neighborhoodService.getById() ya retorna el nodo normalizado con jerarquía:
        //   { id, name, label, code, type, parent_id, is_active, metadata, created_at, parent }
        if (formData.neighborhood_id) {
          try {
            const nbNode = await neighborhoodService.getById(formData.neighborhood_id);
            neighborhoodSelector.setSelectedOption({
              id: nbNode.id ?? String(formData.neighborhood_id),
              label: nbNode.label ?? nbNode.name ?? 'Barrio',
            });
          } catch (nbErr) {
            console.warn('No se pudo cargar el nombre del barrio:', nbErr);
            neighborhoodSelector.setSelectedOption({
              id: String(formData.neighborhood_id),
              label: 'Barrio',
            });
          }
        }
      } catch (err) {
        console.error('Error cargando formulario para edición:', err);
        if (mounted) setEditLoadError('No se pudo cargar la información del formulario.');
      } finally {
        if (mounted) setIsLoadingEdit(false);
      }
    };

    loadEditData();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // ── Función para CREAR un formulario (modo creación) ──
  const createForm = async () => {
    const title = headerControls.title || FORM_CREATION_CONFIG.defaultFormTitle;
    const description = headerControls.description || '';
    const neighborhood_id = neighborhoodSelector.selectedOption && neighborhoodSelector.selectedOption.id;

    if (!neighborhood_id) {
      throw new Error('Debe seleccionar un barrio antes de crear el formulario');
    }

    // Construir schema estandarizado (key/label/type en inglés/options como strings)
    const questions = questionList.questions || [];
    const schema = questions.map(q => ({
      key: q.key || String(q.id || (Date.now() + Math.random())),
      label: q.label ?? q.title,
      type: LABEL_TO_TYPE[q.type] ?? q.type,
      required: !!q.required,
      options: Array.isArray(q.options) ? q.options.map(o => o.value ?? o) : [],
    }));

    // Usar FormData (multipart/form-data) para que el backend pueda subir la imagen a Cloudinary
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('is_active', 'true');
    formData.append('neighborhood_id', neighborhood_id);
    formData.append('schema', JSON.stringify(schema));

    // Incluir imagen solo si el usuario seleccionó un archivo
    if (headerControls.imageFile) {
      formData.append('imagen', headerControls.imageFile);
    }

    const res = await formService.create(formData);
    return res;
  };

  // ── Función para ACTUALIZAR un formulario (modo edición) ──
  const updateForm = async () => {
    if (!id) throw new Error('No hay ID de formulario para actualizar');

    const title = headerControls.title || FORM_CREATION_CONFIG.defaultFormTitle;
    const description = headerControls.description || '';
    const is_active = headerControls.isPublishOn;

    // Construir schema estandarizado (key/label/type en inglés/options como strings)
    const questions = questionList.questions || [];
    const schema = questions.map(q => ({
      key: q.key || String(q.id || (Date.now() + Math.random())),
      label: q.label ?? q.title,
      type: LABEL_TO_TYPE[q.type] ?? q.type,
      required: !!q.required,
      options: Array.isArray(q.options) ? q.options.map(o => o.value ?? o) : [],
    }));

    // Construir FormData (multipart/form-data requerido por el endpoint)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('is_active', String(is_active)); // "true" o "false"
    formData.append('schema', JSON.stringify(schema));

    // Incluir neighborhood_id si el usuario seleccionó un barrio
    const neighborhood_id = neighborhoodSelector.selectedOption?.id;
    if (neighborhood_id) {
      formData.append('neighborhood_id', neighborhood_id);
    }

    // Incluir imagen solo si el usuario seleccionó un nuevo archivo
    if (headerControls.imageFile) {
      formData.append('imagen', headerControls.imageFile);
    }

    const res = await formService.update(id, formData);
    return res;
  };

  // ── Función de salida: navegar de vuelta a la lista ──
  const exitToList = () => {
    try {
      navigate('/forms');
    } catch (e) {
      console.warn('Navigation to /forms failed', e);
    }
  };

  // Contexto de modo edición
  const editModeValue = {
    isEditMode,
    editFormId: id || null,
    isLoadingEdit,
    editLoadError,
    exitToList,
  };

  return (
    <EditModeContext.Provider value={editModeValue}>
      <QuestionListContext.Provider value={questionList}>
        <EditingSectionContext.Provider value={editingSection}>
          <OptionsListContext.Provider value={optionsList}>
            <TypeSelectorContext.Provider value={typeSelector}>
              <CreationControlsContext.Provider value={creationControls}>
                <HeaderContext.Provider value={{ ...headerControls, createForm, updateForm, exitToList }}>
                  <NeighborhoodSelectorContext.Provider value={neighborhoodSelector}>
                    {children}
                  </NeighborhoodSelectorContext.Provider>
                </HeaderContext.Provider>
              </CreationControlsContext.Provider>
            </TypeSelectorContext.Provider>
          </OptionsListContext.Provider>
        </EditingSectionContext.Provider>
      </QuestionListContext.Provider>
    </EditModeContext.Provider>
  );
}

export default FormCreationProvider;
