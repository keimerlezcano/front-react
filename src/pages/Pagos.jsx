// src/pages/Pagos.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Container, Row, Col, Button, Alert, Spinner, InputGroup, FormGroup, Label, Input, InputGroupText
} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import PagoTable from "../components/Pagos/PagoTable"; // Asegúrate que la ruta es correcta
import PagoForm from "../components/Pagos/PagoForm";   // Asegúrate que la ruta es correcta
import ViewPagoModal from "../components/Pagos/ViewPagoForm"; // Asegúrate que la ruta es correcta
import pagosApi, { obtenerPagoPorId } from "../api/pagosApi"; // Asegúrate que la ruta es correcta
import { getAllContracts } from "../api/contractApi";   // Asegúrate que la ruta es correcta

const ALERT_FADE_TIMEOUT = 300;

const Pagos = () => {
    // --- Estados ---
    const [pagos, setPagos] = useState([]); // Lista completa de pagos
    const [contratos, setContratos] = useState([]); // Lista completa de contratos
    const [formModalOpen, setFormModalOpen] = useState(false); // Visibilidad modal formulario
    const [viewModalOpen, setViewModalOpen] = useState(false); // Visibilidad modal vista
    const [pagoActual, setPagoActual] = useState(null); // Pago siendo editado/creado
    const [pagoToView, setPagoToView] = useState(null); // Pago para modal de vista
    const [alerta, setAlerta] = useState({ visible: false, mensaje: "", tipo: "" }); // Alerta general
    const [isLoading, setIsLoading] = useState(false); // Cargando datos iniciales
    const [isSaving, setIsSaving] = useState(false); // Guardando pago
    const [isFetchingDetails, setIsFetchingDetails] = useState(false); // Cargando detalles para vista
    const [selectedContractId, setSelectedContractId] = useState(''); // Filtro por contrato ID
    const [searchTerm, setSearchTerm] = useState(''); // Filtro por búsqueda de texto
    const [modalError, setModalError] = useState(null); // Error dentro del modal
    const [error, setError] = useState(null); // Error general de carga

    // --- Callbacks de Utilidad ---
    const clearPageError = useCallback(() => setError(null), []);
    const clearModalError = useCallback(() => setModalError(null), []);
    const getFriendlyError = useCallback((err) => {
        return err?.response?.data?.message || err?.message || "Ocurrió un error inesperado.";
    }, []);
    const mostrarAlerta = useCallback((mensaje, tipo, duracion = 3500) => {
        setAlerta({ visible: true, mensaje, tipo });
        const timerId = setTimeout(() => {
            setAlerta(a => ({ ...a, visible: false }));
        }, duracion);
        return () => clearTimeout(timerId);
    }, []);

    // --- Carga de Datos ---
    const cargarDatos = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        clearPageError();
        let accumulatedErrors = [];
        try {
            const [pagosResponse, contratosResponse] = await Promise.allSettled([
                pagosApi.obtenerPagos(),
                getAllContracts()
            ]);

            if (pagosResponse.status === 'fulfilled' && Array.isArray(pagosResponse.value)) {
                setPagos(pagosResponse.value);
            } else {
                setPagos([]);
                const errorMsg = getFriendlyError(pagosResponse.reason || new Error("Respuesta inválida de pagos"));
                accumulatedErrors.push(`Pagos: ${errorMsg}`);
            }

            if (contratosResponse.status === 'fulfilled' && Array.isArray(contratosResponse.value)) {
                setContratos(contratosResponse.value);
            } else {
                setContratos([]);
                const errorMsg = getFriendlyError(contratosResponse.reason || new Error("Respuesta inválida de contratos"));
                accumulatedErrors.push(`Contratos: ${errorMsg}`);
            }
        } catch (unexpectedError) {
            const errorMsg = getFriendlyError(unexpectedError);
            accumulatedErrors.push(`General: ${errorMsg}`);
            setPagos([]); setContratos([]);
        } finally {
            if (accumulatedErrors.length > 0) {
                setError(accumulatedErrors.join(' | '));
            }
            if (showLoading) setIsLoading(false);
        }
    }, [getFriendlyError, clearPageError]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // --- Manejo de Modales ---
    const toggleFormModal = useCallback(() => {
        if (formModalOpen) {
             setPagoActual(null); clearModalError(); setIsSaving(false);
        } else {
            clearModalError();
        }
        setFormModalOpen(prev => !prev);
    }, [formModalOpen, clearModalError]);

    const toggleViewModal = useCallback(() => {
        if (viewModalOpen) { setPagoToView(null); }
        setViewModalOpen(prev => !prev);
    }, [viewModalOpen]);

    // --- Acciones CRUD ---
    const abrirModalNuevo = useCallback(() => {
        const currentMonth = new Date().getMonth() + 1;
        setPagoActual({
            valor: "", metodoPago: "efectivo", mesPago: currentMonth,
            contractId: "", fechaPago: new Date().toISOString().split('T')[0]
        });
        setAlerta(a => ({...a, visible: false})); clearModalError();
        setFormModalOpen(true);
    }, [clearModalError]);

    const abrirModalEditar = useCallback((pago) => {
        setPagoActual({
            ...pago,
            fechaPago: pago.fechaPago ? new Date(pago.fechaPago).toISOString().split('T')[0] : ''
        });
        setAlerta(a => ({...a, visible: false})); clearModalError();
        setFormModalOpen(true);
    }, [clearModalError]);

    const handleViewPago = useCallback(async (pagoBasico) => {
        if (!pagoBasico?.id_pago) {
             mostrarAlerta("ID de pago inválido.", "warning"); return;
        }
        setIsFetchingDetails(true); setPagoToView(null); setAlerta(a => ({...a, visible: false})); clearPageError();
        try {
            const pagoCompleto = await obtenerPagoPorId(pagoBasico.id_pago);
            setPagoToView(pagoCompleto); setViewModalOpen(true);
        } catch (error) {
            mostrarAlerta(`Error al obtener detalles: ${getFriendlyError(error)}`, "danger", 5000);
            setViewModalOpen(false);
        } finally { setIsFetchingDetails(false); }
    }, [mostrarAlerta, getFriendlyError, clearPageError]);

    // ***** CAMBIO PRINCIPAL AQUÍ *****
    // Callback para manejar cambios en el formulario (pasado a PagoForm como manejarCambioDirecto)
    const manejarCambioForm = useCallback((e) => {
        const { name, value } = e.target; // type y checked no se usan aquí directamente

        if (modalError) clearModalError(); // Limpiar error del modal al escribir

        setPagoActual(prev => {
            // Determinar si estamos creando un nuevo pago basado en el estado *previo*
            const isNew = !prev.id_pago;
            let updatedPago = { ...prev, [name]: value }; // Actualización básica

            // Lógica especial si cambia el contrato seleccionado
            if (name === 'contractId') {
                const selectedId = value;
                const contratoSeleccionado = contratos.find(c => c.id?.toString() === selectedId);
                const nuevoValor = contratoSeleccionado?.precioMensual ?? "";
                updatedPago.valor = nuevoValor; // Actualizar valor automáticamente

                // --- Lógica para sugerir próximo mes (SOLO al crear nuevo pago) ---
                if (isNew && selectedId) {
                    const contractPayments = pagos.filter(p => p.contractId?.toString() === selectedId);
                    let suggestedMonth;
                    if (contractPayments.length > 0) {
                        // Encontrar el mes más alto pagado para este contrato
                        const maxMonth = Math.max(...contractPayments.map(p => Number(p.mesPago || 0)));
                        // Calcular el siguiente mes, con vuelta a 1 si es diciembre (12)
                        suggestedMonth = maxMonth >= 12 ? 1 : maxMonth + 1;
                    } else {
                        // Si no hay pagos previos, usar el mes actual como default
                        suggestedMonth = new Date().getMonth() + 1;
                    }
                    updatedPago.mesPago = suggestedMonth; // Actualizar mesPago
                }
                 // Si no es nuevo o no se seleccionó contrato, mesPago no se toca aquí
                 // (se actualiza por su propio input si el usuario lo cambia)
            }
             // Si cambia otro campo (mesPago, valor, metodoPago, fechaPago)
             // simplemente se actualiza por la línea `updatedPago = { ...prev, [name]: value };`

            return updatedPago; // Devolver el estado actualizado
        });
    // IMPORTANTE: Añadir 'pagos' a las dependencias porque ahora se usa para calcular el mes
    }, [modalError, clearModalError, contratos, pagos]);

    // Callback para manejar el envío del formulario (Crear/Actualizar)
    const manejarEnvio = useCallback(async (e) => {
        e.preventDefault(); if (isSaving) return;
        setIsSaving(true); clearModalError();
        try {
            if (!pagoActual?.contractId || !pagoActual?.valor || !pagoActual?.fechaPago || !pagoActual?.mesPago) {
                 throw new Error("Faltan datos obligatorios (Contrato, Mes, Valor, Fecha).");
            }
             const dataToSend = { // Enviar solo los datos relevantes
                 id_pago: pagoActual.id_pago || undefined, // No enviar id_pago si es nuevo
                 contractId: pagoActual.contractId,
                 mesPago: parseInt(pagoActual.mesPago, 10), // Asegurar que sea número
                 valor: parseFloat(pagoActual.valor),     // Asegurar que sea número
                 metodoPago: pagoActual.metodoPago,
                 fechaPago: pagoActual.fechaPago,
             };

            await pagosApi.guardarPago(dataToSend);
            mostrarAlerta(pagoActual.id_pago ? "Pago actualizado correctamente." : "Pago creado correctamente.", "success");
            toggleFormModal();
            await cargarDatos(false); // Recargar lista sin spinner principal
        } catch (error) {
            setModalError(getFriendlyError(error));
        } finally { setIsSaving(false); }
    }, [isSaving, pagoActual, mostrarAlerta, toggleFormModal, cargarDatos, getFriendlyError, clearModalError]);

    // --- Filtrado ---
    const filteredPagos = useMemo(() => {
        let filtered = pagos;
        if (selectedContractId) {
            filtered = filtered.filter(p => p.contractId?.toString() === selectedContractId);
        }
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.id_pago?.toString().includes(lowerSearchTerm) ||
                p.metodoPago?.toLowerCase().includes(lowerSearchTerm) ||
                p.mesPago?.toString().includes(lowerSearchTerm) ||
                (p.fechaPago && new Date(p.fechaPago + 'T00:00:00Z').toLocaleDateString('es-ES', { timeZone: 'UTC' }).includes(lowerSearchTerm)) || // Ajuste para fecha
                p.contract?.client?.nombre?.toLowerCase().includes(lowerSearchTerm) ||
                p.contract?.client?.documento?.includes(lowerSearchTerm) ||
                p.contract?.id?.toString().includes(lowerSearchTerm)
            );
        }
        return filtered;
    }, [pagos, selectedContractId, searchTerm]);

    // --- Renderizado ---
    return (
        <Container fluid className="mt-4 mb-4">

            {/* Alertas */}
            {alerta.visible && !formModalOpen && !viewModalOpen && (
                <Alert color={alerta.tipo} isOpen={alerta.visible} toggle={() => setAlerta(a => ({ ...a, visible: false }))} fade={true} timeout={ALERT_FADE_TIMEOUT}>
                    {alerta.mensaje}
                </Alert>
            )}
            {error && !isLoading && (
                <Alert color="danger" isOpen={!!error} toggle={clearPageError} fade={true} timeout={ALERT_FADE_TIMEOUT}>
                   Error al cargar datos: {error}
                </Alert>
            )}

            {/* Controles (Filtros y Botón Nuevo) */}
            <Row className="mb-3 align-items-center">
                <Col xs="12" md>
                    <div className="d-flex flex-column flex-sm-row justify-content-md-end align-items-stretch gap-2">
                         {/* Búsqueda */}
                         <InputGroup size="sm" style={{ minWidth: '200px', maxWidth: '350px' }}>
                           <InputGroupText><FontAwesomeIcon icon={faSearch} /></InputGroupText>
                           <Input type="text" placeholder="Buscar pago..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isLoading} aria-label="Buscar pago"/>
                       </InputGroup>
                       {/* Filtro Contrato */}
                       <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
                           <InputGroupText><FontAwesomeIcon icon={faFilter} /></InputGroupText>
                           <Input type="select" id="contractFilter" value={selectedContractId} onChange={(e) => setSelectedContractId(e.target.value)} disabled={isLoading || isSaving || isFetchingDetails || contratos.length === 0} title="Filtrar por Contrato">
                               <option value="">- Todos los Contratos </option>
                               {contratos.map(c => (<option key={c.id} value={c.id}>#{c.id} </option>))}
                               {/* {c.client ? `- ${c.client.nombre}` : ''} */}
                           </Input>
                       </InputGroup>
                       {/* Botón Nuevo */}
                       <Button color="success" size="sm" onClick={abrirModalNuevo} disabled={isLoading || isSaving || isFetchingDetails} className="flex-shrink-0" title="Registrar un nuevo pago">
                           <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Pago
                       </Button>
                    </div>
                </Col>
            </Row>

            {/* Indicador de Carga */}
            {(isLoading || isSaving || isFetchingDetails) && (
                <div className="text-center p-3">
                    <Spinner color="primary" size="sm" />
                    <span className="ms-2 fst-italic">
                        {isLoading ? 'Cargando datos...' : (isFetchingDetails ? 'Cargando detalles...' : 'Guardando...')}
                    </span>
                </div>
            )}

            {/* Tabla o Mensaje "No hay datos" */}
            {!isLoading && (
                !error ? (
                    filteredPagos.length > 0 ? (
                        <div className="table-responsive">
                            <PagoTable pagos={filteredPagos} onEdit={abrirModalEditar} onView={handleViewPago} />
                        </div>
                    ) : (
                        <Alert color="info" className="text-center mt-3" fade={true} timeout={ALERT_FADE_TIMEOUT}>
                            {searchTerm || selectedContractId ? "No se encontraron pagos que coincidan con los filtros." : "Aún no hay pagos registrados."}
                        </Alert>
                    )
                ) : ( null )
            )}

            {/* Modales */}
            {formModalOpen && (
                <PagoForm
                    modal={formModalOpen}
                    toggleModal={toggleFormModal}
                    pagoActual={pagoActual}
                    manejarCambioDirecto={manejarCambioForm} // Pasar la función de cambio actualizada
                    manejarEnvio={manejarEnvio}
                    contratos={contratos}
                    isSaving={isSaving}
                    apiError={modalError}
                    clearApiError={clearModalError}
                    key={`pago-form-${pagoActual?.id_pago || 'new'}`}
                />
            )}
            {pagoToView && viewModalOpen && (
                <ViewPagoModal
                    isOpen={viewModalOpen}
                    toggle={toggleViewModal}
                    pago={pagoToView}
                    key={`view-pago-${pagoToView?.id_pago}`}
                 />
            )}
        </Container>
    );
};

export default Pagos;