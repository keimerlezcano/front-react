import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container, Row, Col, Button, Input, Spinner, Alert,
    Modal, ModalHeader, ModalBody
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

import { createSede, updateSede, deleteSede, getAllSedes } from '../api/sedeApi';
import { getSpecimens } from '../api/specimenApi';

import SedeForm from '../components/Sedes/SedeForm';
import SedeSpecimensTable from '../components/Sedes/SedeSpecimensTable';

const SedesPage = () => {
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [specimens, setSpecimens] = useState([]);
    const [selectedSede, setSelectedSede] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const fetchSedes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllSedes();
            setSedes(data);
        } catch (err) {
            setError('Error al cargar sedes.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSpecimens = useCallback(async () => {
        setError(null);
        try {
            const specimensData = await getSpecimens();
            setSpecimens(specimensData);
        } catch (err) {
            setError('Error al cargar ejemplares.');
        }
    }, []);

    useEffect(() => {
        fetchSedes();
        fetchSpecimens();
    }, [fetchSedes, fetchSpecimens]);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        if (modalOpen) setSelectedSede(null);
    };

    const handleEditSede = (sede) => {
        setSelectedSede(sede);
        setModalOpen(true);
    };

    const handleDeleteSede = async (id) => {
        if (!window.confirm('¿Eliminar esta sede? Esta acción no se puede deshacer.')) return;
        try {
            await deleteSede(id);
            fetchSedes();
        } catch (err) {
            setError('Error al eliminar la sede.');
        }
    };

    const handleSaveSede = async (sedeData, id) => {
        try {
            if (id) {
                await updateSede(id, sedeData);
            } else {
                await createSede(sedeData);
            }
            toggleModal();
            fetchSedes();
        } catch (err) {
            setError('Error al guardar la sede.');
        }
    };

    const filteredSpecimens = useMemo(() => {
        if (!searchTerm) return specimens;
        const lowerSearch = searchTerm.toLowerCase();
        return specimens.filter(spec =>
            spec.name?.toLowerCase().includes(lowerSearch) ||
            spec.identifier?.toLowerCase().includes(lowerSearch)
        );
    }, [specimens, searchTerm]);

    return (
        <Container fluid className="mt-4 mb-4 sedes-page">
            <Row className="mb-3 align-items-center">
                <Col xs="12" md="6">
                    <h2>Sedes y Ejemplares</h2>
                </Col>
                <Col xs="12" md="6" className="d-flex justify-content-end align-items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Buscar ejemplares..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                    <Button color="success" onClick={toggleModal} disabled={loading}>
                        <FontAwesomeIcon icon={faPlus} /> Nueva Sede
                    </Button>
                </Col>
            </Row>

            {(error) && <Alert color="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center p-5">
                    <Spinner color="primary" />
                </div>
            ) : (
                <>
                    <Row xs="1" md="2" lg="3" className="g-4">
                        {sedes.length === 0 ? (
                            <Col>
                                <Alert color="info">No hay sedes registradas.</Alert>
                            </Col>
                        ) : (
                            sedes.map(sede => {
                                const specimensInSede = filteredSpecimens.filter(spec => spec.sedeId === sede.id);
                                return (
                                    <Col key={sede.id}>
                                        <div className="card h-100">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">{sede.NombreSede}</h5>
                                                <div>
                                                    <Button size="sm" color="primary" onClick={() => handleEditSede(sede)} className="me-2">Editar</Button>
                                                    <Button size="sm" color="danger" onClick={() => handleDeleteSede(sede.id)}>Eliminar</Button>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Cantidad de ejemplares:</strong> {specimensInSede.length}</p>
                                                <SedeSpecimensTable specimens={specimensInSede} />
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })
                        )}
                    </Row>
                </>
            )}

            <Modal isOpen={modalOpen} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal}>{selectedSede ? 'Editar Sede' : 'Nueva Sede'}</ModalHeader>
                <ModalBody>
                    <SedeForm initialData={selectedSede} onSubmit={handleSaveSede} onCancel={toggleModal} />
                </ModalBody>
            </Modal>
        </Container>
    );
};

export default SedesPage;
