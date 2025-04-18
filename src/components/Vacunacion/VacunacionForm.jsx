// src/components/VacunacionForm.jsx
import React from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";

const VacunacionForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  editing,
  resetForm,
  specimens = [], // Recibe la lista de especímenes
  loadingSpecimens = false // Opcional: estado de carga
}) => {
  return (
    <div className="border p-3 mb-4 rounded">
      <h5>{editing ? "Editar Registro de Vacunación" : "Nuevo Registro de Vacunación"}</h5>
      <Form onSubmit={handleSubmit}>
        {/* Campo Nombre Vacuna */}
        <FormGroup>
          <Label for="nombreVacuna">Nombre Vacuna*</Label>
          <Input
            id="nombreVacuna"
            type="text"
            name="nombreVacuna"
            placeholder="Ej: Rabia, Parvovirus"
            value={formData.nombreVacuna || ''}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        {/* Campo Selector de Specimen */}
        <FormGroup>
          <Label for="specimenId">Espécimen*</Label>
          <Input
            id="specimenId"
            type="select"
            name="specimenId"
            value={formData.specimenId || ''}
            onChange={handleInputChange}
            required
            disabled={editing || loadingSpecimens} // Deshabilitado al editar o si cargan especímenes
          >
            <option value="" disabled>-- Selecciona un Espécimen --</option>
             {loadingSpecimens ? (
                <option value="" disabled>Cargando especímenes...</option>
            ) : specimens.length > 0 ? (
              specimens.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name} (ID: {spec.id})
                </option>
              ))
            ) : (
              <option value="" disabled>No hay especímenes disponibles</option>
            )}
          </Input>
          {editing && <small className="text-muted"> No se puede cambiar el espécimen al editar.</small>}
        </FormGroup>

        {/* Campo Fecha Administración */}
        <FormGroup>
          <Label for="fechaAdministracion">Fecha Administración*</Label>
          <Input
            id="fechaAdministracion"
            type="date" // Input tipo 'date'
            name="fechaAdministracion"
            value={formData.fechaAdministracion || ''} // El formato debe ser YYYY-MM-DD
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        {/* Botones */}
        <div className="d-flex justify-content-end">
          <Button
            color="secondary"
            type="button"
            onClick={resetForm}
            className="me-2"
          >
            Cancelar
          </Button>
          <Button color={editing ? "warning" : "success"} type="submit">
            {editing ? "Actualizar Registro" : "Guardar Registro"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default VacunacionForm;