// src/components/Categories/CategoryForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const CategoryForm = ({ initialData = null, onSubmit, onCancel, apiError, isSaving }) => {
    const [name, setName] = useState('');
    const [estado, setEstado] = useState('activo'); // 'activo' o 'inactivo'
    const [formError, setFormError] = useState('');

    useEffect(() => {
        setFormError('');
        if (initialData) {
            setName(initialData.name || '');
            setEstado(initialData.estado || 'activo');
        } else {
            setName('');
            setEstado('activo');
        }
    }, [initialData]);

    const validate = () => {
        if (!name.trim()) { setFormError('Nombre obligatorio.'); return false; }
        if (name.trim().length < 3) { setFormError('Nombre debe tener 3+ caracteres.'); return false; }
        if (estado !== 'activo' && estado !== 'inactivo') { setFormError('Estado inválido.'); return false; }
        setFormError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate() || isSaving) return;
        onSubmit({ name: name.trim(), estado: estado }, initialData?.id || initialData?._id);
    };

    return (
        <Form onSubmit={handleSubmit}>
            {apiError && <Alert color="danger" className="mb-3">{apiError}</Alert>}
            {formError && <Alert color="warning" className="mb-3">{formError}</Alert>}

            <FormGroup>
                <Label for="categoryName" className="fw-bold">Nombre Categoría <span className="text-danger">*</span></Label>
                <Input id="categoryName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Reptiles" required disabled={isSaving} invalid={!!formError.includes("Nombre")} bsSize="sm" />
            </FormGroup>

            <FormGroup>
                 <Label for="categoryEstado" className="fw-bold">Estado</Label>
                 <Input id="categoryEstado" type="select" name="estado" value={estado} onChange={(e) => setEstado(e.target.value)} disabled={isSaving} bsSize="sm">
                     <option value="activo">Activo</option>
                     <option value="inactivo">Inactivo</option>
                 </Input>
                 {!!formError.includes("Estado") && <small className="text-danger">{formError}</small>}
            </FormGroup>

            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
                <Button color="secondary" outline onClick={onCancel} type="button" disabled={isSaving}>
                    <FontAwesomeIcon icon={faTimes} className="me-1"/> Cancelar
                </Button>
                <Button color="primary" type="submit" disabled={isSaving}>
                    {isSaving ? <Spinner size="sm" className="me-1"/> : <FontAwesomeIcon icon={faSave} className="me-1"/>}
                    {initialData ? 'Actualizar' : 'Crear'} Categoría
                </Button>
            </div>
        </Form>
    );
};

export default CategoryForm;