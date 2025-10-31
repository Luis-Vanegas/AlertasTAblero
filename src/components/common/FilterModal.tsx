/**
 * Modal para mostrar los filtros
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Close as CloseIcon, ClearAll as ClearAllIcon } from '@mui/icons-material';
import FilterPanel, { FilterPanelProps } from './FilterPanel';

interface FilterModalProps extends FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  hasActiveFilters,
  onClearFilters,
  ...filterPanelProps
}) => {
  // Cerrar modal con tecla Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[9998] flex items-center justify-center p-4'>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
          />

          {/* Modal - Centrado perfecto con flexbox */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='relative z-[9999] w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col'
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(95vw, 80rem)',
              maxHeight: 'min(90vh, 48rem)',
            }}
          >
            {/* Header del modal */}
            <div className='flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0'>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800'>Filtros</h2>
              <div className='flex items-center gap-2'>
                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className='px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors flex items-center gap-1'
                    title='Limpiar todos los filtros'
                  >
                    <ClearAllIcon className='w-4 h-4' />
                    Limpiar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className='p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                  title='Cerrar'
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Contenido del modal - scrollable */}
            <div className='flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 min-h-0'>
              <FilterPanel {...filterPanelProps} onClearFilters={onClearFilters} />
            </div>

            {/* Footer del modal */}
            <div className='flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0'>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FilterModal;

