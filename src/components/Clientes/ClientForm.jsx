import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Spinner, Alert } from 'reactstrap';

const ClientForm = ({ initialData, onSubmit, onCancel, apiError, isSaving }) => {
    const [client, setClient] = useState({
        nombre: '',
        documento: '',
        correo: '',
        celular: '',
        ejemplares: 0,
        ...initialData 
    });

    // Efecto para actualizar el formulario si initialData cambia
    useEffect(() => {
        // console.log("ClientForm useEffect, initialData:", initialData); // Debug
        if (initialData) {
            // Asegura que todos los campos existan incluso si initialData no los trae
             setClient(prev => ({
                nombre: '',
                documento: '',
                correo: '',
                celular: '',
                ejemplares: 0,
                ...initialData // Aplica los datos recibidos
             }));
        } else {
            // Resetea el formulario si es para crear uno nuevo
            setClient({
                nombre: '',
                documento: '',
                correo: '',
                celular: '',
                ejemplares: 0,
            });
        }
    }, [initialData]); // Se ejecuta cuando initialData cambia

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // Convierte a número si el input es de tipo number
        const val = type === 'number' ? parseInt(value, 10) || 0 : value;
        setClient(prevClient => ({
            ...prevClient,
            [name]: val
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Llama a la función onSubmit pasada desde ClientsPage,
        // enviándole los datos actuales del formulario.
        // console.log("ClientForm handleSubmit, llamando a onSubmit con:", client); // Debug
        onSubmit(client);
    };

    // console.log("Renderizando ClientForm, estado client:", client); // Debug

    return (
        // Usa el componente Form de reactstrap
        <Form onSubmit={handleSubmit}>
            {/* Muestra el error de la API si existe */}
            {apiError && <Alert color="danger" className="mt-3 mb-3">{apiError}</Alert>}

            <FormGroup>
                <Label htmlFor="client-nombre">Nombre</Label>
                <Input
                    type="text"
                    name="nombre"
                    id="client-nombre"
                    value={client.nombre || ''} // Asegura que no sea null/undefined
                    onChange={handleChange}
                    placeholder="Nombre completo del cliente"
                    required
                    disabled={isSaving}
                />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="client-documento">Documento</Label>
                <Input
                    type="text"
                    name="documento"
                    id="client-documento"
                    value={client.documento || ''}
                    onChange={handleChange}
                    placeholder="Número de documento"
                    required
                    disabled={isSaving}
                />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="client-correo">Correo Electrónico</Label>
                <Input
                    type="email"
                    name="correo"
                    id="client-correo"
                    value={client.correo || ''}
                    onChange={handleChange}
                    placeholder="ejemplo@dominio.com"
                    required
                    disabled={isSaving}
                />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="client-celular">Celular</Label>
                <Input
                    type="text"
                    name="celular"
                    id="client-celular"
                    value={client.celular || ''}
                    onChange={handleChange}
                    placeholder="Número de celular"
                    // required
                    disabled={isSaving}
                />
            </FormGroup>

             <FormGroup>
                <Label htmlFor="client-ejemplares">Ejemplares Prestados</Label>
                <Input
                    type="number"
                    name="ejemplares"
                    id="client-ejemplares"
                    value={client.ejemplares || 0} // Asegura que no sea null/undefined
                    onChange={handleChange}
                    min="0"
                    required
                    disabled={isSaving}
                />
            </FormGroup>

            <div className="d-flex justify-content-end mt-4">
                <Button color="secondary" type="button" onClick={onCancel} disabled={isSaving} className="me-2">
                    Cancelar
                </Button>
                <Button color="primary" type="submit" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Spinner size="sm" className="me-1" /> Guardando...
                        </>
                    ) : (
                        initialData ? 'Actualizar Cliente' : 'Agregar Cliente'
                    )}
                </Button>
            </div>
        </Form>
    );
};

export default ClientForm;