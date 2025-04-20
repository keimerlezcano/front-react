// src/components/Specimens/SpecimenForm.jsx
// Componente visual del formulario para Ejemplares (Specimens)

import React, { useState, useEffect } from 'react';
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
    Spinner,
    Alert,
    FormFeedback
} from 'reactstrap';

// Ya no necesitamos importar APIs aquí, el padre se encarga.

const formatDateForInput = (dateString) => {
    // ... (tu función formatDateForInput sin cambios)
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn("Invalid date received:", dateString);
            return '';
        }
        return date.toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return '';
    }
};

const SpecimenForm = ({
    onSubmit,           // Función a llamar al guardar (viene del padre)
    initialData = null, // Datos iniciales si estamos editando (viene del padre)
    isEditMode = false, // True si estamos editando (viene del padre)
    sedes = [],         // Lista de sedes disponibles (viene del padre, ya mapeada a {id, name})
    categories = [],    // Lista de categorías (viene del padre)
    clients = [],       // Lista de clientes (viene del padre)
    // contracts = [],  // Parece no usarse aquí, si es necesario, añádelo como prop
    apiError = null,    // Mensaje de error del API (viene del padre)
    isSaving = false,   // True si se está guardando (viene del padre)
    isMoveMode = false, // Modo especial para mover (viene del padre)
    // onCancel,        // Función si hubiera un botón cancelar (viene del padre)
}) => {

    // --- Estado Interno del Formulario ---
    const [formData, setFormData] = useState({
        name: '',
        // --- CAMPOS AÑADIDOS/MODIFICADOS ---
        descripcion: '', // Añadido para la descripción del ejemplar
        cantidad: 0,     // Añadido para la cantidad, inicializar en 0 o ''
        sedeId: '',      // ID de la sede seleccionada (debe ser el _id de Mongo)
        // --- Otros campos existentes ---
        breed: '',
        color: '',
        birthDate: '',
        clientId: '',
        specimenCategoryId: '', // Asumo que aún necesitas categorías
        // contractId: '',      // Asumo que ya no lo necesitas para 'Ejemplar'
        identifier: '',         // Solo se muestra al editar
    });

    const [fieldErrors, setFieldErrors] = useState({}); // Errores de validación locales

    // --- Efecto para llenar el formulario con datos iniciales (Editar) ---
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || initialData.nombre || '', // Acepta 'nombre' o 'name'
                // --- CAMPOS AÑADIDOS/MODIFICADOS ---
                descripcion: initialData.descripcion || '',         // Llenar descripción
                cantidad: initialData.cantidad || 0,              // Llenar cantidad
                sedeId: initialData.sedeId || initialData.sede || '', // Acepta 'sedeId' o 'sede' (debe ser el _id)
                // --- Otros campos existentes ---
                breed: initialData.breed || '',
                color: initialData.color || '',
                birthDate: formatDateForInput(initialData.birthDate) || '',
                clientId: initialData.clientId || '', // Asume que aún lo usas
                specimenCategoryId: initialData.specimenCategoryId || '', // Asume que aún lo usas
                identifier: initialData.identifier || initialData._id || '', // Mostrar _id si no hay identifier
            });
        } else {
            // Resetear formulario si no hay datos iniciales (Modo Crear)
            setFormData({
                name: '', descripcion: '', cantidad: 0, sedeId: '',
                breed: '', color: '', birthDate: '', clientId: '',
                specimenCategoryId: '', identifier: ''
            });
        }
        setFieldErrors({}); // Limpiar errores al cambiar datos iniciales
    }, [initialData]);

    // --- Manejador de Cambios en los Inputs ---
    const handleChange = (event) => {
        const { name, value, type } = event.target;

        setFormData(prev => ({
            ...prev,
            // Usar el valor directamente (evitar parseInt innecesario para ObjectIds)
            // Si 'cantidad' es el input, convertir a número si no está vacío
            [name]: (name === 'cantidad')
                        ? (value === '' ? '' : Number(value)) // Permitir vaciar, convertir a número si no
                        : value
        }));

        // Limpiar error de campo si el usuario empieza a escribir
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // --- Validación Local del Formulario ---
    const validateForm = () => {
        const newFieldErrors = {};
        let isValid = true;

        // Nombre requerido
        if (!formData.name || !formData.name.trim()) {
            newFieldErrors.name = 'El nombre es obligatorio.';
            isValid = false;
        }
        // Sede requerida
        if (!formData.sedeId) {
             newFieldErrors.sedeId = 'La sede es obligatoria.';
             isValid = false;
         }
        // Cantidad requerida y no negativa
        if (formData.cantidad === '' || formData.cantidad === null || isNaN(formData.cantidad)) {
            newFieldErrors.cantidad = 'La cantidad es obligatoria.';
            isValid = false;
        } else if (Number(formData.cantidad) < 0) {
             newFieldErrors.cantidad = 'La cantidad no puede ser negativa.';
             isValid = false;
        }
         // Descripción podría ser opcional, si no, añadir validación:
         // if (!formData.descripcion || !formData.descripcion.trim()) {
         //     newFieldErrors.descripcion = 'La descripción es obligatoria.';
         //     isValid = false;
         // }
         // Categoría requerida (si aún la usas)
         if (!isMoveMode && !formData.specimenCategoryId) { // No validar categoría en modo mover
              newFieldErrors.specimenCategoryId = 'La categoría es obligatoria (si aplica).';
              // isValid = false; // Comenta si categoría es opcional
         }

        setFieldErrors(newFieldErrors);
        return isValid;
    };

    // --- Manejador de Submit Local ---
    const handleSubmit = (event) => {
        event.preventDefault();
        setFieldErrors({}); // Limpiar errores viejos

        if (!validateForm()) {
            console.log("Validación fallida:", fieldErrors);
            return; // Detener si la validación falla
        }

        // Llamar a la función onSubmit pasada por el padre, enviando los datos actuales
        // El padre (SpecimensPage) se encargará de mapear esto a la API
        console.log("Enviando datos al padre (SpecimensPage):", formData);
        onSubmit(formData);
    };

    // --- Renderizado del Formulario ---
    return (
        <Form onSubmit={handleSubmit} noValidate>
            {/* Título Dinámico */}
            <h4 className='mb-3'>
                {isMoveMode ? `Mover Ejemplar` : (isEditMode ? 'Editar Ejemplar' : 'Crear Nuevo Ejemplar')}
            </h4>
             <hr className="mb-4"/>

            {/* Mostrar Error del API (si viene del padre) */}
            {apiError && (
                <Alert color="danger" isOpen={!!apiError} /* toggle opcional si quieres cerrarlo */ >
                    {apiError}
                </Alert>
            )}

            <Row>
                {/* --- Campo Nombre --- */}
                <Col md={6}>
                    <FormGroup>
                        <Label for="name">Nombre del Ejemplar <span className="text-danger">*</span></Label>
                        <Input
                            id="name"
                            name="name" // Debe coincidir con la key en formData
                            value={formData.name}
                            onChange={handleChange}
                            required
                            invalid={!!fieldErrors.name} // Muestra borde rojo si hay error
                            autoFocus={!isEditMode} // Solo autofocus al crear
                        />
                        {/* Muestra mensaje de error si existe */}
                        {fieldErrors.name && <FormFeedback>{fieldErrors.name}</FormFeedback>}
                    </FormGroup>
                </Col>

                {/* --- Campo Sede (Dropdown) --- */}
                <Col md={6}>
                    <FormGroup>
                         <Label for="sedeId">Sede <span className="text-danger">*</span></Label>
                         <Input
                            id="sedeId"
                            name="sedeId" // Debe coincidir con la key en formData
                            type="select"
                            value={formData.sedeId} // El valor debe ser el _id de Mongo
                            onChange={handleChange}
                            required
                            invalid={!!fieldErrors.sedeId}
                            disabled={sedes.length === 0} // Deshabilitar si no hay sedes
                        >
                            <option value="">-- Seleccione Sede --</option>
                            {/* Mapea las sedes pasadas como prop */}
                            {/* Asume que el padre ya mapeó { _id: '...', nombre: '...' } a { id: '...', name: '...' } */}
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}> {/* Usa el id (mapeado desde _id) */}
                                    {sede.name} {/* Muestra el nombre */}
                                </option>
                            ))}
                            {sedes.length === 0 && <option disabled>No hay sedes disponibles</option>}
                        </Input>
                         {fieldErrors.sedeId && <FormFeedback>{fieldErrors.sedeId}</FormFeedback>}
                    </FormGroup>
                </Col>

                 {/* --- Campo Descripción (NUEVO) --- */}
                 <Col md={12}>
                    <FormGroup>
                        <Label for="descripcion">Descripción (Opcional)</Label>
                        <Input
                            id="descripcion"
                            name="descripcion" // Coincide con formData
                            type="textarea"   // Textarea para descripciones largas
                            rows="3"
                            value={formData.descripcion}
                            onChange={handleChange}
                            invalid={!!fieldErrors.descripcion}
                            // No es requerido, pero puedes añadir validación si quieres
                        />
                        {fieldErrors.descripcion && <FormFeedback>{fieldErrors.descripcion}</FormFeedback>}
                    </FormGroup>
                </Col>

                 {/* --- Campo Cantidad (NUEVO) --- */}
                 <Col md={6}>
                    <FormGroup>
                        <Label for="cantidad">Cantidad <span className="text-danger">*</span></Label>
                        <Input
                            id="cantidad"
                            name="cantidad" // Coincide con formData
                            type="number"   // Input de tipo número
                            min="0"         // No permitir negativos en el input HTML
                            value={formData.cantidad}
                            onChange={handleChange}
                            required
                            invalid={!!fieldErrors.cantidad}
                        />
                         {fieldErrors.cantidad && <FormFeedback>{fieldErrors.cantidad}</FormFeedback>}
                    </FormGroup>
                </Col>

                {/* --- Campo Categoría (Existente, si aún lo necesitas) --- */}
                <Col md={6}>
                     <FormGroup>
                         <Label for="specimenCategoryId">Categoría {!isMoveMode && <span className="text-danger">*</span>}</Label> {/* Requerido solo si no es mover */}
                         <Input
                            id="specimenCategoryId"
                            name="specimenCategoryId"
                            type="select"
                            value={formData.specimenCategoryId}
                            onChange={handleChange}
                            required={!isMoveMode} // Requerido si no es modo mover
                            invalid={!!fieldErrors.specimenCategoryId}
                            disabled={categories.length === 0}
                        >
                            <option value="">-- Seleccione Categoría --</option>
                            {categories.map((category) => (
                                <option key={category.id || category._id} value={category.id || category._id}> {/* Acepta id o _id */}
                                    {category.name}
                                </option>
                            ))}
                             {categories.length === 0 && <option disabled>No hay categorías</option>}
                        </Input>
                        {fieldErrors.specimenCategoryId && <FormFeedback>{fieldErrors.specimenCategoryId}</FormFeedback>}
                    </FormGroup>
                </Col>

                {/* --- Otros Campos Opcionales Existentes (Raza, Color, Fecha Nacimiento, Cliente) --- */}
                {/* Mantener si son relevantes para Ejemplares */}
                <Col md={6}>
                     <FormGroup>
                         <Label for="breed">Raza (Opcional)</Label>
                         <Input id="breed" name="breed" value={formData.breed} onChange={handleChange}/>
                    </FormGroup>
                </Col>
                <Col md={6}>
                     <FormGroup>
                         <Label for="color">Color (Opcional)</Label>
                         <Input id="color" name="color" value={formData.color} onChange={handleChange}/>
                    </FormGroup>
                </Col>
                <Col md={6}>
                     <FormGroup>
                         <Label for="birthDate">Fecha de Nacimiento (Opcional)</Label>
                         <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange}/>
                    </FormGroup>
                </Col>
                <Col md={6}>
                     <FormGroup>
                         <Label for="clientId">Cliente/Propietario (Opcional)</Label>
                         <Input id="clientId" name="clientId" type="select" value={formData.clientId} onChange={handleChange} disabled={clients.length === 0}>
                             <option value="">-- Sin Cliente Asignado --</option>
                             {clients.map((client) => (
                                 <option key={client.id || client._id} value={client.id || client._id}> {/* Acepta id o _id */}
                                     {client.name || client.nombre} {/* Acepta name o nombre */}
                                 </option>
                            ))}
                         </Input>
                    </FormGroup>
                </Col>

                {/* Mostrar Identificador solo en modo Edición */}
                {isEditMode && formData.identifier && (
                     <Col md={12}>
                         <FormGroup>
                             <Label for="identifier">Identificador (_id)</Label>
                             <Input id="identifier" name="identifier" value={formData.identifier} readOnly className="text-muted" />
                        </FormGroup>
                    </Col>
                 )}
            </Row>

             {/* Botón de Envío */}
             <Button
                 color="primary"
                 type="submit"
                 // Deshabilitar si se está guardando o si faltan datos clave (como sedes)
                 disabled={isSaving || sedes.length === 0}
                 className="mt-3 w-100"
             >
                 {/* Mostrar spinner si se está guardando */}
                 {isSaving ? <Spinner size="sm" /> : (isEditMode ? 'Actualizar Ejemplar' : 'Crear Ejemplar')}
             </Button>

             {/* Podrías añadir un botón onCancel aquí si la prop onCancel existe */}
             {/* {onCancel && <Button color="secondary" onClick={onCancel} disabled={isSaving} className="mt-3 w-100">Cancelar</Button>} */}
        </Form>
    );
};

export default SpecimenForm;