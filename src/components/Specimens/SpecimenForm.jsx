import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
    Spinner,
    Alert,
    FormFeedback
} from 'reactstrap';

import { getAllCategories as getCategories } from '../../api/categoryApi.js';
import { getAllClients } from '../../api/clientApi.js';
import { getAllContracts } from '../../api/contractApi.js';
import SpecimenService from '../../api/specimenApi.js'

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn("Invalid date received:", dateString);
            return '';
        }
        return date.toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return '';
    }
};

const SpecimenForm = ({ onSubmit, initialData = null, isEditMode = false, categories: propCategories = [], sedes = [], clients: propClients = [], contracts: propContracts = [], apiError = null, isSaving = false, isMoveMode = false, onCancel = null }) => {
    const [formData, setFormData] = useState({ name: '', breed: '', color: '', birthDate: '', clientId: '', specimenCategoryId: '', contractId: '', identifier: '', sedeId: '' });
    const [categories, setCategories] = useState(propCategories);
    const [clients, setClients] = useState(propClients);
    const [contracts, setContracts] = useState(propContracts);
    const [loading, setLoading] = useState({ submit: false });
    const [errors, setErrors] = useState({ form: apiError });
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                breed: initialData.breed || '',
                color: initialData.color || '',
                birthDate: formatDateForInput(initialData.birthDate) || '',
                clientId: initialData.clientId || '',
                specimenCategoryId: initialData.specimenCategoryId || '',
                contractId: initialData.contractId || '',
                identifier: initialData.identifier || '',
                sedeId: initialData.sedeId || '',
            });
        } else {
            setFormData({ name: '', breed: '', color: '', birthDate: '', clientId: '', specimenCategoryId: '', contractId: '', identifier: '', sedeId: '' });
        }
        setErrors({ form: apiError });
        setFieldErrors({});
    }, [initialData, apiError]);

    useEffect(() => { setCategories(propCategories); }, [propCategories]);
    useEffect(() => { setClients(propClients); }, [propClients]);
    useEffect(() => { setContracts(propContracts); }, [propContracts]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const newValue = (name === 'clientId' || name === 'specimenCategoryId' || name === 'sedeId' || name === 'contractId') && value !== ''
                             ? parseInt(value, 10)
                             : value;
            return { ...prev, [name]: newValue };
        });
        if (errors.form) setErrors(prev => ({ ...prev, form: null }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newFieldErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newFieldErrors.name = 'El nombre es obligatorio.';
            isValid = false;
        }
        if (!formData.specimenCategoryId) {
             newFieldErrors.specimenCategoryId = 'La categoría es obligatoria.';
             isValid = false;
        }
         if (!formData.sedeId) {
             newFieldErrors.sedeId = 'La sede es obligatoria.';
             isValid = false;
         }

        setFieldErrors(newFieldErrors);
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors(prev => ({ ...prev, form: null }));

        if (!validateForm()) {
            return;
        }

        setLoading(prev => ({ ...prev, submit: true }));

        try {
            const dataToSend = { ...formData };
            for (const key of ['clientId', 'contractId']) {
                if (dataToSend[key] === '') {
                    dataToSend[key] = null;
                }
            }
            dataToSend.birthDate = dataToSend.birthDate || null;

            console.log("Submitting form data:", dataToSend);
            await onSubmit(dataToSend);

             if (!isEditMode) {
                setFormData({ name: '', breed: '', color: '', birthDate: '', clientId: '',
                              specimenCategoryId: '', contractId: '', identifier: '', sedeId: '' });
                setFieldErrors({});
            }

        } catch (error) {
            console.error("Error submitting specimen form:", error);
            const message = SpecimenService.getErrorMessage ? SpecimenService.getErrorMessage(error) : (error.message || 'Error al guardar el ejemplar.');
            setErrors(prev => ({ ...prev, form: message }));
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    return (
        <Form onSubmit={handleSubmit} noValidate>
            <h4>
                {isEditMode ? 'Editar Ejemplar' : 'Crear Nuevo Ejemplar'}
            </h4>
             <hr/>

            {errors.form && (
                <Alert color="danger" isOpen={!!errors.form} toggle={() => setErrors(prev => ({ ...prev, form: null }))}>
                    {errors.form}
                </Alert>
            )}

            <Row>
                <Col md={6}>
                    <FormGroup>
                        <Label for="name">Nombre del Ejemplar <span className="text-danger">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            invalid={!!fieldErrors.name}
                            autoFocus
                        />
                        {fieldErrors.name && <FormFeedback>{fieldErrors.name}</FormFeedback>}
                    </FormGroup>
                </Col>

                <Col md={6}>
                    <FormGroup>
                         <Label for="sedeId">Sede <span className="text-danger">*</span></Label>
                         <Input
                            id="sedeId"
                            name="sedeId"
                            type="select"
                            value={formData.sedeId}
                            onChange={handleChange}
                            required
                            invalid={!!fieldErrors.sedeId}
                            disabled={sedes.length === 0}
                        >
                            <option value="">-- Seleccione Sede --</option>
                            {sedes.length > 0 && sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}>
                                    {sede.name}
                                </option>
                            ))}
                            {sedes.length === 0 && <option disabled>No hay sedes disponibles</option>}
                        </Input>
                    </FormGroup>
                </Col>

                <Col md={6}>
                     <FormGroup>
                         <Label for="specimenCategoryId">Categoría <span className="text-danger">*</span></Label>
                         <Input
                            id="specimenCategoryId"
                            name="specimenCategoryId"
                            type="select"
                            value={formData.specimenCategoryId}
                            onChange={handleChange}
                            required
                            invalid={!!fieldErrors.specimenCategoryId || !!errors.categories}
                            disabled={loading.categories || categories.length === 0}
                        >
                            <option value="">-- Seleccione Categoría --</option>
                            {loading.categories && <option disabled>Cargando Categorías...</option>}
                            {!loading.categories && categories.length > 0 && categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                             {!loading.categories && categories.length === 0 && <option disabled>No hay categorías</option>}
                        </Input>
                        {(fieldErrors.specimenCategoryId || errors.categories) && (
                            <FormFeedback>{fieldErrors.specimenCategoryId || errors.categories}</FormFeedback>
                        )}
                    </FormGroup>
                </Col>

                <Col md={6}>
                     <FormGroup>
                         <Label for="breed">Raza (Opcional)</Label>
                         <Input
                            id="breed"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                        />
                    </FormGroup>
                </Col>

                <Col md={6}>
                     <FormGroup>
                         <Label for="color">Color (Opcional)</Label>
                         <Input
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                        />
                    </FormGroup>
                </Col>

                <Col md={6}>
                     <FormGroup>
                         <Label for="birthDate">Fecha de Nacimiento (Opcional)</Label>
                         <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                        />
                    </FormGroup>
                </Col>

                <Col md={6}>
                     <FormGroup>
                         <Label for="clientId">Cliente/Propietario (Opcional)</Label>
                         <Input
                            id="clientId"
                            name="clientId"
                            type="select"
                            value={formData.clientId}
                            onChange={handleChange}
                            disabled={loading.clients}
                            invalid={!!errors.clients}
                        >
                            <option value="">-- Sin Cliente Asignado --</option>
                            {loading.clients && <option disabled>Cargando Clientes...</option>}
                            {!loading.clients && clients.length > 0 && clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </Input>
                         {errors.clients && <FormFeedback>{errors.clients}</FormFeedback>}
                    </FormGroup>
                </Col>

                <Col md={6}>
                     <FormGroup>
                         <Label for="contractId">Contrato (Opcional)</Label>
                         <Input
                            id="contractId"
                            name="contractId"
                            type="select"
                            value={formData.contractId}
                            onChange={handleChange}
                            disabled={loading.contracts}
                            invalid={!!errors.contracts}
                        >
                             <option value="">-- Sin Contrato Asignado --</option>
                             {loading.contracts && <option disabled>Cargando Contratos...</option>}
                            {!loading.contracts && contracts.length > 0 && contracts.map((contract) => (
                                <option key={contract.id} value={contract.id}>
                                     {`Contrato #${contract.id}` + (contract.client ? ` - ${contract.client.name}` : '')}
                                </option>
                            ))}
                        </Input>
                         {errors.contracts && <FormFeedback>{errors.contracts}</FormFeedback>}
                    </FormGroup>
                </Col>

                {isEditMode && formData.identifier && (
                     <Col md={12}>
                         <FormGroup>
                             <Label for="identifier">Identificador Único (UUID)</Label>
                             <Input
                                id="identifier"
                                name="identifier"
                                value={formData.identifier}
                                readOnly
                                className="text-muted"
                            />
                        </FormGroup>
                    </Col>
                 )}

            </Row>

             <Button
                 color="primary"
                 type="submit"
                 disabled={loading.submit || loading.venues || loading.categories}
                 className="mt-3 w-100"
             >
                 {loading.submit ? <Spinner size="sm" /> : (isEditMode ? 'Actualizar Ejemplar' : 'Crear Ejemplar')}
             </Button>
        </Form>
    );
};

export default SpecimenForm;
