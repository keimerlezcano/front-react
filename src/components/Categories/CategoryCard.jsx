// src/components/Categories/CategoryCard.jsx
import React from 'react';
import { Card, CardHeader, CardBody, Collapse, Button, Badge, ButtonGroup, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importar los iconos correctos: faEdit y faTrash (y los de collapse)
import { faChevronDown, faChevronUp, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SpecimenTable from '../Specimens/SpecimenTable'; // Verifica ruta

const CategoryCard = ({
    category,
    specimensInCategory = [],
    isOpen = false,
    onToggleCollapse,
    onEditCategory,
    onDeleteCategory,
    // Props para pasar a SpecimenTable
    onEditSpecimen,
    onDeleteSpecimen,
    onMoveSpecimen,
    onViewSpecimen,
    // Props helper para nombres
    getCategoryNameById, // Puede no ser necesario aquí si SpecimenTable lo resuelve
    getSedeNameById,
    getClientNameById,
}) => {
    const categoryId = category?.id || category?._id;
    // Asumimos que 'activo' es el estado positivo. Ajusta si es diferente.
    const isActive = category?.estado === 'activo';

    if (!categoryId) {
        // Es mejor retornar null o un fragmento vacío si el componente padre maneja errores
        // return null;
        // O mostrar una alerta si este componente DEBE mostrar algo
         return <Alert color="warning" className="my-2">Error: Datos de categoría inválidos.</Alert>;
    }

    return (
        <Card className="mb-3 shadow-sm category-card">
            <CardHeader
                onClick={onToggleCollapse} // El clic en el header principal hace collapse/expand
                style={{ cursor: 'pointer', backgroundColor: isOpen ? '#e9ecef' : '#f8f9fa' }}
                // Usar flexbox para alinear elementos
                className="d-flex justify-content-between align-items-center p-2 flex-wrap gap-2" // gap-2 para espaciado
            >
                {/* Contenedor para nombre, estado y contador */}
                <div className="me-auto d-flex align-items-center flex-wrap"> {/* flex-wrap por si no cabe */}
                    <span className='fw-bold me-2'>{category.name || 'Categoría sin nombre'}</span>
                    {/* Mostrar badge de estado */}
                    <Badge color={isActive ? "success" : "secondary"} pill className="me-2">
                        {isActive ? "Activa" : "Inactiva"}
                    </Badge>
                    {/* Mostrar contador de ejemplares */}
                    <span className="text-muted small">({specimensInCategory.length} ejemplares)</span>
                </div>

                {/* Grupo de botones de acción */}
                <ButtonGroup size="sm">
                     {/* Botón Editar (estilo RolesTable) */}
                     <Button
                        color="dark" // Color sólido amarillo
                        onClick={(e) => { e.stopPropagation(); onEditCategory(category); }} // Evita que el clic haga collapse
                        title="Editar Categoría"
                        className="me-1" // Margen a la derecha
                     >
                        <FontAwesomeIcon icon={faEdit} /> {/* Icono de editar */}
                     </Button>

                     {/* Botón Eliminar (estilo RolesTable) */}
                     <Button
                        color="danger" // Color sólido rojo
                        onClick={(e) => { e.stopPropagation(); onDeleteCategory(categoryId); }} // Evita que el clic haga collapse
                        title="Eliminar Categoría"
                        className="me-1" // Margen a la derecha
                     >
                        <FontAwesomeIcon icon={faTrash} /> {/* Icono de eliminar */}
                     </Button>

                     {/* Botón Collapse/Expand (mantener estilo original o ajustarlo) */}
                     <Button
                        color="light" // O el color que prefieras
                        onClick={onToggleCollapse} // Sin stopPropagation aquí
                        title={isOpen ? "Ocultar ejemplares" : "Mostrar ejemplares"}
                        className="border" // Mantener borde si te gusta
                     >
                        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                     </Button>
                </ButtonGroup>
            </CardHeader>

            {/* Contenido colapsable con la tabla de especímenes */}
            <Collapse isOpen={isOpen}>
                <CardBody className="p-0"> {/* Quitar padding para que la tabla ocupe todo */}
                    {specimensInCategory.length > 0 ? (
                        // Renderizar la tabla de especímenes si hay datos
                        <SpecimenTable
                            specimens={specimensInCategory}
                            // Pasar los handlers con los nombres correctos que espera SpecimenTable
                            onEdit={onEditSpecimen}
                            onDelete={onDeleteSpecimen}
                            onMove={onMoveSpecimen}
                            onView={onViewSpecimen}
                            // Pasar los helpers si SpecimenTable los necesita internamente
                            getSedeNameById={getSedeNameById}
                            getClientNameById={getClientNameById}
                        />
                    ) : (
                        // Mensaje si no hay ejemplares en esta categoría
                        <p className="text-center text-muted fst-italic p-3 mb-0">
                            No hay ejemplares asignados a esta categoría.
                        </p>
                    )}
                </CardBody>
            </Collapse>
        </Card>
    );
};

export default CategoryCard;