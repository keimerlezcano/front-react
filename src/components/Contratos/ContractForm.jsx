// src/components/Contracts/ContractForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Form, FormGroup, Label, Input, Button, Alert, Spinner, Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import Select from 'react-select'; // <<< 1. Importa react-select
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// APIs
import { getAllClients } from '../../api/clientApi';
import { getAllServices } from '../../api/servicesApi';
import { getAllSpecimens } from '../../api/specimenApi';

// Helper para formatear moneda (si no lo tienes en un archivo utils)
const formatDropdownCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '';
    return number.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const ContractForm = ({
    isOpen,
    toggle,
    initialData = null,
    onSubmit,
    apiError,
    isSaving,
}) => {

    const getInitialFormData = useCallback(() => ({
        fechaInicio: initialData?.fechaInicio ? new Date(initialData.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        precioMensual: initialData?.precioMensual || '',
        clientId: initialData?.client?.id?.toString() || '',
        estado: initialData?.estado || 'activo',
        // serviceIds sigue siendo un array de IDs (strings o números, react-select manejará strings)
        serviceIds: initialData?.servicios ? initialData.servicios.map(s => (s.id || s._id).toString()) : [],
        specimenIdToAssociate: '',
        currentSpecimenName: initialData?.contractSpecimens?.[0]?.name || null
    }), [initialData]);

    const [formData, setFormData] = useState(getInitialFormData);
    const [formError, setFormError] = useState('');

    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]); // Lista original de servicios de la API
    const [availableSpecimens, setAvailableSpecimens] = useState([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

    // Carga de datos para dropdowns (igual que antes)
    useEffect(() => {
        if (!isOpen) return;
        const loadDropdownData = async () => {
            setIsLoadingDropdowns(true);
            setFormError('');
            try {
                const [clientsData, servicesData, specimensData] = await Promise.all([
                    getAllClients(),
                    getAllServices(),
                    !initialData ? getAllSpecimens() : Promise.resolve([])
                ]);
                setClients(Array.isArray(clientsData) ? clientsData : []);
                setServices(Array.isArray(servicesData) ? servicesData : []); // Guarda servicios
                if (!initialData) {
                    const specimensWithoutContract = Array.isArray(specimensData) ? specimensData.filter(spec => !spec.contractId) : [];
                    setAvailableSpecimens(specimensWithoutContract);
                } else {
                    setAvailableSpecimens([]);
                }
            } catch (error) {
                console.error("Error cargando datos para formulario de contrato:", error);
                setFormError("Error al cargar opciones.");
                setClients([]); setServices([]); setAvailableSpecimens([]);
            } finally {
                setIsLoadingDropdowns(false);
            }
        };
        loadDropdownData();
    }, [isOpen, initialData]);

    // Resetear formulario al cambiar initialData (igual que antes)
    useEffect(() => {
        setFormData(getInitialFormData());
        setFormError('');
    }, [initialData, getInitialFormData]);

    // Handler para inputs normales (igual que antes)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError) setFormError('');
    };

    // --- 2. Prepara las opciones para react-select ---
    const serviceOptions = useMemo(() => {
        return services.map(service => ({
            value: service.id.toString(), // El ID como string (o número)
            // La etiqueta que ve el usuario (nombre + precio opcional)
            label: `${service.nombre} ${service.precio ? `(${formatDropdownCurrency(service.precio)})` : ''}`
        }));
    }, [services]);

    // --- 3. Encuentra los objetos de opción que corresponden a los IDs seleccionados ---
    const selectedServiceOptions = useMemo(() => {
        // formData.serviceIds es ['1', '3']
        // serviceOptions es [{value: '1', label: '...'}, {value: '2', ...}]
        // Filtramos serviceOptions para obtener los objetos completos que coinciden con los IDs guardados
        return serviceOptions.filter(option => formData.serviceIds.includes(option.value));
    }, [formData.serviceIds, serviceOptions]);

    // --- 4. Handler para cambios en react-select ---
    const handleReactSelectChange = (selectedOptions) => {
        // react-select pasa un array de los objetos de opción seleccionados (o null)
        // Extraemos solo los 'value' (IDs) de esos objetos
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        // Actualizamos formData.serviceIds con el nuevo array de IDs
        setFormData(prev => ({ ...prev, serviceIds: selectedIds }));
        if (formError) setFormError(''); // Limpia error si el usuario interactúa
    };


    // Validación (igual que antes, ya verifica serviceIds.length)
    const validate = () => {
        if (!formData.fechaInicio) { setFormError('La Fecha de inicio es obligatoria.'); return false; }
        if (!formData.precioMensual || isNaN(parseFloat(formData.precioMensual)) || parseFloat(formData.precioMensual) < 0) {
             setFormError('El Precio mensual debe ser un número válido (mayor o igual a 0).'); return false;
        }
        if (!formData.clientId) { setFormError('Debe seleccionar un Cliente.'); return false; }
        if (!initialData && !formData.specimenIdToAssociate) {
            setFormError('Debe seleccionar un Ejemplar al crear un contrato.'); return false;
        }
        if (!formData.estado) { setFormError('Debe seleccionar un Estado.'); return false; }
        // Validar que al menos un servicio sea seleccionado
        if (formData.serviceIds.length === 0) {
            setFormError('Debe seleccionar al menos un Servicio.');
            return false;
        }
        setFormError('');
        return true;
    };

    // Submit (igual que antes, ya convierte serviceIds a números al enviar)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate() || isSaving || isLoadingDropdowns) return;
        const contractId = initialData?.id || initialData?._id;
        const dataToSend = {
            fechaInicio: formData.fechaInicio,
            precioMensual: parseFloat(formData.precioMensual),
            clientId: parseInt(formData.clientId, 10),
            estado: formData.estado,
            // Asegura enviar array de números
            serviceIds: formData.serviceIds.map(id => parseInt(id, 10)),
            ...( !contractId && formData.specimenIdToAssociate && { specimenIdToAssociate: parseInt(formData.specimenIdToAssociate, 10) } )
        };
        console.log('[ContractForm] Enviando datos:', dataToSend, 'para ID:', contractId);
        onSubmit(dataToSend, contractId);
    };

    const formId = initialData ? `contract-form-edit-${initialData.id}` : 'contract-form-new';
    const modalTitle = initialData ? `Editar Contrato (ID: ${initialData.id || initialData._id})` : 'Nuevo Contrato';

    return (
        <Modal isOpen={isOpen} toggle={toggle} backdrop="static" size="lg" centered>
            <ModalHeader toggle={toggle} closeAriaLabel="Cerrar">{modalTitle}</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit} id={formId}>
                    {apiError && <Alert color="danger" className="mb-3" fade={false}>{apiError}</Alert>}
                    {formError && <Alert color="warning" className="mb-3" fade={false}>{formError}</Alert>}
                    {isLoadingDropdowns && <div className="text-center mb-3"><Spinner size="sm">Cargando opciones...</Spinner></div>}

                    <Row>
                        <Col md={6}><FormGroup><Label for={`${formId}-fechaInicio`} className="fw-bold">Fecha Inicio *</Label><Input type="date" name="fechaInicio" id={`${formId}-fechaInicio`} value={formData.fechaInicio} onChange={handleChange} required disabled={isSaving || isLoadingDropdowns} bsSize="sm" /></FormGroup></Col>
                        <Col md={6}><FormGroup><Label for={`${formId}-precioMensual`} className="fw-bold">Precio Mensual *</Label><Input type="number" step="0.01" name="precioMensual" id={`${formId}-precioMensual`} value={formData.precioMensual} onChange={handleChange} required min="0" disabled={isSaving || isLoadingDropdowns} bsSize="sm" placeholder="Ej: 150000" /></FormGroup></Col>
                    </Row>
                    <Row>
                        <Col md={6}><FormGroup><Label for={`${formId}-clientId`} className="fw-bold">Cliente *</Label><Input type="select" name="clientId" id={`${formId}-clientId`} value={formData.clientId} onChange={handleChange} required disabled={isSaving || isLoadingDropdowns || !!initialData} bsSize="sm"><option value="">-- Seleccione Cliente --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>)}</Input>{!!initialData && <small className="text-muted d-block">Cliente no editable.</small>}</FormGroup></Col>
                        <Col md={6}><FormGroup><Label for={`${formId}-specimenIdToAssociate`} className="fw-bold">Ejemplar {initialData ? '' : '*'}</Label>{!initialData ? (<Input type="select" name="specimenIdToAssociate" id={`${formId}-specimenIdToAssociate`} value={formData.specimenIdToAssociate} onChange={handleChange} required={!initialData} disabled={isSaving || isLoadingDropdowns} bsSize="sm"><option value="">-- Seleccione Ejemplar --</option>{availableSpecimens.map(ej => <option key={ej.id} value={ej.id}>{ej.name}</option>)}</Input>) : (<Input type="text" value={formData.currentSpecimenName || 'No asociado o no encontrado'} disabled bsSize="sm" />)}{!!initialData && <small className="text-muted d-block">Ejemplar no editable.</small>}</FormGroup></Col>
                    </Row>
                    <Row>
                        <Col md={6}><FormGroup><Label for={`${formId}-estado`} className="fw-bold">Estado *</Label><Input type="select" name="estado" id={`${formId}-estado`} value={formData.estado} onChange={handleChange} required disabled={isSaving || isLoadingDropdowns} bsSize="sm"><option value="activo">Activo</option><option value="finalizado">Finalizado</option><option value="cancelado">Cancelado</option></Input></FormGroup></Col>

                        {/* --- 5. Reemplaza el Input select múltiple con el componente Select --- */}
                        <Col md={6}>
                            <FormGroup>
                                 <Label for={`${formId}-serviceIds`} className="fw-bold">Servicios Asociados *</Label>
                                 <Select
                                     id={`${formId}-serviceIds`}
                                     isMulti // Permite selección múltiple
                                     name="serviceIds"
                                     options={isLoadingDropdowns ? [] : serviceOptions} // Opciones en formato {value, label}
                                     value={selectedServiceOptions} // Valor actual (array de objetos {value, label})
                                     onChange={handleReactSelectChange} // Handler para actualizar el estado
                                     placeholder="Seleccione uno o más servicios..."
                                     isLoading={isLoadingDropdowns}
                                     isDisabled={isSaving || isLoadingDropdowns}
                                     closeMenuOnSelect={false} // Mantiene el menú abierto al seleccionar
                                     className="react-select-container" // Clases para estilizar si es necesario
                                     classNamePrefix="react-select"
                                     isClearable={true} // Botón para limpiar selección
                                     noOptionsMessage={() => isLoadingDropdowns ? 'Cargando...' : 'No hay servicios disponibles'}
                                     // required // La validación manual es suficiente
                                 />
                                 {/* Muestra error de validación si es sobre servicios */}
                                 {formError.includes("Servicio") && <div className="text-danger small mt-1">{formError}</div>}
                             </FormGroup>
                        </Col>
                        {/* --- FIN DEL CAMBIO --- */}
                    </Row>

                     <ModalFooter className="border-top pt-3 pb-0 mt-3">
                         <Button type="button" color="secondary" outline onClick={toggle} disabled={isSaving} size="sm"> <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar </Button>
                         {/* Botón Guardar deshabilitado si no hay servicios seleccionados */}
                         <Button type="submit" color="primary" disabled={isSaving || isLoadingDropdowns || formData.serviceIds.length === 0} size="sm"> {isSaving ? <Spinner size="sm" className="me-1"/> : <FontAwesomeIcon icon={faSave} className="me-1" />} {initialData ? "Guardar Cambios" : "Crear Contrato"} </Button>
                     </ModalFooter>
                 </Form>
            </ModalBody>
        </Modal>
    );
};

export default ContractForm;