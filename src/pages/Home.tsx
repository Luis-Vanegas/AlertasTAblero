/**
 * Página de Inicio - Menú de Proyectos Estratégicos
 *
 * Muestra un grid de tarjetas con todos los proyectos estratégicos.
 * Cada tarjeta muestra el nombre del proyecto y un badge con el número de alertas.
 * Al hacer clic, navega al dashboard de alertas con el proyecto filtrado.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStrategicProjects } from '../hooks/useStrategicProjects';
import { ProjectCard } from '../components/home/ProjectCard';
import { ANIMATION_VARIANTS } from '../constants';
import { ROUTES, MESSAGES } from '../constants';
import bgBlueImage from '../assets/Fondo Azul con logo.jpg';
import logoContenedor from '../assets/Logo en contenedor.png';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error } = useStrategicProjects();

  const handleProjectClick = useCallback(
    (_projectId: string, projectName: string) => {
      navigate(`${ROUTES.ALERTAS}?proyecto=${encodeURIComponent(projectName)}`);
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-white text-xl'>{MESSAGES.LOADING}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-white text-xl'>{MESSAGES.ERROR_LOADING}</div>
      </div>
    );
  }

  return (
    <div className='h-screen overflow-hidden relative flex flex-col'>
      {/* Fondo con imagen azul - mejor ajuste para tablets */}
      <div
        className='fixed inset-0 -z-10'
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.15)), url(${bgBlueImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header con logo a la derecha - compacto */}
      <header className='relative z-20 px-3 sm:px-4 lg:px-6 py-1 sm:py-2 flex-shrink-0'>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className='flex items-center justify-end'
        >
          <img
            src={logoContenedor}
            alt='Logo Alcaldía de Medellín'
            className='h-10 sm:h-12 md:h-14 w-auto drop-shadow-lg'
          />
        </motion.div>
      </header>

      {/* Contenido principal */}
      <div className='relative z-10 flex-1 flex flex-col px-3 sm:px-4 lg:px-6 pb-2 overflow-hidden'>
        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className='text-center mb-2 sm:mb-3 flex-shrink-0'
        >
          <h1 className='text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-white drop-shadow-xl'>
            PROYECTOS ESTRATÉGICOS
          </h1>
          <p className='text-xs sm:text-sm text-white/90 drop-shadow-md'>Alcaldía de Medellín</p>
        </motion.div>

        {/* Grid de proyectos */}
        <motion.div
          variants={ANIMATION_VARIANTS.container}
          initial='hidden'
          animate='visible'
          className='flex-1 flex items-center justify-center overflow-hidden'
        >
          <div className='max-w-full mx-auto w-full px-2 sm:px-2 lg:px-2 tablet-grid-fix'>
            {projects.length > 0 ? (
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-2.5 md:gap-2 lg:gap-3 auto-rows-fr'>
                {projects.map((project, index) => (
                  <div key={project.id} className='flex min-h-0'>
                    <ProjectCard
                      project={project}
                      index={index}
                      onClick={handleProjectClick}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-center py-8'
              >
                <p className='text-white text-sm font-medium drop-shadow-md'>{MESSAGES.NO_DATA}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Texto informativo abajo - compacto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='text-center pt-1.5 pb-0.5 flex-shrink-0 border-t border-white/20'
        >
          <p className='text-xs text-white/90 drop-shadow-md font-medium'>
            Tablero de Alertas - Sistema de gestión de proyectos estratégicos
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
