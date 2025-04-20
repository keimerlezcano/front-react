// src/api/sedeApi.js
import apiClient from '../utils/apiClient.js'; // <<<--- ¡CORREGIDO! Importar desde utils

/**
 * Obtiene todas las sedes.
 * @returns {Promise<Array<Sede>>} Array de sedes.
 */
export const getAllSedes = async () => { // Cambiado nombre a getAllSedes para consistencia
    try {
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.get('/sedes');
        console.log("API Response (getAllSedes):", response.data);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching venues:', error.response?.data || error.message);
        throw error; // Relanzar para que el componente lo maneje
    }
};

/**
 * Obtiene los detalles de una sede específica por su ID.
 * @param {number|string} id - El ID de la sede.
 * @returns {Promise<Sede>} El objeto Sede con detalles (y ejemplares).
 * @throws {Error} Si el ID es inválido o la API falla.
 */
export const getSedeById = async (id) => { // Cambiado nombre a getSedeById
    if (!id || id === 'undefined' || id === 'null') {
        console.error("getSedeById called with invalid ID:", id);
        throw new Error("ID de Sede inválido proporcionado.");
    }
    try {
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.get(`/sedes/${id}`);
        console.log(`API Response (getSedeById ${id}):`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching venue with id ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Crea una nueva sede.
 * @param {object} sedeData - Datos de la nueva sede.
 * @returns {Promise<Sede>} La sede creada.
 * @throws {Error} Si la API falla.
 */
export const createSede = async (sedeData) => { // Cambiado nombre a createSede
    try {
         // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.post('/sedes', sedeData);
        return response.data;
    } catch (error) {
        console.error('Error creating venue:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Actualiza una sede existente.
 * @param {number|string} id - ID de la sede.
 * @param {object} sedeData - Datos a actualizar.
 * @returns {Promise<Sede|object>} La sede actualizada o confirmación.
 * @throws {Error} Si el ID es inválido o la API falla.
 */
export const updateSede = async (id, sedeData) => { // Cambiado nombre a updateSede
     if (!id || id === 'undefined' || id === 'null') {
        console.error("updateSede called with invalid ID:", id);
        throw new Error("ID de Sede inválido proporcionado.");
    }
    try {
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.put(`/sedes/${id}`, sedeData);
         return response.data || { success: true, id, ...sedeData };
    } catch (error) {
        console.error(`Error updating venue with id ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Elimina una sede por su ID.
 * @param {number|string} id - ID de la sede.
 * @returns {Promise<object>} Respuesta de la API.
 * @throws {Error} Si el ID es inválido o la API falla.
 */
export const deleteSede = async (id) => { // Cambiado nombre a deleteSede
     if (!id || id === 'undefined' || id === 'null') {
        console.error("deleteSede called with invalid ID:", id);
        throw new Error("ID de Sede inválido proporcionado.");
    }
    try {
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.delete(`/sedes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting venue with id ${id}:`, error.response?.data || error.message);
         if (error.response?.data?.message) {
             throw new Error(error.response.data.message);
         }
        throw error;
    }
};

// Exportar individualmente si es tu patrón o como default
export default {
    getAllSedes,
    getSedeById,
    createSede,
    updateSede,
    deleteSede,
};

// O exportaciones nombradas individuales (ajusta las importaciones en los componentes si cambias esto):
// export { getAllSedes, getSedeById, createSede, updateSede, deleteSede };