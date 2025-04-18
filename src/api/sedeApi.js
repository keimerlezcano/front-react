// src/api/sedeApi.js
// (Asegúrate de que el nombre del archivo coincida con tu importación, ej. '../api/sedeApi.js')

import apiClient from '../utils/apiClient'; 

// --- Funciones API para Sedes ---

/**
 * Obtiene todas las Sedes.
 * Llama a GET /api/sedes
 */
export const getAllSedes = async () => {
  try {
    // Usa apiClient y la ruta relativa '/sedes'
    const response = await apiClient.get('/sedes');
    // Devuelve los datos si es un array, o un array vacío
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // El interceptor ya manejó el log detallado y formateó el error
    console.error("Error en sedeApi.getAllSedes:", error.message);
    throw error; // Relanza el error para que la página lo capture
  }
};

/**
 * Obtiene una Sede por su ID.
 * Llama a GET /api/sedes/:id
 * @param {string|number} id - ID de la sede.
 */
export const getSedeById = async (id) => { // Nombre consistente
  try {
    const response = await apiClient.get(`/sedes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en sedeApi.getSedeById (ID: ${id}):`, error.message);
    throw error;
  }
};


/**
 * Crea una nueva Sede.
 * Llama a POST /api/sedes
 * @param {object} sedeData - Objeto con los datos de la sede (ej. { name: '...' }).
 */
export const createSede = async (sedeData) => { // Nombre consistente
  try {
    // Envía el objeto de datos directamente
    const response = await apiClient.post('/sedes', sedeData);
    return response.data; // Devuelve la sede creada
  } catch (error) {
    console.error("Error en sedeApi.createSede:", error.message);
    throw error;
  }
};

/**
 * Actualiza una Sede existente.
 * Llama a PUT /api/sedes/:id
 * @param {string|number} id - ID de la sede a actualizar.
 * @param {object} sedeData - Objeto con los datos a actualizar (ej. { name: '...' }).
 */
export const updateSede = async (id, sedeData) => { // Nombre consistente
  try {
    const response = await apiClient.put(`/sedes/${id}`, sedeData);
    return response.data; // Asume que devuelve la sede actualizada
  } catch (error) {
    console.error(`Error en sedeApi.updateSede (ID: ${id}):`, error.message);
    throw error;
  }
};

/**
 * Elimina una Sede por su ID.
 * Llama a DELETE /api/sedes/:id
 * @param {string|number} id - ID de la sede a eliminar.
 */
export const deleteSede = async (id) => { // Nombre consistente
  try {
    // Delete no suele devolver contenido, solo confirma éxito o lanza error
    await apiClient.delete(`/sedes/${id}`);
    return { success: true }; // Indica éxito
  } catch (error) {
    console.error(`Error en sedeApi.deleteSede (ID: ${id}):`, error.message);
    throw error;
  }
};

// Si necesitas mantener compatibilidad con nombres antiguos en algún lado, puedes usar alias:
// export { getAllSedes as getVenues };
// export { createSede as agregarVenue };
// export { updateSede as actualizarVenue };
// export { deleteSede as eliminarVenue };