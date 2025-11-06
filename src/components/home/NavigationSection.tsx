/**
 * Componente de navegación principal en la página de inicio
 * Muestra opciones para "Proyectos Estratégicos" y "Tablero de Alertas"
 */

import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Assignment as ProjectsIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { ROUTES } from '../../constants';
import { NavigationButton } from './NavigationButton';

const NAVIGATION_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.3, duration: 0.5 },
};

const CONTAINER_CLASSES = 'fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-6 lg:px-8 py-4 sm:py-6';

export const NavigationSection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;

  const handleNavigateToDashboard = useCallback(() => {
    navigate(ROUTES.ALERTAS);
  }, [navigate]);

  const handleScrollToProjects = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <motion.div {...NAVIGATION_ANIMATION} className={CONTAINER_CLASSES}>
      <div className='max-w-4xl mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <NavigationButton
            icon={<ProjectsIcon className='text-2xl' />}
            title='Proyectos Estratégicos'
            description='Ver todos los proyectos'
            color='cyan'
            isActive={isHome}
            onClick={handleScrollToProjects}
          />

          <NavigationButton
            icon={<DashboardIcon className='text-2xl' />}
            title='Tablero de Alertas'
            description='Gestionar alertas'
            color='blue'
            onClick={handleNavigateToDashboard}
          />
        </div>
      </div>
    </motion.div>
  );
};
