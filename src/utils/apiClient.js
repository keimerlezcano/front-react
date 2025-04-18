// src/utils/apiClient.js (CORRECTO)
import axios from "axios";

const SERVER_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 1. CREA la instancia primero
const apiClient = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
});

// 2. APLICA interceptores a la instancia YA CREADA
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log(`[apiClient Request] Path: ${config.url}, Token found: ${token ? 'Yes' : 'No'}`);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
     console.error("[apiClient Request] Error:", error);
     return Promise.reject(error);
  }
);

// 3. APLICA interceptor de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const configUrl = error.config?.url;
    const responseData = error.response?.data; // Obtener datos de respuesta
    const errorMessage = responseData?.message || responseData?.error || (Array.isArray(responseData?.errors) ? JSON.stringify(responseData.errors) : null) || error.message || "Error desconocido";

    console.error(`[apiClient Response] Path: ${configUrl}, Status: ${status || 'Network'}, Message: ${errorMessage}`);
    console.error("[apiClient Response] Full Response Data:", responseData); // Log detallado
    // console.error("[apiClient Response] Full Error Object:", error); // Log más completo si es necesario

    // *** RE-HABILITA LA REDIRECCIÓN DESPUÉS DE DEPURAR EL 400 ***
    // if (status === 401 || status === 403) {
    //    if (!configUrl?.includes('/auth/login')) {
    //        console.warn("[apiClient] Unauthorized/Forbidden. Redirecting to login.");
    //        localStorage.removeItem('authToken');
    //        if (window.location.pathname !== '/login') {
    //           window.location.href = '/login';
    //        }
    //    }
    // }
    // **********************************************************

    return Promise.reject(new Error(errorMessage));
  }
);

// 4. EXPORTA la instancia configurada
export default apiClient;