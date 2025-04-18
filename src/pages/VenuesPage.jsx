import React, { useState, useEffect, useCallback } from 'react';
// --- ¡IMPORTACIONES CORREGIDAS! ---
import {
    Container,
    Button, // Añade otros componentes que uses, como Button, Input, Form, etc.
    Modal,
    ModalHeader,
    ModalBody,
    // Añade ModalFooter si lo necesitas
    Spinner, // Si usas Spinner para isLoading
    Alert,   // Si usas Alert para los errores
    Input,   // Si usas Input para el buscador
    Table    // Si usas Table para mostrar los datos
} from 'reactstrap';
// -----------------------------------
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faPen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { getAllSedes, createSede, updateSede, deleteSede } from '../api/sedeApi';
// Importa tu SedeForm si lo tienes en otro archivo
// import SedeForm from '../components/SedeForm';

const SedesPage = () => { // O VenuesPage
    const [sedes, setSedes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Para el guardado en el modal
    const [error, setError] = useState(null); // Error principal de la página
    const [modalError, setModalError] = useState(null); // Error dentro del modal
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSede, setSelectedSede] = useState(null); // Para saber si editamos o creamos

    // --- Funciones de Utilidad ---
    const clearPageError = () => setError(null);
    const clearModalError = () => setModalError(null);
    const getFriendlyErrorMessage = (error) => {
        // Intenta obtener un mensaje más específico si tu API lo envía
        return error?.response?.data?.message || error?.message || "Error desconocido. Intente de nuevo.";
    };

    // --- Fetch Data ---
    const fetchSedes = useCallback(async () => {
        setIsLoading(true);
        clearPageError();
        try {
            const data = await getAllSedes();
            setSedes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
            setSedes([]); // Limpia los datos si hay error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSedes();
    }, [fetchSedes]);

    // --- Filtrado ---
    // Asegúrate que 'name' es el campo correcto por el que quieres buscar
    const filteredSedes = sedes.filter(sede =>
        sede.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sede.address?.toLowerCase().includes(searchTerm.toLowerCase()) // Ejemplo: buscar por dirección también
    );

    // --- Toggle Modal ---
    const toggleModal = () => {
        setModalOpen(!modalOpen);
        if (modalOpen) { // Si se está cerrando el modal
            setSelectedSede(null); // Limpia la sede seleccionada
            clearModalError(); // Limpia errores del modal
        }
    };

    // --- Handlers ---
    const handleAddNew = () => {
        setSelectedSede(null); // Asegura que no haya sede seleccionada
        toggleModal();
    };

    const handleEdit = (sede) => {
        setSelectedSede(sede); // Guarda la sede a editar
        toggleModal();
    };

    const handleSave = async (sedeData) => { // El form pasará los datos
        setIsSaving(true);
        clearModalError();
        const sedeId = selectedSede?.id; // Obtiene el ID si estamos editando

        try {
            if (sedeId) {
                await updateSede(sedeId, sedeData);
            } else {
                await createSede(sedeData);
            }
            toggleModal(); // Cierra el modal
            await fetchSedes(); // Refresca la lista
        } catch (err) {
            setModalError(getFriendlyErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, nombreSede) => { // Pasar nombre para confirmación más clara
        // Usar un modal de confirmación sería mejor, pero window.confirm es más simple
        if (window.confirm(`¿Está seguro que desea eliminar la sede "${nombreSede}" (ID: ${id})? Esta acción no se puede deshacer.`)) {
            // Idealmente, mostrar un spinner específico para la fila o un estado 'isDeleting'
            setIsLoading(true); // Usamos isLoading por ahora
            clearPageError();
            try {
                await deleteSede(id);
                await fetchSedes(); // Refresca la lista
            } catch (err) {
                setError(getFriendlyErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        }
    };

    // --- Renderizado ---
    return (
        <Container fluid className="mt-4 mb-4 sedes-page"> {/* Añade clase para estilos */}
            <h2>Gestión de Sedes</h2>

            {/* Botón Añadir y Barra de Búsqueda */}
            <div className="d-flex justify-content-between mb-3">
                <Button color="success" onClick={handleAddNew}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Nueva Sede
                </Button>
                <div className="d-flex w-50">
                    <Input
                        type="text"
                        placeholder="Buscar por nombre o dirección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="me-2"
                    />
                    <Button color="secondary">
                        <FontAwesomeIcon icon={faSearch} />
                    </Button>
                </div>
            </div>

            {/* Alerta de Error Principal */}
            {error && <Alert color="danger" fade={false}>{error}</Alert>}

            {/* Indicador de Carga */}
            {isLoading ? (
                <div className="text-center">
                    <Spinner color="primary">Cargando...</Spinner>
                </div>
            ) : (
                // Tabla de Sedes (o podrías usar Cards)
                <Table striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            {/* Añade otras columnas relevantes */}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSedes.length > 0 ? (
                            filteredSedes.map((sede) => (
                                <tr key={sede.id}>
                                    <td>{sede.id}</td>
                                    <td>{sede.name}</td>
                                    <td>{sede.address}</td>
                                    {/* Otras celdas */}
                                    <td>
                                        <Button color="primary" size="sm" className="me-2" onClick={() => handleEdit(sede)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button color="danger" size="sm" onClick={() => handleDelete(sede.id, sede.name)}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center"> {/* Ajusta colSpan al número de columnas */}
                                    No se encontraron sedes {searchTerm ? 'que coincidan con la búsqueda' : ''}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            {/* Modal para Crear/Editar */}
            {/* El modal ahora usa los componentes importados */}
            <Modal isOpen={modalOpen} toggle={toggleModal} centered backdrop="static" size="lg">
                <ModalHeader toggle={toggleModal}>
                    {selectedSede ? `Editar Sede: ${selectedSede.name}` : 'Crear Nueva Sede'}
                </ModalHeader>
                <ModalBody>
                    {/* Alerta de Error del Modal */}
                    {modalError && <Alert color="danger" fade={false}>{modalError}</Alert>}

                    {/* Renderiza el formulario aquí. Asume que SedeForm recibe:
                        - initialData: selectedSede (o null si es nuevo)
                        - onSave: handleSave
                        - onCancel: toggleModal
                        - isSaving: isSaving (para deshabilitar botón de guardar)
                     */}
                     {modalOpen && ( // Renderiza el form solo cuando el modal está abierto para resetear estado
                        <p>Aquí iría tu componente SedeForm</p>
                        // <SedeForm
                        //     initialData={selectedSede}
                        //     onSave={handleSave}
                        //     onCancel={toggleModal}
                        //     isSaving={isSaving}
                        // />
                     )}
                </ModalBody>
                {/* Puedes añadir un ModalFooter con botones si tu SedeForm no los incluye */}
            </Modal>
        </Container>
    );
};

export default SedesPage; // O VenuesPage   