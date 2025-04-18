import React from "react";
import { Button, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const VenueForm = ({ nombreVenue, setNombreVenue, handleSubmit, venueId }) => {
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h4>{venueId ? "Editar Venue" : "Agregar Venue"}</h4>
      <div className="d-flex gap-2">
        <Input
          type="text"
          placeholder="Nombre del venue"
          value={nombreVenue}
          onChange={(e) => setNombreVenue(e.target.value)}
        />
        <Button color="primary" type="submit">
          <FontAwesomeIcon icon={faPlus} /> {venueId ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
};

export default VenueForm;
