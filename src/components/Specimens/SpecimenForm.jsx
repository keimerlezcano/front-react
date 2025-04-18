// src/components/Specimens/SpecimenForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert, Spinner, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faArrowsAltV } from '@fortawesome/free-solid-svg-icons';

const SpecimenForm = ({
    initialData = null,
    categories = [],
    sedes = [],
    clients = [],
    onSubmit,
    onCancel,
    apiError,
    isSaving,
    isMoveMode = false
}) => {

    const getInitialFormData = useCallback(() => ({
        name: initialData?.name || '',
        breed: initialData?.breed || '',
        color: initialData?.color || '',
        birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
        specimenCategoryId: initialData?.specimenCategoryId?.toString() || '',
        sedeId: initialData?.sedeId?.toString() || '',
        clientId: initialData?.clientId?.toString() || '',
    }), [initialData]);

    const [formData, setFormData] = useState(getInitialFormData);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        setFormData(getInitialFormData());
        setFormError('');
    }, [initialData, getInitialFormData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError) setFormError('');
    };

    const validate = () => {
        if (isMoveMode) {
            const hasCategoryChanged = formData.specimenCategoryId && formData.specimenCategoryId !== (initialData?.specimenCategoryId?.toString() || '');
            const hasSedeChanged = formData.sedeId && formData.sedeId !== (initialData?.sedeId?.toString() || '');
            const hasClientChanged = formData.clientId && formData.clientId !== (initialData?.clientId?.toString() || '');
            if (!hasCategoryChanged && !hasSedeChanged && !hasClientChanged) {
                setFormError('Debe seleccionar una nueva Categoría, Sede o Propietario diferente al actual.');
                return false;
            }
        } else {
            if (!formData.name?.trim()) { setFormError('El Nombre del ejemplar es obligatorio.'); return false; }
            if (!formData.specimenCategoryId) { setFormError('La Categoría es obligatoria.'); return false; }
            // Agrega aquí validación si el cliente es obligatorio al crear
            // if (!initialData && !formData.clientId) { setFormError('El Propietario es obligatorio al crear.'); return false;}
        }
        setFormError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate() || isSaving) return;
        const specimenId = initialData?.id || initialData?._id;
        const dataToSend = {
            name: formData.name.trim(),
            breed: formData.breed?.trim() || null,
            color: formData.color?.trim() || null,
            birthDate: formData.birthDate || null,
            specimenCategoryId: formData.specimenCategoryId ? parseInt(formData.specimenCategoryId, 10) : null,
            sedeId: formData.sedeId ? parseInt(formData.sedeId, 10) : null,
            clientId: formData.clientId ? parseInt(formData.clientId, 10) : null,
        };

         if (isMoveMode) {
             const movePayload = {};
             if (dataToSend.specimenCategoryId !== (initialData?.specimenCategoryId || null)) movePayload.specimenCategoryId = dataToSend.specimenCategoryId;
             if (dataToSend.sedeId !== (initialData?.sedeId || null)) movePayload.sedeId = dataToSend.sedeId;
             if (dataToSend.clientId !== (initialData?.clientId || null)) movePayload.clientId = dataToSend.clientId;
             console.log('[SpecimenForm] Enviando datos (Modo Mover):', movePayload, 'para ID:', specimenId);
             if (Object.keys(movePayload).length > 0) {
                onSubmit(movePayload, specimenId);
             } else {
                console.log('[SpecimenForm] Modo Mover: No hubo cambios detectados.');
                onCancel(); // Simplemente cierra si no hay cambios
             }
         } else {
             console.log('[SpecimenForm] Enviando datos (Crear/Editar):', dataToSend, 'para ID:', specimenId);
             onSubmit(dataToSend, specimenId);
         }
    };

    const readOnlyInMoveMode = isMoveMode;

    return (
        <Form onSubmit={handleSubmit}>
            {apiError && <Alert color="danger" className="mb-3" toggle={() => setFormError('')}>{apiError}</Alert>}
            {formError && <Alert color="warning" className="mb-3" toggle={() => setFormError('')}>{formError}</Alert>}

            {/* Fila 1: Nombre, Categoría */}
            <Row className="mb-3"> {/* Quitamos prop 'form' */}
                <Col md={6}>
                    <FormGroup>
                        <Label for="specimenName" className="fw-bold">Nombre</Label>
                        <Input id="specimenName" name="name" type="text" value={formData.name} onChange={handleChange} readOnly={readOnlyInMoveMode} disabled={isSaving} bsSize="sm" required={!isMoveMode} />
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label for="specimenCategory" className="fw-bold">Categoría</Label>
                        <Input id="specimenCategory" name="specimenCategoryId" type="select" value={formData.specimenCategoryId} onChange={handleChange} disabled={isSaving || categories.length === 0} bsSize="sm" required={!isMoveMode}>
                            <option value="">-- Seleccione Categoría --</option>
                            {categories.map(cat => <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>)}
                        </Input>
                    </FormGroup>
                </Col>
            </Row>

            {/* Fila 2: Raza, Color */}
            <Row className="mb-3"> {/* Quitamos prop 'form' */}
                <Col md={6}>
                    <FormGroup>
                        <Label for="specimenBreed">Raza</Label>
                        <Input id="specimenBreed" name="breed" type="text" value={formData.breed} onChange={handleChange} readOnly={readOnlyInMoveMode} disabled={isSaving} bsSize="sm" />
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label for="specimenColor">Color</Label>
                        <Input id="specimenColor" name="color" type="text" value={formData.color} onChange={handleChange} readOnly={readOnlyInMoveMode} disabled={isSaving} bsSize="sm" />
                    </FormGroup>
                </Col>
            </Row>

             {/* Fila 3: Nacimiento, Sede */}
            <Row className="mb-3"> {/* Quitamos prop 'form' */}
                <Col md={6}>
                     <FormGroup>
                        <Label for="specimenBirthDate">Fecha Nacimiento</Label>
                        <Input id="specimenBirthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} readOnly={readOnlyInMoveMode} disabled={isSaving} bsSize="sm" />
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label for="specimenSede">Sede Actual</Label>
                        <Input id="specimenSede" name="sedeId" type="select" value={formData.sedeId} onChange={handleChange} disabled={isSaving || sedes.length === 0} bsSize="sm">
                            <option value="">-- Sin Asignar Sede --</option>
                            {sedes.map(sede => <option key={sede.id || sede._id} value={sede.id || sede._id}>{sede.NombreSede}</option>)}
                        </Input>
                    </FormGroup>
                </Col>
            </Row>

            {/* Fila 4: Cliente Propietario */}
            <Row className="mb-3"> {/* Quitamos prop 'form' */}
                <Col md={6}>
                    <FormGroup>
                        <Label for="specimenClient" className="fw-bold">Propietario</Label>
                        <Input id="specimenClient" name="clientId" type="select" value={formData.clientId} onChange={handleChange} disabled={isSaving || clients.length === 0} bsSize="sm">
                            <option value="">-- Sin Asignar Propietario --</option>
                            {clients.map(client => (
                                <option key={client.id || client._id} value={client.id || client._id}>
                                    {client.nombre} {/* Muestra solo el nombre */}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>
                </Col>
                 <Col md={6}></Col>
            </Row>

            {/* Botones de Acción */}
            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
                <Button type="button" color="secondary" onClick={onCancel} disabled={isSaving} size="sm"> <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar </Button>
                <Button type="submit" color={isMoveMode ? 'warning' : 'primary'} disabled={isSaving} size="sm">
                    {isSaving ? <Spinner size="sm" className="me-1"> </Spinner> : <FontAwesomeIcon icon={isMoveMode ? faArrowsAltV : faSave} className="me-1" />}
                    {isMoveMode ? 'Mover Ejemplar' : (initialData ? 'Guardar Cambios' : 'Crear Ejemplar')}
                </Button>
            </div>
        </Form>
    );
};

export default SpecimenForm;