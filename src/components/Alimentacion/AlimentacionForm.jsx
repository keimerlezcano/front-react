// src/components/AlimentacionForm.jsx
import React from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";

const AlimentacionForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  editing,
  resetForm,
  specimens = [], // Recibe la lista de especímenes
  loadingSpecimens = false // Opcional: para deshabilitar select mientras carga
}) => {
  return (
    <div className="border p-3 mb-4 rounded">
      <h5>{editing ? "Editar Registro de Alimentación" : "Nuevo Registro de Alimentación"}</h5>
      <Form onSubmit={handleSubmit}>
        {/* Campo Nombre Alimento */}
        <FormGroup>
          <Label for="nombreAlimento">Nombre Alimento*</Label>
          <Input
            id="nombreAlimento"
            type="text"
            name="nombreAlimento"
            placeholder="Ej: Pienso A, Heno B"
            value={formData.nombreAlimento || ''}
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
            disabled={editing || loadingSpecimens} // Deshabilitado al editar o si están cargando especímenes
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

        {/* Campo Cantidad */}
        <FormGroup>
          <Label for="cantidad">Cantidad*</Label>
          <Input
            id="cantidad"
            type="number" // Input tipo 'number'
            name="cantidad"
            placeholder="Cantidad (ej: 500)"
            value={formData.cantidad ?? ''} // Usa ?? para mostrar vacío si es null/undefined
            onChange={handleInputChange}
            required
            min="1" // O el mínimo apropiado
          />
           {/* Podrías añadir un InputGroupText para la unidad (ej: 'gr', 'kg') si es relevante */}
           {/* <InputGroupText>gr</InputGroupText> */}
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

export default AlimentacionForm;