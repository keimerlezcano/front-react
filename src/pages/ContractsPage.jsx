// src/pages/ContractsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Button,
  Spinner,
  Alert,
  Input,
  InputGroup // <--- OK
} from 'reactstrap';
import { useContracts } from '../context/ContractContext';
// *** Asegúrate que las rutas de importación sean correctas ***
import ContractTable from '../components/Contratos/ContractTable'; // <-- ESTE COMPONENTE DEBE SER MODIFICADO INTERNAMENTE
import ContractForm from '../components/Contratos/ContractForm';
import ViewContractModal from '../components/Contratos/ViewContractModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons"; // <--- OK

const ContractsPage = () => {
    // --- Contexto (Sin Cambios) ---
    const {
        contratos, isLoading, error, agregarNuevoContrato,
        actualizarContratoContext, eliminarContratoContext
    } = useContracts();

    // --- Estados Locales (Sin Cambios) ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [modalApiError, setModalApiError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredContracts, setFilteredContracts] = useState([]);

    // --- Efecto para Filtrar Contratos (Sin Cambios) ---
    useEffect(() => {
        const originalContracts = Array.isArray(contratos) ? contratos : [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowerCaseSearchTerm) {
            setFilteredContracts(originalContracts);
        } else {
            const filtered = originalContracts.filter(contract => {
                if (!contract) return false;
                return (
                    (contract.id || contract._id || '').toString().toLowerCase().includes(lowerCaseSearchTerm) ||
                    (contract.client?.nombre?.toLowerCase() || '').includes(lowerCaseSearchTerm)
                );
            });
            setFilteredContracts(filtered);
        }
    }, [searchTerm, contratos]);

    // --- Handlers para Modales (Sin Cambios) ---
    const handleOpenNewModal = () => { setSelectedContract(null); setModalApiError(null); setIsFormModalOpen(true); };
    const handleOpenEditModal = (contract) => { setSelectedContract(contract); setModalApiError(null); setIsFormModalOpen(true); };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setSelectedContract(null); setModalApiError(null); setIsSaving(false); };
    const handleOpenViewModal = (contract) => { setSelectedContract(contract); setIsViewModalOpen(true); };
    const handleCloseViewModal = () => { setIsViewModalOpen(false); setSelectedContract(null); };

    // --- Handler para Guardar (Sin Cambios) ---
    const handleSaveContract = async (formData, contractId) => {
        setIsSaving(true); setModalApiError(null);
        try {
            if (contractId) { await actualizarContratoContext(contractId, formData); }
            else { await agregarNuevoContrato(formData); }
            handleCloseFormModal();
        } catch (err) {
            console.error("Error guardando contrato:", err);
            setModalApiError(err?.message || "Ocurrió un error al guardar.");
        } finally { setIsSaving(false); }
    };

     // --- Handler para Eliminar (Sin Cambios) ---
     const handleDeleteContract = async (id) => {
         if (!id) return;
         const contractToDelete = contratos.find(c => (c.id || c._id) === id);
         const clientName = contractToDelete?.client?.nombre || 'Cliente Desconocido';
         const confirmMessage = `¿Está seguro de que desea eliminar el contrato para "${clientName}" (ID: ${id})?`;
         if (window.confirm(confirmMessage)) {
             try { await eliminarContratoContext(id); }
             catch (err) { console.error("Error eliminando contrato:", err); /* Error se muestra */ }
         }
     };

    // --- Renderizado ---
    return (
        <Container fluid className="mt-4 mb-5">

            {/* --- MODIFICADO: Cabecera (Layout estilo RolesPage) --- */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3 flex-wrap">
                 {/* <h2 className="mb-0 flex-shrink-0">Gestión de Contratos</h2> */}
                 <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-md-end align-items-stretch">
                    {/* Grupo de Input para búsqueda */}
                    <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
                         <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                         <Input
                            type="text"
                            placeholder="Buscar por ID o Cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bsSize="sm" // Tamaño pequeño
                            aria-label="Buscar contratos"
                         />
                    </InputGroup>
                    {/* Botón Nuevo */}
                    <Button color="success" size="sm" onClick={handleOpenNewModal} disabled={isLoading} className="flex-shrink-0">
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Contrato
                    </Button>
                 </div>
            </div>
             {/* --- FIN Cabecera Modificada --- */}

            {/* Carga Inicial (Sin Cambios) */}
            {isLoading && contratos.length === 0 && (
                 <div className="text-center py-5">
                    <Spinner color="primary" style={{ width: '3rem', height: '3rem' }}>Cargando...</Spinner>
                    <p className="text-muted mt-2">Cargando contratos...</p>
                 </div>
            )}

            {/* Error General (Sin Cambios) */}
            {error && (
                <Alert color="danger" fade={false} className="mt-3">
                    <strong>Error al cargar datos:</strong> {error}
                </Alert>
            )}

            {/* Contenido Principal: Tabla o Mensaje (Sin Cambios) */}
            {!isLoading && !error && (
                <>
                    {filteredContracts.length > 0 ? (
                        <ContractTable // <-- Este componente debe tener internamente la tabla con estilo RolesPage
                            contracts={filteredContracts}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDeleteContract}
                            onView={handleOpenViewModal}
                        />
                    ) : (
                        <Alert color="info" className="text-center mt-3" fade={false}>
                            {searchTerm
                                ? `No se encontraron contratos que coincidan con "${searchTerm}".`
                                : "Aún no hay contratos registrados."
                            }
                        </Alert>
                    )}
                    {/* Paginación podría ir aquí si es necesaria */}
                </>
            )}

            {/* Modal de Crear/Editar (Sin Cambios) */}
            {isFormModalOpen && (
                <ContractForm
                    isOpen={isFormModalOpen}
                    toggle={handleCloseFormModal}
                    initialData={selectedContract}
                    onSubmit={handleSaveContract}
                    apiError={modalApiError}
                    isSaving={isSaving}
                />
            )}

            {/* Modal de Ver Detalles (Sin Cambios) */}
             {isViewModalOpen && (
                <ViewContractModal
                    isOpen={isViewModalOpen}
                    toggle={handleCloseViewModal}
                    contract={selectedContract}
                />
             )}
        </Container>
    );
};

export default ContractsPage;