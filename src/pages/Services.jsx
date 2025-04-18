// src/pages/ServicesPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Container, Row, Col, Button, Input, Spinner, Alert,
  Modal, ModalHeader, ModalBody
} from 'reactstrap';
import {
  getAllServices, deleteService, updateService, createService
} from '../api/servicesApi'; // Ajusta la ruta si es necesario
import ServiceCard from '../components/Servicios/ServiceCard'; // Ajusta la ruta
import ServiceForm from '../components/Servicios/ServiceForm';   // Ajusta la ruta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
// Asumiendo que tienes paginación si la lista puede ser larga
// import ServicesPagination from '../components/ServicesPagination'; // Descomenta si usas paginación aquí
// const ITEMS_PER_PAGE = 6; // Ejemplo: 6 cards por página

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1); // Para paginación

  // --- Limpiar Alertas ---
  const clearPageError = () => setError(null);
  const clearModalError = () => setModalError(null);

   // --- Función para mostrar mensajes de error amigables ---
   const getFriendlyErrorMessage = (error) => {
    const defaultMessage = "Ocurrió un error inesperado. Inténtalo de nuevo.";
    if (!error) return defaultMessage;
    const validationErrors = error.response?.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        return validationErrors.map(err => err.msg).join(', ');
    }
    if (error.message) {
        if (error.message.includes("401") || error.message.includes("403")) return "No tienes permiso para realizar esta acción.";
        if (error.message.includes("Network Error")) return "Error de conexión. Verifica tu red o el servidor.";
        if (!error.message.toLowerCase().includes('request failed')) return error.message; // Usa mensaje si no es genérico
    }
    return defaultMessage;
  }

  // --- Fetch Data ---
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    clearPageError(); // Limpia error general al recargar
    try {
      console.log("Fetching services...");
      const data = await getAllServices();
      console.log("Services data received:", data);
      if(Array.isArray(data)) {
          setServices(data);
      } else {
          setServices([]);
          setError("La respuesta de la API no es válida.");
      }
    } catch (err) {
      console.error("fetchServices error caught:", err);
      setError(getFriendlyErrorMessage(err));
      setServices([]); // Limpia en caso de error
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // --- Modal ---
  const toggleModal = () => {
      setModalOpen(!modalOpen);
      if (modalOpen) { // Al cerrar
          setSelectedService(null);
          clearModalError();
          setIsSaving(false);
      }
  }

  // --- Actions ---
  const handleAddNew = () => {
      setSelectedService(null);
      clearModalError();
      setModalOpen(true);
  };

  const handleEdit = (service) => {
      setSelectedService(service);
      clearModalError();
      setModalOpen(true);
  };

   const handleDelete = async (id) => {
      if (window.confirm(`¿Seguro que quieres eliminar el servicio con ID ${id}?`)) {
          setIsLoading(true); // O un estado de loading específico para delete
          clearPageError();
          try {
              await deleteService(id);
              // Eliminar de la lista localmente o recargar
              // Opción 1: Recargar todo
              await fetchServices();
              // Opción 2: Filtrar localmente (más rápido si no hay paginación compleja)
              // setServices(prevServices => prevServices.filter(s => (s.id || s._id) !== id));
          } catch (err) {
              console.error('Error al eliminar servicio:', err);
              setError(getFriendlyErrorMessage(err));
          } finally {
              setIsLoading(false);
          }
      }
  };

  // --- Save / Update ---
   const handleSaveService = async (formData, serviceId) => { // Recibe FormData
       setIsSaving(true);
       clearModalError();
       try {
           if (serviceId) {
               await updateService(serviceId, formData); // Envía FormData a la API
           } else {
               await createService(formData); // Envía FormData a la API
           }
           toggleModal(); // Cierra si éxito
           await fetchServices(); // Recarga la lista
       } catch (err) {
           console.error('Error al guardar servicio:', err);
           setModalError(getFriendlyErrorMessage(err)); // Muestra error en el modal
           // No cierra el modal si hay error
       } finally {
           setIsSaving(false);
       }
   };

  // --- Filtering & Pagination ---
  const filteredServices = useMemo(() => services.filter(service =>
      service.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [services, searchTerm]);

  // Lógica de paginación (si la usas)
  // const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  // const currentServices = filteredServices.slice(
  //    (currentPage - 1) * ITEMS_PER_PAGE,
  //    currentPage * ITEMS_PER_PAGE
  // );
  // const handlePageChange = (page) => setCurrentPage(page);

  // Usa currentServices en el map si tienes paginación, sino usa filteredServices
  const servicesToDisplay = filteredServices; // Cambia a currentServices si implementas paginación


  return (
    <Container fluid className="mt-4 mb-4">
      {/* Cabecera */}
       <Row className="mb-3 align-items-center">
          <Col xs="12" lg="6" className="mb-2 mb-lg-0">
             {/* <h2 className='mb-0'>Servicios</h2> */}
          </Col>
          <Col xs="12" lg="6">
             <div className="d-flex flex-column flex-sm-row justify-content-lg-end gap-2">
                <Input
                   type="text"
                   placeholder="Buscar servicio..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{ maxWidth: '300px' }}
                   bsSize="sm"
                />
                <Button color="success" size="sm" onClick={handleAddNew}>
                   <FontAwesomeIcon icon={faPlus} className="me-1"/> Añadir Servicio
                </Button>
             </div>
          </Col>
       </Row>

        {/* Alerta General y Spinner */}
        {isLoading && <div className="text-center p-4"><Spinner>Cargando...</Spinner></div>}
        {error && <Alert color="danger" isOpen={!!error} toggle={clearPageError}>{error}</Alert>}

        {/* Lista de Cards */}
        {!isLoading && !error && (
            <Row className="g-3 justify-content-center"> {/* g-3 para gutters, justify-center para centrar última fila */}
                {servicesToDisplay.length > 0 ? (
                    servicesToDisplay.map(service => (
                        // Ajuste de columnas para 3 por fila en lg y xl
                        <Col xs="12" sm="6" md="6" lg="4" key={service.id || service._id} className="d-flex align-items-stretch">
                            <ServiceCard
                                service={service}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        </Col>
                    ))
                ) : (
                    // Mensaje si no hay servicios o no coinciden con la búsqueda
                    <Col xs="12">
                        <Alert color="info" className="text-center">
                            {searchTerm ? "No se encontraron servicios que coincidan." : "Aún no hay servicios registrados."}
                        </Alert>
                    </Col>
                )}
            </Row>
        )}

        {/* Paginación (si la implementas) */}
        {/* {!isLoading && !error && totalPages > 1 && (
            <ServicesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
             />
        )} */}

        {/* Modal */}
         <Modal isOpen={modalOpen} toggle={toggleModal} size="lg" backdrop="static" centered> {/* centered opcional */}
             <ModalHeader toggle={toggleModal}>
                 {selectedService ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
             </ModalHeader>
             <ModalBody>
                 <ServiceForm
                     initialData={selectedService}
                     onSubmit={handleSaveService} // Esta función recibe FormData
                     onCancel={toggleModal}
                     apiError={modalError} // Error específico del modal
                     isSaving={isSaving}   // Estado de carga del guardado
                     key={selectedService?.id || selectedService?._id || 'new'} // Key para resetear form
                 />
             </ModalBody>
         </Modal>

    </Container>
  );
};

export default ServicesPage;