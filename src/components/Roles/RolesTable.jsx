// src/components/Roles/RolesTable.jsx
import React from "react";
// Usa Table y Button de reactstrap
import { Table, Button, ButtonGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";

const RolesTable = ({ roles, onEdit, onDelete, onView }) => {

  if (!roles || roles.length === 0) {
      return null; // Dejamos que RolesPage muestre "No encontrado"
  }

  return (
    // Usa las clases originales que tenías (ej. table-bordered, table-hover)
    // Mantenemos 'responsive' para scroll horizontal
    <Table className="table table-bordered table-hover" responsive>
      {/* Cabecera original con clase table-dark */}
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Rol</th>
          {/*<th>Permisos</th> // Columna eliminada previamente */}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => (
          <tr key={role.id || role._id}>
            <td>{role.id || role._id}</td>
            <td>{role.name}</td>
            {/*<td>{role.permissions.join(", ")}</td> // Celda eliminada */}
            <td>
              {/* Usamos ButtonGroup para agrupar como en tu ejemplo original */}
              <ButtonGroup size="sm"> {/* Tamaño pequeño para botones */}
                <Button
                  color="dark" // Color original para editar
                  onClick={() => onEdit(role)}
                  title="Editar"
                  className="me-1" // Margen si lo necesitas
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button
                  color="danger" // Color original para eliminar
                  onClick={() => onDelete(role.id || role._id)}
                  title="Eliminar"
                  className="me-1"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
                 <Button
                   outline // Outline como en tu ejemplo
                   color="info"
                   onClick={() => onView(role)}
                   title="Ver"
                   // Estilos en línea si los tenías para el botón de ver
                   style={{ border:'none', padding: '0.25rem 0.5rem' }}
                 >
                   <FontAwesomeIcon icon={faEye} style={{ color: '#4a90e2' }}/>
                 </Button>
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RolesTable;