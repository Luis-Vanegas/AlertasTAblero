/**
 * Componente de tarjeta de proyecto estratégico con estilo glassmorphism
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Warning as WarningIcon,
  Folder as FolderIcon,
  SportsSoccer as SportsIcon,
  School as SchoolIcon,
  Park as ParkIcon,
  LocalHospital as HospitalIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  DirectionsCar as TransportIcon,
  WaterDrop as WaterIcon,
  Construction as ConstructionIcon,
  LibraryBooks as LibraryIcon,
  SportsBasketball as BasketballIcon,
  Stadium as StadiumIcon,
  FitnessCenter as GymIcon,
} from '@mui/icons-material';
import { ProjectCard as ProjectCardType } from '../../types/home';
import { PROJECT_CARD_COLORS, PRIORITY_PROJECTS } from '../../constants';
import { ANIMATION_VARIANTS } from '../../constants';
import { normalizeProjectName } from '../../utils/textNormalize';

interface ProjectCardProps {
  project: ProjectCardType;
  index: number;
  onClick: (projectId: string, projectName: string) => void;
}

// Mapeo de colores a clases de Tailwind para iconos
const getIconColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#14A9E1': 'bg-cyan-600',
    '#FC6909': 'bg-orange-600',
    '#7AD300': 'bg-green-600',
  };
  return colorMap[color] || 'bg-cyan-600';
};

// Función para obtener el icono según el nombre del proyecto
const getProjectIcon = (projectName: string): React.ReactElement => {
  const normalized = projectName.toLowerCase();

  // Deportes y recreación
  if (
    normalized.includes('deportiv') ||
    normalized.includes('deporte') ||
    normalized.includes('estadio') ||
    normalized.includes('cancha') ||
    normalized.includes('escenario deportivo') ||
    normalized.includes('recreo') ||
    normalized.includes('gimnasio') ||
    normalized.includes('fitness')
  ) {
    if (normalized.includes('estadio') || normalized.includes('escenario')) {
      return <StadiumIcon />;
    }
    if (normalized.includes('basketball') || normalized.includes('baloncesto')) {
      return <BasketballIcon />;
    }
    if (normalized.includes('gimnasio') || normalized.includes('fitness')) {
      return <GymIcon />;
    }
    return <SportsIcon />;
  }

  // Educación
  if (
    normalized.includes('escuela') ||
    normalized.includes('colegio') ||
    normalized.includes('educacion') ||
    normalized.includes('educación') ||
    normalized.includes('institución educativa') ||
    normalized.includes('institucion educativa')
  ) {
    return <SchoolIcon />;
  }

  // Parques y espacios públicos
  if (
    normalized.includes('parque') ||
    normalized.includes('plaza') ||
    normalized.includes('espacio publico') ||
    normalized.includes('espacio público') ||
    normalized.includes('alameda') ||
    normalized.includes('jardin') ||
    normalized.includes('jardín')
  ) {
    return <ParkIcon />;
  }

  // Salud
  if (
    normalized.includes('hospital') ||
    normalized.includes('salud') ||
    normalized.includes('clinica') ||
    normalized.includes('clínica') ||
    normalized.includes('centro de salud')
  ) {
    return <HospitalIcon />;
  }

  // Vivienda
  if (
    normalized.includes('vivienda') ||
    normalized.includes('casa') ||
    normalized.includes('hogar') ||
    normalized.includes('residencial')
  ) {
    return <HomeIcon />;
  }

  // Infraestructura y construcción
  if (
    normalized.includes('construccion') ||
    normalized.includes('construcción') ||
    normalized.includes('infraestructura') ||
    normalized.includes('obra') ||
    normalized.includes('puente') ||
    normalized.includes('tunel') ||
    normalized.includes('túnel')
  ) {
    return <ConstructionIcon />;
  }

  // Transporte
  if (
    normalized.includes('transporte') ||
    normalized.includes('via') ||
    normalized.includes('vía') ||
    normalized.includes('carretera') ||
    normalized.includes('metro') ||
    normalized.includes('tram') ||
    normalized.includes('terminal')
  ) {
    return <TransportIcon />;
  }

  // Agua y saneamiento
  if (
    normalized.includes('agua') ||
    normalized.includes('acueducto') ||
    normalized.includes('alcantarillado') ||
    normalized.includes('saneamiento')
  ) {
    return <WaterIcon />;
  }

  // Bibliotecas y cultura
  if (
    normalized.includes('biblioteca') ||
    normalized.includes('cultura') ||
    normalized.includes('museo') ||
    normalized.includes('teatro')
  ) {
    return <LibraryIcon />;
  }

  // Comercial y negocios
  if (
    normalized.includes('comercial') ||
    normalized.includes('negocio') ||
    normalized.includes('centro comercial') ||
    normalized.includes('mercado')
  ) {
    return <BusinessIcon />;
  }

  // Por defecto
  return <FolderIcon />;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick }) => {
  const cardColor = PROJECT_CARD_COLORS[index % PROJECT_CARD_COLORS.length];
  const iconColorClass = getIconColorClass(cardColor);
  const normalizedProjectName = normalizeProjectName(project.nombre);
  const isPriority = PRIORITY_PROJECTS.includes(
    normalizedProjectName as (typeof PRIORITY_PROJECTS)[number]
  );

  const handleClick = () => {
    onClick(project.id, project.nombre);
  };

  return (
    <motion.div
      key={project.id}
      variants={ANIMATION_VARIANTS.item}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className='relative group cursor-pointer w-full h-full flex'
      onClick={handleClick}
    >
      {/* Tarjeta glassmorphism - Ultra compacta en mobile */}
      <div className='relative w-full h-full min-h-[90px] sm:min-h-[110px] md:min-h-[130px] lg:min-h-[140px] rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 flex flex-col'>
        {/* Base glassmorphism - Responsive */}
        <div
          className='absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-md sm:rounded-lg md:rounded-xl group-hover:border-white/20 transition-all duration-300'
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        />

        {/* Overlay de color en hover - Responsive */}
        <div
          className='absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md sm:rounded-lg md:rounded-xl'
          style={{ backgroundColor: cardColor }}
        />

        {/* Efecto shine - brillo que cruza la tarjeta - Responsive */}
        <div className='absolute inset-0 overflow-hidden rounded-md sm:rounded-lg md:rounded-xl'>
          <div className='absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out'>
            <div className='h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent' />
          </div>
        </div>

        {/* Badge rojo para proyectos prioritarios - esquina superior derecha - Ultra pequeño en mobile */}
        {isPriority && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className='absolute top-0.5 right-0.5 sm:top-0.5 sm:right-0.5 md:top-1 md:right-1 lg:top-1.5 lg:right-1.5 z-20'
          >
            <div className='bg-red-500 rounded-full px-0.5 py-0.5 sm:px-0.5 sm:py-0.5 md:px-1 md:py-0.5 lg:px-1.5 lg:py-1 shadow-lg flex items-center justify-center border border-white/80 sm:border min-w-[10px] sm:min-w-[12px] md:min-w-[14px] lg:min-w-[16px] h-[10px] sm:h-[12px] md:h-[14px] lg:h-[16px]'>
              <span className='text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] font-extrabold text-white leading-none'>
                !
              </span>
            </div>
          </motion.div>
        )}

        {/* Badge de alertas - esquina superior izquierda - Ultra pequeño en mobile */}
        {project.alertCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className='absolute top-0.5 left-0.5 sm:top-0.5 sm:left-0.5 md:top-1 md:left-1 lg:top-1.5 lg:left-1.5 z-20'
          >
            <div className='bg-red-500 rounded-full px-0.5 py-0.5 sm:px-0.5 sm:py-0.5 md:px-1 md:py-0.5 lg:px-1.5 lg:py-1 shadow-lg flex items-center gap-0.5 sm:gap-0.5 md:gap-1 border border-white/80 sm:border group-hover:scale-110 transition-transform min-w-[12px] sm:min-w-[14px] md:min-w-[16px] lg:min-w-[18px] justify-center'>
              <WarningIcon className='text-white' style={{ fontSize: '5px', width: '5px', height: '5px' }} />
              <span className='text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] xl:text-[9px] font-extrabold text-white leading-none'>
                {project.alertCount}
              </span>
            </div>
          </motion.div>
        )}

        {/* Contenido de la tarjeta - Máxima compresión en mobile */}
        <div className='relative h-full flex flex-col items-center justify-center p-0.5 sm:p-1 md:p-2 lg:p-3 text-center flex-1 min-h-0 z-10'>
          {/* Contenedor del icono - Ultra pequeño en mobile */}
          <div className='flex-shrink-0 mb-0.5 sm:mb-0.5 md:mb-1 lg:mb-2'>
            <div
              className={`${iconColorClass} w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <div className='w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6'>
                {getProjectIcon(project.nombre)}
              </div>
            </div>
          </div>

          {/* Contenedor del texto - Máximo de líneas para no perder contenido */}
          <div className='flex-1 flex items-center justify-center min-h-0 w-full px-0.5 sm:px-0.5 md:px-1 lg:px-2'>
            <h3
              className='text-white font-bold text-[6.5px] sm:text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] 2xl:text-xs leading-[1.08] sm:leading-[1.1] md:leading-[1.15] lg:leading-tight drop-shadow-lg break-words w-full'
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 8,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                textAlign: 'center',
              }}
            >
              {project.nombre.toUpperCase()}
            </h3>
          </div>
        </div>

        {/* Sombra sutil con color - Responsive */}
        <div
          className='absolute inset-0 rounded-md sm:rounded-lg md:rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none'
          style={{
            boxShadow: `0 10px 40px -10px ${cardColor}`,
          }}
        />
      </div>
    </motion.div>
  );
};
