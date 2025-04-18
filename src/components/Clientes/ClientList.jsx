// src/components/ClientList.jsx
import React from 'react';
// Importa los componentes necesarios de reactstrap y fontawesome
import { Table, Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

// Asegúrate de recibir onView como prop, aunque solo haga un console.log por ahora
const ClientList = ({ clients, onEdit, onDelete, onView }) => {

  // Si no hay clientes, no renderiza nada (la página mostrará el mensaje)
  if (!clients || clients.length === 0) {
    return null;
  }

  return (
    // Usa las mismas clases y el componente Table de reactstrap
    <Table className="table table-bordered table-hover" responsive striped> {/* Añadí striped para alternar filas */}
      {/* Cabecera oscura como en RolesTable */}
      <thead className="table-dark">
        <tr>
          {/* Puedes añadir un ID si lo tienes y lo quieres mostrar */}
          {/* <th>ID</th> */}
          <th>Nombre</th>
          <th>Documento</th>
          <th>Correo</th>
          <th>Celular</th>
          <th>Ejemplares</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          // Usa client.id como key (o client.id || client._id si tus IDs pueden variar)
          <tr key={client.id}>
            {/* <td>{client.id}</td> */} {/* Si añades la columna ID */}
            <td>{client.nombre}</td>
            <td>{client.documento}</td>
            <td>{client.correo}</td>
            {/* Muestra 'N/A' o '-' si el celular es opcional y no está presente */}
            <td>{client.celular || '-'}</td>
            <td>{client.ejemplares}</td>
            <td>
              {/* Usa ButtonGroup y Button de reactstrap con iconos */}
              <ButtonGroup size="sm"> {/* Botones pequeños */}
                <Button
                  color="dark" // Color Editar
                  onClick={() => onEdit(client)}
                  title="Editar Cliente"
                  className="me-1" // Margen derecho pequeño
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button
                  color="danger" // Color Eliminar
                  // Asegúrate de pasar el ID correcto
                  onClick={() => onDelete(client.id)}
                  title="Eliminar Cliente"
                  className="me-1"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ClientList;