/**
 * Componente de tarjeta de proyecto estratégico con estilo glassmorphism
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ProjectCard as ProjectCardType } from '../../types/home';
import { PROJECT_CARD_COLORS, PRIORITY_PROJECTS } from '../../constants';
import { ANIMATION_VARIANTS } from '../../constants';
import { normalizeProjectName } from '../../utils/textNormalize';
import { getProjectIcon } from '../../utils/projectIcons';
import { getIconColorClass, CARD_CLASSES, TITLE_TEXT_STYLES } from '../../utils/projectCardStyles';
import { ProjectCardBadge } from './ProjectCardBadge';

interface ProjectCardProps {
  project: ProjectCardType;
  index: number;
  onClick: (projectId: string, projectName: string) => void;
}

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
      {/* Tarjeta glassmorphism */}
      <div className={CARD_CLASSES.container}>
        {/* Base glassmorphism */}
        <div
          className={CARD_CLASSES.glassmorphism}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        />

        {/* Overlay de color en hover */}
        <div className={CARD_CLASSES.overlay} style={{ backgroundColor: cardColor }} />

        {/* Efecto shine */}
        <div className={CARD_CLASSES.shine}>
          <div className={CARD_CLASSES.shineInner}>
            <div className={CARD_CLASSES.shineGradient} />
          </div>
        </div>

        {/* Badge de prioridad */}
        {isPriority && <ProjectCardBadge position='top-right' content='!' />}

        {/* Badge de alertas */}
        {project.alertCount > 0 && (
          <ProjectCardBadge position='top-left' content={project.alertCount} showIcon />
        )}

        {/* Contenido de la tarjeta */}
        <div className={CARD_CLASSES.content}>
          {/* Contenedor del icono */}
          <div className={CARD_CLASSES.iconContainer}>
            <div
              className={`${iconColorClass} ${CARD_CLASSES.iconWrapper} ${CARD_CLASSES.iconSizes}`}
            >
              <div className={CARD_CLASSES.iconInnerSizes}>{getProjectIcon(project.nombre)}</div>
            </div>
          </div>

          {/* Contenedor del texto */}
          <div className={CARD_CLASSES.textContainer}>
            <h3 className={CARD_CLASSES.textTitle} style={TITLE_TEXT_STYLES}>
              {project.nombre.toUpperCase()}
            </h3>
          </div>
        </div>

        {/* Sombra sutil con color */}
        <div
          className={CARD_CLASSES.shadow}
          style={{
            boxShadow: `0 10px 40px -10px ${cardColor}`,
          }}
        />
      </div>
    </motion.div>
  );
};
