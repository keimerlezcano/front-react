import React, { useEffect, useState } from "react";
import { Form, FormGroup, Label, Input, Alert } from "reactstrap";
import apiClient from "../../utils/apiClient";

const UserForm = ({ initialData, apiError, isSaving, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    documento: "",
    email: "",
    celular: "",
    username: "",
    password: "",
    roleId: "",
  });
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [errorRoles, setErrorRoles] = useState('');

  const isEditing = !!initialData?.id || !!initialData?._id;

  useEffect(() => {
    const cargarRoles = async () => {
      setLoadingRoles(true);
      setErrorRoles('');
      try {
        const response = await apiClient.get("/roles");
        if (response.data && Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          setErrorRoles('Respuesta inesperada al cargar roles.');
          setRoles([]);
        }
      } catch (err) {
        console.error("[UserForm] Error cargando roles:", err);
        setErrorRoles(`Error al cargar roles: ${err.message}`);
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };
    cargarRoles();
  }, []);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        nombreCompleto: initialData.nombreCompleto || "",
        documento: initialData.documento || "",
        email: initialData.email || "",
        celular: initialData.celular || "",
        username: initialData.username || "",
        password: "",
        roleId: initialData.role?.id || initialData.roleId || "",
      });
    } else {
      setFormData({
        nombreCompleto: "", documento: "", email: "", celular: "",
        username: "", password: "", roleId: "",
      });
    }
  }, [initialData, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
        ...formData,
        roleId: formData.roleId ? parseInt(formData.roleId, 10) : null,
    };
    if (isEditing && !formData.password) {
        delete dataToSend.password;
    }
    onSubmit(dataToSend);
  };

  return (
    <Form id="user-form-inside-modal" onSubmit={handleSubmit}>
      {apiError && <Alert color="danger" className="mt-2">{apiError}</Alert>}
      {errorRoles && <Alert color="warning" className="mt-2">{errorRoles}</Alert>}

      <FormGroup>
        <Label for="nombreCompleto">Nombre Completo (*)</Label>
        <Input type="text" name="nombreCompleto" id="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} required disabled={isSaving} maxLength={255}/>
      </FormGroup>

      <div className="row">
          <FormGroup className="col-md-6">
            <Label for="documento">Documento (Cédula) (*)</Label>
            <Input type="text" name="documento" id="documento" value={formData.documento} onChange={handleInputChange} required disabled={isSaving} maxLength={50}/>
          </FormGroup>
          <FormGroup className="col-md-6">
             <Label for="celular">Celular</Label>
             <Input type="tel" name="celular" id="celular" value={formData.celular || ''} onChange={handleInputChange} disabled={isSaving} maxLength={10}/>
           </FormGroup>
      </div>

      <FormGroup>
        <Label for="email">Correo Electrónico (*)</Label>
        <Input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required disabled={isSaving} maxLength={255}/>
      </FormGroup>

      <div className="row">
          <FormGroup className="col-md-6">
            <Label for="username">Nombre de Usuario (login) (*)</Label>
            <Input type="text" name="username" id="username" value={formData.username} onChange={handleInputChange} required disabled={isSaving} maxLength={255}/>
          </FormGroup>
           <FormGroup className="col-md-6">
             <Label for="password">Contraseña {isEditing ? '(Opcional)' : '(*)'}</Label>
             <Input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} placeholder={isEditing ? "Dejar vacío para no cambiar" : ""} required={!isEditing} disabled={isSaving} autoComplete="new-password"/>
           </FormGroup>
      </div>

      <FormGroup>
        <Label for="roleId">Rol (*)</Label>
        <Input type="select" name="roleId" id="roleId" value={formData.roleId} onChange={handleInputChange} required disabled={loadingRoles || roles.length === 0 || isSaving}>
          <option value="">{loadingRoles ? 'Cargando...' : 'Seleccione un rol'}</option>
          {roles.map((role) => (
            <option key={role.id || role._id} value={role.id || role._id}>
              {role.name}
            </option>
          ))}
        </Input>
        {loadingRoles && <small className="text-muted">Cargando roles...</small>}
      </FormGroup>
    </Form>
  );
};

export default UserForm;