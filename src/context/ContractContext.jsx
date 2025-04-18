// src/context/ContractContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";

// --- IMPORTACIÓN CORREGIDA ---
// Importa las funciones específicas que necesitas usando llaves {}
import {
    getAllContracts,
    createContract,
    updateContract,
    deleteContract
    // Importa getContractById si lo necesitas en este contexto
} from "../api/contractApi"; // Asegúrate que la ruta relativa sea correcta

// 1. Crear el Contexto
const ContractContext = createContext();

// 2. Hook Personalizado para usar el Contexto (Exportado)
// Permite a otros componentes acceder fácilmente al contexto.
export const useContracts = () => {
    const context = useContext(ContractContext);
    if (!context) {
        // Error si se usa fuera del Provider
        throw new Error("useContracts debe ser usado dentro de un ContractProvider");
    }
    return context;
};

// 3. Componente Provider (Exportado)
// Envuelve las partes de la aplicación que necesitan acceso a los datos de contratos.
export const ContractProvider = ({ children }) => {
  // --- Estados Internos del Provider ---
  const [contratos, setContratos] = useState([]); // Almacena la lista de contratos
  const [isLoading, setIsLoading] = useState(false); // Indica si se está realizando una operación API
  const [error, setError] = useState(null); // Almacena mensajes de error de la API

  // --- Funciones Helper ---

  // Función para obtener un mensaje de error más legible desde la respuesta de error de Axios/API
  const getFriendlyError = useCallback((err) => {
      // Intenta obtener el mensaje específico del backend, si no, el mensaje general del error
      return err?.response?.data?.message || err?.message || "Ocurrió un error desconocido";
  }, []); // No tiene dependencias

  // --- Funciones de Interacción con la API (envueltas en useCallback) ---

  // Carga todos los contratos desde la API
  const cargarContratos = useCallback(async () => {
    setIsLoading(true); // Inicia indicador de carga
    setError(null);    // Limpia errores previos
    try {
      // Llama directamente a la función importada de la API
      const data = await getAllContracts();
      // Asegura que el estado siempre sea un array
      setContratos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error en ContractContext al cargar contratos:", err);
      setError(getFriendlyError(err)); // Guarda el mensaje de error
      setContratos([]); // Limpiar datos en caso de error
    } finally {
      setIsLoading(false); // Finaliza indicador de carga
    }
  }, [getFriendlyError]); // Depende de getFriendlyError (que es estable)

  // Efecto para cargar los contratos cuando el Provider se monta por primera vez
  useEffect(() => {
    cargarContratos();
  }, [cargarContratos]); // Se ejecuta si cargarContratos cambia (solo al montar gracias a useCallback)

  // Añade un nuevo contrato a través de la API
  const agregarNuevoContrato = useCallback(async (contratoData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Llama directamente a la función de la API
      const nuevoContrato = await createContract(contratoData);
      // Actualiza el estado local añadiendo el nuevo contrato a la lista existente
      setContratos(prevContratos => [...prevContratos, nuevoContrato]);
      return nuevoContrato; // Devuelve el objeto del nuevo contrato creado
    } catch (err) {
      console.error("Error en ContractContext al agregar contrato:", err);
      const friendlyError = getFriendlyError(err);
      setError(friendlyError);
      throw new Error(friendlyError); // Relanza el error para que el componente que llama pueda manejarlo
    } finally {
      setIsLoading(false);
    }
  }, [getFriendlyError]); // Depende de getFriendlyError

  // Actualiza un contrato existente a través de la API
  const actualizarContratoContext = useCallback(async (id, contratoActualizado) => {
    setIsLoading(true);
    setError(null);
    const contractId = id?.toString(); // Asegurar que ID sea string para comparación segura
    if (!contractId) {
        const errMsg = "ID inválido proporcionado para actualizar contrato";
        console.error(errMsg);
        setError(errMsg);
        setIsLoading(false);
        throw new Error(errMsg); // Lanzar error si el ID no es válido
    }
    try {
      // Llama directamente a la función de la API
      const contratoDevuelto = await updateContract(contractId, contratoActualizado);
      // Actualiza el estado local reemplazando el contrato modificado en la lista
      setContratos(prevContratos =>
        prevContratos.map(c => ((c.id || c._id)?.toString() === contractId ? contratoDevuelto : c))
      );
      return contratoDevuelto; // Devuelve el contrato actualizado
    } catch (err) {
      console.error(`Error en ContractContext al actualizar contrato ID: ${contractId}`, err);
      const friendlyError = getFriendlyError(err);
      setError(friendlyError);
      throw new Error(friendlyError); // Relanza el error
    } finally {
      setIsLoading(false);
    }
  }, [getFriendlyError]); // Depende de getFriendlyError

  // Elimina un contrato a través de la API
  const eliminarContratoContext = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    const contractId = id?.toString(); // Asegurar que ID sea string
     if (!contractId) {
        const errMsg = "ID inválido proporcionado para eliminar contrato";
        console.error(errMsg);
        setError(errMsg);
        setIsLoading(false);
        throw new Error(errMsg); // Lanzar error si el ID no es válido
    }
    try {
      // Llama directamente a la función de la API
      await deleteContract(contractId);
      // Actualiza el estado local filtrando (eliminando) el contrato de la lista
      setContratos(prevContratos =>
        prevContratos.filter(c => (c.id || c._id)?.toString() !== contractId)
      );
      // No se devuelve nada específico en delete exitoso
    } catch (err) {
      console.error(`Error en ContractContext al eliminar contrato ID: ${contractId}`, err);
      const friendlyError = getFriendlyError(err);
      setError(friendlyError);
      throw new Error(friendlyError); // Relanza el error
    } finally {
      setIsLoading(false);
    }
  }, [getFriendlyError]); // Depende de getFriendlyError

  // --- Valor del Contexto ---
  // Se utiliza useMemo para evitar que el objeto contextValue se recree en cada render
  // si ninguna de sus dependencias (estados o funciones) ha cambiado.
  const contextValue = useMemo(() => ({
    contratos,                // La lista actual de contratos
    isLoading,                // Indicador de carga
    error,                    // Mensaje de error (si existe)
    cargarContratos,          // Función para recargar la lista
    agregarNuevoContrato,     // Función para añadir un contrato
    actualizarContratoContext,// Función para modificar un contrato
    eliminarContratoContext   // Función para borrar un contrato
  }), [
    contratos, isLoading, error, cargarContratos, // Dependencias del useMemo
    agregarNuevoContrato, actualizarContratoContext, eliminarContratoContext
  ]);

  // --- Renderizado del Provider ---
  // Envuelve a los componentes hijos con el Context.Provider,
  // pasándoles el contextValue calculado.
  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};