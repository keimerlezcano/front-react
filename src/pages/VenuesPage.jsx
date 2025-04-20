// src/pages/VenuesPage/SedesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// --- IMPORTACIONES ---
import {
    Container,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter, // Añadido por si el form no tiene botones
    Spinner,
    Alert,
    Input,
    Table,
    // --- ¡NUEVAS IMPORTACIONES DE REACTSTRAP PARA LA LISTA! ---
    ListGroup,
    ListGroupItem
    // --------------------------------------------------------
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faPen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
// --- ¡USAREMOS TODAS LAS FUNCIONES DEL API! ---
import { getAllSedes, createSede, updateSede, deleteSede, getSedeById } from '../api/sedeApi'; // Asegúrate que getSedeById exista en sedeApi.js
// ---------------------------------------------

// Importa tu SedeForm si lo tienes en otro archivo
// import SedeForm from '../../components/Sedes/SedeForm'; // Ajusta la ruta si es necesario

const SedesPage = () => {
    const [sedes, setSedes] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Para carga de tabla
    const [isDetailLoading, setIsDetailLoading] = useState(false); // Para cargar detalles al editar
    const [isSaving, setIsSaving] = useState(false); // Para el guardado en el modal
    const [error, setError] = useState(null); // Error principal de la página
    const [modalError, setModalError] = useState(null); // Error dentro del modal
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    // --- ¡MODIFICADO: selectedSede ahora guardará detalles completos! ---
    const [selectedSede, setSelectedSede] = useState(null); // Guarda la sede con detalles (incluye ejemplares)
    // ----------------------------------------------------------------

    // --- Funciones de Utilidad ---
    const clearPageError = () => setError(null);
    const clearModalError = () => setModalError(null);
    const getFriendlyErrorMessage = (error) => {
        return error?.response?.data?.message || error?.message || "Error desconocido. Intente de nuevo.";
    };

    // --- Fetch Data (Lista de Sedes) ---
    const fetchSedes = useCallback(async () => {
        setIsLoading(true);
        clearPageError();
        try {
            const data = await getAllSedes(); // Llama a la función para obtener *todas* las sedes
            console.log("Sedes fetched for list:", data);
            setSedes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching sedes list:", err);
            setError(getFriendlyErrorMessage(err));
            setSedes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSedes();
    }, [fetchSedes]);

    // --- Filtrado ---
    // Asegúrate que 'NombreSede' sea el campo correcto
    const filteredSedes = sedes.filter(sede =>
        sede.NombreSede?.toLowerCase().includes(searchTerm.toLowerCase())
        // Puedes añadir más campos de búsqueda si es necesario
        // || sede.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Toggle Modal ---
    const toggleModal = () => {
        setModalOpen(!modalOpen);
        if (modalOpen) { // Si se está cerrando
            setSelectedSede(null); // Limpia la sede seleccionada
            clearModalError();
        }
    };

    // --- Handlers ---
    const handleAddNew = () => {
        setSelectedSede(null); // Limpia para asegurar que es modo creación
        clearModalError();
        setModalOpen(true); // Abrir modal directamente
    };

    // --- ¡MODIFICADO: handleEdit ahora carga detalles completos! ---
    const handleEdit = async (sedeBasica) => {
        clearModalError();
        setIsDetailLoading(true); // Inicia carga de detalles
        setModalOpen(true); // Abre el modal inmediatamente (mostrará spinner)
        setSelectedSede(null); // Limpia datos previos mientras carga

        try {
            // Llama a la API para obtener los detalles COMPLETOS (con ejemplares)
            const sedeCompleta = await getSedeById(sedeBasica.id);
            console.log("Full sede details fetched for edit:", sedeCompleta);
            setSelectedSede(sedeCompleta); // Guarda los datos completos
        } catch (err) {
            console.error(`Error fetching details for sede ${sedeBasica.id}:`, err);
            setModalError(`Error al cargar detalles: ${getFriendlyErrorMessage(err)}`);
            // Mantener el modal abierto para mostrar el error, pero sin datos
            setSelectedSede(null); // Asegurar que no se muestren datos incorrectos
             // Opcional: cerrar modal si falla carga? setModalOpen(false);
        } finally {
            setIsDetailLoading(false); // Termina carga de detalles
        }
    };
    // ---------------------------------------------------------

    const handleSave = async (sedeDataFromForm) => {
        setIsSaving(true);
        clearModalError();
        const isEditing = selectedSede?.id; // Verifica si estamos editando usando el ID cargado

        // --- Prepara los datos a enviar (solo los campos relevantes del form) ---
        // Asumiendo que tu SedeForm devuelve un objeto solo con los campos editables
        // Por ejemplo: { NombreSede: 'nuevo nombre', direccion: 'nueva dir' }
        const dataToSend = {
             NombreSede: sedeDataFromForm.NombreSede,
             // Añade otros campos que tu formulario permita editar
             // direccion: sedeDataFromForm.direccion,
        };
        console.log("Data to send for save:", dataToSend);

        try {
            if (isEditing) {
                await updateSede(selectedSede.id, dataToSend);
            } else {
                await createSede(dataToSend);
            }
            setModalOpen(false); // Cierra el modal en éxito
            await fetchSedes(); // Refresca la lista principal
        } catch (err) {
            console.error("Error saving sede:", err);
            setModalError(getFriendlyErrorMessage(err));
            // No cerrar el modal si hay error para que el usuario vea el mensaje
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, nombreSede) => {
        if (window.confirm(`¿Está seguro que desea eliminar la sede "${nombreSede}" (ID: ${id})? Verifique que no tenga ejemplares asociados. Esta acción no se puede deshacer.`)) {
            setIsLoading(true); // Usar spinner de página principal para borrado
            clearPageError();
            try {
                await deleteSede(id);
                await fetchSedes(); // Refresca la lista
            } catch (err) {
                console.error(`Error deleting sede ${id}:`, err);
                // Mostrar error específico de FK si la API lo devuelve
                if (err.message && err.message.includes('ejemplares asociados')) {
                     setError(err.message);
                } else {
                     setError(getFriendlyErrorMessage(err));
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    // --- Renderizado ---
    return (
        <Container fluid className="mt-4 mb-4 sedes-page">
            <h2>Gestión de Sedes</h2>

            <div className="d-flex justify-content-between mb-3 flex-wrap gap-2"> {/* flex-wrap y gap para responsividad */}
                <Button color="success" onClick={handleAddNew}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Nueva Sede
                </Button>
                <div className="d-flex flex-grow-1" style={{ maxWidth: '400px' }}> {/* Max width para search */}
                    <Input
                        type="text"
                        placeholder="Buscar por nombre..." // Ajustado placeholder
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="me-2"
                    />
                    {/* Quitado botón de búsqueda si el filtrado es en tiempo real */}
                    {/* <Button color="secondary"><FontAwesomeIcon icon={faSearch} /></Button> */}
                </div>
            </div>

            {error && <Alert color="danger" isOpen={!!error} toggle={clearPageError}>{error}</Alert>}

            {isLoading ? (
                <div className="text-center p-5">
                    <Spinner color="primary">Cargando Sedes...</Spinner>
                </div>
            ) : (
                <Table striped bordered hover responsive size="sm" className="mt-3">
                    <thead className='table-dark'>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            {/* <th>Dirección</th> */} {/* Comentado si no lo tienes */}
                            <th style={{width: '120px'}}>Acciones</th> {/* Ancho fijo para botones */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSedes.length > 0 ? (
                            filteredSedes.map((sede) => (
                                <tr key={sede.id}>
                                    <td>{sede.id}</td>
                                    {/* Asegúrate que el campo es NombreSede */}
                                    <td>{sede.NombreSede}</td>
                                    {/* <td>{sede.direccion || 'N/A'}</td> */}
                                    <td>
                                        <Button color="primary" size="sm" className="me-2" title="Editar" onClick={() => handleEdit(sede)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button color="danger" size="sm" title="Eliminar" onClick={() => handleDelete(sede.id, sede.NombreSede)}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center text-muted"> {/* Ajusta colSpan */}
                                    No se encontraron sedes {searchTerm ? 'que coincidan con la búsqueda' : ''}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            {/* --- MODAL PARA CREAR/EDITAR --- */}
            <Modal isOpen={modalOpen} toggle={toggleModal} centered backdrop="static" size="lg">
                {/* Mostrar header solo después de cargar detalles si se está editando */}
                <ModalHeader toggle={toggleModal}>
                    {isDetailLoading ? 'Cargando Detalles...' : (selectedSede ? `Editar Sede: ${selectedSede.NombreSede}` : 'Crear Nueva Sede')}
                </ModalHeader>
                <ModalBody>
                    {modalError && <Alert color="danger" isOpen={!!modalError} toggle={clearModalError}>{modalError}</Alert>}

                    {/* Mostrar Spinner mientras cargan detalles */}
                    {isDetailLoading ? (
                        <div className="text-center p-5">
                            <Spinner color="primary">Cargando...</Spinner>
                        </div>
                    ) : (
                        // Renderizar contenido solo si no está cargando detalles
                        <>
                            {/* --- FORMULARIO (Reemplaza con tu componente real) --- */}
                            {/* Asume que SedeForm necesita initialData y onSave */}
                            {/* Si SedeForm es simple, puedes poner los inputs aquí directamente */}
                            {/* Aquí un ejemplo simple si no tienes SedeForm */}
                            <p><strong>(Aquí iría tu componente SedeForm real)</strong></p>
                            <Input
                                type="text"
                                name="NombreSede"
                                placeholder="Nombre de la Sede"
                                defaultValue={selectedSede?.NombreSede || ''} // Usar defaultValue si es no controlado
                                className="mb-2"
                                disabled={isSaving}
                                // Si usas un estado controlado en SedeForm, pasa el valor y onChange
                            />
                             {/* Añade otros inputs para campos editables como dirección, etc. */}


                            {/* --- ¡NUEVA SECCIÓN PARA MOSTRAR EJEMPLARES! --- */}
                            {/* Solo se muestra si estamos editando (selectedSede existe) */}
                            {selectedSede && (
                                <>
                                    <hr className="my-3" />
                                    <h5>Ejemplares en esta Sede</h5>
                                    {/* Verificar si la propiedad existe, es array */}
                                    {selectedSede.ejemplaresEnSede && Array.isArray(selectedSede.ejemplaresEnSede) ? (
                                        // Verificar si hay elementos
                                        selectedSede.ejemplaresEnSede.length > 0 ? (
                                            <ListGroup flush style={{maxHeight: '200px', overflowY: 'auto'}}> {/* Limitar altura y scroll */}
                                                {selectedSede.ejemplaresEnSede.map(ejemplar => (
                                                    <ListGroupItem key={ejemplar.id} className="px-0 py-2"> {/* Menos padding */}
                                                        <div>
                                                            <strong>{ejemplar.name || 'Ejemplar sin nombre'}</strong>
                                                            <small className="d-block text-muted">
                                                                {/* Mostrar info relevante del ejemplar */}
                                                                ID: {ejemplar.id} |
                                                                Código: {ejemplar.identifier || 'N/A'} |
                                                                Raza: {ejemplar.breed || 'N/A'}
                                                            </small>
                                                        </div>
                                                    </ListGroupItem>
                                                ))}
                                            </ListGroup>
                                        ) : (
                                            // Mensaje si el array está vacío
                                            <p className="text-muted fst-italic">
                                                No hay ejemplares registrados en esta sede.
                                            </p>
                                        )
                                    ) : (
                                        // Mensaje si la propiedad no existe o es inválida
                                        // Esto podría indicar que getSedeById no está populando bien en el backend
                                        <p className="text-danger fst-italic">
                                            No se pudo cargar la información de los ejemplares.
                                        </p>
                                    )}
                                </>
                            )}
                            {/* --- FIN DE LA SECCIÓN DE EJEMPLARES --- */}
                        </>
                    )}
                </ModalBody>
                 <ModalFooter>
                    {/* Botones para guardar y cancelar */}
                    {/* Asume que el form interno NO tiene sus propios botones */}
                    <Button color="secondary" onClick={toggleModal} disabled={isSaving || isDetailLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => {
                             // --- ¡IMPORTANTE! Debes obtener los datos ACTUALIZADOS del form ---
                             // Si usas un SedeForm, necesitarás una forma de obtener sus datos (ej. useRef, o que onSave los pase)
                             // Ejemplo simple si los inputs están aquí directamente (NO RECOMENDADO para forms complejos):
                             const nombreInput = document.querySelector('input[name="NombreSede"]'); // Mala práctica, ¡usa estado o refs!
                             const datosDelForm = { NombreSede: nombreInput?.value || selectedSede?.NombreSede }; // Obtener datos actualizados
                             handleSave(datosDelForm);
                        }}
                        disabled={isSaving || isDetailLoading} // Deshabilitar mientras guarda o carga detalles
                    >
                        {isSaving ? <Spinner size="sm" /> : (selectedSede ? 'Actualizar Sede' : 'Crear Sede')}
                    </Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default SedesPage;