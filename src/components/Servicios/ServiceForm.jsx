// src/components/ServiceForm.jsx
import React, { useState, useEffect, useRef } from 'react'; // Añadir useRef
import { Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const ServiceForm = ({ initialData = null, onSubmit, onCancel, apiError, isSaving }) => {
  // Estado para campos de texto/número
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
  });
  // Estado separado para el archivo de imagen seleccionado
  const [imageFile, setImageFile] = useState(null);
  // Estado para la URL de previsualización (puede ser URL existente o Data URL del archivo nuevo)
  const [imagePreview, setImagePreview] = useState(null);
  // Estado para errores del formulario
  const [formError, setFormError] = useState('');
  // Referencia para poder limpiar el input file
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormError('');
    setImageFile(null); // Limpia archivo seleccionado al inicio/cambio

    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        precio: initialData.precio?.toString() || '',
      });
      // Establece previsualización con la imagen existente si hay
      setImagePreview(initialData.imagen || null);
    } else {
      // Resetea para modo 'Añadir'
      setFormData({ nombre: '', descripcion: '', precio: '' });
      setImagePreview(null); // Sin previsualización inicial
    }
    // Limpia visualmente el input file
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }

  }, [initialData]); // Re-ejecutar si cambia initialData

  // Maneja cambios en inputs de texto/número
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Maneja la selección de un archivo de imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validación básica de tipo
      if (!file.type.startsWith('image/')) {
        setFormError('Por favor, selecciona un archivo de imagen (jpg, png, gif, webp...).');
        setImageFile(null);
        setImagePreview(initialData?.imagen || null); // Vuelve a la preview anterior (si había)
        if (fileInputRef.current) fileInputRef.current.value = ""; // Limpia el input
        return;
      }
      // Guarda el archivo y genera previsualización
      setImageFile(file);
      setFormError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Muestra la imagen seleccionada
      };
      reader.readAsDataURL(file);
    } else {
      // Si el usuario cancela, resetea al estado anterior
      setImageFile(null);
      setImagePreview(initialData?.imagen || null);
    }
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setFormError('El nombre del servicio es obligatorio.');
      return false;
    }
    if (formData.precio && isNaN(parseFloat(formData.precio))) {
        setFormError('El precio debe ser un número válido.');
        return false;
    }
    setFormError('');
    return true;
  };

  // Envía el formulario (ahora con FormData)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm() || isSaving) {
      return;
    }

    // Crea FormData para enviar datos y archivo
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre.trim());
    formDataToSend.append('descripcion', formData.descripcion.trim());
    if (formData.precio) { // Añade precio solo si existe
      formDataToSend.append('precio', parseFloat(formData.precio));
    }
    // Añade el archivo SOLO SI se seleccionó uno nuevo
    if (imageFile) {
      // La clave 'imagen' debe coincidir con upload.single('imagen') en el backend
      formDataToSend.append('imagen', imageFile);
    }
    // NOTA: Si estás editando y NO seleccionas un nuevo archivo,
    // el backend NO recibirá el campo 'imagen' y NO debería actualizarlo.
    // Si necesitas explícitamente borrar una imagen, necesitarías otra lógica.

    const serviceId = initialData?.id || initialData?._id;
    onSubmit(formDataToSend, serviceId); // Envía FormData y ID (si es edición)
  };

  return (
    <Form onSubmit={handleSubmit}>
      {apiError && <Alert color="danger" className="mb-3">{apiError}</Alert>}
      {formError && <Alert color="warning" className="mb-3">{formError}</Alert>}

      {/* Nombre */}
      <FormGroup>
        <Label for="serviceName" className="fw-bold">Nombre <span className="text-danger">*</span></Label>
        <Input id="serviceName" type="text" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={isSaving} invalid={!!formError.includes("nombre")} bsSize="sm" placeholder="Ej: Corte de Pelo Canino"/>
      </FormGroup>

      {/* Descripción */}
      <FormGroup>
        <Label for="serviceDescription" className="fw-bold">Descripción</Label>
        <Input id="serviceDescription" type="textarea" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" disabled={isSaving} bsSize="sm" placeholder="Detalles del servicio..."/>
      </FormGroup>

      {/* Carga de Imagen */}
      <FormGroup>
        <Label for="serviceImageFile" className="fw-bold">Imagen</Label>
        <Input
          id="serviceImageFile"
          type="file" // <<< Tipo archivo
          name="imagenFile" // Nombre del input (no necesariamente enviado)
          onChange={handleFileChange} // <<< Nuevo handler
          accept="image/*" // Aceptar cualquier tipo de imagen
          disabled={isSaving}
          innerRef={fileInputRef} // <<< Referencia para limpiar
          bsSize="sm"
        />
        {/* Previsualización */}
        {imagePreview && (
          <div className="mt-2 text-center border rounded p-2" style={{backgroundColor: '#f8f9fa'}}>
            <Label className='d-block text-muted small mb-1'>Previsualización:</Label>
            <img
              src={imagePreview}
              alt="Previsualización"
              style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain' }} // Ajusta tamaño máximo
            />
            {imageFile && <small className="text-muted d-block mt-1">Nuevo archivo: {imageFile.name}</small>}
          </div>
        )}
      </FormGroup>

      {/* Botones */}
      <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
        <Button color="secondary" outline onClick={onCancel} type="button" disabled={isSaving}>
          <FontAwesomeIcon icon={faTimes} className="me-1"/> Cancelar
        </Button>
        <Button color="primary" type="submit" disabled={isSaving}>
          {isSaving ? <Spinner size="sm" className="me-1"/> : <FontAwesomeIcon icon={faSave} className="me-1"/>}
          {initialData ? 'Actualizar Servicio' : 'Guardar Servicio'}
        </Button>
      </div>
    </Form>
  );
};

export default ServiceForm;