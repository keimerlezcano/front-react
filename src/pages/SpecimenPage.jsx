// src/pages/SpecimensPage.jsx
// Página que muestra la lista de categorías/ejemplares y maneja los modales de creación/edición

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Row, Col, Button, Input, Spinner, Alert,
    Modal, ModalHeader, ModalBody, Card, CardHeader,
    CardBody as StrapCardBody, InputGroup, InputGroupText
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faEdit, faTrash, faExchangeAlt, faEye } from '@fortawesome/free-solid-svg-icons';

// --- Tus importaciones de API ---
// Asumimos que estas funciones interactúan correctamente con tu backend
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import { getSpecimens, createSpecimen, updateSpecimen, deleteSpecimen } from '../api/specimenApi'; // API para Ejemplares
import { getAllSedes } from '../api/sedeApi'; // API para Sedes
import { getAllClients } from '../api/clientApi';

// --- Tus Componentes ---
import CategoryCard from '../components/Categories/CategoryCard';
import CategoryForm from '../components/Categories/CategoryForm.jsx';
import SpecimenForm from '../components/Specimens/SpecimenForm'; // El formulario que acabamos de modificar
import ViewSpecimenModal from '../components/Specimens/ViewSpecimenForm.jsx';
import SpecimenTable from '../components/Specimens/SpecimenTable.jsx';

const ALERT_FADE_TIMEOUT = 300; // Ajusta si quieres

