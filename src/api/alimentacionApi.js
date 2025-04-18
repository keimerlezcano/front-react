// src/api/alimentacionApi.js

import apiClient from '../utils/apiClient'; // Ruta corregida

/**
 * Obtiene todos los registros de alimentación.
 * Incluye los datos del espécimen asociado.
 */
export const getAllAlimentaciones = async () => {
  try {
    const response = await apiClient.get('/alimentaciones');
    // Devuelve un array vacío si la respuesta no es un array por alguna razón
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching alimentaciones:", error);
    throw error; // Relanza para manejo en el componente/hook
  }
};

/**
 * Obtiene un registro de alimentación por su ID.
 * Incluye los datos del espécimen asociado.
 * @param {number|string} id El ID del registro de alimentación.
 */
export const getAlimentacionById = async (id) => {
  try {
    const response = await apiClient.get(`/alimentaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching alimentación con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo registro de alimentación.
 * @param {object} alimentacionData Datos del registro ({ nombreAlimento, cantidad, specimenId }).
 */
export const createAlimentacion = async (alimentacionData) => {
  try {
    const response = await apiClient.post('/alimentaciones', alimentacionData);
    return response.data; // Devuelve el registro recién creado
  } catch (error) {
    console.error("Error creating alimentación:", error);
    throw error;
  }
};

/**
 * Actualiza un registro de alimentación existente.
 * @param {number|string} id El ID del registro a actualizar.
 * @param {object} alimentacionData Datos a actualizar.
 */
export const updateAlimentacion = async (id, alimentacionData) => {
  try {
    const response = await apiClient.put(`/alimentaciones/${id}`, alimentacionData);
    return response.data; // Devuelve el registro actualizado
  } catch (error) {
    console.error(`Error updating alimentación con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un registro de alimentación por su ID.
 * @param {number|string} id El ID del registro a eliminar.
 */
export const deleteAlimentacion = async (id) => {
  try {
    await apiClient.delete(`/alimentaciones/${id}`);
    // No hay contenido en la respuesta (204), devolvemos éxito
    return { success: true };
  } catch (error) {
    console.error(`Error deleting alimentación con ID ${id}:`, error);
    throw error;
  }
};