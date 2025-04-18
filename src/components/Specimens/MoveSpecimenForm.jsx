import React, { useState, useEffect } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import { moveSpecimen } from "../../api/specimenApi";
import { getCategories } from "../../api/categoryApi";
import { getVenues } from "../../api/venuesApi";

const MoveSpecimenForm = ({ specimenId, onMoveSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");

  useEffect(() => {
    // Cargar categorías y sedes disponibles
    getCategories().then(setCategories);
    getVenues().then(setVenues);
  }, []);

  const handleMove = async () => {
    if (!selectedCategory && !selectedVenue) {
      alert("Debe seleccionar al menos una opción para mover el ejemplar.");
      return;
    }

    const moveData = {};
    if (selectedCategory) moveData.categoryId = selectedCategory;
    if (selectedVenue) moveData.venueId = selectedVenue;

    const response = await moveSpecimen(specimenId, moveData);
    if (response) {
      alert("Ejemplar movido exitosamente.");
      onMoveSuccess();
    } else {
      alert("Error al mover el ejemplar.");
    }
  };

  return (
    <Form>
      <FormGroup>
        <Label for="categorySelect">Seleccionar Categoría</Label>
        <Input
          type="select"
          id="categorySelect"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Input>
      </FormGroup>

      <FormGroup>
        <Label for="venueSelect">Seleccionar Sede</Label>
        <Input
          type="select"
          id="venueSelect"
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
        >
          <option value="">Selecciona una sede</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </Input>
      </FormGroup>

      <Button color="primary" onClick={handleMove}>
        Mover Ejemplar
      </Button>
    </Form>
  );
};

export default MoveSpecimenForm;
