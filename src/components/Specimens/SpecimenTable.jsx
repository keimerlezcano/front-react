// src/components/Specimens/SpecimenTable.jsx
import React from 'react';
import { Table, Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importa los iconos correctos, incluyendo los de RolesTable + faExchangeAlt
import { faEdit, faTrash, faEye, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

const SpecimenTable = ({
    specimens,
    onEdit,
    onDelete,
    onMove, // Se mantiene esta prop
    onView,
    getSedeNameById,
    getClientNameById
}) => {

  if (!specimens || specimens.length === 0) {
    return null;
  }

  // Opcional: Mantener el formateador si lo usas en alguna columna no mostrada aquí
  const formatDate = (dateString) => {
    // ... (código del formateador si se usa)
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      // Considera usar toLocaleDateString('es-ES', { timeZone: 'UTC' }) si las fechas vienen como YYYY-MM-DD
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return '-';
    }
  };

  return (
    // Aplicar clases de RolesTable: table-bordered, table-hover, responsive
    <Table className="table table-bordered table-hover" responsive>
      {/* Aplicar clase de thead de RolesTable: table-dark */}
      <thead className="table-dark">
        <tr>
          <th style={{width: '5%'}}>ID</th>
          <th>Nombre</th>
          <th style={{width: '25%'}}>Propietario</th>
          <th style={{width: '20%'}}>Sede</th>
          <th style={{width: '20%'}} className='text-center'>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {specimens.map((specimen) => {
            const specimenId = specimen.id || specimen._id;
            const clientName = getClientNameById ? getClientNameById(specimen.clientId) : (specimen.propietario?.nombre || 'N/A');
            const sedeName = getSedeNameById ? getSedeNameById(specimen.sedeId) : (specimen.sede?.NombreSede || 'N/A');

            return (
              <tr key={specimenId}>
                <td>{specimenId}</td>
                <td>{specimen.name || 'Sin Nombre'}</td>
                <td>{clientName}</td>
                <td>{sedeName}</td>
                <td className='text-center'>
                  {/* Usar ButtonGroup y size="sm" como en RolesTable */}
                  <ButtonGroup size="sm">
                    {/* Botón Ver: outline, color info, estilo inline, icono faEye */}
                    <Button
                      outline
                      color="info"
                      onClick={() => onView(specimen)}
                      title="Ver Detalles"
                      style={{ border:'none', padding: '0.25rem 0.5rem' }} // Estilo de RolesTable
                      className="me-1" // Añadir margen
                    >
                      <FontAwesomeIcon icon={faEye} style={{ color: '#4a90e2' }}/>
                    </Button>
                        {/* Botón Mover (Específico de Ejemplares): outline, color info, icono faExchangeAlt */}
                        {onMove && (
                      <Button
                        outline
                        color="success" 
                        onClick={() => onMove(specimen)}
                        title="Mover Ejemplar"
                        className="me-1" // Añadir margen
                      >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                      </Button>
                    )}
                    {/* Botón Editar: color warning, icono faEdit */}
                    <Button
                      color="dark" // Cambiar a color sólido warning
                      onClick={() => onEdit(specimen)}
                      title="Editar Ejemplar"
                      className="me-1" // Añadir margen
                    >
                      <FontAwesomeIcon icon={faEdit} /> {/* Cambiar icono */}
                    </Button>
                    {/* Botón Eliminar: color danger, icono faTrash */}
                    <Button
                      color="danger" // Cambiar a color sólido danger
                      onClick={() => onDelete(specimenId)}
                      title="Eliminar Ejemplar"
                      className="me-1" // Añadir margen
                    >
                      <FontAwesomeIcon icon={faTrash} /> {/* Cambiar icono */}
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            );
        })}
      </tbody>
    </Table>
  );
};

export default SpecimenTable;