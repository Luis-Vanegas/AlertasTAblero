/**
 * Componente para mostrar un grupo de alertas por dependencia
 *
 * Agrupa y muestra alertas filtradas por dependencia con capacidad
 * de expandir/contraer y mostrar estadísticas por gravedad.
 *
 * @component
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

import AlertCard from '../common/AlertCard';
import { MappedAlerta } from '../../types/api';
import { formatDate } from '../../utils/dateFormatting';
import { isPriorityAlert } from '../../utils/severity';
import { PRIORITY_PROJECTS } from '../../constants';
import { ANIMATION_VARIANTS } from '../../constants';

interface DependencyGroupProps {
  /** Nombre de la dependencia */
  dependencia: string;

  /** Alertas de esta dependencia */
  alertas: MappedAlerta[];

  /** Estadísticas del grupo */
  stats: {
    total: number;
    altas: number;
    medias: number;
    leves: number;
    sinRiesgo: number;
  };

  /** Si el grupo está expandido para mostrar todas las alertas */
  isExpanded: boolean;

  /** Callback para cambiar el estado expandido */
  onToggleExpand: () => void;

  /** Callback para abrir detalles de una alerta */
  onViewDetails: (alerta: MappedAlerta) => void;
}

/**
 * Componente que muestra un grupo de alertas por dependencia
 */
const DependencyGroup: React.FC<DependencyGroupProps> = ({
  dependencia,
  alertas,
  stats,
  isExpanded,
  onToggleExpand,
  onViewDetails,
}) => {
  // Mostrar solo las primeras 6 alertas si no está expandido
  const displayedAlertas = isExpanded ? alertas : alertas.slice(0, 6);

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.item}
      initial='hidden'
      animate='visible'
      className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl'
    >
      {/* Header del grupo */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white'>
            <BusinessIcon className='w-5 h-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-gray-800'>{dependencia}</h3>
            <p className='text-sm text-gray-600'>
              {stats.total} alertas • Última actualización: {formatDate(new Date(), 'HH:mm')}
            </p>
          </div>
        </div>

        {/* Badges de estadísticas */}
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full'>
            {stats.altas} Críticas
          </span>
          <span className='px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full'>
            {stats.medias} Moderadas
          </span>
          <span className='px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full'>
            {stats.leves} Leves
          </span>
          {stats.sinRiesgo > 0 && (
            <span className='px-2 py-1 bg-green-100 text-green-700 border border-green-300 text-xs font-medium rounded-full'>
              {stats.sinRiesgo} Sin riesgo
            </span>
          )}
        </div>
      </div>

      {/* Separador */}
      <div className='border-t border-gray-200 my-4'></div>

      {/* Grid de alertas */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {displayedAlertas.map(alerta => {
          const isPriority = isPriorityAlert(alerta, PRIORITY_PROJECTS);
          return (
            <AlertCard
              key={alerta.id}
              alerta={alerta}
              onViewDetails={onViewDetails}
              isPriority={isPriority}
            />
          );
        })}
      </div>

      {/* Botón para expandir/contraer si hay más de 6 alertas */}
      {alertas.length > 6 && (
        <div className='mt-4 text-center'>
          <button
            onClick={onToggleExpand}
            className='inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
            aria-expanded={isExpanded}
            aria-controls={`grupo-${dependencia.replace(/\s+/g, '-')}`}
          >
            {isExpanded ? (
              <>
                <ExpandLessIcon className='w-4 h-4 mr-1' />
                Ver menos
              </>
            ) : (
              <>
                <ExpandMoreIcon className='w-4 h-4 mr-1' />
                Ver {alertas.length - 6} más
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DependencyGroup;
