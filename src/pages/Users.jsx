import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Button,
  Input,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  Spinner
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faSearch, faEye } from "@fortawesome/free-solid-svg-icons";
import UserForm from "../components/Usuarios/UserForm";
import UserTable from "../components/Usuarios/UserTable";
import ViewUserModal from "../components/Usuarios/ViewUserModal"; // Importar modal de vista
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from "../api/userApi";

const UsersPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Estado para modal vista
  const [modalApiError, setModalApiError] = useState(null);
  const [generalAlert, setGeneralAlert] = useState({ visible: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showAlert = useCallback((type, message, duration = 4000) => {
    setGeneralAlert({ visible: true, message, type });
    const timer = setTimeout(() => { setGeneralAlert({ visible: false, message: "", type: "" }); }, duration);
    return () => clearTimeout(timer);
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setGeneralAlert({ visible: false, message: "", type: "" });
    try {
      const data = await obtenerUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("danger", `Error al cargar usuarios: ${error.message}`);
      setUsuarios([]);
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) {
      setFilteredUsers(usuarios);
    } else {
      const filtered = usuarios.filter(user =>
        user.nombreCompleto?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.documento?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.celular?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.role?.name?.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, usuarios]);

  const toggleFormModal = useCallback(() => {
    if (isFormModalOpen) {
      setSelectedUser(null);
      setModalApiError(null);
    }
    setIsFormModalOpen(prevState => !prevState);
  }, [isFormModalOpen]);

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setModalApiError(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalApiError(null);
    setIsFormModalOpen(true);
  };

  const handleSave = async (userData) => {
    setIsSaving(true);
    setModalApiError(null);
    const userId = selectedUser?.id || selectedUser?._id;

    try {
      let successMessage = "";
      if (userId) {
        await actualizarUsuario(userId, userData);
        successMessage = "Usuario actualizado con éxito.";
      } else {
        await crearUsuario(userData);
        successMessage = "Usuario creado con éxito.";
      }
      toggleFormModal();
      await fetchUsers();
      showAlert("success", successMessage);

    } catch (error) {
      console.error(`Error ${userId ? 'actualizando' : 'creando'} usuario:`, error);
      setModalApiError(error.message || `Error al ${userId ? 'actualizar' : 'crear'} usuario.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const userToDelete = usuarios.find(u => (u.id || u._id) === id);
    const confirmMessage = `¿Está seguro de eliminar al usuario "${userToDelete?.username || id}"?`;

    if (window.confirm(confirmMessage)) {
       try {
         await eliminarUsuario(id);
         showAlert("info", "Usuario eliminado con éxito.");
         await fetchUsers();
         if ((selectedUser?.id || selectedUser?._id) === id) setSelectedUser(null);
       } catch (error) {
         console.error("Error eliminando usuario:", error);
         showAlert("danger", `Error al eliminar usuario: ${error.message}`);
       }
    }
  };

  return (
    <Container fluid className="mt-4 mb-5">

      {generalAlert.visible && (
        <Alert color={generalAlert.type} isOpen={generalAlert.visible} toggle={() => setGeneralAlert({ visible: false, message: "", type: "" })} fade>
          {generalAlert.message}
        </Alert>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3 flex-wrap">
         <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-md-end align-items-stretch">
            <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
                 <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                 <Input type="text" placeholder="Buscar usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} bsSize="sm" aria-label="Buscar usuarios"/>
            </InputGroup>
            <Button color="success" size="sm" onClick={handleAddNew} className="flex-shrink-0" disabled={isLoading}>
                <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Usuario
            </Button>
         </div>
      </div>

      {isLoading ? (
        <div className="text-center p-5"><Spinner color="primary">Cargando...</Spinner></div>
      ) : (
         <UserTable
            usuarios={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleOpenViewModal} // Pasar handler para ver
         />
      )}

       {!isLoading && filteredUsers.length === 0 && (
          <Alert color="info" className="text-center mt-3" fade={false}>
             {usuarios.length === 0 ? "No hay usuarios registrados." : "No se encontraron coincidencias para la búsqueda."}
          </Alert>
       )}

      {isFormModalOpen && (
          <Modal isOpen={isFormModalOpen} toggle={toggleFormModal} backdrop="static" centered size="lg" onClosed={() => { setSelectedUser(null); setModalApiError(null); }}>
            <ModalHeader toggle={toggleFormModal}>
              {selectedUser ? `Editar Usuario: ${selectedUser.username}` : "Nuevo Usuario"}
            </ModalHeader>
            <ModalBody>
              <UserForm key={selectedUser?.id || selectedUser?._id || 'new-user'} initialData={selectedUser} onSubmit={handleSave} apiError={modalApiError} isSaving={isSaving}/>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggleFormModal} disabled={isSaving}> Cancelar </Button>
                 <Button color="primary" type="submit" form="user-form-inside-modal" disabled={isSaving}>
                    {isSaving ? <Spinner size="sm" /> : (selectedUser ? 'Actualizar' : 'Guardar')}
                 </Button>
            </ModalFooter>
          </Modal>
      )}

      {isViewModalOpen && selectedUser && (
         <ViewUserModal
             isOpen={isViewModalOpen}
             toggle={handleCloseViewModal}
             user={selectedUser}
         />
      )}

    </Container>
  );
};

export default UsersPage;