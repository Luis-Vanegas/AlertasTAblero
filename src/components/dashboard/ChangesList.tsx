/**
 * Componente para mostrar listas de cambios (presupuesto o fechas)
 *
 * Se utiliza para mostrar cambios de presupuesto o cambios de fechas
 * estimadas con paginación.
 *
 * @component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CambioFechaEstimada } from '../../types/api';
import { ANIMATION_VARIANTS } from '../../constants';

interface CambioItem extends Partial<CambioFechaEstimada> {
  nombre_obra: string;
  dependencia: string;
}

interface ChangesListProps {
  /** Título de la lista */
  title: string;

  /** Descripción de la lista */
  description: string;

  /** Cambios a mostrar */
  cambios: CambioItem[];

  /** Tipo de cambio: 'fechas' o 'presupuesto' */
  tipo: 'fechas' | 'presupuesto';

  /** Items por página */
  itemsPerPage?: number;

  /** Callback cuando se cierra la lista */
  onClose: () => void;
}

/**
 * Componente para mostrar una lista paginada de cambios
 */
const ChangesList: React.FC<ChangesListProps> = ({
  title,
  description,
  cambios,
  tipo,
  itemsPerPage = 20,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular cambios de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCambios = cambios.slice(startIndex, endIndex);
  const totalPages = Math.ceil(cambios.length / itemsPerPage);

  return (
    <motion.div variants={ANIMATION_VARIANTS.item}>
      <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 mb-4 md:mb-6 flex flex-col max-h-[80vh] overflow-hidden'>
        {/* Header - Fijo */}
        <div className='flex justify-between items-center mb-4 flex-shrink-0'>
          <div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>{title}</h3>
            <p className='text-sm text-gray-600'>
              {description} ({cambios.length} cambios)
            </p>
          </div>
          <button
            onClick={onClose}
            className='px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
            aria-label='Cerrar lista de cambios'
          >
            Cerrar
          </button>
        </div>

        {/* Contenedor con scroll interno para el grid */}
        <div className='flex-1 min-h-0 overflow-y-auto scroll-container pr-2 -mr-2'>
          {/* Grid de cambios */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {paginatedCambios.map((cambio, index) => (
              <motion.div
                key={`${cambio.nombre_obra}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className='p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-lg'
              >
                <h4 className='text-lg font-bold text-gray-800 mb-2 line-clamp-2'>
                  {cambio.nombre_obra}
                </h4>

                <div className='space-y-2'>
                  {/* Dependencia */}
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Dependencia:</span>
                    <span className='text-sm font-medium text-gray-800'>{cambio.dependencia}</span>
                  </div>

                  {/* Campos específicos según el tipo */}
                  {tipo === 'fechas' ? (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Fecha Anterior:</span>
                        <span className='text-sm font-medium text-gray-800'>
                          {cambio.fecha_anterior || 'N/A'}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Fecha Nueva:</span>
                        <span className='text-sm font-medium text-gray-800'>
                          {cambio.fecha_nueva || 'N/A'}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Días de Diferencia:</span>
                        <span className='text-sm font-bold text-red-600'>N/A</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Presupuesto Anterior:</span>
                        <span className='text-sm font-medium text-gray-800'>
                          {cambio.presupuesto_anterior || 'N/A'}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Presupuesto Nuevo:</span>
                        <span className='text-sm font-medium text-gray-800'>
                          {cambio.presupuesto_nuevo || 'N/A'}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Diferencia:</span>
                        <span className='text-sm font-bold text-red-600'>
                          {cambio.diferencia || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Paginación */}
          {cambios.length > itemsPerPage && (
            <div className='flex justify-center items-center mt-6 gap-4 pb-2'>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                aria-label='Página anterior'
              >
                Anterior
              </button>
              <span className='text-sm text-gray-600'>
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                aria-label='Página siguiente'
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChangesList;
