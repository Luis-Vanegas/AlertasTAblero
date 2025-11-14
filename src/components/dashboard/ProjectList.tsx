/**
 * Componente reutilizable para mostrar listas de proyectos
 *
 * Se utiliza para mostrar diferentes tipos de listas de proyectos
 * (tardíos, pendientes de definición, etc.) con paginación.
 *
 * @component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS } from '../../constants';

interface Project {
  name: string;
  dependencia: string;
  proyectoEstrategico?: string;
  fechaEstimada?: string;
  etapa?: string;
  porcentajeEjecucion?: number;
  estadoEntrega?: string;
  razon?: string;
}

interface ProjectListProps {
  /** Título de la lista */
  title: string;

  /** Descripción de la lista */
  description: string;

  /** Proyectos a mostrar */
  projects: Project[];

  /** Items por página */
  itemsPerPage?: number;

  /** Callback cuando se cierra la lista */
  onClose: () => void;

  /** Clase personalizada para el contenedor de cada proyecto */
  projectCardClassName?: string;
}

/**
 * Componente para mostrar una lista paginada de proyectos
 */
const ProjectList: React.FC<ProjectListProps> = ({
  title,
  description,
  projects,
  itemsPerPage = 20,
  onClose,
  projectCardClassName = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular proyectos de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = projects.slice(startIndex, endIndex);
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  return (
    <motion.div variants={ANIMATION_VARIANTS.item}>
      <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 mb-4 md:mb-6 flex flex-col max-h-[80vh] overflow-hidden'>
        {/* Header - Fijo */}
        <div className='flex justify-between items-center mb-4 flex-shrink-0'>
          <div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>{title}</h3>
            <p className='text-sm text-gray-600'>
              {description} ({projects.length} obras)
            </p>
          </div>
          <button
            onClick={onClose}
            className='px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
            aria-label='Cerrar lista'
          >
            Cerrar
          </button>
        </div>

        {/* Contenedor con scroll interno para el grid */}
        <div className='flex-1 min-h-0 overflow-y-auto scroll-container pr-2 -mr-2'>
          {/* Grid de proyectos */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
            {paginatedProjects.map((proyecto, index) => (
              <motion.div
                key={`${proyecto.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-yellow-400 ${projectCardClassName}`}
              >
                <h4 className='text-lg font-bold text-cyan-600 mb-3 break-words'>
                  {proyecto.name}
                </h4>

                {/* Badges de información */}
                <div className='mb-4 flex flex-wrap gap-2'>
                  {proyecto.etapa && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        proyecto.etapa === 'CONTRACTUAL'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {proyecto.etapa}
                    </span>
                  )}
                  {proyecto.porcentajeEjecucion !== undefined && (
                    <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                      {proyecto.porcentajeEjecucion}% Progreso
                    </span>
                  )}
                  {proyecto.estadoEntrega && (
                    <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium'>
                      {proyecto.estadoEntrega}
                    </span>
                  )}
                </div>

                {/* Información del proyecto */}
                <div className='space-y-2'>
                  {proyecto.fechaEstimada && (
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-600 font-medium min-w-[90px]'>Fecha:</span>
                      <span className='text-sm font-bold text-gray-800'>
                        {proyecto.fechaEstimada}
                      </span>
                    </div>
                  )}

                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600 font-medium min-w-[90px]'>
                      Dependencia:
                    </span>
                    <span className='text-sm text-gray-800 flex-1'>{proyecto.dependencia}</span>
                  </div>

                  {proyecto.proyectoEstrategico && (
                    <div className='flex items-start gap-2'>
                      <span className='text-sm text-gray-600 font-medium min-w-[90px]'>
                        Proyecto:
                      </span>
                      <span className='text-sm text-gray-800 flex-1 line-clamp-2'>
                        {proyecto.proyectoEstrategico}
                      </span>
                    </div>
                  )}

                  {/* Razon o advertencia */}
                  {proyecto.razon && (
                    <div className='mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-300'>
                      <p className='text-sm font-bold text-yellow-800'>⚠️ {proyecto.razon}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Paginación */}
          {projects.length > itemsPerPage && (
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

export default ProjectList;
