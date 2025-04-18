import apiClient from '../utils/apiClient'; 

export const getAllServices = async () => {
  try {
    // Usa la instancia importada apiClient
    const response = await apiClient.get('/services');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw error;
  }
};

export const getServiceById = async (id) => {
  try {
    // Usa la instancia importada apiClient
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createService = async (formData) => {
  try {
    // Usa la instancia importada apiClient
    const response = await apiClient.post('/services', formData);
    return response.data;
  } catch (error) {
    console.error("Catch final en createService:", error.message); // Mantén logs específicos si quieres
    throw error;
  }
};

export const updateService = async (id, formData) => {
  try {
    // Usa la instancia importada apiClient
    const response = await apiClient.put(`/services/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Catch final en updateService:", error.message);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
    // Usa la instancia importada apiClient
    await apiClient.delete(`/services/${id}`);
    return { success: true };
  } catch (error) {
    throw error;
  }
};