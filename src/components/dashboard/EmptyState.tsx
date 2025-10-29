/**
 * Componente de estado vacío
 *
 * Muestra un mensaje cuando no hay filtros activos o no hay resultados.
 *
 * @component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS } from '../../constants';

interface EmptyStateProps {
  /** Si hay filtros activos */
  hasActiveFilters: boolean;

  /** Si hay resultados visibles (filtros o métricas activas) */
  showResults: boolean;

  /** Total de alertas disponibles */
  totalAlertas: number;
}

/**
 * Componente que muestra un mensaje cuando no hay resultados o filtros activos
 */
const EmptyState: React.FC<EmptyStateProps> = ({ hasActiveFilters, showResults, totalAlertas }) => {
  // No mostrar si hay filtros activos o si hay resultados visibles (métricas activas)
  if (hasActiveFilters || showResults) {
    return null; // No mostrar si hay filtros activos o métricas seleccionadas
  }

  return (
    <motion.div variants={ANIMATION_VARIANTS.item}>
      <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 md:p-8 text-center'>
        <h3 className='text-xl font-bold text-gray-800 mb-2'>Aplicar Filtros para Ver Alertas</h3>
        <p className='text-gray-600 mb-4'>
          Usa los filtros del panel superior para ver las alertas específicas por dependencia,
          gravedad, comuna o proyecto estratégico.
        </p>
        <p className='text-sm text-gray-500'>
          Total de alertas disponibles: <strong className='text-gray-800'>{totalAlertas}</strong>
        </p>
      </div>
    </motion.div>
  );
};

export default EmptyState;
