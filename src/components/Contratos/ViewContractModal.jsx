// src/components/Contracts/ViewContractModal.jsx
import React from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge, ListGroup, ListGroupItem, Row, Col, Spinner
} from 'reactstrap';

// Asume que tienes estos helpers en un archivo utils o defínelos aquí
// import { formatDate, formatCurrency } from '../../utils/formatters';
// O cópialos/defínelos aquí si no:
const formatDate = (dateString) => {
    if (!dateString) return 'N/D'; try { const d = new Date(dateString); return isNaN(d.getTime()) ? 'N/D' : d.toLocaleDateString('es-ES', { timeZone: 'UTC' }); } catch (e) { return 'N/D'; }
};
const formatCurrency = (value) => {
    const n = parseFloat(value); return isNaN(n) ? 'N/D' : n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};


const ViewContractModal = ({
    isOpen,             // Booleano para controlar visibilidad
    toggle,             // Función para cerrar el modal
    contract,           // El objeto contrato a mostrar (puede ser null inicialmente)
    isLoadingDetails = false // Opcional: si cargas detalles adicionales
}) => {

    // Muestra un loader o nada si no hay contrato o está cargando
    if (!isOpen) return null;
    if (isLoadingDetails) {
        return (
             <Modal isOpen={isOpen} centered><ModalBody className="text-center p-4"><Spinner>Cargando detalles...</Spinner></ModalBody></Modal>
        );
    }
     if (!contract) {
         // Podrías mostrar un mensaje o simplemente no renderizar
         console.warn("ViewContractModal recibió 'isOpen' pero 'contract' es null.");
         return null; // O un modal con mensaje de error
     }

    // Extraer datos del contrato con valores por defecto
    const contractId = contract.id || contract._id || 'N/D';
    const estado = contract.estado || 'desconocido';
    const isActive = estado === 'activo';

    // Datos del Cliente (con acceso seguro)
    const clientName = contract.client?.nombre || 'No asignado';
    const clientDoc = contract.client?.documento || 'N/D';
    const clientEmail = contract.client?.correo || 'N/D';
    const clientPhone = contract.client?.celular || 'N/D';

    // Datos del Ejemplar (con acceso seguro, asume que puede haber 0 o 1)
    const specimen = contract.contractSpecimens?.[0]; // Toma el primero si existe
    const specimenName = specimen?.name || 'No asignado';
    const specimenId = specimen?.id || 'N/D';
    // Podrías añadir más datos del ejemplar si los incluyes en el backend

    // Datos de Servicios (con acceso seguro)
    const services = Array.isArray(contract.servicios) ? contract.servicios : [];

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable> {/* scrollable si el contenido es largo */}
            <ModalHeader toggle={toggle} className="bg-light">
                Detalles del Contrato #{contractId}
            </ModalHeader>
            <ModalBody className="p-4">

                {/* Información General del Contrato */}
                <h5 className="mb-3 border-bottom pb-2">Información General</h5>
                <Row className="mb-2">
                    <Col sm={3} className="fw-bold">ID Contrato:</Col><Col sm={9}>{contractId}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={3} className="fw-bold">Fecha Inicio:</Col><Col sm={9}>{formatDate(contract.fechaInicio)}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={3} className="fw-bold">Precio Mensual:</Col><Col sm={9}>{formatCurrency(contract.precioMensual)}</Col>
                </Row>
                <Row className="mb-3">
                    <Col sm={3} className="fw-bold">Estado:</Col>
                    <Col sm={9}>
                        <Badge color={isActive ? "success" : "secondary"} pill>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </Badge>
                    </Col>
                </Row>
                <hr />

                {/* Información del Cliente */}
                <h5 className="mb-3 border-bottom pb-2">Cliente</h5>
                <Row className="mb-2">
                    <Col sm={3} className="fw-bold">Nombre:</Col><Col sm={9}>{clientName}</Col>
                </Row>
                 <Row className="mb-2">
                    <Col sm={3} className="fw-bold">Documento:</Col><Col sm={9}>{clientDoc}</Col>
                </Row>
                 <Row className="mb-2">
                    <Col sm={3} className="fw-bold">Correo:</Col><Col sm={9}>{clientEmail}</Col>
                </Row>
                 <Row className="mb-3">
                    <Col sm={3} className="fw-bold">Celular:</Col><Col sm={9}>{clientPhone}</Col>
                </Row>
                <hr />

                {/* Información del Ejemplar */}
                <h5 className="mb-3 border-bottom pb-2">Ejemplar Asociado</h5>
                 <Row className="mb-3">
                    <Col sm={3} className="fw-bold">Nombre:</Col><Col sm={9}>{specimenName}</Col>
                </Row>
                {/* Aquí podrías añadir más detalles del ejemplar si los necesitas y los traes del backend */}
                <hr />

                {/* Servicios Asociados */}
                <h5 className="mb-3 border-bottom pb-2">Servicios Incluidos</h5>
                {services.length > 0 ? (
                   <ListGroup flush>
                      {services.map((service) => (
                           <ListGroupItem key={service.id || service._id} className="d-flex justify-content-between align-items-center ps-0 py-1">
                               {service.nombre || 'Servicio sin nombre'}
                               {service.precio && (
                                    <span className="text-muted small">{formatCurrency(service.precio)}</span>
                               )}
                           </ListGroupItem>
                       ))}
                   </ListGroup>
                ) : (
                   <p className="text-muted fst-italic">Este contrato no tiene servicios asociados.</p>
                )}

            </ModalBody>
            <ModalFooter className="border-top-0">
                <Button color="secondary" outline onClick={toggle}>Cerrar</Button>
            </ModalFooter>
        </Modal>
    );
};

export default ViewContractModal;