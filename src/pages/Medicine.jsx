// src/pages/Medicine.jsx

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
import MedicineForm from "../components/Medicina/MedicineForm";
import {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
} from "../api/medicineApi";
import { getSpecimens } from "../api/specimenApi";

const Medicine = () => {
  // --- Estados del Componente (Sin Cambios) ---
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    id: null, nombre: "", cantidad: 1, dosis: "", horaAdministracion: "", estado: "Programado", specimenId: '',
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

  const fetchMedicines = useCallback(async () => {
    try {
      const data = await getAllMedicines();
      setMedicines(data || []);
    } catch (error) {
      console.error("Error fetching medicines:", error.response || error);
      showAlert("danger", error.response?.data?.message || "Error al cargar medicinas.");
    }
  }, [showAlert]);

  const fetchSpecimens = useCallback(async () => {
    setLoadingSpecimens(true);
    try {
      const specimenData = await getSpecimens();
      setSpecimens(specimenData || []);
    } catch (error) {
      console.error("Error fetching specimens:", error.response || error);
      showAlert("warning", "No se pudieron cargar los especímenes para seleccionar.");
    } finally {
      setLoadingSpecimens(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchMedicines();
    fetchSpecimens();
  }, [fetchMedicines, fetchSpecimens]);

  const resetFormAndAlert = () => {
     setFormData({
      id: null, nombre: "", cantidad: 1, dosis: "", horaAdministracion: "", estado: "Programado", specimenId: ''
     });
     setEditing(false);
     setAlertInfo({ type: "", message: "" });
  }

  const toggleModal = () => {
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

    if (!formData.nombre || !formData.dosis || !formData.horaAdministracion || !formData.specimenId) {
       setAlertInfo({type:"warning", message: "Complete todos los campos requeridos (*)."});
       setIsSubmitting(false); return;
    }
     const cantidadNum = parseInt(formData.cantidad, 10);
     const specimenIdNum = parseInt(formData.specimenId, 10);
     if (isNaN(cantidadNum) || cantidadNum < 0 || isNaN(specimenIdNum)) {
        setAlertInfo({type: "warning", message:"Cantidad debe ser número >= 0. Espécimen inválido."});
        setIsSubmitting(false); return;
     }
     if (!/^\d{2}:\d{2}(:\d{2})?$/.test(formData.horaAdministracion)) {
        setAlertInfo({type: "warning", message:"Formato de hora inválido (HH:MM)."});
        setIsSubmitting(false); return;
     }

    const dataToSend = {
      nombre: formData.nombre, cantidad: cantidadNum, dosis: formData.dosis,
      horaAdministracion: formData.horaAdministracion, estado: formData.estado || 'Programado',
      specimenId: specimenIdNum,
    };

    try {
      let successMessage = "";
      if (editing) {
        await updateMedicine(formData.id, dataToSend);
        successMessage = "Medicina actualizada correctamente.";
      } else {
        await createMedicine(dataToSend);
        successMessage = "Medicina agregada correctamente.";
      }
      await fetchMedicines();
      toggleModal();
      showAlert("success", successMessage);
    } catch (error) {
      console.error("Error saving medicine:", error.response || error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Ocurrió un error al guardar.";
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

  const handleEdit = (medicine) => {
    let horaFormateada = "";
    if (medicine.horaAdministracion) {
        const parts = String(medicine.horaAdministracion).split(':');
        if (parts.length >= 2) {
            horaFormateada = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
    }
    setFormData({
        id: medicine.id, nombre: medicine.nombre || '', cantidad: medicine.cantidad ?? 1,
        dosis: medicine.dosis || '', horaAdministracion: horaFormateada,
        estado: medicine.estado || 'Programado',
        specimenId: medicine.specimen?.id || medicine.specimenId || '',
    });
    setEditing(true);
    setAlertInfo({ type: "", message: "" });
    toggleModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta medicina?')) {
      try {
        await deleteMedicine(id);
        showAlert("info", "Medicina eliminada.");
        fetchMedicines();
      } catch (error) {
        console.error("Error deleting medicine:", error.response || error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || "Error al eliminar la medicina.";
        showAlert("danger", errorMsg);
      }
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    medicine.specimen?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // --- Renderizado del Componente ---
  return (
    <div className="container mt-4">
      {/* Alerta General (Sin cambios) */}
      {alertInfo.message && !modalIsOpen && (
        <Alert color={alertInfo.type} isOpen={!!alertInfo.message} toggle={() => setAlertInfo({ message: "", type: "" })} fade className="mt-3" >
          {alertInfo.message}
        </Alert>
      )}

      {/* --- MODIFICADO: Controles Superiores (Estilo RolesPage) --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3 flex-wrap">
         {/* <h2 className="mb-0 flex-shrink-0">Gestión de Medicinas</h2> */}
         <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-md-end align-items-stretch">
            {/* Grupo de Input para búsqueda */}
            <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
                 <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                 <Input
                     type="text"
                     placeholder="Buscar por nombre o espécimen..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     bsSize="sm" // Tamaño pequeño
                     aria-label="Buscar medicina"
                 />
            </InputGroup>
            {/* Botón para agregar nueva medicina */}
            <Button color="success" size="sm" onClick={handleAddNew} className="flex-shrink-0">
                <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar Medicina
            </Button>
         </div>
      </div>
      {/* --- FIN Controles Superiores Modificados --- */}


      {/* --- MODAL (Sin cambios estructurales) --- */}
       <Modal isOpen={modalIsOpen} toggle={toggleModal} onClosed={resetFormAndAlert} backdrop="static" centered size="lg">
        <ModalHeader toggle={toggleModal}>
            {editing ? 'Editar Medicina' : 'Agregar Nueva Medicina'}
        </ModalHeader>
        <ModalBody>
             {alertInfo.message && modalIsOpen && (
                <Alert color={alertInfo.type} className="mb-3">{alertInfo.message}</Alert>
             )}
             <MedicineForm
                formData={formData}
                handleInputChange={handleInputChange}
                editing={editing}
                specimens={specimens}
                loadingSpecimens={loadingSpecimens}
             />
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
               {isSubmitting ? 'Guardando...' : (editing ? 'Actualizar Cambios' : 'Guardar Medicina')}
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
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Dosis</th>
              <th>Hora Adm.</th>
              <th>Espécimen</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td>{medicine.nombre || "-"}</td>
                  <td>{medicine.cantidad ?? "-"}</td>
                  <td>{medicine.dosis || "-"}</td>
                  <td>{medicine.horaAdministracion || "-"}</td>
                  <td>{medicine.specimen?.name || (medicine.specimenId ? `ID: ${medicine.specimenId}` : "-")}</td>
                  <td>{medicine.estado || "-"}</td>
                  <td>
                    {/* Usar ButtonGroup para Acciones */}
                    <ButtonGroup size="sm">
                      <Button color="dark" onClick={() => handleEdit(medicine)} title="Editar" className="me-1"> {/* color="dark" */}
                          <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button color="danger" onClick={() => handleDelete(medicine.id)} title="Eliminar" className="me-1"> {/* me-1 para espacio */}
                          <FontAwesomeIcon icon={faTrash} />
                      </Button>
                      {/* Aquí iría un botón de ver si lo necesitas */}
                    </ButtonGroup>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center fst-italic py-3">
                  {medicines.length === 0 ? "No hay medicinas registradas." : "No se encontraron coincidencias."}
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

export default Medicine;