// src/api/rolesApi.js (o donde esté)

// --- 1. IMPORTA la instancia centralizada ---
import apiClient from '../utils/apiClient'; // Asegúrate que esta ruta sea correcta

// --- 3. Funciones API (usan el apiClient IMPORTADO) ---

export const getRoles = async () => {
  try {
    // Usa la instancia importada apiClient
    const response = await apiClient.get('/roles');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // El interceptor central ya manejó el error, solo relanza
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    // Usa la instancia importada apiClient
    const response = await apiClient.post('/roles', roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRole = async (id, roleData) => {
  try {
    // Usa la instancia importada apiClient
    const response = await apiClient.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    // Usa la instancia importada apiClient
    await apiClient.delete(`/roles/${id}`);
    return { success: true };
  } catch (error) {
    throw error;
  }
};