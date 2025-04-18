import axios from "axios";

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:3000/api/auth";
const API_USERS_URL = import.meta.env.VITE_API_USERS_URL || "http://localhost:3000/api/users";

const apiClient = axios.create({});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      if (!config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
          config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    console.error(`API Error (${status || 'Network'}):`, errorMessage);
    if (status === 401 || status === 403) {
       if (!error.config.url.includes('/auth/login')) {
            console.warn("Unauthorized/Forbidden. Redirecting to login.");
            localStorage.removeItem('authToken');
            if (window.location.pathname !== '/login') {
               window.location.href = '/login';
            }
       }
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const loginUserApi = async (credentials) => {
  try {
    const response = await apiClient.post(`${API_AUTH_URL}/login`, credentials);
    if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUserApi = async (userData) => {
  try {
    const response = await apiClient.post(`${API_AUTH_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllUsersApi = async () => {
  try {
    const response = await apiClient.get(API_USERS_URL);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw error;
  }
};

export const getUserByIdApi = async (id) => {
    try {
      const response = await apiClient.get(`${API_USERS_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
};

export const updateUserApi = async (id, userData) => {
  try {
    const response = await apiClient.put(`${API_USERS_URL}/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserApi = async (id) => {
  try {
    await apiClient.delete(`${API_USERS_URL}/${id}`);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const obtenerUsuarios = getAllUsersApi;
export const crearUsuario = registerUserApi;
export const actualizarUsuario = updateUserApi;
export const eliminarUsuario = deleteUserApi;
export const loginUsuario = loginUserApi;
export const obtenerUsuarioPorId = getUserByIdApi;