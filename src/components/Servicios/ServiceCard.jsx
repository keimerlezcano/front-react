// src/components/ServiceCard.jsx
import React, { useState } from 'react';
import {
  Card, CardImg, CardBody, CardTitle, CardText, Button, ButtonGroup
} from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import './ServiceCard.css'; // Asegúrate de importar el CSS

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ServiceCard = ({ service, onDelete, onEdit }) => {
  // No necesitamos estado local 'isHovered' si el efecto lo maneja CSS
  // const [isHovered, setIsHovered] = useState(false);

  let imageUrl = 'https://via.placeholder.com/500x350.png?text=Sin+Imagen';
  if (service.imagen) {
     const imagePath = service.imagen.startsWith('/') ? service.imagen.substring(1) : service.imagen;
     imageUrl = `${BACKEND_BASE_URL}/${imagePath}`;
  }

  const serviceId = service.id || service._id;

  return (
    // Añadida clase 'service-card' para estilos hover globales
    // h-100 para igualar altura en filas flex/grid
    <Card className="m-2 shadow-sm service-card h-100" style={{ width: '22rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Contenedor de Imagen Proporcional (ej. 4:3) */}
      <div className="service-card-img-container" style={{ paddingTop: '75%' }}>
         <CardImg
             top
             src={imageUrl}
             alt={`Imagen de ${service.nombre || 'servicio'}`}
             className="service-card-img" // Clase para estilos de imagen
             // Estilo objectFit 'contain' añadido directamente aquí
             style={{ objectFit: 'contain' }}
             onError={(e) => {
                 if (!e.target.src.includes('placeholder.com')) {
                     e.target.src = 'https://via.placeholder.com/500x350.png?text=Error';
                 }
             }}
         />
         {/* Overlay opcional (se puede activar con CSS en hover) */}
         <div className="service-card-img-overlay"></div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <CardBody className="d-flex flex-column flex-grow-1 p-3">
        <CardTitle tag="h5" className="mb-2 service-card-title">{service.nombre || 'Servicio sin nombre'}</CardTitle>

        {/* Descripción con scroll */}
        <div className="service-card-description mb-3">
           <CardText tag="div">
              {service.descripcion || 'Sin descripción.'}
           </CardText>
        </div>

        {/* Acciones */}
        <div className="d-flex justify-content-end mt-auto pt-2 border-top">
          <ButtonGroup size="sm">
             <Button color="dark"  onClick={() => onEdit(service)} title="Editar">
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button color="danger"  onClick={() => onDelete(serviceId)} title="Eliminar" className="ms-1">
                <FontAwesomeIcon icon={faTrash} />
              </Button>
          </ButtonGroup>
        </div>
      </CardBody>
    </Card>
  );
};

export default ServiceCard;