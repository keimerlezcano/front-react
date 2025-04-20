import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllSedes } from '../api/sedeApi';

const SedesContext = createContext();

export const SedesProvider = ({ children }) => {
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSedes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllSedes();
            setSedes(data);
        } catch (err) {
            setError('Error al cargar sedes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSedes();
    }, [fetchSedes]);

    return (
        <SedesContext.Provider value={{ sedes, loading, error, fetchSedes }}>
            {children}
        </SedesContext.Provider>
    );
};

export const useSedes = () => {
    const context = useContext(SedesContext);
    if (!context) {
        throw new Error('useSedes debe usarse dentro de un SedesProvider');
    }
    return context;
};

export default SedesPage;