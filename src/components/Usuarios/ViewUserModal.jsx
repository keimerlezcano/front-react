// src/components/Usuarios/ViewUserModal.jsx
import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Badge // Para mostrar el rol de forma destacada
} from 'reactstrap';

const ViewUserModal = ({ isOpen, toggle, user }) => {

  // Si no hay usuario, no renderiza nada o muestra un estado vacío
  if (!user) {
    return null; // O un modal indicando que no hay datos
  }

  // Formatear la fecha de creación/actualización si existen
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(); // Formato local con hora
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        Detalles del Usuario: {user.username || 'N/A'}
      </ModalHeader>
      <ModalBody>
        {/* Usaremos Rows y Cols para organizar la información */}
        <Row className="mb-3">
          <Col md="4"><strong>ID:</strong></Col>
          <Col md="8">{user.id || user._id || 'N/A'}</Col>
        </Row>
        <Row className="mb-3">
          <Col md="4"><strong>Nombre Completo:</strong></Col>
          <Col md="8">{user.nombreCompleto || 'N/A'}</Col>
        </Row>
        <Row className="mb-3">
          <Col md="4"><strong>Documento (Cédula):</strong></Col>
          <Col md="8">{user.documento || 'N/A'}</Col>
        </Row>
        <Row className="mb-3">
          <Col md="4"><strong>Correo Electrónico:</strong></Col>
          <Col md="8">{user.email || 'N/A'}</Col>
        </Row>
        <Row className="mb-3">
          <Col md="4"><strong>Celular:</strong></Col>
          <Col md="8">{user.celular || 'N/A'}</Col>
        </Row>
        <Row className="mb-3">
          <Col md="4"><strong>Nombre de Usuario:</strong></Col>
          <Col md="8">{user.username || 'N/A'}</Col>
        </Row>
        <Row className="mb-3">
          <Col md="4"><strong>Rol:</strong></Col>
          <Col md="8">
            {user.role ? (
              // Mostrar el nombre del rol como un Badge
              <Badge color="info" pill>
                {user.role.name} 
              </Badge>
            ) : (
              'N/A'
            )}
          </Col>
        </Row>
        <hr /> {/* Separador visual */}
        <Row className="mb-2">
          <Col md="4"><strong>Fecha de Creación:</strong></Col>
          <Col md="8">{formatDate(user.createdAt)}</Col>
        </Row>
        <Row>
          <Col md="4"><strong>Última Actualización:</strong></Col>
          <Col md="8">{formatDate(user.updatedAt)}</Col>
        </Row>

      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewUserModal;