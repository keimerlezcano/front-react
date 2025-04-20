// src/pages/VacunacionPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,         // <--- OK
  Button,
  Input,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,    // <--- IMPORTAR InputGroup
  ButtonGroup    // <--- IMPORTAR ButtonGroup
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons"; // <--- IMPORTAR faSearch
import VacunacionForm from "../components/Vacunacion/VacunacionForm";
import {
  getAllVacunaciones,
  createVacunacion,
  updateVacunacion,
  deleteVacunacion
} from "../api/vacunacionApi";
import { getSpecimens } from "../api/specimenApi";

const VacunacionPage = () => {
  // --- Estados (Sin Cambios) ---
  const [vacunaciones, setVacunaciones] = useState([]);
  const [formData, setFormData] = useState({
    id: null, nombreVacuna: "", fechaAdministracion: "", specimenId: '',
  });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });
  const [specimens, setSpecimens] = useState([]);
  const [loadingSpecimens, setLoadingSpecimens] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Funciones (Sin Cambios) ---
  const showAlert = useCallback((type, message, duration = 5000) => {
    setAlertInfo({ type, message });
    const timer = setTimeout(() => { setAlertInfo({ type: "", message: "" }); }, duration);
    return () => clearTimeout(timer);
  }, []);

  const fetchVacunaciones = useCallback(async () => {
    try {
      const data = await getAllVacunaciones();
      setVacunaciones(data || []);
    } catch (error) {
      console.error("Error fetching vacunaciones:", error.response || error);
      const errorMsg = error.response?.data?.message || "Error al cargar vacunaciones.";
      showAlert("danger", errorMsg);
    }
  }, [showAlert]);

  const fetchSpecimens = useCallback(async () => {
    setLoadingSpecimens(true);
    try {
      const specimenData = await getSpecimens();
      setSpecimens(specimenData || []);
    } catch (error) {
      console.error("Error fetching specimens:", error.response || error);
      showAlert("warning", "No se pudieron cargar especímenes.");
    } finally {
      setLoadingSpecimens(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchVacunaciones();
    fetchSpecimens();
  }, [fetchVacunaciones, fetchSpecimens]);

   const resetFormAndAlert = () => {
    setFormData({ id: null, nombreVacuna: "", fechaAdministracion: "", specimenId: '' });
    setEditing(false);
    setAlertInfo({ type: "", message: "" });
  }

  const toggleModal = () => {
    // Resetear al cerrar
    if (modalIsOpen) {
        resetFormAndAlert();
    }
    setModalIsOpen(!modalIsOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if(e && typeof e.preventDefault === 'function') e.preventDefault();
    setIsSubmitting(true);
    setAlertInfo({ type: "", message: "" });

    if (!formData.nombreVacuna || !formData.fechaAdministracion || !formData.specimenId) {
      setAlertInfo({type:"warning", message: "Complete los campos requeridos."});
      setIsSubmitting(false); return;
    }
    const specimenIdNum = parseInt(formData.specimenId, 10);
    if (isNaN(specimenIdNum)) {
      setAlertInfo({type:"warning", message: "Espécimen inválido."});
      setIsSubmitting(false); return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaAdministracion) || isNaN(Date.parse(formData.fechaAdministracion))) {
      setAlertInfo({type:"warning", message:"Fecha inválida (YYYY-MM-DD)."});
      setIsSubmitting(false); return;
    }

    const dataToSend = {
      nombreVacuna: formData.nombreVacuna, fechaAdministracion: formData.fechaAdministracion,
      specimenId: specimenIdNum,
    };

    try {
      let successMessage = "";
      if (editing) {
        await updateVacunacion(formData.id, dataToSend);
        successMessage = "Registro actualizado.";
      } else {
        await createVacunacion(dataToSend);
        successMessage = "Registro agregado.";
      }
      await fetchVacunaciones();
      toggleModal();
      showAlert("success", successMessage);
    } catch (error) {
      console.error("Error saving vacunacion:", error.response || error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Error al guardar.";
      setAlertInfo({type: "danger", message: errorMsg});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    resetFormAndAlert();
    setEditing(false);
    toggleModal();
  };

  const handleEdit = (vacunacion) => {
    let fechaFormateada = "";
    if (vacunacion.fechaAdministracion) {
      try {
        const dateObj = new Date(vacunacion.fechaAdministracion);
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        if (!isNaN(dateObj.getTime())) fechaFormateada = dateObj.toISOString().split('T')[0];
        else console.warn("Fecha inválida:", vacunacion.fechaAdministracion);
      } catch (e) { console.error("Error formateando fecha:", e); }
    }
    setFormData({
      id: vacunacion.id,
      nombreVacuna: vacunacion.nombreVacuna || '',
      fechaAdministracion: fechaFormateada,
      specimenId: vacunacion.specimen?.id || vacunacion.specimenId || '',
    });
    setEditing(true);
    setAlertInfo({ type: "", message: "" });
    toggleModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este registro?')) {
      try {
        await deleteVacunacion(id);
        showAlert("info", "Registro eliminado.");
        fetchVacunaciones();
      } catch (error) {
        console.error("Error deleting vacunacion:", error.response || error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || "Error al eliminar.";
        showAlert("danger", errorMsg);
      }
    }
  };

  const filteredVacunaciones = vacunaciones.filter((item) =>
    item.nombreVacuna?.toLowerCase().includes(search.toLowerCase()) ||
    item.specimen?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    try {
      const dateObj = new Date(dateString);
      // Usar UTC para evitar problemas de zona horaria al mostrar solo la fecha
      const utcDate = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
      if (!isNaN(utcDate.getTime())) return utcDate.toLocaleDateString(); // Formato local
      return "-";
    } catch (e) { console.error("Error formateando fecha:", e); return "-"; }
  };

  // --- Renderizado ---
  return (
    <div className="container mt-4">
      {/* Alerta General (Sin cambios) */}
      {alertInfo.message && !modalIsOpen && (
        <Alert color={alertInfo.type} isOpen={!!alertInfo.message} toggle={() => setAlertInfo({ message: "", type: "" })} fade className="mt-3">
          {alertInfo.message}
        </Alert>
      )}

      {/* --- MODIFICADO: Controles Superiores (Estilo RolesPage) --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3 flex-wrap">
        {/* <h2 className="mb-0 flex-shrink-0">Gestión de Vacunación</h2> */}
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-md-end align-items-stretch">
          {/* Grupo de Input para búsqueda */}
          <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
            <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
            <Input
              type="text"
              placeholder="Buscar por vacuna o espécimen..." // Placeholder ajustado
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bsSize="sm" // Tamaño pequeño
              aria-label="Buscar vacunación"
            />
          </InputGroup>
          {/* Botón para agregar nuevo registro */}
          <Button color="success" size="sm" onClick={handleAddNew} className="flex-shrink-0">
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Registro
          </Button>
        </div>
      </div>
      {/* --- FIN Controles Superiores Modificados --- */}


      {/* --- MODAL (Sin Cambios Estructurales) --- */}
      <Modal isOpen={modalIsOpen} toggle={toggleModal} onClosed={resetFormAndAlert} backdrop="static" centered size="lg">
        <ModalHeader toggle={toggleModal}>
            {editing ? 'Editar Registro de Vacunación' : 'Nuevo Registro de Vacunación'}
        </ModalHeader>
        <ModalBody>
            {alertInfo.message && modalIsOpen && ( <Alert color={alertInfo.type} className="mb-3">{alertInfo.message}</Alert> )}
            <VacunacionForm
                formData={formData}
                handleInputChange={handleInputChange}
                editing={editing}
                specimens={specimens}
                loadingSpecimens={loadingSpecimens}
             />
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
               {isSubmitting ? 'Guardando...' : (editing ? 'Actualizar' : 'Guardar')}
            </Button>{' '}
            <Button color="secondary" onClick={toggleModal} disabled={isSubmitting}>
               Cancelar
            </Button>
        </ModalFooter>
      </Modal>
      {/* --- Fin MODAL --- */}


      {/* --- MODIFICADO: Tabla (Estilo RolesPage) --- */}
      <div className="table-responsive mt-4">
        <Table className="table table-bordered table-hover" responsive> {/* Clases añadidas */}
          <thead className="table-dark"> {/* Cabecera Oscura */}
            <tr>
              <th>Vacuna</th>
              <th>Fecha Adm.</th>
              <th>Espécimen</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVacunaciones.length > 0 ? (
              filteredVacunaciones.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombreVacuna || "-"}</td>
                  <td>{formatDateForDisplay(item.fechaAdministracion)}</td>
                  <td>{item.specimen?.name || (item.specimenId ? `ID: ${item.specimenId}` : "-")}</td>
                  <td>{formatDateForDisplay(item.createdAt)}</td>
                  <td>
                    {/* Usar ButtonGroup para Acciones */}
                    <ButtonGroup size="sm">
                      <Button color="dark" onClick={() => handleEdit(item)} title="Editar" className="me-1"> {/* color="dark" */}
                          <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button color="danger" onClick={() => handleDelete(item.id)} title="Eliminar" className="me-1"> {/* me-1 para espacio */}
                          <FontAwesomeIcon icon={faTrash} />
                      </Button>
                      {/* Aquí iría un botón de ver si lo necesitas */}
                    </ButtonGroup>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center fst-italic py-3">
                  {vacunaciones.length === 0 ? "No hay registros." : "No se encontraron coincidencias."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
       {/* --- FIN Tabla Modificada --- */}
    </div>
  );
};

export default VacunacionPage;