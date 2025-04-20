// src/components/SedeCard.jsx
import React from 'react';

function SedeCard({ sede, ejemplares }) {
    return (
        <div className='bg-zinc-800 p-5 rounded-lg shadow-lg border border-zinc-700 flex flex-col h-full hover:shadow-indigo-500/30 transition duration-200'>
            {/* Información de la Sede */}
            <div className='mb-4'>
                <h3 className='text-xl font-bold text-white mb-2 truncate' title={sede.nombre}>{sede.nombre}</h3>
                {sede.direccion && (
                    <p className='text-sm text-gray-400 mb-1'>
                        <span className="font-semibold">Dirección:</span> {sede.direccion}
                    </p>
                )}
                 {sede.telefono && (
                    <p className='text-sm text-gray-400'>
                         <span className="font-semibold">Teléfono:</span> {sede.telefono}
                    </p>
                 )}
            </div>

            {/* Lista de Ejemplares (ocupa espacio restante) */}
            <div className='flex-grow border-t border-zinc-700 pt-3 mt-3'>
                <h4 className='text-md font-semibold text-gray-200 mb-2'>Ejemplares en esta Sede:</h4>
                {ejemplares.length === 0 ? (
                    <p className='text-sm text-gray-500 italic'>No hay ejemplares asignados.</p>
                ) : (
                    <ul className='list-disc list-inside pl-2 space-y-1 max-h-40 overflow-y-auto'> {/* Limita altura y permite scroll */}
                        {ejemplares.map((ejemplar) => (
                            <li key={ejemplar._id} className='text-sm text-gray-300 truncate' title={ejemplar.nombre}>
                                {ejemplar.nombre} ({ejemplar.cantidad}) {/* Muestra nombre y cantidad */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

             {/* Podrías añadir botones de Editar/Eliminar sede aquí más adelante */}
             {/* <div className='mt-4 flex gap-x-2 border-t border-zinc-700 pt-3'>
                 <button className='text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded'>Editar</button>
                 <button className='text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded'>Eliminar</button>
             </div> */}
        </div>
    );
}

export default SedeCard;