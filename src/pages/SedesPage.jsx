// src/pages/SedesPage.jsx

import React from 'react'; // Importación estándar de React
import { useForm } from 'react-hook-form'; // Para manejar el formulario de creación
import { useSedes } from '../context/SedeProvider'; // Hook para acceder a las sedes y funciones relacionadas
import { useEjemplares } from '../context/EjemplarProvider'; // Hook para acceder a los ejemplares (necesitamos la lista completa)
import SedeCard from '../components/SedeCard'; // El componente que mostrará cada sede

function SedesPage() {
    // --- Estado y Funciones del Contexto ---
    // Del contexto de Sedes:
    const {
        sedes,          // Array de objetos Sede
        createSede,     // Función para llamar a la API POST /api/sedes
        loadingSedes,   // Booleano para saber si las sedes están cargando
        errorsSedes,    // Array de errores al obtener o crear sedes
        getSedes        // Opcional: Función para recargar sedes si es necesario
    } = useSedes();

    // Del contexto de Ejemplares (solo necesitamos la lista y el estado de carga):
    const {
        ejemplares,         // Array de objetos Ejemplar
        loadingEjemplares   // Booleano para saber si los ejemplares están cargando
    } = useEjemplares();

    // --- Manejo del Formulario (react-hook-form) ---
    const {
        register,           // Función para registrar inputs
        handleSubmit,       // Función para envolver nuestro submit handler
        reset,              // Función para limpiar el formulario
        formState: { errors: formErrors } // Objeto con errores de validación del formulario
    } = useForm();

    // --- Handler para el Submit del Formulario de Creación ---
    const onSubmitSede = handleSubmit(async (data) => {
        console.log("Datos a enviar para crear sede:", data); // Para depuración
        // Llamamos a la función del contexto para crear la sede en el backend
        // createSede devuelve true si tuvo éxito, false si hubo error (según lo definimos en el provider)
        const success = await createSede(data);

        if (success) {
            console.log("Sede creada con éxito");
            reset(); // Limpia los campos del formulario solo si la creación fue exitosa
        } else {
            console.log("Error al crear la sede (ver errores en consola o UI)");
            // El error ya se maneja y muestra a través de 'errorsSedes' del contexto
        }
    });

    // --- Renderizado Condicional (Loading) ---
    // Muestra un mensaje de carga si las sedes O los ejemplares aún no han llegado
    if (loadingSedes || loadingEjemplares) {
        return (
            <div className='flex justify-center items-center h-[calc(100vh-150px)]'>
                 <p className='text-white text-center text-xl'>Cargando datos, por favor espera...</p>
                 {/* Podrías poner un spinner aquí */}
            </div>
        );
    }

    // --- Renderizado Principal de la Página ---
    return (
        // Contenedor principal con padding
        <div className='p-4 md:p-10 text-white'>

            {/* Título Principal de la Página */}
            <h1 className='text-3xl font-bold mb-8 text-center'>Administración de Sedes</h1>

            {/* Sección para Mostrar Errores del Backend (al crear) */}
            {errorsSedes && errorsSedes.length > 0 && (
                 <div className='bg-red-600 border border-red-800 p-3 rounded-md mb-6 max-w-md mx-auto shadow-lg'>
                    <p className="font-semibold text-center mb-1">Error al procesar la solicitud:</p>
                    {errorsSedes.map((error, i) => (
                        // Muestra cada mensaje de error recibido del backend
                        <p key={i} className='text-white text-center text-sm'>{error}</p>
                    ))}
                 </div>
            )}

            {/* Sección del Formulario para Crear Nueva Sede */}
            <div className='bg-zinc-800 max-w-lg p-6 md:p-8 rounded-md mb-10 mx-auto shadow-xl border border-zinc-700'>
                <h2 className='text-2xl font-semibold mb-5 text-center'>Crear Nueva Sede</h2>
                {/* El formulario llama a onSubmitSede cuando se envía */}
                <form onSubmit={onSubmitSede} className="space-y-4">
                    {/* Campo Nombre */}
                    <div>
                        <label htmlFor="nombreSedeForm" className='block text-sm font-medium text-gray-300 mb-1'>Nombre de la Sede *</label>
                        <input
                            id="nombreSedeForm"
                            type="text"
                            // Registra el input con react-hook-form
                            {...register("nombre", { required: "El nombre de la sede es obligatorio." })}
                            className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            placeholder='Ej: Sede Centro'
                        />
                        {/* Muestra error de validación si existe para este campo */}
                        {formErrors.nombre && <p className='text-red-400 text-xs mt-1'>{formErrors.nombre.message}</p>}
                    </div>

                    {/* Campo Dirección */}
                    <div>
                        <label htmlFor="direccionSedeForm" className='block text-sm font-medium text-gray-300 mb-1'>Dirección</label>
                        <input
                            id="direccionSedeForm"
                            type="text"
                            // No es requerido según el modelo de backend, así que no añadimos { required: ... }
                            {...register("direccion")}
                            className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            placeholder='(Opcional) Ej: Calle 10 # 40-20'
                        />
                        {/* No mostramos error de validación si no es requerido */}
                    </div>

                    {/* Campo Teléfono */}
                    <div>
                        <label htmlFor="telefonoSedeForm" className='block text-sm font-medium text-gray-300 mb-1'>Teléfono</label>
                        <input
                            id="telefonoSedeForm"
                            type="text"
                             // No es requerido
                            {...register("telefono")}
                            className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            placeholder='(Opcional) Ej: 3001234567'
                        />
                    </div>

                    {/* Botón de Envío del Formulario */}
                    <button type="submit" className='w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded transition duration-200 ease-in-out mt-2'>
                        Crear Sede
                    </button>
                </form>
            </div>

            {/* Separador Visual (Opcional) */}
            <hr className="border-zinc-700 my-10" />

            {/* Sección del Listado de Sedes Existentes */}
            <h2 className='text-2xl font-semibold mb-6 text-center'>Sedes Existentes</h2>

            {/* Mensaje si no hay sedes Y ya terminó de cargar */}
            {sedes.length === 0 && !loadingSedes ? (
                 <div className='bg-zinc-800 border border-zinc-700 rounded-md p-6 text-center'>
                    <p className='text-gray-400'>No se encontraron sedes registradas.</p>
                    <p className='text-gray-500 text-sm mt-1'>Puedes crear una usando el formulario de arriba.</p>
                 </div>
            ) : (
                // Grid para mostrar las tarjetas de sede
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {/* Mapea cada sede a un componente SedeCard */}
                    {sedes.map((sede) => {
                        // *** FILTRADO CLAVE EN EL FRONTEND ***
                        // Para cada sede, filtramos la lista COMPLETA de ejemplares
                        // para encontrar solo aquellos cuyo campo 'sede' coincide con el '_id' de esta sede.
                        const ejemplaresDeEstaSede = ejemplares.filter(ej => ej.sede === sede._id);

                        // Renderiza la tarjeta, pasando la sede y sus ejemplares filtrados
                        return (
                            <SedeCard
                                key={sede._id} // Key única para el mapeo
                                sede={sede} // El objeto completo de la sede
                                ejemplares={ejemplaresDeEstaSede} // El array filtrado de ejemplares para esta sede
                            />
                        );
                    })}
                </div>
            )}
        </div> // Fin del contenedor principal
    );
}

export default SedesPage; // Exporta el componente