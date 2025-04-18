// src/components/MedicineForm.jsx
import React from "react";
import { FormGroup, Label, Input, Row, Col } from "reactstrap"; // Asegúrate de importar FormGroup y Label

const MedicineForm = ({
  formData,
  handleInputChange,
  // No necesita handleSubmit ni resetForm aquí
  editing,
  specimens = [],
  loadingSpecimens = false
}) => {

  // Formatear hora para input type="time" (HH:MM)
  // Asegurarse de que formData.horaAdministracion exista y sea un string
  const horaParaInput = formData.horaAdministracion ? String(formData.horaAdministracion).substring(0, 5) : '';

  return (
      // Usamos Rows y Cols para organizar en dos columnas
      <Row>
        {/* --- Columna Izquierda --- */}
        <Col md={6}>
          {/* Nombre Medicina */}
          <FormGroup>
            {/* *** ETIQUETA PARA Nombre *** */}
            <Label for="nombre">Nombre Medicina*</Label>
            <Input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Ej: Analgésico X"
              value={formData.nombre || ''}
              onChange={handleInputChange}
              required
              autoComplete="off"
            />
          </FormGroup>

          {/* Dosis */}
          <FormGroup>
             {/* *** ETIQUETA PARA Dosis *** */}
            <Label for="dosis">Dosis*</Label>
            <Input
              id="dosis"
              type="text"
              name="dosis"
              placeholder="Ej: 10mg, 5ml"
              value={formData.dosis || ''}
              onChange={handleInputChange}
              required
              autoComplete="off"
            />
          </FormGroup>

          {/* Hora Administración */}
          <FormGroup>
             {/* *** ETIQUETA PARA Hora Administración *** */}
            <Label for="horaAdministracion">Hora Administración*</Label>
            <Input
              id="horaAdministracion"
              type="time"
              name="horaAdministracion"
              value={horaParaInput} // Usa el valor formateado
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </Col>

        {/* --- Columna Derecha --- */}
        <Col md={6}>
           {/* Selector de Specimen */}
          <FormGroup>
             {/* *** ETIQUETA PARA Espécimen *** */}
            <Label for="specimenId">Espécimen*</Label>
            <Input
              id="specimenId"
              type="select"
              name="specimenId"
              value={formData.specimenId || ''}
              onChange={handleInputChange}
              required
              disabled={editing || loadingSpecimens}
            >
              <option value="" disabled>-- Selecciona Espécimen --</option>
              {loadingSpecimens ? (
                  <option value="" disabled>Cargando...</option>
              ) : specimens.length > 0 ? (
                specimens.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name} (ID: {spec.id})
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay especímenes</option>
              )}
            </Input>
            {/* Mensaje si está en modo edición */}
            {editing && <small className="text-muted d-block mt-1">No se puede cambiar el espécimen al editar.</small>}
          </FormGroup>

          {/* Cantidad */}
          <FormGroup>
             {/* *** ETIQUETA PARA Cantidad *** */}
            <Label for="cantidad">Cantidad*</Label>
            <Input
              id="cantidad"
              type="number"
              name="cantidad"
              placeholder="Unidades/Dosis"
              value={formData.cantidad ?? ''}
              onChange={handleInputChange}
              required
              min="0" // Permitir 0? Ajustar si es necesario
              step="1"
            />
          </FormGroup>

          {/* Estado */}
          <FormGroup>
             {/* *** ETIQUETA PARA Estado *** */}
             <Label for="estado">Estado</Label>
             <Input
               id="estado"
               type="select"
               name="estado"
               value={formData.estado || 'Programado'} // Valor por defecto
               onChange={handleInputChange}
             >
               <option value="Programado">Programado</option>
               <option value="Administrado">Administrado</option>
               <option value="Cancelado">Cancelado</option>
               {/* Añadir más estados si es necesario */}
             </Input>
          </FormGroup>

        </Col>
      </Row>
  );
};

export default MedicineForm;