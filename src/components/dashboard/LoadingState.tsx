/**
 * Componente de estado de carga
 *
 * Muestra un indicador de carga mientras se obtienen los datos del dashboard.
 *
 * @component
 */

import React from 'react';

interface LoadingStateProps {
  /** Mensaje de carga personalizado */
  message?: string;
}

/**
 * Componente que muestra el estado de carga
 */
const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Cargando datos...' }) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[50vh]'>
      <div className='w-full bg-gray-200 rounded-full h-2 mb-4 max-w-md'>
        <div
          className='bg-cyan-500 h-2 rounded-full animate-pulse transition-all duration-500'
          style={{ width: '100%' }}
        ></div>
      </div>
      <p className='text-gray-600 font-medium'>{message}</p>
    </div>
  );
};

export default LoadingState;
