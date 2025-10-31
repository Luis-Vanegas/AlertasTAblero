import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';

import { useSettingsStore } from '../store/settings';
import { useAlertas } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import FilterModal from './common/FilterModal';
import ActiveFiltersBadges from './common/ActiveFiltersBadges';
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
  const hasActiveFilters = Boolean(
    filters.gravedad.length > 0 ||
      filters.dependencia.length > 0 ||
      (filters.comuna && filters.comuna.length > 0) ||
      filters.impacto.length > 0 ||
      filters.searchTerm ||
      (filters.obraIds && filters.obraIds.length > 0)
  );

  return (
    <div className='min-h-screen flex flex-col relative'>
      {/* Fondo con imagen */}
      <div
        className='fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `linear-gradient(rgba(5,25,38,0.6), rgba(5,25,38,0.6)), url(${bgImage})`,
        }}
      />

      {/* Barra superior - más compacta */}
      <header className='bg-white backdrop-blur-lg shadow-md sticky top-0 z-50'>
        <div className='px-3 sm:px-4 lg:px-6'>
          <div className='flex items-center justify-between py-2 sm:py-3'>
            {/* Título y menú móvil */}
            <div className='flex items-center space-x-2 sm:space-x-3'>
              <button
                onClick={handleMobileMenuToggle}
                className='md:hidden p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors'
              >
                <MenuIcon className='w-5 h-5' />
              </button>

              <div>
                <motion.h1
                  className='text-lg sm:text-xl font-bold text-gray-800'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {appTitle}
                </motion.h1>
                <p className='text-xs sm:text-sm text-gray-600'>Alcaldía de Medellín</p>
              </div>
            </div>

            {/* Botones de acción y Logo */}
            <div className='flex items-center space-x-2 sm:space-x-3'>
              {/* Botón de filtros */}
              <button
                onClick={handleFiltersToggle}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 ${
                  hasActiveFilters
                    ? 'bg-cyan-500 text-white border-cyan-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FilterIcon className='w-4 h-4' />
                <span className='hidden sm:inline'>
                  {hasActiveFilters ? 'Filtros Activos' : 'Filtros'}
                </span>
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className='px-2 py-1.5 sm:px-3 sm:py-2 border border-red-300 rounded-lg text-xs sm:text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors flex items-center gap-1'
                  title='Limpiar todos los filtros'
                >
                  <ClearAllIcon className='w-4 h-4' />
                  <span className='hidden sm:inline'>Limpiar</span>
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className='p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                title='Actualizar datos'
              >
                <RefreshIcon className='w-4 h-4 sm:w-5 sm:h-5' />
              </button>
              {/* Logo de la Alcaldía */}
              <div>
                <img
                  src={logoImage}
                  alt='Logo Alcaldía de Medellín'
                  className='h-8 sm:h-10 w-auto'
                />
              </div>
            </div>
          </div>

          {/* Badges de filtros activos */}
          {hasActiveFilters && (
            <div className='pb-2 border-t border-gray-200 pt-2'>
              <ActiveFiltersBadges />
            </div>
          )}
        </div>
      </header>

      {/* Modal de filtros */}
      <FilterModal
        isOpen={filtersOpen}
        onClose={handleCloseFilters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        searchTerm={filters.searchTerm}
        dependencias={filterOptions.dependencias}
        comunas={filterOptions.comunas}
        impactoOptions={filterOptions.impactoOptions}
        priorityProjects={filterOptions.priorityProjects as Array<{ key: string; label: string }>}
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
      />

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
