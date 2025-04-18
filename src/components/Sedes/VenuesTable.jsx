import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const VenuesTable = ({ venues, handleEditar, handleEliminar }) => {
  return (
    <Table striped responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {venues.map((venue) => (
          <tr key={venue.id}>
            <td>{venue.id}</td>
            <td>{venue.NombreVenue}</td>
            <td>
              <Button color="warning" size="sm" className="me-2" onClick={() => handleEditar(venue)}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button color="danger" size="sm" onClick={() => handleEliminar(venue.id)}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default VenuesTable;
