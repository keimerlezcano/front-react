// src/pages/SpecimensPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Row, Col, Button, Input, Spinner, Alert,
    Modal, ModalHeader, ModalBody, Card, CardHeader,
    CardBody as StrapCardBody, InputGroup, InputGroupText
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faEdit, faTrash, faExchangeAlt, faEye } from '@fortawesome/free-solid-svg-icons';

import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import { getAllSpecimens, createSpecimen, updateSpecimen, deleteSpecimen } from '../api/specimenApi';
import { getAllSedes } from '../api/sedeApi';
import { getAllClients } from '../api/clientApi';

import CategoryCard from '../components/Categories/CategoryCard';
import CategoryForm from '../components/Categories/CategoryForm.jsx';
import SpecimenForm from '../components/Specimens/SpecimenForm';
import ViewSpecimenModal from '../components/Specimens/ViewSpecimenForm.jsx';
import SpecimenTable from '../components/Specimens/SpecimenTable.jsx';

const ALERT_FADE_TIMEOUT = 300;

const SpecimensPage = () => {
    const [categories, setCategories] = useState([]);
    const [specimens, setSpecimens] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isSavingSpecimen, setIsSavingSpecimen] = useState(false);
    const [error, setError] = useState(null);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [specimenEditModalOpen, setSpecimenEditModalOpen] = useState(false);
    const [isSpecimenMoveMode, setIsSpecimenMoveMode] = useState(false);
    const [specimenViewModalOpen, setSpecimenViewModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSpecimen, setSelectedSpecimen] = useState(null);
    const [specimenToView, setSpecimenToView] = useState(null);
    const [openCategories, setOpenCategories] = useState({});

    const clearPageError = useCallback(() => setError(null), []);
    const clearModalError = useCallback(() => setModalError(null), []);
    const getFriendlyErrorMessage = useCallback((error) => {
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

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        clearPageError();
        let accumulatedErrors = [];
        try {
            const results = await Promise.allSettled([ getAllCategories(), getAllSpecimens(), getAllSedes(), getAllClients() ]);
            const [categoriesResult, specimensResult, sedesResult, clientsResult] = results;

            if (categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)) {
                const fetchedCategories = categoriesResult.value;
                setCategories(fetchedCategories);
                setOpenCategories(prevOpen => fetchedCategories.reduce((acc, cat) => { const id = (cat.id||cat._id)?.toString(); if(id) acc[id]=prevOpen[id]||false; return acc; },{}));
            } else { accumulatedErrors.push(`Categorías: ${getFriendlyErrorMessage(categoriesResult.reason || "Error")}`); setCategories([]); }

            if (specimensResult.status === 'fulfilled' && Array.isArray(specimensResult.value)) { setSpecimens(specimensResult.value); }
            else { accumulatedErrors.push(`Ejemplares: ${getFriendlyErrorMessage(specimensResult.reason || "Error")}`); setSpecimens([]); }

            if (sedesResult.status === 'fulfilled' && Array.isArray(sedesResult.value)) { setSedes(sedesResult.value); }
            else { accumulatedErrors.push(`Sedes: ${getFriendlyErrorMessage(sedesResult.reason || "Error")}`); setSedes([]); }

            if (clientsResult.status === 'fulfilled' && Array.isArray(clientsResult.value)) { setClients(clientsResult.value); }
            else { accumulatedErrors.push(`Clientes: ${getFriendlyErrorMessage(clientsResult.reason || "Error")}`); setClients([]); }

            if (accumulatedErrors.length > 0) setError(accumulatedErrors.join(' | '));
        } catch (err) { setError(`Error Gral: ${getFriendlyErrorMessage(err)}`); setCategories([]); setSpecimens([]); setSedes([]); setClients([]); setOpenCategories({}); }
        finally { if (showLoading) setIsLoading(false); }
    }, [getFriendlyErrorMessage, clearPageError]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleCategoryCollapse = useCallback((categoryId) => { const id = categoryId?.toString(); if(id) setOpenCategories(prev => ({ ...prev, [id]: !prev[id] })); }, []);

    const filteredSpecimens = useMemo(() => {
        if (!searchTerm) return [];
        if (!specimens.length) return [];
        const lowerSearch = searchTerm.toLowerCase();
        return specimens.filter(spec =>
            spec.name?.toLowerCase().includes(lowerSearch) ||
            spec.propietario?.nombre?.toLowerCase().includes(lowerSearch) ||
            (spec.id||spec._id)?.toString().includes(lowerSearch) ||
            spec.identifier?.toLowerCase().includes(lowerSearch)
        );
    }, [specimens, searchTerm]);

    const specimensByCategory = useMemo(() => {
        if (!specimens.length) return {};
        return specimens.reduce((acc, spec) => {
            const key = spec.specimenCategoryId?.toString() || 'sin_categoria';
            if (!acc[key]) acc[key] = [];
            acc[key].push(spec);
            return acc;
        }, {});
    }, [specimens]);

    const toggleCategoryModal = useCallback(() => { setCategoryModalOpen(prev => !prev); if (!categoryModalOpen) clearModalError(); else setSelectedCategory(null); setIsSavingCategory(false); }, [categoryModalOpen, clearModalError]);
    const toggleSpecimenEditModal = useCallback(() => { setSpecimenEditModalOpen(prev => !prev); if (!specimenEditModalOpen) clearModalError(); else setSelectedSpecimen(null); setIsSavingSpecimen(false); setIsSpecimenMoveMode(false); }, [specimenEditModalOpen, clearModalError]);
    const toggleSpecimenViewModal = useCallback((specimen = null) => { setSpecimenToView(specimen); setSpecimenViewModalOpen(prev => !prev); }, []);

    const handleAddNewCategory = useCallback(() => { setSelectedCategory(null); toggleCategoryModal(); }, [toggleCategoryModal]);
    const handleEditCategory = useCallback((category) => { setSelectedCategory(category); toggleCategoryModal(); }, [toggleCategoryModal]);
    const handleDeleteCategory = useCallback(async (id) => {
        const categoryId = id?.toString(); if (!categoryId) return;
        const category = categories.find(c => (c.id||c._id)?.toString() === categoryId);
        if (window.confirm(`¿Eliminar categoría "${category?.name||categoryId}"? Esta acción no se puede deshacer.`)) {
             setIsProcessing(true); clearPageError();
             try { await deleteCategory(categoryId); await fetchData(false); }
             catch (err) { setError(getFriendlyErrorMessage(err)); }
             finally { setIsProcessing(false); }
         }
    }, [categories, deleteCategory, fetchData, getFriendlyErrorMessage, clearPageError]);
    const handleSaveCategory = useCallback(async (categoryData, categoryId) => {
        setIsSavingCategory(true); clearModalError();
        try { const idStr = categoryId?.toString(); if (idStr) await updateCategory(idStr, categoryData); else await createCategory(categoryData); toggleCategoryModal(); await fetchData(false); }
        catch (err) { setModalError(getFriendlyErrorMessage(err)); }
        finally { setIsSavingCategory(false); }
    }, [toggleCategoryModal, fetchData, getFriendlyErrorMessage, clearModalError]);

     const handleAddNewSpecimen = useCallback(() => { setSelectedSpecimen(null); setIsSpecimenMoveMode(false); toggleSpecimenEditModal(); }, [toggleSpecimenEditModal]);
     const handleEditSpecimen = useCallback((specimen) => { setSelectedSpecimen(specimen); setIsSpecimenMoveMode(false); toggleSpecimenEditModal(); }, [toggleSpecimenEditModal]);
     const handleMoveSpecimen = useCallback((specimen) => { setSelectedSpecimen(specimen); setIsSpecimenMoveMode(true); toggleSpecimenEditModal(); }, [toggleSpecimenEditModal]);
     const handleViewSpecimen = useCallback((specimen) => { toggleSpecimenViewModal(specimen); }, [toggleSpecimenViewModal]);
     const handleDeleteSpecimen = useCallback(async (id) => {
         const specimenId = id?.toString(); if (!specimenId) return;
         const specimen = specimens.find(s => (s.id||s._id)?.toString() === specimenId);
         if (window.confirm(`¿Eliminar ejemplar "${specimen?.name||specimenId}"? Esta acción no se puede deshacer.`)) {
             setIsProcessing(true); clearPageError();
             try { await deleteSpecimen(specimenId); await fetchData(false); }
             catch (err) { setError(getFriendlyErrorMessage(err)); }
             finally { setIsProcessing(false); }
         }
     }, [specimens, deleteSpecimen, fetchData, getFriendlyErrorMessage, clearPageError]);
     const handleSaveSpecimen = useCallback(async (specimenFormData, specimenIdInput) => {
         setIsSavingSpecimen(true); clearModalError();
         const specimenId = specimenIdInput?.toString();
         const dataToSend = {
             name: specimenFormData.name?.trim() || '',
             breed: specimenFormData.breed?.trim() || null,
             color: specimenFormData.color?.trim() || null,
             birthDate: specimenFormData.birthDate || null,
             specimenCategoryId: specimenFormData.specimenCategoryId ? parseInt(specimenFormData.specimenCategoryId, 10) : null,
             sedeId: specimenFormData.sedeId ? parseInt(specimenFormData.sedeId, 10) : null,
             clientId: specimenFormData.clientId ? parseInt(specimenFormData.clientId, 10) : null,
         };

         if (!dataToSend.name && !specimenId && !isSpecimenMoveMode) { setModalError("El nombre del ejemplar es obligatorio."); setIsSavingSpecimen(false); return; }
         if (!dataToSend.specimenCategoryId && !specimenId && !isSpecimenMoveMode) { setModalError("La categoría del ejemplar es obligatoria."); setIsSavingSpecimen(false); return; }

         if (isSpecimenMoveMode && specimenId) {
             const original = selectedSpecimen;
             const categoryChanged = dataToSend.specimenCategoryId !== (original?.specimenCategoryId || null);
             const sedeChanged = dataToSend.sedeId !== (original?.sedeId || null);
             const clientChanged = dataToSend.clientId !== (original?.clientId || null);
             if (!categoryChanged && !sedeChanged && !clientChanged) {
                 setModalError("No se han realizado cambios en la categoría, sede o propietario para mover el ejemplar.");
                 setIsSavingSpecimen(false);
                 return;
             }
         }

         try {
            if (specimenId) {
                await updateSpecimen(specimenId, dataToSend);
            } else {
                await createSpecimen(dataToSend);
            }
            toggleSpecimenEditModal();
            await fetchData(false);
         } catch (err) {
            setModalError(getFriendlyErrorMessage(err));
         } finally {
            setIsSavingSpecimen(false);
         }
     }, [isSpecimenMoveMode, selectedSpecimen, toggleSpecimenEditModal, fetchData, getFriendlyErrorMessage, clearModalError, updateSpecimen, createSpecimen]);

      const getCategoryNameById = useCallback((id) => {
          const cat = categories.find(c=>(c.id||c._id)?.toString()===id?.toString());
          return cat?.name || 'N/A';
      }, [categories]);
      const getSedeNameById = useCallback((id) => {
          const sede = sedes.find(s=>(s.id||s._id)?.toString()===id?.toString());
          return sede?.NombreSede || 'Sin Sede';
      }, [sedes]);
      const getClientNameById = useCallback((id) => {
          const cli = clients.find(c=>(c.id||c._id)?.toString()===id?.toString());
          return cli?.nombre || 'Sin Propietario';
      }, [clients]);
      const getFullClientDataById = useCallback((id) => {
          return clients.find(c=>(c.id||c._id)?.toString()===id?.toString()) || null;
      }, [clients]);

    return (
        <Container fluid className="mt-4 mb-4 specimens-page">
             <Row className="mb-3 align-items-center">
                <Col xs="12" md="auto" className="mb-2 mb-md-0">
                   {/* <h2 className='mb-0'>Categorías y Ejemplares</h2> */}
                </Col>
                <Col xs="12" md>
                    <div className="d-flex flex-column flex-sm-row justify-content-md-end align-items-stretch gap-2">
                       <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
                           <InputGroupText>
                               <FontAwesomeIcon icon={faSearch} />
                           </InputGroupText>
                           <Input
                               type="text"
                               placeholder="Buscar por nombre, ID, propietario..."
                               value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                               disabled={isLoading}
                               className="form-control"
                               aria-label="Buscar ejemplar"
                           />
                       </InputGroup>
                       <Button color="info" size="sm" onClick={handleAddNewCategory} disabled={isLoading || isProcessing} className="flex-shrink-0">
                           <FontAwesomeIcon icon={faPlus} className="me-1" /> Crear Categoria
                       </Button>
                       <Button color="success" size="sm" onClick={handleAddNewSpecimen} disabled={isLoading || isProcessing} className="flex-shrink-0">
                           <FontAwesomeIcon icon={faPlus} className="me-1" /> Crear Ejemplar
                       </Button>
                    </div>
                </Col>
            </Row>

            {(isLoading || isProcessing) && <div className="text-center p-5"><Spinner color="primary">{isProcessing ? 'Procesando...' : 'Cargando...'}</Spinner></div>}

            {error && (
                 <Row className="justify-content-center">
                    <Col xs="12" md="10" lg="8">
                        <Alert color="danger" className='mt-3' isOpen={!!error} toggle={clearPageError} fade={true} timeout={ALERT_FADE_TIMEOUT}>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {!isLoading && !error && (
                <>
                    {searchTerm ? (
                        <Row className="mt-3">
                            <Col xs="12">
                                <h4>Resultados para "{searchTerm}"</h4>
                                {filteredSpecimens.length > 0 ? (
                                    <Card>
                                        <StrapCardBody className="p-0">
                                            <SpecimenTable
                                                specimens={filteredSpecimens}
                                                onEdit={handleEditSpecimen}
                                                onDelete={handleDeleteSpecimen}
                                                onMove={handleMoveSpecimen}
                                                onView={handleViewSpecimen}
                                                getSedeNameById={getSedeNameById}
                                                getClientNameById={getClientNameById}
                                            />
                                        </StrapCardBody>
                                    </Card>
                                ) : (
                                    <Alert
                                        color="info"
                                        className="text-center mt-3"
                                        fade={true}
                                        timeout={ALERT_FADE_TIMEOUT}
                                    >
                                        No se encontraron ejemplares que coincidan con la búsqueda.
                                    </Alert>
                                )}
                            </Col>
                        </Row>
                    ) : (
                        <Row className="g-3 category-cards-container">
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
                                                getSedeNameById={getSedeNameById}
                                                getClientNameById={getClientNameById}
                                            />
                                        </Col>
                                     );
                                })
                            ) : (
                                <Col xs="12">
                                    <Alert color="secondary" className='text-center'>
                                        No hay categorías registradas. Use el botón "Crear Categoria" para empezar.
                                    </Alert>
                                </Col>
                            )}
                             {specimensByCategory['sin_categoria']?.length > 0 && !searchTerm && (
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

            {categoryModalOpen && (
                <Modal isOpen={categoryModalOpen} toggle={toggleCategoryModal} centered backdrop="static">
                    <ModalHeader toggle={toggleCategoryModal}>{selectedCategory ? `Editar Categoría: ${selectedCategory.name}` : 'Nueva Categoría'}</ModalHeader>
                    <ModalBody>
                        <CategoryForm
                            initialData={selectedCategory}
                            onSubmit={handleSaveCategory}
                            onCancel={toggleCategoryModal}
                            apiError={modalError}
                            isSaving={isSavingCategory}
                            key={`cat-form-${selectedCategory?.id || 'new'}`}
                        />
                    </ModalBody>
                </Modal>
            )}

            {specimenEditModalOpen && (
                <Modal isOpen={specimenEditModalOpen} toggle={toggleSpecimenEditModal} size="lg" backdrop="static" centered>
                    <ModalHeader toggle={toggleSpecimenEditModal}>
                        {isSpecimenMoveMode ? `Mover Ejemplar: ${selectedSpecimen?.name||''}` : (selectedSpecimen ? `Editar Ejemplar: ${selectedSpecimen?.name||''}` : 'Nuevo Ejemplar')}
                    </ModalHeader>
                    <ModalBody>
                        <SpecimenForm
                            initialData={selectedSpecimen}
                            categories={categories}
                            sedes={sedes}
                            clients={clients}
                            onSubmit={handleSaveSpecimen}
                            onCancel={toggleSpecimenEditModal}
                            apiError={modalError}
                            isSaving={isSavingSpecimen}
                            isMoveMode={isSpecimenMoveMode}
                            key={`spec-form-${selectedSpecimen?.id||'new'}-${isSpecimenMoveMode}`}
                        />
                    </ModalBody>
                </Modal>
             )}

            {specimenViewModalOpen && specimenToView && (
                 <ViewSpecimenModal
                    isOpen={specimenViewModalOpen}
                    toggle={() => toggleSpecimenViewModal(null)}
                    specimen={specimenToView}
                    categoryName={getCategoryNameById(specimenToView.specimenCategoryId)}
                    sedeName={getSedeNameById(specimenToView.sedeId)}
                    clientData={specimenToView.propietario || getFullClientDataById(specimenToView.clientId)}
                 />
             )}
        </Container>
    );
};

export default SpecimensPage;