const SpecimensPage = () => {
    // --- Estados de la Página ---
    const [categories, setCategories] = useState([]);
    const [specimens, setSpecimens] = useState([]); // Lista de ejemplares
    const [sedes, setSedes] = useState([]);         // Lista de sedes
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Para eliminar
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isSavingSpecimen, setIsSavingSpecimen] = useState(false); // Para crear/editar ejemplar
    const [error, setError] = useState(null); // Error general de la página
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [specimenEditModalOpen, setSpecimenEditModalOpen] = useState(false); // Modal para crear/editar ejemplar
    const [isSpecimenMoveMode, setIsSpecimenMoveMode] = useState(false);
    const [specimenViewModalOpen, setSpecimenViewModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null); // Error dentro del modal
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSpecimen, setSelectedSpecimen] = useState(null); // Ejemplar a editar/mover
    const [specimenToView, setSpecimenToView] = useState(null);
    const [openCategories, setOpenCategories] = useState({}); // Para expandir/colapsar categorías

    // --- Funciones de Utilidad ---
    const clearPageError = useCallback(() => setError(null), []);
    const clearModalError = useCallback(() => setModalError(null), []);
    const getFriendlyErrorMessage = /* ... tu función existente ... */ useCallback((error) => {
        console.error("[getFriendlyErrorMessage] Error recibido:", error);
        const defaultMessage = "Ocurrió un error inesperado. Intente nuevamente.";
        if (!error) return defaultMessage;
        const errorData = error.response?.data;
        const validationErrors = errorData?.errors || errorData?.message;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) { return validationErrors.map(err => err.msg || JSON.stringify(err)).join('; '); }
        if (typeof validationErrors === 'string' && validationErrors.length > 0) { if (validationErrors.includes("Sequelize is not defined")) return "Error de validación interno."; if (validationErrors.startsWith("No se puede eliminar")) return validationErrors; return validationErrors; }
        const axiosMsg = errorData?.message;
        if (axiosMsg) return axiosMsg;
        const errorMsg = error.message;
        if (errorMsg) { if (errorMsg.includes("401") || errorMsg.includes("403")) return "No autorizado."; if (errorMsg.includes("Network Error")) return "Error red."; if (errorMsg.toLowerCase().includes('request failed')) return defaultMessage; return errorMsg; }
        return defaultMessage;
    }, []);


    // --- Carga de Datos Inicial ---
    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        clearPageError();
        let accumulatedErrors = [];
        try {
            // Llama a todas las APIs en paralelo
            const results = await Promise.allSettled([
                getAllCategories(),
                getSpecimens(),
                getAllSedes(), // Asegúrate que esta función devuelve [{ _id: '...', nombre: '...' }, ...]
                getAllClients()
            ]);
            const [categoriesResult, specimensResult, sedesResult, clientsResult] = results;

            // Procesar resultados de categorías
            if (categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)) {
                 setCategories(categoriesResult.value);
                 // Mantiene el estado expandido/colapsado
                 const fetchedCategories = categoriesResult.value;
                 setOpenCategories(prevOpen => fetchedCategories.reduce((acc, cat) => { const id = (cat.id||cat._id)?.toString(); if(id) acc[id]=prevOpen[id]||false; return acc; },{}));
            } else { accumulatedErrors.push(`Categorías: ${getFriendlyErrorMessage(categoriesResult.reason || "Error")}`); setCategories([]); }

            // Procesar resultados de ejemplares
            if (specimensResult.status === 'fulfilled' && Array.isArray(specimensResult.value)) {
                setSpecimens(specimensResult.value);
            } else { accumulatedErrors.push(`Ejemplares: ${getFriendlyErrorMessage(specimensResult.reason || "Error")}`); setSpecimens([]); }

            // Procesar resultados de sedes
            if (sedesResult.status === 'fulfilled' && Array.isArray(sedesResult.value)) {
                setSedes(sedesResult.value); // Guarda la lista de sedes en el estado
                console.log("Sedes cargadas:", sedesResult.value); // Para depurar
            } else { accumulatedErrors.push(`Sedes: ${getFriendlyErrorMessage(sedesResult.reason || "Error")}`); setSedes([]); }

            // Procesar resultados de clientes
            if (clientsResult.status === 'fulfilled' && Array.isArray(clientsResult.value)) {
                setClients(clientsResult.value);
            } else { accumulatedErrors.push(`Clientes: ${getFriendlyErrorMessage(clientsResult.reason || "Error")}`); setClients([]); }

            // Mostrar errores acumulados si los hubo
            if (accumulatedErrors.length > 0) setError(accumulatedErrors.join(' | '));

        } catch (err) {
            // Error general si falla Promise.allSettled (raro)
            setError(`Error General Cargando Datos: ${getFriendlyErrorMessage(err)}`);
            setCategories([]); setSpecimens([]); setSedes([]); setClients([]); setOpenCategories({});
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [getFriendlyErrorMessage, clearPageError]);

    // Cargar datos cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // --- Funciones para abrir/cerrar modales y manejar selecciones ---
    const toggleCategoryCollapse = /* ... tu función existente ... */ useCallback((categoryId) => { const id = categoryId?.toString(); if(id) setOpenCategories(prev => ({ ...prev, [id]: !prev[id] })); }, []);
    const toggleCategoryModal = /* ... tu función existente ... */ useCallback(() => { setCategoryModalOpen(prev => !prev); if (!categoryModalOpen) clearModalError(); else setSelectedCategory(null); setIsSavingCategory(false); }, [categoryModalOpen, clearModalError]);
    const toggleSpecimenEditModal = /* ... tu función existente ... */ useCallback(() => { setSpecimenEditModalOpen(prev => !prev); if (!specimenEditModalOpen) clearModalError(); else setSelectedSpecimen(null); setIsSavingSpecimen(false); setIsSpecimenMoveMode(false); }, [specimenEditModalOpen, clearModalError]);
    const toggleSpecimenViewModal = /* ... tu función existente ... */ useCallback((specimen = null) => { setSpecimenToView(specimen); setSpecimenViewModalOpen(prev => !prev); }, []);


    // --- Handlers para Acciones CRUD (Categorías) ---
    const handleAddNewCategory = /* ... tu función existente ... */ useCallback(() => { setSelectedCategory(null); toggleCategoryModal(); }, [toggleCategoryModal]);
    const handleEditCategory = /* ... tu función existente ... */ useCallback((category) => { setSelectedCategory(category); toggleCategoryModal(); }, [toggleCategoryModal]);
    const handleDeleteCategory = /* ... tu función existente ... */ useCallback(async (id) => {
        const categoryId = id?.toString(); if (!categoryId) return;
        const category = categories.find(c => (c.id||c._id)?.toString() === categoryId);
        if (window.confirm(`¿Eliminar categoría "${category?.name||categoryId}"? Esta acción no se puede deshacer.`)) {
             setIsProcessing(true); clearPageError();
             try { await deleteCategory(categoryId); await fetchData(false); }
             catch (err) { setError(getFriendlyErrorMessage(err)); }
             finally { setIsProcessing(false); }
         }
    }, [categories, deleteCategory, fetchData, getFriendlyErrorMessage, clearPageError]);
    const handleSaveCategory = /* ... tu función existente ... */ useCallback(async (categoryData, categoryId) => {
        setIsSavingCategory(true); clearModalError();
        try { const idStr = categoryId?.toString(); if (idStr) await updateCategory(idStr, categoryData); else await createCategory(categoryData); toggleCategoryModal(); await fetchData(false); }
        catch (err) { setModalError(getFriendlyErrorMessage(err)); }
        finally { setIsSavingCategory(false); }
    }, [toggleCategoryModal, fetchData, getFriendlyErrorMessage, clearModalError]);


    // --- Handlers para Acciones CRUD (Ejemplares) ---
    const handleAddNewSpecimen = useCallback(() => {
        setSelectedSpecimen(null);      // No hay datos iniciales
        setIsSpecimenMoveMode(false);   // No es modo mover
        clearModalError();              // Limpiar errores previos del modal
        setSpecimenEditModalOpen(true); // Abrir el modal de edición/creación
     }, []); // No necesita toggle aquí, solo abrir

     const handleEditSpecimen = useCallback((specimen) => {
        setSelectedSpecimen(specimen); // Establecer los datos iniciales
        setIsSpecimenMoveMode(false);  // No es modo mover
        clearModalError();
        setSpecimenEditModalOpen(true);
     }, []);

     const handleMoveSpecimen = useCallback((specimen) => {
        setSelectedSpecimen(specimen);
        setIsSpecimenMoveMode(true); // Activar modo mover
        clearModalError();
        setSpecimenEditModalOpen(true);
     }, []);

     const handleViewSpecimen = useCallback((specimen) => {
        toggleSpecimenViewModal(specimen);
     }, [toggleSpecimenViewModal]);

     const handleDeleteSpecimen = useCallback(async (id) => {
        const specimenId = id?.toString(); if (!specimenId) return;
        const specimen = specimens.find(s => (s.id||s._id)?.toString() === specimenId);
        if (window.confirm(`¿Eliminar ejemplar "${specimen?.name||specimenId}"? Esta acción no se puede deshacer.`)) {
            setIsProcessing(true); clearPageError();
            try {
                // Llama a la función de tu API para eliminar
                await deleteSpecimen(specimenId);
                await fetchData(false); // Recarga los datos sin mostrar spinner grande
            } catch (err) {
                setError(getFriendlyErrorMessage(err));
            } finally {
                setIsProcessing(false);
            }
        }
    }, [specimens, deleteSpecimen, fetchData, getFriendlyErrorMessage, clearPageError]); // Dependencias correctas


    // --- Handler Principal para Guardar/Actualizar Ejemplar (se pasa a SpecimenForm) ---
    const handleSaveSpecimen = useCallback(async (specimenFormData) => {
        // specimenFormData es el objeto { name, descripcion, cantidad, sedeId, ... } que viene de SpecimenForm
        setIsSavingSpecimen(true);
        clearModalError();
        const isEditing = !!selectedSpecimen; // Determina si estamos editando basado en si hay un selectedSpecimen

        // --- *** MAPEO CRÍTICO DE DATOS PARA LA API *** ---
        // Construye el objeto EXACTAMENTE como lo espera tu API de backend
        const dataToSend = {
            nombre: specimenFormData.name?.trim(), // Usa 'nombre' como espera el backend
            descripcion: specimenFormData.descripcion?.trim() || null, // Usa 'descripcion', envía null si está vacío/undefined
            cantidad: Number.isNaN(Number(specimenFormData.cantidad)) ? null : Number(specimenFormData.cantidad), // Usa 'cantidad', convierte a número, envía null si no es válido
            sede: specimenFormData.sedeId || null, // Usa 'sede' (el _id de Mongo que viene en sedeId), envía null si no hay
            // Incluye OTROS campos SOLO si tu backend los espera en la ruta POST/PUT /api/ejemplares/:
            // Ejemplo: si el backend también espera 'clientId'
            // clientId: specimenFormData.clientId || null,
            // Ejemplo: si el backend también espera 'specimenCategoryId' (¡OJO! el nombre puede ser diferente)
            // categoriaId: specimenFormData.specimenCategoryId || null, // Asumiendo que el backend lo llama 'categoriaId'
        };

        // Eliminar propiedades nulas si el backend no las maneja bien (opcional)
        // Object.keys(dataToSend).forEach(key => dataToSend[key] == null && delete dataToSend[key]);

        console.log(`Intentando ${isEditing ? 'actualizar' : 'crear'} ejemplar. ID: ${selectedSpecimen?._id}, Datos:`, dataToSend);

        try {
            if (isEditing) {
                // Llama a la función de tu API para actualizar
                // Asegúrate que updateSpecimen en specimenApi.js haga un PUT a /api/ejemplares/:id
                const specimenId = selectedSpecimen?._id; // Obtener el _id real
                if (!specimenId) throw new Error("ID de ejemplar no encontrado para actualizar.");
                await updateSpecimen(specimenId, dataToSend);
            } else {
                // Llama a la función de tu API para crear
                // Asegúrate que createSpecimen en specimenApi.js haga un POST a /api/ejemplares
                await createSpecimen(dataToSend);
            }
            setSpecimenEditModalOpen(false); // Cierra el modal si tuvo éxito
            await fetchData(false);         // Recarga la lista de ejemplares
            setSelectedSpecimen(null);      // Limpia la selección

        } catch (err) {
            // Captura el error y lo muestra en el modal
            console.error("Error en handleSaveSpecimen:", err);
            setModalError(getFriendlyErrorMessage(err));
            // No cierres el modal si hay error, para que el usuario vea el mensaje
        } finally {
            setIsSavingSpecimen(false); // Quita el spinner del botón
        }
    }, [selectedSpecimen, createSpecimen, updateSpecimen, fetchData, getFriendlyErrorMessage, clearModalError]); // Dependencias correctas


    // --- Funciones para obtener nombres (útiles para mostrar en tablas/vistas) ---
    const getCategoryNameById = /* ... tu función existente ... */ useCallback((id) => { /* ... */ }, [categories]);
    const getSedeNameById = useCallback((id) => {
        // Busca usando _id y devuelve el campo 'nombre' (como está en tu backend)
        const sede = sedes.find(s => (s._id)?.toString() === id?.toString());
        return sede?.nombre || 'Sin Sede'; // Devuelve 'nombre'
    }, [sedes]);
    const getClientNameById = /* ... tu función existente ... */ useCallback((id) => { /* ... */ }, [clients]);
    const getFullClientDataById = /* ... tu función existente ... */ useCallback((id) => { /* ... */ }, [clients]);

    // --- Memoización para filtrado y agrupación ---
    const filteredSpecimens = /* ... tu función existente ... */ useMemo(() => { /* ... */ }, [specimens, searchTerm]);
    const specimensByCategory = /* ... tu función existente ... */ useMemo(() => { /* ... */ }, [specimens]);


    // --- Renderizado de la Página ---
    return (
        <Container fluid className="mt-4 mb-4 specimens-page">
             {/* --- Barra Superior (Búsqueda y Botones) --- */}
             <Row className="mb-3 align-items-center">
                <Col xs="12" md="auto" className="mb-2 mb-md-0">
                   {/* Puedes poner un título aquí si quieres */}
                </Col>
                <Col xs="12" md>
                    <div className="d-flex flex-column flex-sm-row justify-content-md-end align-items-stretch gap-2">
                       {/* Input de Búsqueda */}
                       <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
                           {/* ... input de búsqueda sin cambios ... */}
                           <InputGroupText><FontAwesomeIcon icon={faSearch} /></InputGroupText>
                           <Input type="text" placeholder="Buscar ejemplar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isLoading} />
                       </InputGroup>
                       {/* Botón Crear Categoría */}
                       <Button color="info" size="sm" onClick={handleAddNewCategory} disabled={isLoading || isProcessing} className="flex-shrink-0">
                           <FontAwesomeIcon icon={faPlus} className="me-1" /> Crear Categoria
                       </Button>
                       {/* Botón Crear Ejemplar (Abre el Modal) */}
                       <Button color="success" size="sm" onClick={handleAddNewSpecimen} disabled={isLoading || isProcessing} className="flex-shrink-0">
                           <FontAwesomeIcon icon={faPlus} className="me-1" /> Crear Ejemplar
                       </Button>
                    </div>
                </Col>
            </Row>

            {/* --- Indicador de Carga o Procesamiento --- */}
            {(isLoading || isProcessing) && <div className="text-center p-5"><Spinner color="primary">{isProcessing ? 'Procesando...' : 'Cargando...'}</Spinner></div>}

            {/* --- Alerta de Error General de Página --- */}
            {error && (
                 <Row className="justify-content-center">
                    <Col xs="12" md="10" lg="8">
                        <Alert color="danger" className='mt-3' isOpen={!!error} toggle={clearPageError} fade={true} /* timeout opcional */ >
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* --- Contenido Principal (Resultados de Búsqueda o Categorías) --- */}
            {!isLoading && !error && (
                <>
                    {/* Si hay término de búsqueda, mostrar resultados filtrados */}
                    {searchTerm ? (
                        <Row className="mt-3">
                            <Col xs="12">
                                <h4>Resultados para "{searchTerm}"</h4>
                                {filteredSpecimens.length > 0 ? (
                                    <Card>
                                        <StrapCardBody className="p-0">
                                            {/* Tabla de Ejemplares Filtrados */}
                                            <SpecimenTable
                                                specimens={filteredSpecimens}
                                                onEdit={handleEditSpecimen}
                                                onDelete={handleDeleteSpecimen}
                                                onMove={handleMoveSpecimen}
                                                onView={handleViewSpecimen}
                                                getSedeNameById={getSedeNameById} // Pasa la función correcta
                                                getClientNameById={getClientNameById}
                                            />
                                        </StrapCardBody>
                                    </Card>
                                ) : (
                                    <Alert color="info" className="text-center mt-3">No se encontraron ejemplares.</Alert>
                                )}
                            </Col>
                        </Row>
                    ) : (
                         // Si no hay búsqueda, mostrar tarjetas de Categorías
                        <Row className="g-3 category-cards-container">
                            {/* Mapeo de Categorías */}
                            {categories.length > 0 ? (
                                categories.map(category => {
                                     const categoryId = (category.id || category._id)?.toString();
                                     if (!categoryId) return null;
                                     return (
                                        <Col xs="12" key={categoryId}>
                                            <CategoryCard
                                                category={category}
                                                specimensInCategory={specimensByCategory[categoryId] || []}
                                                isOpen={!!openCategories[categoryId]}
                                                onToggleCollapse={() => toggleCategoryCollapse(categoryId)}
                                                onEditCategory={() => handleEditCategory(category)}
                                                onDeleteCategory={() => handleDeleteCategory(categoryId)}
                                                onEditSpecimen={handleEditSpecimen}
                                                onDeleteSpecimen={handleDeleteSpecimen}
                                                onMoveSpecimen={handleMoveSpecimen}
                                                onViewSpecimen={handleViewSpecimen}
                                                getSedeNameById={getSedeNameById} // Pasa la función correcta
                                                getClientNameById={getClientNameById}
                                            />
                                        </Col>
                                     );
                                })
                            ) : (
                                <Col xs="12">
                                    <Alert color="secondary" className='text-center'>No hay categorías registradas.</Alert>
                                </Col>
                            )}
                             {/* Mostrar Ejemplares Sin Categoría (si aplica) */}
                             {specimensByCategory['sin_categoria']?.length > 0 && !searchTerm && (
                                 /* ... tu código para mostrar ejemplares sin categoría ... */
                                 <Col xs="12" key="sin_categoria">
                                     <Card>
                                         <CardHeader className="bg-warning text-dark">Ejemplares Sin Categoría</CardHeader>
                                         <StrapCardBody className="p-0">
                                             <SpecimenTable
                                                 specimens={specimensByCategory['sin_categoria']}
                                                 onEdit={handleEditSpecimen}
                                                 onDelete={handleDeleteSpecimen}
                                                 onMove={handleMoveSpecimen}
                                                 onView={handleViewSpecimen}
                                                 getSedeNameById={getSedeNameById}
                                                 getClientNameById={getClientNameById}
                                             />
                                         </StrapCardBody>
                                     </Card>
                                 </Col>
                             )}
                        </Row>
                    )}
                </>
            )}

            {/* --- Modal para Crear/Editar Categoría --- */}
            {categoryModalOpen && (
                /* ... tu modal de categoría sin cambios ... */
                <Modal isOpen={categoryModalOpen} toggle={toggleCategoryModal} centered backdrop="static">
                    {/* ... */}
                </Modal>
            )}

            {/* --- Modal para Crear/Editar/Mover Ejemplar --- */}
            {specimenEditModalOpen && (
                <Modal isOpen={specimenEditModalOpen} toggle={toggleSpecimenEditModal} size="lg" backdrop="static" centered>
                    <ModalHeader toggle={toggleSpecimenEditModal}>
                        {/* Título dinámico del modal */}
                        {isSpecimenMoveMode ? `Mover Ejemplar: ${selectedSpecimen?.name||''}` : (selectedSpecimen ? `Editar Ejemplar: ${selectedSpecimen?.name||''}` : 'Nuevo Ejemplar')}
                    </ModalHeader>
                    <ModalBody>
                        {/* Renderizar el formulario SpecimenForm con las props correctas */}
                        <SpecimenForm
                             // --- PASO DE PROPS CRÍTICO ---
                             // Mapear sedes: SpecimenForm espera {id, name}, backend usa {_id, nombre}
                             sedes={sedes.map(s => ({ id: s._id, name: s.nombre }))}
                             // Pasar otras listas si son necesarias para los dropdowns del form
                             categories={categories}
                             clients={clients}

                             // Función que se ejecutará al guardar el formulario
                             onSubmit={handleSaveSpecimen}

                             // Datos iniciales (si estamos editando)
                             initialData={selectedSpecimen}
                             isEditMode={!!selectedSpecimen} // True si hay selectedSpecimen

                             // Estado de guardado y error para el botón/alertas en el form
                             isSaving={isSavingSpecimen}
                             apiError={modalError} // Pasa el error del modal

                             isMoveMode={isSpecimenMoveMode} // Indica si estamos en modo mover

                             // Key única para forzar re-renderizado si cambia el ejemplar o modo
                             key={`spec-form-${selectedSpecimen?._id || 'new'}-${isSpecimenMoveMode}`}
                         />
                    </ModalBody>
                </Modal>
             )}

            {/* --- Modal para Ver Detalles del Ejemplar --- */}
            {specimenViewModalOpen && specimenToView && (
                 /* ... tu modal de vista sin cambios ... */
                 <ViewSpecimenModal
                    isOpen={specimenViewModalOpen}
                    toggle={() => toggleSpecimenViewModal(null)}
                    specimen={specimenToView}
                    categoryName={getCategoryNameById(specimenToView.specimenCategoryId)}
                    sedeName={getSedeNameById(specimenToView.sedeId || specimenToView.sede)} // Acepta sedeId o sede
                    clientData={specimenToView.propietario || getFullClientDataById(specimenToView.clientId)}
                 />
             )}
        </Container>
    );
};

export default SpecimensPage;