// src/components/ViewPagoForm.jsx
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Badge, Alert } from 'reactstrap';

// --- FORMATDATE SIMPLIFICADO ---
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Asume formato ISO o parseable por Date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Devuelve original si no es parseable

      // Muestra siempre solo la fecha, usando UTC para consistencia
      return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC' // Importante para mostrar el día correcto
      });
    } catch (e) { return '-'; }
};
// ------------------------------

const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '-';
    // Asegura que muestre sin decimales si son .00
    return number.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const ViewPagoModal = ({ isOpen, toggle, pago }) => {
    if (!isOpen || !pago) return null;

    // Acceso a datos relacionados (asegúrate que el backend los incluye como se espera)
    const contract = pago.contract;
    const client = contract?.client;
    // --- CORRECCIÓN DE ACCESO A EJEMPLAR ---
    // Usa el alias correcto 'contractSpecimens' definido en el repositorio/asociaciones
    const specimen = contract?.contractSpecimens?.[0]; // Toma el primero si es un array
    // ---------------------------------------
    // Accede al propietario a través del ejemplar (si está incluido anidado)
    const propietario = specimen?.propietario;

    // Log para depuración final (puedes quitarlo después)
    console.log("Datos completos recibidos en ViewPagoModal:", JSON.stringify(pago, null, 2));

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
            {/* <ModalHeader toggle={toggle} className="bg-light">
                Detalles del Pago (ID: {pago.id_pago || 'N/A'})
            </ModalHeader> */}
            <ModalBody className="p-4">
                 <>
                     <h5 className="mb-3 text-primary border-bottom pb-2">Información del Pago</h5>
                     <Row className="mb-2">
                        <Col md={4} className="fw-bold text-muted">Fecha Registro:</Col>
                        <Col md={8}>{formatDate(pago.fechaPago)}</Col> {/* Usa formatDate simplificado */}
                     </Row>
                     <Row className="mb-2">
                        <Col md={4} className="fw-bold text-muted">Valor Pagado:</Col>
                        <Col md={8} className="fw-bold text-success">{formatCurrency(pago.valor)}</Col>
                     </Row>
                     <Row className="mb-2">
                        <Col md={4} className="fw-bold text-muted">Método:</Col>
                        <Col md={8}>
                            <Badge color={pago.metodoPago === 'efectivo' ? 'success' : 'info'} pill>
                                {pago.metodoPago ? pago.metodoPago.charAt(0).toUpperCase() + pago.metodoPago.slice(1) : '-'}
                            </Badge>
                        </Col>
                     </Row>
                     <Row className="mb-2">
                        <Col md={4} className="fw-bold text-muted">Mes Corresp.:</Col>
                        <Col md={8}>{pago.mesPago || '-'}</Col>
                     </Row>

                     {contract ? (
                         <>
                             <hr className="my-4"/>
                             <h5 className="mb-3 text-primary border-bottom pb-2">Contrato Asociado (ID: {contract.id})</h5>
                             <Row className="mb-2">
                                <Col md={4} className="fw-bold text-muted">Inicio Contrato:</Col>
                                <Col md={8}>{formatDate(contract.fechaInicio)}</Col> {/* Usa formatDate simplificado */}
                             </Row>
                             <Row className="mb-2">
                                <Col md={4} className="fw-bold text-muted">Precio Base:</Col>
                                <Col md={8}>{formatCurrency(contract.precioMensual)}</Col>
                             </Row>
                             {/* Estado del contrato si viene del backend */}
                             {contract.estado && (
                                <Row className="mb-2">
                                    <Col md={4} className="fw-bold text-muted">Estado Contrato:</Col>
                                    <Col md={8}>
                                         <span className={`badge rounded-pill text-bg-${contract.estado === 'activo' ? 'success' : 'secondary'}`}>
                                             {contract.estado.charAt(0).toUpperCase() + contract.estado.slice(1)}
                                         </span>
                                    </Col>
                                </Row>
                             )}

                             {client ? (
                                 <>
                                     <Row className="mb-2 mt-3"><Col md={12} className="fw-bold">Cliente del Contrato:</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Nombre:</Col><Col md={8}>{client.nombre || '-'}</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Documento:</Col><Col md={8}>{client.documento || '-'}</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Correo:</Col><Col md={8}>{client.correo || '-'}</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Celular:</Col><Col md={8}>{client.celular || '-'}</Col></Row>
                                 </>
                             ) : <Alert color="secondary" className="fst-italic mt-2 py-1 px-2">Sin información del cliente del contrato.</Alert>}

                            {/* Verifica si specimen existe antes de mostrar */}
                             {specimen ? (
                                 <>
                                     <Row className="mb-2 mt-3"><Col md={12} className="fw-bold">Ejemplar Asociado al Contrato:</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Nombre Ej.:</Col><Col md={8}>{specimen.name || '-'}</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Raza:</Col><Col md={8}>{specimen.breed || '-'}</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Color:</Col><Col md={8}>{specimen.color || '-'}</Col></Row>
                                     <Row className="mb-2"><Col md={4} className="text-muted ps-4">Fecha Nac.:</Col><Col md={8}>{formatDate(specimen.birthDate)}</Col></Row> {/* Usa formatDate simplificado */}

                                     {/* Mostrar propietario del ejemplar si existe y es diferente al cliente del contrato (opcional) */}
                                     {propietario && propietario.id !== client?.id ? (
                                         <>
                                             <Row className="mb-2 mt-2"><Col md={12} className="fw-bold ps-4">Propietario Actual del Ejemplar (si difiere):</Col></Row>
                                             <Row className="mb-2"><Col md={4} className="text-muted ps-5">Nombre Prop.:</Col><Col md={8}>{propietario.nombre || '-'}</Col></Row>
                                             <Row className="mb-2"><Col md={4} className="text-muted ps-5">Documento:</Col><Col md={8}>{propietario.documento || '-'}</Col></Row>
                                         </>
                                     ) : (propietario && propietario.id === client?.id ? null : <Alert color="secondary" className="fst-italic mt-2 py-1 px-2 ms-4">Sin información del propietario del ejemplar.</Alert>)}
                                 </>
                             // Si no se encontró 'specimen' (porque el include falló o porque el contrato no tiene ejemplares)
                             ) : <Alert color="info" className="fst-italic mt-2 py-1 px-2">El contrato asociado no tiene un ejemplar vinculado en este momento.</Alert>}
                         </>
                     ) : <Alert color="warning" className="mt-3">No se pudo cargar la información del contrato asociado a este pago.</Alert> }
                 </>
             </ModalBody>
             <ModalFooter className="border-top-0">
                 <Button color="secondary" outline onClick={toggle}>Cerrar</Button>
             </ModalFooter>
         </Modal>
    );
};

export default ViewPagoModal;