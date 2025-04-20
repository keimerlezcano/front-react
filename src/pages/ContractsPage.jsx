import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Button,
  Spinner,
  Alert,
  Input,
  InputGroup
} from 'reactstrap';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

import ContractTable from '../components/Contratos/ContractTable';
import ContractForm from '../components/Contratos/ContractForm';
import ViewContractModal from '../components/Contratos/ViewContractModal';

import {
  getAllContracts,
  createContract,
  updateContract,
  deleteContract
} from '../api/contractApi';

const ContractsPage = () => {
    const [contratos, setContratos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [modalApiError, setModalApiError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredContracts, setFilteredContracts] = useState([]);

    const fetchContracts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllContracts();
            setContratos(data);
        } catch (err) {
            setError('Error al cargar contratos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

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

    const handleOpenNewModal = () => { setSelectedContract(null); setModalApiError(null); setIsFormModalOpen(true); };
    const handleOpenEditModal = (contract) => { setSelectedContract(contract); setModalApiError(null); setIsFormModalOpen(true); };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setSelectedContract(null); setModalApiError(null); setIsSaving(false); };
    const handleOpenViewModal = (contract) => { setSelectedContract(contract); setIsViewModalOpen(true); };
    const handleCloseViewModal = () => { setIsViewModalOpen(false); setSelectedContract(null); };

    const handleSaveContract = async (formData, contractId) => {
        setIsSaving(true); setModalApiError(null);
        try {
            if (contractId) {
                await updateContract(contractId, formData);
            } else {
                await createContract(formData);
            }
            handleCloseFormModal();
            fetchContracts();
        } catch (err) {
            console.error("Error guardando contrato:", err);
            setModalApiError(err?.message || "Ocurrió un error al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteContract = async (id) => {
        if (!id) return;
        const contractToDelete = contratos.find(c => (c.id || c._id) === id);
        const clientName = contractToDelete?.client?.nombre || 'Cliente Desconocido';
        const confirmMessage = `¿Está seguro de que desea eliminar el contrato para "${clientName}" (ID: ${id})?`;
        if (window.confirm(confirmMessage)) {
            try {
                await deleteContract(id);
                fetchContracts();
            } catch (err) {
                console.error("Error eliminando contrato:", err);
            }
        }
    };

    return (
        <Container fluid className="mt-4 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3 flex-wrap">
                 <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-md-end align-items-stretch">
                    <InputGroup size="sm" style={{ minWidth: '220px', maxWidth: '400px' }}>
                         <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                         <Input
                            type="text"
                            placeholder="Buscar por ID o Cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bsSize="sm"
                            aria-label="Buscar contratos"
                         />
                    </InputGroup>
                    <Button color="success" size="sm" onClick={handleOpenNewModal} disabled={isLoading} className="flex-shrink-0">
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Contrato
                    </Button>
                 </div>
            </div>

            {isLoading && contratos.length === 0 && (
                 <div className="text-center py-5">
                    <Spinner color="primary" style={{ width: '3rem', height: '3rem' }}>Cargando...</Spinner>
                    <p className="text-muted mt-2">Cargando contratos...</p>
                 </div>
            )}

            {error && (
                <Alert color="danger" fade={false} className="mt-3">
                    <strong>Error al cargar datos:</strong> {error}
                </Alert>
            )}

            {!isLoading && !error && (
                <>
                    {filteredContracts.length > 0 ? (
                        <ContractTable
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
                </>
            )}

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
