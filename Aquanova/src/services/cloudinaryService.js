const API_URL = import.meta.env.VITE_API_URL;

/**
 * Intenta reducir la resolución y calidad de un video en el cliente usando HTML5 MediaRecorder.
 * Advertencia: Esto procesa en tiempo real (1 segundo de video toma ~1 segundo en procesar).
 * @param {File} file - El archivo de video original.
 * @param {number} maxWidth - Ancho máximo deseado para el video.
 * @returns {Promise<File>} Archivo de video comprimido o el original si falla o no es compatible.
 */
const compressVideo = async (file, maxWidth = 854) => {
  if (!file.type.startsWith('video/')) return file;

  return new Promise((resolve) => {
    // Si el navegador no soporta MediaRecorder, devolvemos el original
    if (!window.MediaRecorder || !window.URL) {
      console.warn('MediaRecorder no soportado. Subiendo video original.');
      return resolve(file);
    }

    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    let isResolved = false;

    // Timeout de seguridad de 3 minutos para evitar que la UI se cuelgue infinitamente
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      }
    }, 180000);

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    video.src = objectUrl;
    video.muted = true; // Fundamental para que los navegadores permitan el auto-play en background
    video.crossOrigin = 'anonymous';

    video.onloadeddata = () => {
      try {
        let width = video.videoWidth;
        let height = video.videoHeight;

        // Limitar la resolución
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Intentar capturar video
        const stream = canvas.captureStream(30);

        // Si el video original tenía audio, intentamos copiar la pista de audio
        // Cuidado: Al estar "muted = true", Firefox/Chrome podrían capturar audio silenciado.
        // Si el audio es vital, lo mejor es subir el video original (modificando Nginx)
        if (video.captureStream) {
          const originalStream = video.captureStream();
          const audioTracks = originalStream.getAudioTracks();
          if (audioTracks.length > 0) {
            stream.addTrack(audioTracks[0]);
          }
        } else if (video.mozCaptureStream) {
           const originalStream = video.mozCaptureStream();
           const audioTracks = originalStream.getAudioTracks();
           if (audioTracks.length > 0) { stream.addTrack(audioTracks[0]); }
        }

        // Configurar MediaRecorder para tratar de comprimir a 1 Mbps (~125KB/s) con códec compatible
        let recorderOptions = { videoBitsPerSecond: 1000000 };
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          recorderOptions.mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          recorderOptions.mimeType = 'video/mp4';
        }

        let recorder;
        try {
          recorder = new MediaRecorder(stream, recorderOptions);
        } catch (e) {
          // Fallback a defecto
          recorder = new MediaRecorder(stream);
        }

        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          if (isResolved) return;
          cleanup();
          
          const finalMimeType = recorder.mimeType || 'video/webm';
          const blob = new Blob(chunks, { type: finalMimeType });
          
          // Si por milagro el blob es más pequeño que el archivo original, lo usamos
          if (blob.size > 0 && blob.size < file.size) {
            const ext = finalMimeType.includes('mp4') ? 'mp4' : 'webm';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
            const compressedFile = new File([blob], `${baseName}_comprimido.${ext}`, {
              type: finalMimeType,
              lastModified: Date.now(),
            });
            console.log(`Video comprimido: de ${(file.size / 1024 / 1024).toFixed(2)} MB a ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
            isResolved = true;
            resolve(compressedFile);
          } else {
            console.log('La compresión no bajó el tamaño. Se usará el video original.');
            isResolved = true;
            resolve(file);
          }
        };

        recorder.start();

        // Reproducimos el video para que el canvas pinte los frames
        video.play().catch(e => {
           console.warn('Autoplay denegado, no se puede comprimir video:', e);
           if (!isResolved) {
             cleanup();
             isResolved = true;
             resolve(file);
           }
        });

        // Bucle de repintado del canvas
        const drawFrame = () => {
          if (video.paused || video.ended) return;
          ctx.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(drawFrame);
        };
        
        video.addEventListener('play', () => {
          // Intentamos apurar el video para comprimir más rápido (Cuidado: distorsiona pitch de audio)
          video.playbackRate = 2.0; 
          drawFrame();
        });
        
        video.onended = () => {
          recorder.stop();
        };

      } catch (err) {
        console.error('Fallo en la lógica de compresión de video:', err);
        if (!isResolved) {
          cleanup();
          isResolved = true;
          resolve(file);
        }
      }
    };

    video.onerror = () => {
      console.warn('Error cargando el video para comprimir.');
      if (!isResolved) {
        cleanup();
        isResolved = true;
        resolve(file);
      }
    };
  });
};

/**
 * Comprime una imagen usando HTML5 Canvas antes de subirla para evitar errores 413 (Payload Too Large).
 * @param {File} file - El archivo original.
 * @param {number} maxWidth - Ancho máximo de la imagen (manteniendo proporción).
 * @param {number} quality - Calidad de compresión JPEG (0.0 a 1.0).
 * @returns {Promise<File>} Archivo comprimido o el original si falla o no es imagen.
 */
const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  // Ignorar si no es una imagen o si es un GIF/SVG (animados, vectoriales)
  if (!file.type.startsWith('image/') || file.type.includes('gif') || file.type.includes('svg')) {
    return file;
  }
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          // Asegurarse de mantener la extensión .jpg o .jpeg, ignorando .png etc.
          const extension = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
          const compressedFile = new File([blob], `${extension}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          // Si por alguna razón la imagen "comprimida" pesa más que la original, conservamos la original
          if (compressedFile.size > file.size) {
             resolve(file);
          } else {
             resolve(compressedFile);
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

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

    let completedUploads = 0;
    const totalFiles = files.length;
    // Realizamos seguimiento individual del progreso para cada archivo concurrente
    const progressPerFile = new Array(totalFiles).fill(0);

    const uploadPromises = files.map(async (file, index) => {
      try {
        // Ejecución concurrente ("al tiempo"): 1. Comprimir (si es imagen o video)
        let compressedFile = file;
        
        if (file.type.startsWith('image/')) {
          compressedFile = await compressImage(file, 1600, 0.7);
        } else if (file.type.startsWith('video/')) {
          console.log(`Iniciando compresión de video local para: ${file.name}... (puede demorar)`);
          compressedFile = await compressVideo(file, 854); // Max ancho 854 (480p)
        }

        // 2. Subir
        const result = await this.uploadFile(compressedFile, folder, (fileProgress) => {
          progressPerFile[index] = fileProgress;
          
          if (onProgress) {
            // El porcentaje global se promedia sobre todos los archivos subiendo al mismo tiempo
            const totalPercent = Math.round(
              progressPerFile.reduce((sum, curr) => sum + curr, 0) / totalFiles
            );
            
            onProgress({
              current: completedUploads,
              total: totalFiles,
              percent: totalPercent,
              currentFilePercent: fileProgress,
              fileName: file.name,
            });
          }
        });

        completedUploads++;
        
        // Retornamos la URL al terminar este archivo
        if (onProgress) {
          progressPerFile[index] = 100;
          const finalPercent = Math.round(
            progressPerFile.reduce((sum, curr) => sum + curr, 0) / totalFiles
          );
          
          onProgress({
            current: completedUploads,
            total: totalFiles,
            percent: finalPercent,
            currentFilePercent: 100,
            fileName: file.name,
          });
        }
        
        return result.url;
      } catch (error) {
        console.error(`Error al subir archivo "${file.name}":`, error);
        throw new Error(`No se pudo subir "${file.name}". ${error.message}`);
      }
    });

    // Se ejecutan en paralelo
    const urls = await Promise.all(uploadPromises);

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
