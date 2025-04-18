// src/pages/RolesPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button, Input, Spinner, Alert, Container,
  Modal, ModalHeader, ModalBody
} from "reactstrap";
import RolesTable from "../components/Roles/RolesTable";
import RolesForm from "../components/Roles/RolesForm";
import RolesPagination from "../components/Roles/RolesPagination";
import ViewRoleModal from "../components/Roles/ViewRoleModal";
import { getRoles, createRole, updateRole, deleteRole } from "../api/rolesApi";
import { ITEMS_PER_PAGE } from "../components/Roles/rolesConstants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

// Constante para la duración de la animación de las alertas
const ALERT_FADE_TIMEOUT = 150; // en milisegundos

const RolesPage = () => {
  // --- Estados ---
  const [allRoles, setAllRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToView, setRoleToView] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // --- Efectos y Lógica de Datos ---

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rolesData = await getRoles();
      if (Array.isArray(rolesData)) {
        setAllRoles(rolesData);
      } else {
        setAllRoles([]);
        console.error("Respuesta de API de roles inválida. Se esperaba un array. Recibido:", rolesData); // Log detallado
        setError("Error interno al procesar la respuesta de roles.");
      }
    } catch (err) {
      console.error("Error fetching roles:", err); // Log detallado
      setError(err.message || "Error al cargar los roles.");
      setAllRoles([]); // Asegurar limpiar roles en caso de error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Filtrado de roles basado en el término de búsqueda
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) {
        setFilteredRoles(allRoles); // Si no hay búsqueda, mostrar todos
    } else {
        const filtered = allRoles.filter(role =>
          role.name?.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredRoles(filtered);
    }
    setCurrentPage(1); // Resetear a la primera página al cambiar el filtro
  }, [searchTerm, allRoles]);

  // Calcula los datos para la página actual
  const currentTableData = useMemo(() => {
    if (ITEMS_PER_PAGE <= 0) return filteredRoles; // Si no hay paginación, mostrar todo
    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return filteredRoles.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredRoles]);

  // Calcula el número total de páginas
  const totalPages = useMemo(() => {
    return ITEMS_PER_PAGE > 0 ? Math.ceil(filteredRoles.length / ITEMS_PER_PAGE) : 1; // Mínimo 1 página
  }, [filteredRoles]);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // --- Manejadores de Acciones (CRUD y Modales) ---

  // Abre/cierra el modal de formulario y resetea estados relacionados
  const toggleFormModal = useCallback(() => {
    if (isFormModalOpen) {
        // Al cerrar, limpiar selección y errores del formulario
        setSelectedRole(null);
        setFormError(null);
    }
    setIsFormModalOpen(prevState => !prevState);
  }, [isFormModalOpen]);

  // Abre el modal para añadir un nuevo rol
  const handleAddNew = () => {
    setSelectedRole(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Abre el modal para editar un rol existente
  const handleEdit = (role) => {
    setSelectedRole(role);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Guarda (crea o actualiza) un rol
  const handleSave = async (roleData) => {
    setIsSaving(true);
    setFormError(null); // Limpiar error previo del formulario
    const roleId = selectedRole?.id || selectedRole?._id; // Obtener ID si estamos editando

    try {
      // Asegurarse de enviar solo los datos relevantes
      const dataToSend = {
        name: roleData.name,
        // Asegurar que permissions sea un array, incluso si viene null/undefined
        permissions: Array.isArray(roleData.permissions) ? roleData.permissions : [],
      };

      if (roleId) {
        // Actualizar rol existente
        await updateRole(roleId, dataToSend);
      } else {
        // Crear nuevo rol
        await createRole(dataToSend);
      }

      setIsFormModalOpen(false); // Cerrar modal si éxito
      await fetchRoles(); // Recargar la lista de roles

    } catch (err) {
      console.error(`Error saving role (ID: ${roleId || 'new'}):`, err); // Log detallado
      // Intenta obtener un mensaje de error más específico del backend
      const errorMessage = err.response?.data?.message
                            || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.map(e => e.msg).join(', ') : null) // Para errores de express-validator
                            || err.message
                            || `Error al ${roleId ? 'actualizar' : 'crear'} el rol.`;
      setFormError(errorMessage); // Mostrar error en el formulario
    } finally {
      setIsSaving(false); // Terminar estado de guardado
    }
  };

  // Elimina un rol
  const handleDelete = async (id) => {
    if (!id) return; // No hacer nada si no hay ID

    // Busca el nombre del rol para un mensaje de confirmación más amigable
    const roleToDelete = allRoles.find(r => (r.id || r._id) === id);
    const confirmMessage = roleToDelete
      ? `¿Está seguro de que desea eliminar el rol "${roleToDelete.name}" (ID: ${id})?`
      : `¿Está seguro de que desea eliminar el rol con ID ${id}?`; // Fallback si no se encuentra

    // Confirmación del usuario
    if (window.confirm(confirmMessage)) {
      setIsLoading(true); // Indicador de carga general para la tabla
      setError(null); // Limpiar error general
      try {
        await deleteRole(id); // Llamada a la API para eliminar
        await fetchRoles(); // Recargar la lista de roles actualizada

        // Lógica para ajustar la página actual si la última fila fue eliminada
        if (currentTableData.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
        // Limpiar estados si el rol eliminado estaba seleccionado o viéndose
        if ((selectedRole?.id || selectedRole?._id) === id) setSelectedRole(null);
        if ((roleToView?.id || roleToView?._id) === id) setRoleToView(null);

      } catch (err) {
        console.error(`Error deleting role ID ${id}:`, err); // Log detallado
        setError(err.message || "Error al eliminar el rol."); // Mostrar error general
      } finally {
        setIsLoading(false); // Finalizar indicador de carga
      }
    }
  };

  // Abre/Cierra el modal de visualización
  const toggleViewModal = (role = null) => {
    setRoleToView(role);
  };

  // --- Renderizado del Componente ---
  return (
    <Container fluid className="roles-page-container mt-4 mb-4">
      {/* Cabecera: Título, Búsqueda, Botón Agregar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3 flex-wrap">
        {/* <h2 className="mb-0 flex-shrink-0">Gestión de Roles</h2> */}
        {/* Contenedor para búsqueda y botón */}
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-md-end align-items-stretch">
          {/* Grupo de Input para búsqueda */}
          <div className="input-group" style={{ minWidth: '220px', maxWidth: '400px' }}>
            {/* Icono de búsqueda */}
            <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control form-control-sm" // Input más pequeño
              aria-label="Buscar rol por nombre"
            />
          </div>
          {/* Botón para agregar nuevo rol */}
          <Button color="success" size="sm" onClick={handleAddNew} className="flex-shrink-0">
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Rol
          </Button>
        </div>
      </div>

      {/* Alerta para Errores Generales */}
      {error && (
        <Alert
          color="danger"
          className="mt-3"
          // Corrección para el warning de 'timeout' requerida por 'Fade'
          fade={true}
          timeout={ALERT_FADE_TIMEOUT}
        >
          {error}
        </Alert>
      )}

      {/* Sección Principal: Tabla o Indicador de Carga */}
      {isLoading && !isSaving ? ( // Mostrar Spinner solo si carga principal, no al guardar
        <div className="text-center p-5">
          <Spinner color="primary">Cargando roles...</Spinner>
        </div>
      ) : (
        <>
          {/* Renderizar tabla solo si hay datos filtrados */}
          {filteredRoles.length > 0 ? (
            <RolesTable
              roles={currentTableData} // Pasar solo los datos de la página actual
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={toggleViewModal}
            />
          ) : null } {/* No renderizar tabla si no hay datos filtrados */}

          {/* Paginación: Mostrar solo si hay más de una página */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <RolesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Mensaje si no hay roles o no se encuentran resultados de búsqueda */}
          {!isLoading && filteredRoles.length === 0 && (
             <Alert
               color="info"
               className="text-center mt-3"
               // Corrección para el warning de 'timeout' requerida por 'Fade'
               fade={true}
               timeout={ALERT_FADE_TIMEOUT}
             >
                {searchTerm
                  ? "No se encontraron roles que coincidan con la búsqueda."
                  : (allRoles.length === 0 ? "Aún no hay roles registrados." : "Error inesperado o lista vacía.") // Mensaje más específico si la lista original está vacía
                }
             </Alert>
          )}
        </>
      )}

      {/* --- Modal para Crear/Editar Rol --- */}
      {/* Renderizar el modal solo cuando isFormModalOpen es true mejora el rendimiento */}
      {isFormModalOpen && (
          <Modal
            isOpen={isFormModalOpen}
            toggle={toggleFormModal}
            backdrop="static" // Evita cerrar al hacer clic fuera
            size="lg" // Modal grande
            centered // Centrado verticalmente
          >
            <ModalHeader toggle={toggleFormModal} closeAriaLabel="Cerrar">
              {/* Título dinámico según si se edita o crea */}
              {selectedRole ? `Editar Rol: ${selectedRole.name}` : "Nuevo Rol"}
            </ModalHeader>
            <ModalBody>
              {/*
                Renderiza el formulario de roles.
                Pasamos las props necesarias: onSubmit, initialData, onCancel, etc.
                Usamos 'key' para forzar el re-renderizado del formulario al cambiar
                entre crear y editar, asegurando que el estado interno se resetee.
              */}
              <RolesForm
                onSubmit={handleSave}
                initialData={selectedRole}
                onCancel={toggleFormModal}
                apiError={formError} // Pasa el error específico del formulario
                isSaving={isSaving} // Indica si se está procesando el guardado
                // Nota: Si RolesForm usa <Alert>, asegúrate de aplicar la corrección de timeout/fade allí también.
                key={selectedRole?.id || selectedRole?._id || 'new-role-form'}
              />
            </ModalBody>
          </Modal>
      )}


      {/* --- Modal para Ver Detalles del Rol --- */}
      {/* Renderizar solo si hay un rol para ver */}
      {roleToView && (
          <ViewRoleModal
            isOpen={!!roleToView} // El modal está abierto si roleToView no es null
            toggle={() => toggleViewModal(null)} // Función para cerrar el modal
            role={roleToView} // Rol a mostrar
          />
      )}

    </Container>
  );
};

export default RolesPage;