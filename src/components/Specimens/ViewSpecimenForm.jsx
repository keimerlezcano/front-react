// src/components/Specimens/ViewSpecimenModal.jsx
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Alert } from 'reactstrap';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
         console.warn('[formatDate] Could not parse date:', dateString);
         return '-';
      }
      return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        });
    } catch (e) {
      console.error("[formatDate] Error formatting date:", dateString, e);
      return '-';
    }
};

const formatCurrency = (value) => {
    const n = parseFloat(value);
    if (isNaN(n)) {
        return 'N/D';
    }
    return n.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

const ViewSpecimenModal = ({
    isOpen,
    toggle,
    specimen,
    categoryName = 'N/A',
    sedeName = 'N/A',
    clientData = null
    }) => {

    if (!isOpen || !specimen) return null;

    const specimenId = specimen.id || specimen._id;
    const contractData = specimen.contract;

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static">
            <ModalHeader toggle={toggle} className="bg-light">
                {/* Detalles del Ejemplar: <span className="fw-bold">{specimen.name || 'Sin Nombre'}</span> */}
            </ModalHeader>
            <ModalBody className="p-4">

                <h5 className="mb-3 text-primary border-bottom pb-2">Información del Ejemplar</h5>
                <Row className="mb-2">
                    <Col md={3} className="fw-bold text-muted">Nombre:</Col>
                    <Col md={9}>{specimen.name || '-'}</Col>
                </Row>
                <Row className="mb-2">
                    <Col md={3} className="fw-bold text-muted">Raza:</Col>
                    <Col md={9}>{specimen.breed || '-'}</Col>
                </Row>
                <Row className="mb-2">
                    <Col md={3} className="fw-bold text-muted">Color:</Col>
                    <Col md={9}>{specimen.color || '-'}</Col>
                </Row>
                <Row className="mb-2">
                    <Col md={3} className="fw-bold text-muted">Fecha Nac.:</Col>
                    <Col md={9}>{formatDate(specimen.birthDate)}</Col>
                </Row>

                <hr className="my-4"/>

                <h5 className="mb-3 text-primary border-bottom pb-2">Ubicación y Clasificación</h5>
                <Row className="mb-2">
                    <Col md={3} className="fw-bold text-muted">Categoría:</Col>
                    <Col md={9}>{categoryName}</Col>
                </Row>
                <Row className="mb-2">
                    <Col md={3} className="fw-bold text-muted">Sede Actual:</Col>
                    <Col md={9}>{sedeName}</Col>
                </Row>

                <hr className="my-4"/>

                <h5 className="mb-3 text-primary border-bottom pb-2">Información del Propietario</h5>
                {clientData ? (
                    <>
                        <Row className="mb-2">
                            <Col md={3} className="fw-bold text-muted">Nombre:</Col>
                            <Col md={9}>{clientData.nombre || '-'}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md={3} className="fw-bold text-muted">Documento:</Col>
                            <Col md={9}>{clientData.documento || '-'}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md={3} className="fw-bold text-muted">Correo:</Col>
                            <Col md={9}>{clientData.correo || '-'}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md={3} className="fw-bold text-muted">Celular:</Col>
                            <Col md={9}>{clientData.celular || '-'}</Col>
                        </Row>
                    </>
                ) : (
                    <Alert color="secondary" className="text-center fst-italic py-2">Sin propietario asignado.</Alert>
                )}

                <hr className="my-4"/>

                <h5 className="mb-3 text-primary border-bottom pb-2">Información del Contrato Asociado</h5>
                {contractData ? (
                     <>
                        <Row className="mb-2">
                            <Col md={3} className="fw-bold text-muted">ID Contrato:</Col>
                            <Col md={9}>{contractData.id || 'N/D'}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md={3} className="fw-bold text-muted">Fecha Inicio:</Col>
                            <Col md={9}>{formatDate(contractData.fechaInicio)}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md={3} className="fw-bold text-muted">Precio Mensual:</Col>
                            <Col md={9}>{formatCurrency(contractData.precioMensual)}</Col>
                        </Row>
                        {contractData.hasOwnProperty('estado') && (
                            <Row className="mb-2">
                                <Col md={3} className="fw-bold text-muted">Estado Contrato:</Col>
                                <Col md={9}>
                                    <span className={`badge rounded-pill text-bg-${contractData.estado === 'activo' ? 'success' : 'secondary'}`}>
                                        {contractData.estado ? contractData.estado.charAt(0).toUpperCase() + contractData.estado.slice(1) : '-'}
                                    </span>
                                </Col>
                             </Row>
                         )}
                    </>
                ) : (
                    <Alert color="secondary" className="text-center fst-italic py-2"> Ejemplar sin contrato asociado directamente. </Alert>
                )}
            </ModalBody>
            <ModalFooter className="border-top-0 pt-0">
                <Button color="secondary" outline onClick={toggle}>Cerrar</Button>
            </ModalFooter>
        </Modal>
    );
};

export default ViewSpecimenModal;