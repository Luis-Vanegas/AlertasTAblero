import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ClearAll as ClearAllIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';

import { useSettingsStore } from '../store/settings';
import { useAlertas } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import FilterPanel from './common/FilterPanel';
import { ANIMATION_VARIANTS, TRANSITIONS } from '../constants';
import bgImage from '../assets/image.png';
import logoImage from '../assets/logo_2022.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { enableAnimations, showReducedMotion, filters, setFilters, clearFilters } =
    useSettingsStore();
  const { alertas } = useAlertas({ limit: 1000 });

  // Usar el hook de filtros
  const { filterOptions } = useFilters({ alertas, filters });

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleFiltersToggle = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleCloseFilters = () => {
    setFiltersOpen(false);
    // No hacer scroll, solo cerrar el panel
  };

  const handleClearFilters = () => {
    clearFilters();
    // Hacer scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const appTitle = import.meta.env.VITE_APP_TITLE || 'Alertas';

  // Cerrar filtros con tecla Escape cuando el panel esté abierto
  useEffect(() => {
    if (!filtersOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtersOpen]);

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filters.gravedad.length > 0 ||
    filters.dependencia.length > 0 ||
    (filters.comuna && filters.comuna.length > 0) ||
    filters.impacto.length > 0 ||
    filters.searchTerm ||
    (filters.obraIds && filters.obraIds.length > 0);

  return (
    <div className='min-h-screen flex flex-col relative'>
      {/* Fondo con imagen */}
      <div
        className='fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `linear-gradient(rgba(5,25,38,0.6), rgba(5,25,38,0.6)), url(${bgImage})`,
        }}
      />

      {/* Barra superior */}
      <header className='bg-white backdrop-blur-lg shadow-lg sticky top-0 z-50'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            {/* Título y menú móvil */}
            <div className='flex items-center space-x-4'>
              <button
                onClick={handleMobileMenuToggle}
                className='md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors'
              >
                <MenuIcon />
              </button>

              <div>
                <motion.h1
                  className='text-2xl font-bold text-gray-800'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {appTitle}
                </motion.h1>
                <p className='text-sm text-gray-600'>Alcaldía de Medellín</p>
              </div>
            </div>

            {/* Botones de acción y Logo */}
            <div className='flex items-center space-x-3'>
              {/* Logo de la Alcaldía */}
              <div>
                <img src={logoImage} alt='Logo Alcaldía de Medellín' className='h-12 w-auto' />
              </div>
            </div>
          </div>

          {/* Barra de filtros */}
          <div className='flex items-center justify-end gap-3 pb-4'>
            <button
              onClick={handleFiltersToggle}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? 'bg-cyan-500 text-white border-cyan-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FilterIcon className='inline w-4 h-4 mr-1' />
              {hasActiveFilters ? 'Filtros Activos' : 'Filtros'}
            </button>
            {filtersOpen && (
              <button
                onClick={handleCloseFilters}
                className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'
                title='Cerrar panel de filtros'
              >
                <CloseIcon className='inline w-4 h-4 mr-1' />
                Cerrar
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className='px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors'
                title='Limpiar todos los filtros'
              >
                <ClearAllIcon className='inline w-4 h-4 mr-1' />
                Limpiar Filtros
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className='p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              title='Actualizar datos'
            >
              <RefreshIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Panel de filtros deslizable */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200 overflow-hidden'
          >
            <div className='p-4'>
              <div className='flex items-center justify-between mb-4 border-b border-gray-200 pb-3'>
                <h3 className='text-lg font-semibold text-gray-800'>Filtros</h3>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleCloseFilters}
                    className='p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors border border-gray-300'
                    title='Cerrar panel de filtros sin hacer scroll'
                  >
                    <CloseIcon fontSize='small' />
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className='p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-300'
                      title='Limpiar todos los filtros y volver arriba'
                    >
                      <ClearAllIcon fontSize='small' />
                    </button>
                  )}
                </div>
              </div>

              <FilterPanel
                searchTerm={filters.searchTerm}
                dependencias={filterOptions.dependencias}
                comunas={filterOptions.comunas}
                impactoOptions={filterOptions.impactoOptions}
                priorityProjects={
                  filterOptions.priorityProjects as Array<{ key: string; label: string }>
                }
                selectedDependencies={filters.dependencia}
                selectedGravedades={filters.gravedad}
                selectedImpactos={filters.impacto}
                selectedComunas={filters.comuna || []}
                selectedPriorityProject={filters.priorityProject}
                onSearchChange={value => setFilters({ searchTerm: value })}
                onDependencyChange={dependencies => setFilters({ dependencia: dependencies })}
                onGravedadChange={gravedades => setFilters({ gravedad: gravedades })}
                onImpactoChange={impactos => setFilters({ impacto: impactos })}
                onComunaChange={comunas => setFilters({ comuna: comunas })}
                onPriorityProjectChange={projectKey => setFilters({ priorityProject: projectKey })}
                onClearFilters={clearFilters}
              />

              {/* Botón pequeño para cerrar filtros dentro del panel */}
              <div className='flex justify-center mt-4 pt-4 border-t border-gray-200'>
                <button
                  onClick={handleCloseFilters}
                  className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 transition-colors'
                  title='Cerrar panel de filtros'
                >
                  <ArrowUpIcon fontSize='small' />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <main className='flex-1 p-4 sm:p-6 lg:p-8'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={window.location.pathname}
            initial={ANIMATION_VARIANTS.page.initial}
            animate={ANIMATION_VARIANTS.page.in}
            exit={ANIMATION_VARIANTS.page.out}
            transition={{
              duration: enableAnimations && !showReducedMotion ? TRANSITIONS.card.duration : 0,
              ease: TRANSITIONS.card.ease,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 md:hidden'
          >
            <div className='absolute inset-0 bg-black/50' onClick={handleMobileMenuToggle} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className='relative w-80 h-full bg-white/95 backdrop-blur-lg shadow-xl'
            >
              <div className='p-4'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-lg font-semibold text-gray-800'>Menú</h2>
                  <button
                    onClick={handleMobileMenuToggle}
                    className='p-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors'
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* Aquí puedes agregar elementos del menú móvil si los necesitas */}
                <div className='space-y-2'>
                  <p className='text-gray-600'>Opciones del menú móvil</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
