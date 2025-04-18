import React, { useState, useEffect, useMemo } from "react";
import { Form, FormGroup, Label, Input, Button, Table, Alert, Spinner } from "reactstrap";
import { modules, moduleNameMap } from "./rolesConstants"; // Asegúrate que la ruta sea correcta
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";

// Constante para la duración de la animación de las alertas
const ALERT_FADE_TIMEOUT = 150; // en milisegundos

const RolesForm = ({ onSubmit, initialData = null, onCancel, apiError, isSaving }) => {
  const [roleName, setRoleName] = useState("");
  const [rolePermissions, setRolePermissions] = useState([]);
  const [formError, setFormError] = useState(""); // Estado para errores de validación del formulario

  // Memoización segura de los módulos
  const safeModules = useMemo(() => Array.isArray(modules) ? modules : [], []);

  // Memoización para saber si todos los permisos están seleccionados
  const isAllSelected = useMemo(() => {
    // Solo tiene sentido si hay módulos definidos
    return safeModules.length > 0 && safeModules.every(perm => rolePermissions.includes(perm));
  }, [rolePermissions, safeModules]);

  // Efecto para inicializar/resetear el formulario cuando cambian los datos iniciales
  useEffect(() => {
    setFormError(''); // Limpiar error de formulario al cambiar datos
    if (initialData) {
      setRoleName(initialData.name || "");
      // Asegurarse de que permissions sea un array válido
      const initialPermissions = Array.isArray(initialData.permissions) ? initialData.permissions : [];
      setRolePermissions(initialPermissions);
    } else {
      // Resetear para un rol nuevo
      setRoleName("");
      setRolePermissions([]);
    }
    // No limpiar apiError aquí, ya que viene de fuera y podría ser relevante
  }, [initialData]);

  // Manejador para cambios en checkboxes de permisos individuales
  const handlePermissionChange = (permissionName) => {
    setRolePermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((perm) => perm !== permissionName) // Quitar si ya está
        : [...prev, permissionName] // Agregar si no está
    );
    setFormError(""); // Limpiar error de validación si el usuario interactúa
  };

  // Manejador para el checkbox "Seleccionar Todos"
  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    setRolePermissions(isChecked ? [...safeModules] : []); // Asignar todos o ninguno
    setFormError(""); // Limpiar error de validación
  };

  // Función de validación del formulario
  const validateForm = () => {
    if (!roleName.trim()) {
      setFormError("El nombre del rol es obligatorio.");
      return false;
    }
    // Validación mejorada: permite espacios pero no al inicio/final (trim ya lo hace)
    // y asegura que no empiece con número o símbolo (excepto espacios internos)
    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ][A-Za-záéíóúÁÉÍÓÚñÑ0-9\s]*$/.test(roleName.trim())) {
     setFormError("El nombre debe comenzar con una letra y solo puede contener letras, números y espacios.");
     return false;
    }
    if (rolePermissions.length === 0) {
      setFormError("Debe seleccionar al menos un permiso.");
      return false;
    }
    setFormError(""); // Limpiar error si pasa todas las validaciones
    return true;
  };

  // Manejador del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevenir recarga de página
    // Validar antes de enviar y asegurarse de no estar ya guardando
    if (!validateForm() || isSaving) return;
    // Llamar a la función onSubmit pasada por props con los datos limpios
    onSubmit({ name: roleName.trim(), permissions: rolePermissions });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Alerta para errores de API */}
      {apiError && (
        <Alert
          color="danger"
          // ----> CORRECCIÓN AQUÍ <----
          fade={true}
          timeout={ALERT_FADE_TIMEOUT}
        >
          {apiError}
        </Alert>
      )}
      {/* Alerta para errores de validación del formulario */}
      {formError && (
        <Alert
          color="warning"
          // ----> CORRECCIÓN AQUÍ <----
          fade={true}
          timeout={ALERT_FADE_TIMEOUT}
        >
          {formError}
        </Alert>
      )}

      {/* Campo Nombre del Rol */}
      <FormGroup>
        <Label for="roleName" className="fw-bold">
          Nombre del Rol <span className="text-danger">*</span>
        </Label>
        <Input
          id="roleName"
          name="roleName" // Añadir name para buenas prácticas (aunque no se use directamente aquí)
          type="text"
          value={roleName}
          onChange={(e) => {
            setRoleName(e.target.value);
            // Limpiar error de nombre si el usuario empieza a escribir
            if (formError.includes("nombre")) {
                setFormError("");
            }
          }}
          required // HTML5 validation
          disabled={isSaving}
          invalid={!!formError.includes("nombre")} // Marcar como inválido si el error es sobre el nombre
          bsSize="sm"
          placeholder="Ej: Administrador de Ventas"
        />
         {/* Opcional: Mostrar mensaje de error directamente bajo el input si es inválido */}
         {/* {formError.includes("nombre") && <FormFeedback>{formError}</FormFeedback>} */}
      </FormGroup>

      <hr className="my-3" />

      {/* Sección de Permisos */}
      <FormGroup>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Label className="fw-bold mb-0">
             Permisos <span className="text-danger">*</span>
          </Label>
          {/* Checkbox "Seleccionar Todos" (solo si hay módulos) */}
          {safeModules.length > 0 && (
            <FormGroup check inline className="ms-auto mb-0">
              <Input
                type="checkbox"
                id="select-all-permissions"
                checked={isAllSelected}
                onChange={handleSelectAllChange}
                disabled={isSaving} // Deshabilitado si está guardando
              />
              <Label check for="select-all-permissions" className="ms-1 fst-italic">Seleccionar Todos</Label>
            </FormGroup>
          )}
        </div>

        {/* Contenedor scrollable para la tabla de permisos */}
        <div className={`border rounded p-2 mt-1 ${formError.includes("permiso") ? 'border-danger' : ''}`}
             style={{ maxHeight: '350px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          <Table borderless hover size="sm" className="mb-0 align-middle">
            <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
              <tr>
                <th>Módulo</th>
                <th className="text-center" style={{ width: '100px' }}>Acceso</th>
              </tr>
            </thead>
            <tbody>
              {safeModules.length > 0 ? (
                safeModules.map((permissionName) => (
                  <tr key={permissionName}>
                    {/* Nombre legible del módulo o el nombre técnico si no hay mapa */}
                    <td>{moduleNameMap[permissionName] || permissionName}</td>
                    {/* Checkbox para el permiso */}
                    <td className="text-center">
                      {/* Envolver en FormGroup/Label permite clickear el área */}
                      <FormGroup check className="d-inline-block m-0 p-0">
                        <Label check className="d-flex justify-content-center align-items-center">
                          <Input
                            type="checkbox"
                            className="form-check-input position-static m-0"
                            style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                            checked={rolePermissions.includes(permissionName)}
                            onChange={() => handlePermissionChange(permissionName)}
                            disabled={isSaving} // Deshabilitado si está guardando
                          />
                        </Label>
                      </FormGroup>
                    </td>
                  </tr>
                ))
              ) : (
                // Mensaje si no hay módulos definidos
                <tr>
                  <td colSpan="2" className="text-center text-muted fst-italic py-3">
                    No hay módulos de permisos definidos en la configuración.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
         {/* Opcional: Mostrar mensaje de error bajo la tabla si es sobre permisos */}
         {formError.includes("permiso") && <div className="text-danger small mt-1">{formError}</div>}
      </FormGroup>

      {/* Botones de Acción */}
      <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
        <Button color="secondary" outline onClick={onCancel} type="button" disabled={isSaving}>
          <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar
        </Button>
        <Button color="primary" type="submit" disabled={isSaving || !roleName || rolePermissions.length === 0}>
          {isSaving ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <FontAwesomeIcon icon={faSave} className="me-1" />
          )}
          {initialData ? 'Actualizar Rol' : 'Guardar Rol'}
        </Button>
      </div>
    </Form>
  );
};

export default RolesForm;