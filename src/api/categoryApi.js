// src/api/categoryApi.js
import apiClient from '../utils/apiClient';

// Funciones internas o renómbralas directamente a las exportadas
const internalGetCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) { throw error; }
};
const internalGetCategoryById = async (id) => {
   try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
   } catch (error) { throw error; }
};
const internalCreateCategory = async (categoryData) => {
   try {
      const response = await apiClient.post('/categories', categoryData);
      return response.data;
   } catch (error) { throw error; }
};
const internalUpdateCategory = async (id, categoryData) => {
   try {
       const response = await apiClient.put(`/categories/${id}`, categoryData);
       return response.data;
   } catch (error) { throw error; }
};
const internalDeleteCategory = async (id) => {
    try {
        await apiClient.delete(`/categories/${id}`);
        return { success: true };
    } catch (error) { throw error; }
};

// *** EXPORTA CON LOS NOMBRES CORRECTOS USADOS EN LA PÁGINA ***
export const getAllCategories = internalGetCategories;
export const getCategoryById = internalGetCategoryById;
export const createCategory = internalCreateCategory; // Exporta como createCategory
export const updateCategory = internalUpdateCategory;
export const deleteCategory = internalDeleteCategory;
// Ya no necesitas el alias export { getCategories as getAllCategories };