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

        // Pre-poblar las preguntas desde el schema
        // El schema puede venir como array (JSON nativo de MySQL) o como string JSON
        let schema = formData.schema;
        if (typeof schema === 'string') {
          try { schema = JSON.parse(schema); } catch { schema = []; }
        }

        if (Array.isArray(schema) && schema.length > 0) {
          const parsedQuestions = schema
            .filter(item => item.type !== 'image') // Excluir la imagen del schema
            .map(item => ({
              id: item.id || `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title: item.title || item.label || FORM_CREATION_CONFIG.defaultQuestionTitle,
              type: item.type || FORM_CREATION_CONFIG.defaultType,
              required: !!item.required,
              options: Array.isArray(item.options) ? item.options : [],
            }));

          questionList.setQuestions(parsedQuestions);

          // En modo edición, desactivar el panel de creación para que las preguntas
          // cargadas se muestren sin blur/opacidad
          creationControls.setIsCreationOn(false);

          // Pre-poblar la imagen si existe en el schema
          const imageEntry = schema.find(item => item.type === 'image');
          if (imageEntry?.data) {
            headerControls.setImagePreview(imageEntry.data);
          }
        }

        // Pre-poblar el barrio (neighborhood)
        // El backend envía neighborhood_id (string UUID), hacemos request para obtener el nombre
        if (formData.neighborhood_id) {
          try {
            const nbResponse = await neighborhoodService.getById(formData.neighborhood_id);
            const nbData = nbResponse?.data?.data ?? nbResponse?.data ?? nbResponse;
            const nbName = nbData?.name ?? nbData?.nombre ?? nbData?.label ?? 'Barrio';
            neighborhoodSelector.setSelectedOption({
              id: String(formData.neighborhood_id),
              label: String(nbName),
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
    const description = headerControls.description || undefined;
    const neighborhood_id = neighborhoodSelector.selectedOption && neighborhoodSelector.selectedOption.id;

    if (!neighborhood_id) {
      throw new Error('Debe seleccionar un barrio antes de crear el formulario');
    }

    const schema = [];
    if (headerControls.imagePreview) {
      schema.push({
        id: `img-${Date.now()}`,
        type: 'image',
        data: headerControls.imagePreview,
      });
    }

    const questions = questionList.questions || [];
    for (const q of questions) {
      schema.push({
        id: q.id,
        title: q.title,
        type: q.type,
        required: !!q.required,
        options: Array.isArray(q.options) ? q.options.map(o => ({ id: o.id, value: o.value })) : [],
      });
    }

    const payload = { title, schema, neighborhood_id };
    if (description) payload.description = description;

    const res = await formService.create(payload);
    return res;
  };

  // ── Función para ACTUALIZAR un formulario (modo edición) ──
  const updateForm = async () => {
    if (!id) throw new Error('No hay ID de formulario para actualizar');

    const title = headerControls.title || FORM_CREATION_CONFIG.defaultFormTitle;
    const description = headerControls.description || '';
    const is_active = headerControls.isPublishOn ? true : false;

    // Reconstruir schema: primero la imagen, luego las preguntas
    const schema = [];
    if (headerControls.imagePreview) {
      schema.push({
        id: `img-${Date.now()}`,
        type: 'image',
        data: headerControls.imagePreview,
      });
    }

    const questions = questionList.questions || [];
    for (const q of questions) {
      schema.push({
        id: q.id,
        title: q.title,
        type: q.type,
        required: !!q.required,
        options: Array.isArray(q.options) ? q.options.map(o => ({ id: o.id, value: o.value })) : [],
      });
    }

    const payload = { title, description, is_active, schema };

    // Incluir neighborhood_id si el usuario seleccionó un barrio
    const neighborhood_id = neighborhoodSelector.selectedOption && neighborhoodSelector.selectedOption.id;
    if (neighborhood_id) {
      payload.neighborhood_id = neighborhood_id;
    }

    const res = await formService.update(id, payload);
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
