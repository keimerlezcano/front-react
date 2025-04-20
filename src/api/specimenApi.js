// src/api/specimenApi.js
import apiClient from '../utils/apiClient.js'; // <<<--- ¡CORREGIDO! Importar desde utils

/**
 * Extrae un mensaje de error significativo de una respuesta de error de Axios.
 * @param {Error} error - El error de Axios.
 * @returns {string} Un mensaje de error legible.
 */
const getErrorMessage = (error) => {
    if (error.response?.data?.errors) {
        return error.response.data.errors.map(err => err.msg).join(', ');
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return 'Ocurrió un error desconocido.';
};


/**
 * Obtiene todos los ejemplares.
 * @returns {Promise<Array<Specimen>>} Array de ejemplares.
 */
export const getSpecimens = async () => {
    try {
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.get('/specimens');
        console.log("API Response (getSpecimens):", response.data);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching specimens:', getErrorMessage(error));
        // Considera si devolver [] o lanzar el error es mejor para tu UI
        throw new Error(getErrorMessage(error)); // Lanzar error para que el componente reaccione
        // return [];
    }
};

/**
 * Obtiene un ejemplar específico por ID.
 * @param {number|string} id - ID del ejemplar.
 * @returns {Promise<Specimen>} El objeto Specimen.
 * @throws {Error} Si el ID es inválido o la API falla.
 */
export const getSpecimenById = async (id) => {
    if (!id || id === 'undefined' || id === 'null') {
        console.error("getSpecimenById called with invalid ID:", id);
        throw new Error("ID de Ejemplar inválido proporcionado.");
    }
    try {
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.get(`/specimens/${id}`);
        console.log(`API Response (getSpecimenById ${id}):`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching specimen with id ${id}:`, getErrorMessage(error));
        throw new Error(getErrorMessage(error));
    }
};

/**
 * Crea un nuevo ejemplar.
 * @param {object} specimenData - Datos del ejemplar. Debe incluir 'sedeId' y 'specimenCategoryId'.
 * @returns {Promise<Specimen>} El ejemplar creado.
 * @throws {Error} Si la validación falla o la API devuelve error.
 */
export const createSpecimen = async (specimenData) => {
    if (!specimenData.sedeId) throw new Error("Falta sedeId.");
    if (!specimenData.specimenCategoryId) throw new Error("Falta specimenCategoryId.");
    if (!specimenData.name) throw new Error("Falta el nombre.");

    try {
        console.log("Sending data to createSpecimen:", specimenData);
         // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.post('/specimens', specimenData);
        return response.data;
    } catch (error) {
        console.error('Error creating specimen:', getErrorMessage(error));
        throw new Error(getErrorMessage(error));
    }
};

/**
 * Actualiza un ejemplar existente.
 * @param {number|string} id - ID del ejemplar a actualizar.
 * @param {object} specimenData - Datos a actualizar.
 * @returns {Promise<Specimen|object>} El ejemplar actualizado o confirmación.
 * @throws {Error} Si el ID es inválido o la API falla.
 */
export const updateSpecimen = async (id, specimenData) => {
    if (!id || id === 'undefined' || id === 'null') {
        console.error("updateSpecimen called with invalid ID:", id);
        throw new Error("ID de Ejemplar inválido proporcionado.");
    }
    try {
         console.log(`Sending data to updateSpecimen (ID: ${id}):`, specimenData);
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.put(`/specimens/${id}`, specimenData);
        return response.data || { success: true, id, ...specimenData };
    } catch (error) {
        console.error(`Error updating specimen with id ${id}:`, getErrorMessage(error));
        throw new Error(getErrorMessage(error));
    }
};

/**
 * Elimina un ejemplar.
 * @param {number|string} id - ID del ejemplar a eliminar.
 * @returns {Promise<object>} Respuesta de la API.
 * @throws {Error} Si el ID es inválido o la API falla.
 */
export const deleteSpecimen = async (id) => {
     if (!id || id === 'undefined' || id === 'null') {
        console.error("deleteSpecimen called with invalid ID:", id);
        throw new Error("ID de Ejemplar inválido proporcionado.");
    }
    try {
         // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.delete(`/specimens/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting specimen with id ${id}:`, getErrorMessage(error));
        throw new Error(getErrorMessage(error));
    }
};

/**
 * Mueve un ejemplar a otra sede y/o categoría.
 * @param {number|string} id - ID del ejemplar.
 * @param {object} moveData - Objeto con { sedeId?, specimenCategoryId? }.
 * @returns {Promise<Specimen|object>} El ejemplar actualizado o confirmación.
 * @throws {Error} Si el ID es inválido o la API falla.
 */
export const moveSpecimen = async (id, moveData) => {
     if (!id || id === 'undefined' || id === 'null') {
        console.error("moveSpecimen called with invalid ID:", id);
        throw new Error("ID de Ejemplar inválido proporcionado.");
    }
    if (!moveData || (moveData.sedeId === undefined && moveData.specimenCategoryId === undefined)) {
        throw new Error("Debe proporcionar una nueva sede o categoría para mover.");
    }
    try {
         console.log(`Sending data to moveSpecimen (ID: ${id}):`, moveData);
        // --- ¡CORREGIDO! Usar apiClient ---
        const response = await apiClient.patch(`/specimens/${id}/move`, moveData);
        return response.data;
    } catch (error) {
        console.error(`Error moving specimen with id ${id}:`, getErrorMessage(error));
        throw new Error(getErrorMessage(error));
    }
};

// Exportar todo como default o individualmente
export default {
    getSpecimens,
    getSpecimenById,
    createSpecimen,
    updateSpecimen,
    deleteSpecimen,
    moveSpecimen,
    getErrorMessage
};

// O exportaciones nombradas:
// export { getSpecimens, getSpecimenById, createSpecimen, updateSpecimen, deleteSpecimen, moveSpecimen, getErrorMessage };