/**
 * Componente reutilizable para botones de navegación
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';

interface NavigationButtonProps {
  /** Icono del botón */
  icon: React.ReactElement;
  /** Título del botón */
  title: string;
  /** Descripción del botón */
  description: string;
  /** Color del tema (cyan o blue) */
  color: 'cyan' | 'blue';
  /** Si está activo (en la página home) */
  isActive?: boolean;
  /** Función onClick */
  onClick: () => void;
}

const BUTTON_ANIMATION = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 },
};

const COLOR_CONFIG = {
  cyan: {
    iconBg: 'bg-cyan-500/20',
    iconBgHover: 'group-hover:bg-cyan-500/30',
    iconColor: 'text-cyan-600',
    gradient: 'from-cyan-500/0 via-cyan-500/10 to-cyan-500/0',
    gradientHover:
      'group-hover:from-cyan-500/10 group-hover:via-cyan-500/20 group-hover:to-cyan-500/10',
  },
  blue: {
    iconBg: 'bg-blue-500/20',
    iconBgHover: 'group-hover:bg-blue-500/30',
    iconColor: 'text-blue-600',
    gradient: 'from-blue-500/0 via-blue-500/10 to-blue-500/0',
    gradientHover:
      'group-hover:from-blue-500/10 group-hover:via-blue-500/20 group-hover:to-blue-500/10',
  },
} as const;

const BASE_BUTTON_CLASSES =
  'relative group overflow-hidden rounded-xl px-6 py-4 sm:px-8 sm:py-5 backdrop-blur-md border-2 transition-all duration-300';

const ACTIVE_BUTTON_CLASSES = 'bg-white/90 border-white/50 text-gray-800 shadow-xl';

const INACTIVE_BUTTON_CLASSES =
  'bg-white/80 border-white/30 text-gray-700 hover:bg-white/95 shadow-lg';

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  icon,
  title,
  description,
  color,
  isActive = false,
  onClick,
}) => {
  const colorConfig = COLOR_CONFIG[color];
  const buttonClasses = isActive
    ? `${BASE_BUTTON_CLASSES} ${ACTIVE_BUTTON_CLASSES}`
    : `${BASE_BUTTON_CLASSES} ${INACTIVE_BUTTON_CLASSES}`;

  return (
    <motion.button {...BUTTON_ANIMATION} onClick={onClick} className={buttonClasses}>
      <div className='relative z-10 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div
            className={`p-2 rounded-lg ${colorConfig.iconBg} ${colorConfig.iconBgHover} transition-colors`}
          >
            <div className={colorConfig.iconColor}>{icon}</div>
          </div>
          <div className='text-left'>
            <h3 className='font-bold text-lg sm:text-xl text-gray-900'>{title}</h3>
            <p className='text-sm text-gray-600'>{description}</p>
          </div>
        </div>
        <ArrowIcon className='text-gray-600 group-hover:translate-x-1 transition-transform' />
      </div>
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colorConfig.gradient} ${colorConfig.gradientHover} transition-all duration-500`}
      />
    </motion.button>
  );
};
