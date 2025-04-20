// src/context/SedeProvider.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
// Asegúrate que la ruta a tu cliente axios configurado sea correcta
import apiClient from '../utils/apiClient';

// Crear el contexto para Sedes
const SedeContext = createContext();

// Hook personalizado para usar el contexto de Sedes fácilmente
export const useSedes = () => {
    const context = useContext(SedeContext);
    if (!context) {
        throw new Error('useSedes debe ser usado dentro de un SedeProvider');
    }
    return context;
};

// El componente Provider que envuelve la aplicación o partes de ella
export function SedeProvider({ children }) {
    // Estado para almacenar la lista de sedes
    const [sedes, setSedes] = useState([]);
    // Estado para indicar si se están cargando las sedes
    const [loadingSedes, setLoadingSedes] = useState(true);
    // Estado para almacenar errores relacionados con sedes
    const [errorsSedes, setErrorsSedes] = useState([]);

    // Función helper para obtener mensajes de error legibles (opcional pero útil)
    const getFriendlyError = useCallback((err) => {
        const apiMessage = err?.response?.data?.message;
        if (apiMessage) {
            // Si el backend envía un array de mensajes (p.ej., errores de validación)
            if (Array.isArray(apiMessage)) return apiMessage.join(', ');
            // Si envía un solo mensaje
            return apiMessage;
        }
        // Si no hay mensaje del backend, usa el mensaje general del error
        return err?.message || "Ocurrió un error desconocido";
    }, []);

    // Función para cargar todas las sedes desde la API
    const getSedes = useCallback(async () => {
        console.log("SedeProvider: Intentando cargar sedes..."); // Log para depuración
        setLoadingSedes(true);
        setErrorsSedes([]); // Limpiar errores previos
        try {
            // Llama a la API (asegúrate que /sedes sea la ruta correcta en tu backend)
            const res = await axiosClient.get('/sedes');
            // Guarda las sedes en el estado (asegura que sea un array)
            setSedes(Array.isArray(res.data) ? res.data : []);
            console.log("SedeProvider: Sedes cargadas:", res.data); // Log
        } catch (error) {
            console.error("SedeProvider: Error fetching sedes:", error);
            const friendlyError = getFriendlyError(error);
            setErrorsSedes([friendlyError]); // Guarda el error
            setSedes([]); // Limpia las sedes si hubo error
        } finally {
             setLoadingSedes(false); // Termina la carga
        }
    }, [getFriendlyError]); // Dependencia

    // Función para crear una nueva sede a través de la API
    const createSede = useCallback(async (sedeData) => {
        // sedeData viene del formulario { nombre, direccion, telefono }
        setErrorsSedes([]); // Limpia errores previos
        console.log("SedeProvider: Intentando crear sede:", sedeData); // Log
        try {
            // Llama a la API (asegúrate que /sedes sea la ruta POST correcta)
            const res = await axiosClient.post('/sedes', sedeData);
            // Añade la nueva sede a la lista existente en el estado
            setSedes(prevSedes => [...prevSedes, res.data]);
            console.log("SedeProvider: Sede creada:", res.data); // Log
            return true; // Indica que la operación fue exitosa
        } catch (error) {
            console.error("SedeProvider: Error creating sede:", error);
            const friendlyError = getFriendlyError(error);
            // Guarda el o los mensajes de error
            const errorMessages = Array.isArray(error.response?.data?.message)
                                 ? error.response.data.message
                                 : [friendlyError];
            setErrorsSedes(errorMessages);
            return false; // Indica que la operación falló
        }
        // No se necesita estado de carga para operaciones rápidas como crear
    }, [getFriendlyError]); // Dependencia

    // Efecto para cargar las sedes cuando el provider se monta
    useEffect(() => {
        getSedes();
    }, [getSedes]); // La dependencia asegura que solo se llame si getSedes cambia (que no lo hará gracias a useCallback)

    // Efecto para limpiar automáticamente los mensajes de error después de un tiempo
    useEffect(() => {
        if (errorsSedes.length > 0) {
            const timer = setTimeout(() => {
                setErrorsSedes([]);
            }, 7000); // Muestra errores por 7 segundos
            // Limpia el temporizador si el componente se desmonta o si los errores cambian
            return () => clearTimeout(timer);
        }
    }, [errorsSedes]);

    // Memoizar el valor del contexto para optimizar el rendimiento
    // Solo se recalculará si una de las dependencias cambia
    const contextValue = useMemo(() => ({
        sedes,              // La lista de sedes
        loadingSedes,       // El estado de carga
        errorsSedes,        // Los errores actuales
        getSedes,           // La función para cargar sedes
        createSede,         // La función para crear una sede
        // Aquí podrías añadir funciones para updateSede y deleteSede cuando las necesites
    }), [sedes, loadingSedes, errorsSedes, getSedes, createSede]); // Dependencias del useMemo

    // Devolver el Provider del contexto, pasando el valor calculado
    return (
        <SedeContext.Provider value={contextValue}>
            {children} {/* Renderiza los componentes hijos envueltos */}
        </SedeContext.Provider>
    );
};

// Puedes exportar el contexto si lo necesitas directamente en algún sitio,
// pero generalmente usarás el hook useSedes.
// export { SedeContext };