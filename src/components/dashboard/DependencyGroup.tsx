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
import { Business as BusinessIcon } from '@mui/icons-material';

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
  onViewDetails,
}) => {
  return (
    <motion.div
      variants={ANIMATION_VARIANTS.item}
      initial='hidden'
      animate='visible'
      className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 transition-all duration-300 hover:shadow-xl'
    >
      {/* Header del grupo - Responsive optimizado para tablets */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4'>
        <div className='flex items-center gap-2 sm:gap-2 md:gap-3 flex-1 min-w-0'>
          <div className='w-8 h-8 sm:w-9 md:w-10 bg-cyan-500 rounded-full flex items-center justify-center text-white flex-shrink-0'>
            <BusinessIcon className='w-4 h-4 sm:w-4 md:w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='text-responsive-lg font-bold text-gray-800 truncate' title={dependencia}>
              {dependencia}
            </h3>
            <p className='text-responsive-sm text-gray-600'>
              {stats.total} alerta{stats.total !== 1 ? 's' : ''} • Última actualización:{' '}
              {formatDate(new Date(), 'HH:mm')}
            </p>
          </div>
        </div>

        {/* Badges de estadísticas - Responsive y compacto */}
        <div className='flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap'>
          <span className='px-2 sm:px-2.5 py-1 sm:py-1.5 bg-red-500 text-white text-responsive-sm font-bold rounded-full whitespace-nowrap'>
            {stats.altas} Críticas
          </span>
          <span className='px-2 sm:px-2.5 py-1 sm:py-1.5 bg-yellow-500 text-white text-responsive-sm font-bold rounded-full whitespace-nowrap'>
            {stats.medias} Moderadas
          </span>
          <span className='px-2 sm:px-2.5 py-1 sm:py-1.5 bg-blue-500 text-white text-responsive-sm font-bold rounded-full whitespace-nowrap'>
            {stats.leves} Leves
          </span>
          {stats.sinRiesgo > 0 && (
            <span className='px-2 sm:px-2.5 py-1 sm:py-1.5 bg-green-100 text-green-700 border border-green-300 text-responsive-sm font-medium rounded-full whitespace-nowrap'>
              {stats.sinRiesgo} Sin riesgo
            </span>
          )}
        </div>
      </div>

      {/* Separador */}
      <div className='border-t border-gray-200 my-3 sm:my-4'></div>

      {/* Grid de alertas - Responsive con altura uniforme y compacta */}
      <div
        className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3'
        style={{ gridAutoRows: 'minmax(140px, 1fr)' }}
      >
        {alertas.map(alerta => {
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
    </motion.div>
  );
};

export default DependencyGroup;
