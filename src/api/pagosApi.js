// src/api/pagosApi.js

// --- IMPORTA la instancia centralizada ---
import apiClient from '../utils/apiClient'; // <<< ASEGÚRATE QUE LA RUTA SEA CORRECTA >>>

// --- Funciones API (usan el apiClient IMPORTADO y rutas completas) ---

export const obtenerPagos = async () => {
  const path = '/pagos'; // Ruta completa relativa a apiClient baseURL
  try {
    console.log(`[pagosApi] GET ${path}`);
    const response = await apiClient.get(path);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error en pagosApi.obtenerPagos (${path}):`, error);
    throw error;
  }
};

export const obtenerPagosPorContrato = async (contractId) => {
    const path = `/pagos/contract/${contractId}`; // Ruta completa
    try {
        console.log(`[pagosApi] GET ${path}`);
        const response = await apiClient.get(path);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error en pagosApi.obtenerPagosPorContrato (Path: ${path}):`, error);
        throw error;
    }
};

export const obtenerPagoPorId = async (id) => {
    const path = `/pagos/${id}`; // Ruta completa
    try {
        console.log(`[pagosApi] GET ${path}`);
        const response = await apiClient.get(path);
        return response.data;
    } catch (error) {
        console.error(`Error en pagosApi.obtenerPagoPorId (Path: ${path}):`, error);
        throw error;
    }
};

export const guardarPago = async (pago) => {
  const isUpdating = !!pago.id_pago;
  const path = isUpdating ? `/pagos/${pago.id_pago}` : '/pagos'; // Ruta completa
  const method = isUpdating ? 'put' : 'post';
  try {
    console.log(`[pagosApi] ${method.toUpperCase()} ${path}`, pago);
    const response = await apiClient[method](path, pago);
    return response.data;
  } catch (error) {
    console.error(`Error en pagosApi.guardarPago (${method.toUpperCase()} ${path}):`, error);
    throw error;
  }
};

export default {
    obtenerPagos,
    obtenerPagosPorContrato,
    obtenerPagoPorId,
    guardarPago
};
