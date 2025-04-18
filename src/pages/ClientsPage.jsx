// src/pages/ClientsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button, Modal, ModalHeader, ModalBody, Input, Spinner, Alert, Container
} from "reactstrap";

// --- Asegúrate que estas rutas sean correctas ---
import ClientList from '../components/Clientes/ClientList.jsx';
import ClientForm from "../components/Clientes/ClientForm.jsx";
import { getAllClients, createClient, updateClient, deleteClient } from '../api/clientApi.js';
// -------------------------------------------------

// --- Componentes no usados/implementados por ahora ---
// import ClientsPagination from "../components/Clients/ClientsPagination";
// import ViewClientModal from "../components/Clients/ViewClientModal";
// ----------------------------------------------------

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

// --- Constantes ---
// Asegúrate de importar Bootstrap CSS en tu archivo principal (index.js o App.js)
// import 'bootstrap/dist/css/bootstrap.min.css';
const ITEMS_PER_PAGE = 10; // Ajusta según necesites

const ClientsPage = () => {
  // --- Estados ---
  const [allClients, setAllClients] = useState([]); // Lista completa desde API
  const [filteredClients, setFilteredClients] = useState([]); // Lista filtrada por búsqueda
  const [selectedClient, setSelectedClient] = useState(null); // Cliente para editar (null para crear)
  // const [clientToView, setClientToView] = useState(null); // Estado para modal de vista (No usado ahora)
  const [editModalOpen, setEditModalOpen] = useState(false); // Visibilidad del modal Crear/Editar
  // const [viewModalOpen, setViewModalOpen] = useState(false); // Visibilidad del modal Ver (No usado ahora)
  const [isLoading, setIsLoading] = useState(false); // Cargando lista/eliminando
  const [isSaving, setIsSaving] = useState(false); // Guardando en modal
  const [error, setError] = useState(null); // Error general de la página
  const [modalError, setModalError] = useState(null); // Error dentro del modal
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual (para futura paginación)

  // --- Carga de Datos ---
  const fetchClients = useCallback(async () => {
    // console.log("fetchClients: Iniciando carga..."); // Debug
    setIsLoading(true);
    setError(null);
    try {
      const clientsData = await getAllClients();
      if (Array.isArray(clientsData)) {
        setAllClients(clientsData);
        // console.log("fetchClients: Datos cargados:", clientsData); // Debug
      } else {
        console.error("Respuesta inesperada de la API al obtener clientes:", clientsData);
        setAllClients([]);
        setError("Respuesta de API inválida al obtener clientes.");
      }
    } catch (err) {
      console.error("Error en fetchClients:", err);
      setError(err.message || "Error al cargar clientes.");
      setAllClients([]);
    } finally {
      setIsLoading(false);
      // console.log("fetchClients: Carga finalizada."); // Debug
    }
  }, []);

  useEffect(() => {
    fetchClients(); // Carga inicial al montar
  }, [fetchClients]);

  // --- Filtrado por Búsqueda ---
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    // console.log(`Filtrando con término: "${lowerCaseSearchTerm}"`); // Debug
    if (!lowerCaseSearchTerm) {
      setFilteredClients(allClients);
    } else {
      const filtered = allClients.filter(client =>
        client.nombre?.toLowerCase().includes(lowerCaseSearchTerm) ||
        client.documento?.toLowerCase().includes(lowerCaseSearchTerm) ||
        client.correo?.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredClients(filtered);
    }
    setCurrentPage(1); // Volver a pág 1 al buscar
  }, [searchTerm, allClients]);

  // --- Paginación (Cálculos - Renderizado comentado) ---
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return filteredClients.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredClients]);

  const totalPages = useMemo(() => {
    if (ITEMS_PER_PAGE <= 0) return 0;
    return Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  }, [filteredClients]);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // --- Manejo de Modales ---
  const toggleEditModal = () => {
    // console.log(`toggleEditModal: Estado actual=${editModalOpen}, nuevo estado=${!editModalOpen}`); // Debug
    setEditModalOpen(!editModalOpen);
    if (editModalOpen) { // Al CERRAR el modal
      setSelectedClient(null);
      setModalError(null);
      setIsSaving(false);
    }
  };

  // const toggleViewModal = (client = null) => { // No usado activamente ahora
  //   setClientToView(client);
  //   setViewModalOpen(!viewModalOpen);
  // };

  // --- Handlers de Acciones CRUD ---
  const handleAddNew = () => {
    // console.log("handleAddNew: Abriendo modal para crear..."); // Debug
    setSelectedClient(null); // Asegura modo creación
    setModalError(null);
    setEditModalOpen(true); // <<< ESTO DEBERÍA ABRIR EL MODAL
  };

  const handleEdit = (client) => {
    // console.log("handleEdit: Abriendo modal para editar cliente:", client); // Debug
    setSelectedClient(client); // Establece datos para el form
    setModalError(null);
    setEditModalOpen(true); // <<< ESTO DEBERÍA ABRIR EL MODAL
  };

  const handleView = (client) => {
    // Como no hay modal de vista, solo hacemos log por ahora
    console.log("handleView: Detalles del cliente:", client);
    alert(`(Implementación pendiente) Ver detalles de: ${client.nombre}`);
    // toggleViewModal(client); // Llamaría al toggle si hubiera modal
  };

  const handleSave = async (clientData) => {
    // console.log("handleSave: Guardando datos:", clientData); // Debug
    setIsSaving(true);
    setModalError(null);
    const clientId = selectedClient?.id; // ID para saber si es update o create

    try {
      if (clientId) {
        // console.log(`handleSave: Actualizando cliente ID ${clientId}`); // Debug
        await updateClient(clientId, clientData);
      } else {
        // console.log("handleSave: Creando nuevo cliente"); // Debug
        await createClient(clientData);
      }
      // console.log("handleSave: Guardado exitoso."); // Debug
      toggleEditModal(); // Cierra el modal
      await fetchClients(); // Recarga la lista
    } catch (err) {
      console.error("Error en handleSave:", err);
      setModalError(err.message || "Error al guardar el cliente.");
      setIsSaving(false); // Permite reintentar sin cerrar modal
    }
     // finally { // Alternativamente, poner setIsSaving(false) solo aquí
     //   setIsSaving(false);
     // }
  };

  const handleDelete = async (id) => {
    // console.log(`handleDelete: Intentando eliminar ID ${id}`); // Debug
    if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente con ID ${id}?`)) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteClient(id);
        // console.log(`handleDelete: Cliente ID ${id} eliminado.`); // Debug
        await fetchClients(); // Recarga la lista
      } catch (err) {
        console.error(`Error en handleDelete (ID: ${id}):`, err);
        setError(err.message || "Error al eliminar el cliente.");
      } finally {
        setIsLoading(false);
      }
    } else {
        // console.log("handleDelete: Operación cancelada por el usuario."); // Debug
    }
  };

  // --- Renderizado ---
  // console.log("Renderizando ClientsPage, estado editModalOpen:", editModalOpen); // Debug para estado del modal

  return (
    <Container fluid className="clients-page-container mt-4 mb-4">
      {/* Cabecera */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">
        {/* <h2 className="mb-0 flex-shrink-0">Gestión de Clientes</h2> */}
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-md-end">
          {/* Búsqueda */}
          <div className="input-group" style={{ minWidth: '220px', maxWidth: '400px' }}>
            <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
            <Input
              type="text"
              placeholder="Buscar por nombre, doc, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control form-control-sm"
              disabled={isLoading} // Deshabilitar mientras carga inicial
            />
          </div>
          {/* Botón Agregar */}
          <Button color="success" size="sm" onClick={handleAddNew} className="flex-shrink-0" disabled={isLoading}>
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Cliente
          </Button>
        </div>
      </div>

      {/* Alerta General */}
      {error && <Alert color="danger" className="mt-3">{error}</Alert>}

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="text-center p-5">
          <Spinner color="primary">Cargando clientes...</Spinner>
        </div>
      ) : (
        <>
          {/* Tabla de Clientes */}
          {/* Se muestra si NO hay error, incluso si la lista está vacía inicialmente */}
          {!error && (
             <ClientList
                // clients={currentTableData} // <-- Usar esto cuando implementes paginación visual
                clients={filteredClients}      // <-- Muestra todos los filtrados mientras no hay paginación
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView} // Asegúrate que ClientList use esta prop
             />
          )}

          {/* --- Paginación (Comentada hasta que tengas el componente) --- */}
          {/*
          {totalPages > 1 && !error && (
            <div className="mt-3 d-flex justify-content-center">
              <ClientsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          */}

          {/* Mensaje si la lista está vacía (después de cargar y sin errores) */}
          {!isLoading && !error && filteredClients.length === 0 && (
            <Alert color="info" className="text-center mt-3">
              {searchTerm ? "No se encontraron clientes que coincidan con la búsqueda." : "No hay clientes registrados."}
            </Alert>
          )}
        </>
      )}

      {/* --- Modal Crear/Editar Cliente --- */}
      <Modal
        isOpen={editModalOpen}          // Controla si el modal está abierto
        toggle={!isSaving ? toggleEditModal : undefined} // Permite cerrar si no está guardando
        size="lg"                       // Tamaño del modal
        backdrop="static"               // No se cierra al hacer clic fuera
        centered                        // Centrado verticalmente
      >
        <ModalHeader
          toggle={!isSaving ? toggleEditModal : undefined} // Permite cerrar si no está guardando
          close={!isSaving ? <button className="btn-close" onClick={toggleEditModal} aria-label="Cerrar"></button> : <></>} // Botón X de cierre
        >
          {/* Título dinámico */}
          {selectedClient ? "Editar Cliente" : "Agregar Nuevo Cliente"}
        </ModalHeader>
        <ModalBody>
          {/* Renderiza el formulario y pasa todas las props necesarias */}
          <ClientForm
            onSubmit={handleSave}
            initialData={selectedClient}
            onCancel={toggleEditModal}
            apiError={modalError}
            isSaving={isSaving}
            // La key es importante para que React resetee el estado interno
            // del formulario cuando cambias entre crear y editar, o editas diferentes clientes.
            key={selectedClient?.id || 'new-client-form'}
          />
        </ModalBody>
      </Modal>
      {/* Fin Modal Crear/Editar Cliente */}

      {/* --- Modal Ver Detalles (Comentado) --- */}
      {/*
      <ViewClientModal
        isOpen={viewModalOpen}
        toggle={toggleViewModal}
        client={clientToView}
      />
      */}

    </Container>
  );
};

export default ClientsPage;