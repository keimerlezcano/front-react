import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../utils/apiClient';

const EjemplarContext = createContext();

export const useEjemplares = () => { // Cambia el nombre del hook si renombras el contexto
    const context = useContext(EjemplarContext);
    if (!context) throw new Error('useEjemplares must be used within an EjemplarProvider');
    return context;
};

export function EjemplarProvider({ children }) {
    const [ejemplares, setEjemplares] = useState([]);
    const [loadingEjemplares, setLoadingEjemplares] = useState(true);
    const [errors, setErrors] = useState([]);

    const getEjemplares = async () => {
        setLoadingEjemplares(true);
        try {
            const res = await axiosClient.get('/ejemplares'); // Ruta del backend
            setEjemplares(res.data);
            setErrors([]);
        } catch (error) {
            console.error("Error fetching ejemplares:", error.response?.data || error.message);
            setErrors(error.response?.data?.message || ['Error al cargar ejemplares']);
             setEjemplares([]);
        } finally {
            setLoadingEjemplares(false);
        }
    };

    const createEjemplar = async (ejemplarData) => {
        // ejemplarData: { nombre: '..', descripcion: '..', cantidad: N, sede: 'sede_id' }
        try {
            const res = await axiosClient.post('/ejemplares', ejemplarData);
            // Importante: La respuesta del backend puede incluir el objeto sede populado
            // o solo el ID. El estado debe ser consistente. Asumamos que devuelve el objeto completo.
            setEjemplares([...ejemplares, res.data]);
             setErrors([]);
            return true; // Éxito
        } catch (error) {
            console.error("Error creating ejemplar:", error.response?.data || error.message);
             const errorMessages = Array.isArray(error.response?.data) // A veces el backend devuelve un array de errores
                                 ? error.response.data
                                 : [error.response?.data?.message || 'Error al crear ejemplar'];
            setErrors(errorMessages);
            return false; // Fallo
        }
    };

    // Podrías añadir getEjemplar, updateEjemplar, deleteEjemplar aquí

    useEffect(() => {
        getEjemplares();
    }, []);

     // Limpiar errores (opcional)
     useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    return (
        <EjemplarContext.Provider value={{
            ejemplares,
            getEjemplares,
            createEjemplar,
            loadingEjemplares,
            errorsEjemplares: errors,
            // Exporta otras funciones si las añades (getEjemplar, updateEjemplar...)
        }}>
            {children}
        </EjemplarContext.Provider>
    );
};

// Exporta el contexto si lo necesitas directamente en algún sitio raro
export { EjemplarContext };