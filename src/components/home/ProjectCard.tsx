/**
 * Componente de tarjeta de proyecto estratégico
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Warning as WarningIcon } from '@mui/icons-material';
import { ProjectCard as ProjectCardType } from '../../types/home';
import { PROJECT_CARD_COLORS } from '../../constants';
import { ANIMATION_VARIANTS } from '../../constants';

interface ProjectCardProps {
  project: ProjectCardType;
  index: number;
  onClick: (projectId: string, projectName: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick }) => {
  const cardColor = PROJECT_CARD_COLORS[index % PROJECT_CARD_COLORS.length];

  const handleClick = () => {
    onClick(project.id, project.nombre);
  };

  return (
    <motion.div
      key={project.id}
      variants={ANIMATION_VARIANTS.item}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className='relative group cursor-pointer w-full h-full flex'
      onClick={handleClick}
    >
      {/* Tarjeta del proyecto - tamaño uniforme, altura 100% para que todas sean iguales */}
      <div
        className={`relative w-full h-full min-h-[96px] sm:min-h-[112px] md:min-h-[128px] rounded-lg ${cardColor} backdrop-blur-sm overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-white/20 flex flex-col`}
      >
        {/* Overlay más sutil para mostrar mejor la imagen de fondo */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/15' />

        {/* Badge de alertas - Mejorado y más visible */}
        {project.alertCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className='absolute top-1.5 left-1.5 z-20'
          >
            <div className='bg-red-500 rounded-full px-1.5 py-0.5 shadow-lg flex items-center gap-1 border-2 border-white/80 group-hover:scale-110 transition-transform min-w-[24px] justify-center'>
              <WarningIcon className='text-white text-xs' style={{ fontSize: '12px' }} />
              <span className='text-xs font-extrabold text-white leading-none'>
                {project.alertCount}
              </span>
            </div>
          </motion.div>
        )}

        {/* Contenido de la tarjeta */}
        <div className='relative h-full flex flex-col justify-center items-center p-1.5 sm:p-2 text-center flex-1 min-h-0'>
          <h3 className='text-white font-bold text-[9px] sm:text-[10px] md:text-xs leading-tight drop-shadow-lg px-1 line-clamp-2 break-words'>
            {project.nombre.toUpperCase()}
          </h3>
        </div>

        {/* Efecto hover mejorado */}
        <div className='absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300' />

        {/* Borde brillante en hover */}
        <div className='absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/50 transition-all duration-300' />
      </div>
    </motion.div>
  );
};
