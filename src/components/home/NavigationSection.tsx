/**
 * Componente de navegación principal en la página de inicio
 * Muestra opciones para "Proyectos Estratégicos" y "Tablero de Alertas"
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Assignment as ProjectsIcon,
  Dashboard as DashboardIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../constants';

export const NavigationSection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;

  const handleNavigateToDashboard = () => {
    navigate(ROUTES.ALERTAS);
  };

  const handleScrollToProjects = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className='fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
    >
      <div className='max-w-4xl mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {/* Botón Proyectos Estratégicos */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleScrollToProjects}
            className={`relative group overflow-hidden rounded-xl px-6 py-4 sm:px-8 sm:py-5 backdrop-blur-md border-2 transition-all duration-300 ${
              isHome
                ? 'bg-white/90 border-white/50 text-gray-800 shadow-xl'
                : 'bg-white/80 border-white/30 text-gray-700 hover:bg-white/95 shadow-lg'
            }`}
          >
            <div className='relative z-10 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors'>
                  <ProjectsIcon className='text-cyan-600 text-2xl' />
                </div>
                <div className='text-left'>
                  <h3 className='font-bold text-lg sm:text-xl text-gray-900'>Proyectos Estratégicos</h3>
                  <p className='text-sm text-gray-600'>Ver todos los proyectos</p>
                </div>
              </div>
              <ArrowIcon className='text-gray-600 group-hover:translate-x-1 transition-transform' />
            </div>
            <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:via-cyan-500/20 group-hover:to-cyan-500/10 transition-all duration-500' />
          </motion.button>

          {/* Botón Tablero de Alertas */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNavigateToDashboard}
            className='relative group overflow-hidden rounded-xl px-6 py-4 sm:px-8 sm:py-5 bg-white/90 backdrop-blur-md border-2 border-white/50 text-gray-800 shadow-xl hover:bg-white/95 transition-all duration-300'
          >
            <div className='relative z-10 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors'>
                  <DashboardIcon className='text-blue-600 text-2xl' />
                </div>
                <div className='text-left'>
                  <h3 className='font-bold text-lg sm:text-xl text-gray-900'>Tablero de Alertas</h3>
                  <p className='text-sm text-gray-600'>Gestionar alertas</p>
                </div>
              </div>
              <ArrowIcon className='text-gray-600 group-hover:translate-x-1 transition-transform' />
            </div>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/20 group-hover:to-blue-500/10 transition-all duration-500' />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

