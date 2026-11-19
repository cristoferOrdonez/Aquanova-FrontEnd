import { useState, useCallback } from 'react';
import { MAP_BUILDER_CONFIG } from '../utils/constants';

/**
 * Hook para gestionar historial de undo/redo del mapa.
 * Mantiene stacks de snapshots (deep copies) del array de polígonos.
 *
 * @returns {{
 *   pushState: (polygons: Array) => void,
 *   undo: () => Array|null,
 *   redo: () => Array|null,
 *   canUndo: boolean,
 *   canRedo: boolean,
 *   clear: () => void
 * }}
 */
export const useHistory = () => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  /**
   * Pushea el estado actual al undo stack y limpia el redo stack.
   * Mantiene el stack dentro del límite MAX_UNDO_STACK.
   *
   * @param {Array} polygons - Estado actual de polígonos a guardar
   */
  const pushState = useCallback((polygons) => {
    const snapshot = JSON.parse(JSON.stringify(polygons));
    setUndoStack((prev) => {
      const next = [...prev, snapshot];
      if (next.length > MAP_BUILDER_CONFIG.MAX_UNDO_STACK) {
        return next.slice(next.length - MAP_BUILDER_CONFIG.MAX_UNDO_STACK);
      }
      return next;
    });
    setRedoStack([]);
  }, []);

  /**
   * Deshace la última acción.
   * Pop del undo stack, push al redo stack, retorna estado anterior.
   *
   * @returns {Array|null} Estado anterior de polígonos, o null si no hay nada que deshacer
   */
  const undo = useCallback(() => {
    let result = null;
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const popped = newStack.pop();
      result = popped;
      setRedoStack((redoPrev) => [...redoPrev, popped]);
      return newStack;
    });
    return result;
  }, []);

  /**
   * Rehace la última acción deshecha.
   * Pop del redo stack, push al undo stack, retorna estado siguiente.
   *
   * @returns {Array|null} Estado siguiente de polígonos, o null si no hay nada que rehacer
   */
  const redo = useCallback(() => {
    let result = null;
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const popped = newStack.pop();
      result = popped;
      setUndoStack((undoPrev) => [...undoPrev, popped]);
      return newStack;
    });
    return result;
  }, []);

  /**
   * Limpia ambos stacks de historial.
   */
  const clear = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
};
