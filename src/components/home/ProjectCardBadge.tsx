/**
 * Componente reutilizable para badges en las tarjetas de proyecto
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ProjectCardBadgeProps {
  /** Posición del badge: 'top-left' | 'top-right' */
  position: 'top-left' | 'top-right';
  /** Contenido del badge (texto o número) */
  content: string | number;
  /** Mostrar icono de advertencia */
  showIcon?: boolean;
  /** Animación personalizada */
  animationDelay?: number;
  /** Clase CSS adicional */
  className?: string;
}

const BADGE_ANIMATION = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { delay: 0.1, type: 'spring' as const, stiffness: 200 },
};

const BADGE_BASE_CLASSES =
  'bg-red-500 rounded-full shadow-lg flex items-center justify-center border border-white/80 text-white font-extrabold leading-none';

const POSITION_CLASSES = {
  'top-left': 'absolute top-0.5 left-0.5 sm:top-0.5 sm:left-0.5 md:top-1 md:left-1 lg:top-1.5 lg:left-1.5',
  'top-right':
    'absolute top-0.5 right-0.5 sm:top-0.5 sm:right-0.5 md:top-1 md:right-1 lg:top-1.5 lg:right-1.5',
};

const SIZE_CLASSES = {
  container: 'min-w-[10px] sm:min-w-[12px] md:min-w-[14px] lg:min-w-[16px] h-[10px] sm:h-[12px] md:h-[14px] lg:h-[16px]',
  containerWithIcon:
    'min-w-[12px] sm:min-w-[14px] md:min-w-[16px] lg:min-w-[18px]',
  text: 'text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px]',
  icon: 'w-[5px] h-[5px]',
  padding: 'px-0.5 py-0.5 sm:px-0.5 sm:py-0.5 md:px-1 md:py-0.5 lg:px-1.5 lg:py-1',
  gap: 'gap-0.5 sm:gap-0.5 md:gap-1',
} as const;

const ICON_STYLES: React.CSSProperties = {
  fontSize: '5px',
  width: '5px',
  height: '5px',
} as const;

export const ProjectCardBadge: React.FC<ProjectCardBadgeProps> = ({
  position,
  content,
  showIcon = false,
  animationDelay = 0.1,
  className = '',
}) => {
  const hasIcon = showIcon;
  const containerSizeClass = hasIcon
    ? SIZE_CLASSES.containerWithIcon
    : SIZE_CLASSES.container;

  return (
    <motion.div
      {...BADGE_ANIMATION}
      transition={{
        ...BADGE_ANIMATION.transition,
        delay: animationDelay,
      }}
      className={`${POSITION_CLASSES[position]} z-20 ${className}`}
    >
      <div
        className={`${BADGE_BASE_CLASSES} ${containerSizeClass} ${SIZE_CLASSES.padding} ${
          hasIcon ? SIZE_CLASSES.gap : ''
        } ${hasIcon ? 'group-hover:scale-110 transition-transform' : ''}`}
      >
        {hasIcon && (
          <WarningIcon className={SIZE_CLASSES.icon} style={ICON_STYLES} />
        )}
        <span className={SIZE_CLASSES.text}>{content}</span>
      </div>
    </motion.div>
  );
};

