import React from "react";
import { Table, Button, ButtonGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEye } from "@fortawesome/free-solid-svg-icons"; // Asegúrate que faEye esté importado

const UserTable = ({ usuarios, onEdit, onDelete, onView }) => { // Añadido onView

  if (!usuarios || usuarios.length === 0) {
    return null;
  }

  return (
    <Table className="table table-bordered table-hover" responsive>
      <thead className="table-dark">
        <tr>
          <th>Nombre Completo</th>
          <th>Documento</th>
          <th>Correo</th>
          <th>Celular</th>
          <th>Usuario (Login)</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((user) => (
          <tr key={user.id || user._id}>
            <td>{user.nombreCompleto || "-"}</td>
            <td>{user.documento || "-"}</td>
            <td>{user.email || "-"}</td>
            <td>{user.celular || "-"}</td>
            <td>{user.username || "-"}</td>
            <td>{user.role?.name || (user.roleId ? `ID: ${user.roleId}` : "N/A")}</td>
            <td>
              <ButtonGroup size="sm">
              {onView && ( 
                  <Button outline color="info" onClick={() => onView(user)} title="Ver" className="me-1">
                    <FontAwesomeIcon icon={faEye} />
                  </Button>
                )}
                <Button color="dark" onClick={() => onEdit(user)} title="Editar" className="me-1">
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button color="danger" onClick={() => onDelete(user.id || user._id)} title="Eliminar" className="me-1">
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

export default UserTable;