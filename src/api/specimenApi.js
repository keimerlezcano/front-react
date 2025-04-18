// src/api/specimenApi.js
import apiClient from '../utils/apiClient'; // <<< IMPORTA TU CLIENTE CONFIGURADO

// Renombra las funciones para posible claridad o mantenlas como estaban
// Usaremos los nombres que tenías exportados: getSpecimens, addSpecimen, etc.

// GET /api/specimens
export const getSpecimens = async (categoryId = null) => { // Renombrado a getSpecimens
  try {
    const params = {};
    if (categoryId) {
        params.categoryId = categoryId; // Pasa categoryId como query param si el backend lo soporta
    }
    const response = await apiClient.get('/specimens', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en specimenApi.getSpecimens:", error.message);
    throw error;
  }
};

// GET /api/specimens/:id
export const getSpecimenById = async (id) => {
  try {
    const response = await apiClient.get(`/specimens/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en specimenApi.getSpecimenById (ID: ${id}):`, error.message);
    throw error;
  }
};

// POST /api/specimens - Recibe objeto JSON (si no subes imagen con FormData aquí)
// Si SÍ subes imagen desde aquí, necesitarías recibir FormData
export const addSpecimen = async (specimenData) => { // specimenData = { name, specimenCategoryId, ... }
  try {
    // IMPORTANTE: Si specimenData es FormData (porque incluye imagen), está bien.
    // Si es solo JSON, también está bien. Axios maneja ambos.
    const response = await apiClient.post('/specimens', specimenData);
    return response.data;
  } catch (error) {
    console.error("Error en specimenApi.addSpecimen:", error.message);
    throw error;
  }
};

// PUT /api/specimens/:id - Recibe objeto JSON o FormData
export const updateSpecimen = async (id, specimenData) => {
  try {
     // IMPORTANTE: Si specimenData es FormData, está bien. Si es JSON, también.
    const response = await apiClient.put(`/specimens/${id}`, specimenData);
    return response.data; // Asume que devuelve el objeto actualizado
  } catch (error) {
    console.error(`Error en specimenApi.updateSpecimen (ID: ${id}):`, error.message);
    throw error;
  }
};

// DELETE /api/specimens/:id
export const deleteSpecimen = async (id) => {
  try {
    await apiClient.delete(`/specimens/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error en specimenApi.deleteSpecimen (ID: ${id}):`, error.message);
    throw error;
  }
};

// PUT /api/specimens/:id/status (Ejemplo toggle estado)
export const toggleSpecimenStatus = async (id, newStatus) => {
    try {
       // Llama a la ruta PUT general para actualizar solo el estado
       const response = await apiClient.put(`/specimens/${id}`, { estado: newStatus });
       return response.data;
    } catch (error) {
        console.error(`Error en specimenApi.toggleSpecimenStatus (ID: ${id}):`, error.message);
        throw error;
    }
};

// PUT /api/specimens/:id/move (Ejemplo mover) - ¿Qué envía 'data'? { newCategoryId?, newSedeId? }
export const moveSpecimen = async (specimenId, data) => {
  try {
    // Asegúrate que el backend tenga una ruta PUT /api/specimens/:specimenId/move
    // o ajusta para usar la ruta PUT /api/specimens/:specimenId general
    const response = await apiClient.put(`/specimens/${specimenId}/move`, data);
    return response.data;
  } catch (error) {
    console.error(`Error en specimenApi.moveSpecimen (ID: ${specimenId}):`, error.message);
    throw error;
  }
};

// Mantén los nombres exportados originales si tu página los usa así
export {
    getSpecimens as getAllSpecimens, // Alias si es necesario
    addSpecimen as createSpecimen,    // Alias
    // updateSpecimen, deleteSpecimen, getSpecimenById, toggleSpecimenStatus ya coinciden
};