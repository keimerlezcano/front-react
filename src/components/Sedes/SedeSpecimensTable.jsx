import React from 'react';
import { Table, Button } from 'reactstrap';

const SedeSpecimensTable = ({ specimens }) => {
    if (!specimens || specimens.length === 0) {
        return <p>No hay ejemplares para mostrar.</p>;
    }

    return (
        <Table striped responsive>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Identificador</th>
                    <th>Raza</th>
                    <th>Color</th>
                    <th>Fecha de Nacimiento</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {specimens.map(specimen => (
                    <tr key={specimen.id}>
                        <td>{specimen.name}</td>
                        <td>{specimen.identifier || 'N/A'}</td>
                        <td>{specimen.breed || 'N/A'}</td>
                        <td>{specimen.color || 'N/A'}</td>
                        <td>{specimen.birthDate ? new Date(specimen.birthDate).toLocaleDateString() : 'N/A'}</td>
                        <td>
                            {/* Aquí puedes agregar botones para editar, eliminar, ver, etc. */}
                            <Button size="sm" color="info" disabled>Ver</Button>{' '}
                            <Button size="sm" color="warning" disabled>Editar</Button>{' '}
                            <Button size="sm" color="danger" disabled>Eliminar</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default SedeSpecimensTable;
