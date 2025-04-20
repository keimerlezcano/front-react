import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';

const SedeForm = ({ initialData = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({ NombreSede: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({ NombreSede: initialData.NombreSede || '' });
        } else {
            setFormData({ NombreSede: '' });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.NombreSede.trim()) {
            setError('El nombre de la sede es obligatorio.');
            return;
        }
        onSubmit(formData, initialData?.id);
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert color="danger">{error}</Alert>}
            <FormGroup>
                <Label for="NombreSede">Nombre de la Sede</Label>
                <Input
                    type="text"
                    id="NombreSede"
                    name="NombreSede"
                    value={formData.NombreSede}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre de la sede"
                    autoFocus
                />
            </FormGroup>
            <div className="d-flex justify-content-end gap-2">
                <Button color="secondary" onClick={onCancel}>Cancelar</Button>
                <Button color="primary" type="submit">Guardar</Button>
            </div>
        </Form>
    );
};

export default SedeForm;
