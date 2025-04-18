// src/api/medicineApi.js

import apiClient from '../utils/apiClient'; // Ruta corregida

/**
 * Obtiene todos los registros de medicinas administradas/programadas.
 * Incluye los datos del espécimen asociado.
 */
export const getAllMedicines = async () => {
  try {
    const response = await apiClient.get('/medicines'); // Endpoint del backend
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching medicines:", error);
    throw error;
  }
};

/**
 * Obtiene un registro de medicina por su ID.
 * Incluye los datos del espécimen asociado.
 * @param {number|string} id El ID del registro de medicina.
 */
export const getMedicineById = async (id) => {
  try {
    const response = await apiClient.get(`/medicines/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching medicine con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo registro de medicina.
 * @param {object} medicineData Datos del registro ({ nombre, cantidad, dosis, horaAdministracion, estado?, specimenId }).
 */
export const createMedicine = async (medicineData) => {
  try {
    const response = await apiClient.post('/medicines', medicineData);
    return response.data;
  } catch (error) {
    console.error("Error creating medicine:", error);
    throw error;
  }
};

/**
 * Actualiza un registro de medicina existente.
 * @param {number|string} id El ID del registro a actualizar.
 * @param {object} medicineData Datos a actualizar.
 */
export const updateMedicine = async (id, medicineData) => {
  try {
    const response = await apiClient.put(`/medicines/${id}`, medicineData);
    return response.data;
  } catch (error) {
    console.error(`Error updating medicine con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un registro de medicina por su ID.
 * @param {number|string} id El ID del registro a eliminar.
 */
export const deleteMedicine = async (id) => {
  try {
    await apiClient.delete(`/medicines/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting medicine con ID ${id}:`, error);
    throw error;
  }
};