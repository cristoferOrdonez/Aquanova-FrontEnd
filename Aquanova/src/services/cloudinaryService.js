const API_URL = import.meta.env.VITE_API_URL;

/**
 * Servicio para subir archivos multimedia (imágenes y videos) a Cloudinary a través del backend.
 * El backend se encarga de la comunicación con Cloudinary y retorna las URLs públicas.
 */
export const cloudinaryService = {
  /**
   * Sube un archivo (imagen o video) a Cloudinary con seguimiento de progreso.
   *
   * @param {File} file - Archivo a subir (imagen o video)
   * @param {string} [folder='submissions'] - Carpeta en Cloudinary donde se almacenará
   * @param {Function} [onProgress] - Callback para progreso (0-100)
   * @returns {Promise<{url: string, public_id: string, resource_type: string}>}
   */
  async uploadFile(file, folder = 'submissions', onProgress = null) {
    if (!file || !(file instanceof File)) {
      throw new Error('Se requiere un archivo válido');
    }

    // Validar que sea imagen o video
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      throw new Error('El archivo debe ser una imagen o video');
    }

    const formData = new FormData();
    // El backend espera el campo 'image' para imágenes y 'video' para videos
    const fieldName = isVideo ? 'video' : 'image';
    formData.append(fieldName, file);
    formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Seguimiento de progreso de subida
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });

      // Manejo de respuesta exitosa
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.url || response.secure_url,
              public_id: response.public_id,
              resource_type: response.resource_type || (isVideo ? 'video' : 'image'),
            });
          } catch (err) {
            reject(new Error('Error al procesar la respuesta del servidor'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Error ${xhr.status}: No se pudo subir el archivo`));
          } catch {
            reject(new Error(`Error ${xhr.status}: No se pudo subir el archivo`));
          }
        }
      });

      // Manejo de errores
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir el archivo'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Subida cancelada'));
      });

      // Usar el endpoint correcto según el tipo de archivo
      const endpoint = isVideo ? '/upload/video' : '/upload/image';
      xhr.open('POST', `${API_URL}${endpoint}`);

      // Agregar token si existe (para formularios autenticados)
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  },

  /**
   * Sube múltiples archivos (imágenes y/o videos) a Cloudinary con progreso.
   *
   * @param {File[]} files - Array de archivos a subir
   * @param {string} [folder='submissions'] - Carpeta en Cloudinary
   * @param {Function} [onProgress] - Callback con progreso global { current, total, percent }
   * @returns {Promise<string[]>} Array de URLs públicas
   */
  async uploadMultipleFiles(files, folder = 'submissions', onProgress = null) {
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    const urls = [];
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const result = await this.uploadFile(file, folder, (fileProgress) => {
          // Calcular progreso global
          if (onProgress) {
            const totalProgress = ((completed + (fileProgress / 100)) / files.length) * 100;
            onProgress({
              current: i + 1,
              total: files.length,
              percent: Math.round(totalProgress),
              currentFilePercent: fileProgress,
              fileName: file.name,
            });
          }
        });

        urls.push(result.url);
        completed++;

        // Notificar progreso al completar archivo
        if (onProgress) {
          onProgress({
            current: completed,
            total: files.length,
            percent: Math.round((completed / files.length) * 100),
            currentFilePercent: 100,
            fileName: file.name,
          });
        }
      } catch (error) {
        console.error(`Error al subir archivo "${file.name}":`, error);
        throw new Error(`No se pudo subir "${file.name}". ${error.message}`);
      }
    }

    return urls;
  },

  // Alias para compatibilidad con código existente
  uploadImage(file, folder = 'submissions', onProgress = null) {
    return this.uploadFile(file, folder, onProgress);
  },

  uploadMultipleImages(files, folder = 'submissions', onProgress = null) {
    return this.uploadMultipleFiles(files, folder, onProgress);
  },
};

export default cloudinaryService;
