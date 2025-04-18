// src/api/vacunacionApi.js

import apiClient from '../utils/apiClient'; // Ruta corregida

/**
 * Obtiene todos los registros de vacunación.
 * Incluye los datos del espécimen asociado.
 */
export const getAllVacunaciones = async () => {
  try {
    const response = await apiClient.get('/vacunaciones');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching vacunaciones:", error);
    throw error;
  }
};

/**
 * Obtiene un registro de vacunación por su ID.
 * Incluye los datos del espécimen asociado.
 * @param {number|string} id El ID del registro de vacunación.
 */
export const getVacunacionById = async (id) => {
  try {
    const response = await apiClient.get(`/vacunaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vacunación con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo registro de vacunación.
 * @param {object} vacunacionData Datos del registro ({ nombreVacuna, fechaAdministracion, specimenId }).
 */
export const createVacunacion = async (vacunacionData) => {
  try {
    const response = await apiClient.post('/vacunaciones', vacunacionData);
    return response.data;
  } catch (error) {
    console.error("Error creating vacunación:", error);
    throw error;
  }
};

/**
 * Actualiza un registro de vacunación existente.
 * @param {number|string} id El ID del registro a actualizar.
 * @param {object} vacunacionData Datos a actualizar.
 */
export const updateVacunacion = async (id, vacunacionData) => {
  try {
    const response = await apiClient.put(`/vacunaciones/${id}`, vacunacionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vacunación con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un registro de vacunación por su ID.
 * @param {number|string} id El ID del registro a eliminar.
 */
export const deleteVacunacion = async (id) => {
  try {
    await apiClient.delete(`/vacunaciones/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting vacunación con ID ${id}:`, error);
    throw error;
  }
};