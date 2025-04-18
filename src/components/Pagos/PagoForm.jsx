// src/components/PagoForm.jsx
import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button, Spinner, Row, Col, Alert } from "reactstrap";

// Helper simple para formato de fecha (opcional, no usado directamente aquí pero puede ser útil)
const formatDateShort = (dateString) => {
    if (!dateString) return '';
    try {
      // Asume que viene como YYYY-MM-DD, trata como UTC
      const date = new Date(dateString + 'T00:00:00Z');
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-ES', { timeZone: 'UTC' });
    } catch (e) { return ''; }
};

const PagoForm = ({
    modal,
    toggleModal,
    pagoActual,
    manejarCambioDirecto, // Renombrado para claridad, viene de Pagos.jsx
    manejarEnvio,
    contratos = [],
    isSaving = false,
    apiError,
    clearApiError
}) => {

    // Wrapper simple para limpiar error al cambiar cualquier campo
    const manejarCambio = (e) => {
        if(apiError) clearApiError();
        manejarCambioDirecto(e); // Llama a la función pasada desde Pagos.jsx
    };

    // Extraer valores del estado pagoActual para los inputs
    const valorPago = pagoActual?.valor ?? "";
    const metodoPago = pagoActual?.metodoPago ?? "efectivo"; // Default a efectivo si es nuevo
    const mesPago = pagoActual?.mesPago ?? "";
    const contractId = pagoActual?.contractId ?? "";
    // Asegurar formato YYYY-MM-DD para input tipo date
    const fechaPago = pagoActual?.fechaPago ? pagoActual.fechaPago.split('T')[0] : "";

    return (
        <Modal isOpen={modal} toggle={toggleModal} backdrop="static" centered>
            <ModalHeader toggle={toggleModal}>{pagoActual?.id_pago ? "Editar Pago" : "Nuevo Pago"}</ModalHeader>
            <Form onSubmit={manejarEnvio}>
                <ModalBody>
                    {/* Muestra errores de la API si existen */}
                    {apiError && (
                        <Alert color="danger" fade={false}>
                            {apiError}
                        </Alert>
                    )}

                    {/* Campo oculto para el ID si estamos editando */}
                    {pagoActual?.id_pago && <input type="hidden" name="id_pago" value={pagoActual.id_pago} />}

                    {/* --- Campo Contrato --- */}
                    <FormGroup>
                        <Label for="contractId">Contrato *</Label>
                        <Input
                            type="select"
                            name="contractId"
                            id="contractId"
                            value={contractId}
                            onChange={manejarCambio}
                            required
                            // ***** CAMBIO AQUÍ *****
                            // Permitir cambiar el contrato incluso al editar.
                            // Solo deshabilitado mientras se guarda.
                            // ADVERTENCIA: Considera las implicaciones de cambiar el contrato a un pago existente.
                            disabled={isSaving}
                            bsSize="sm"
                        >
                            <option value="">-- Seleccione Contrato --</option>
                            {contratos.map((contrato) => (
                                <option key={contrato.id} value={contrato.id}>
                                    #{contrato.id} {contrato.client ? `- ${contrato.client.nombre}` : ''}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>

                    {/* --- Fila Mes y Valor --- */}
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="mesPago">Mes Pago (1-12) *</Label>
                                <Input
                                    type="number"
                                    name="mesPago"
                                    id="mesPago"
                                    value={mesPago}
                                    onChange={manejarCambio}
                                    min="1"
                                    max="12"
                                    required
                                    disabled={isSaving} // Deshabilitado solo al guardar
                                    bsSize="sm"
                                    placeholder="Ej: 1"
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="valor">Valor *</Label>
                                <Input
                                    type="number"
                                    step="0.01" // Permitir decimales si aplica
                                    name="valor"
                                    id="valor"
                                    value={valorPago}
                                    onChange={manejarCambio}
                                    required
                                    min="0"
                                    disabled={isSaving} // Deshabilitado solo al guardar
                                    bsSize="sm"
                                    placeholder="Ej: 150000"
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* --- Fila Método y Fecha --- */}
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="metodoPago">Método *</Label>
                                <Input
                                    type="select"
                                    name="metodoPago"
                                    id="metodoPago"
                                    value={metodoPago}
                                    onChange={manejarCambio}
                                    required
                                    disabled={isSaving} // Deshabilitado solo al guardar
                                    bsSize="sm"
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    {/* Añadir más métodos si es necesario */}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="fechaPago">Fecha Pago *</Label>
                                <Input
                                    type="date"
                                    name="fechaPago"
                                    id="fechaPago"
                                    value={fechaPago} // Debe estar en formato YYYY-MM-DD
                                    onChange={manejarCambio}
                                    required
                                    disabled={isSaving} // Deshabilitado solo al guardar
                                    bsSize="sm"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    {/* Botón Cancelar */}
                    <Button color="secondary" outline onClick={toggleModal} disabled={isSaving} size="sm"> Cancelar </Button>
                    {/* Botón Guardar/Actualizar */}
                    <Button color="primary" type="submit" disabled={isSaving} size="sm">
                        {isSaving ? <Spinner size="sm" className="me-1" /> : null}
                        {pagoActual?.id_pago ? "Actualizar" : "Crear"}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default PagoForm;