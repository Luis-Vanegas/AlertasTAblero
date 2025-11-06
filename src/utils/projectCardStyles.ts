/**
 * Utilidades de estilos para las tarjetas de proyecto
 */

import React from 'react';

/**
 * Mapeo de colores hexadecimales a clases de Tailwind para iconos
 */
const COLOR_TO_CLASS_MAP: Record<string, string> = {
  '#14A9E1': 'bg-cyan-600',
  '#FC6909': 'bg-orange-600',
  '#7AD300': 'bg-green-600',
} as const;

const DEFAULT_ICON_COLOR = 'bg-cyan-600';

/**
 * Obtiene la clase de Tailwind para el color del icono
 * @param color - Color hexadecimal
 * @returns Clase de Tailwind para el color del icono
 */
export const getIconColorClass = (color: string): string => {
  return COLOR_TO_CLASS_MAP[color] || DEFAULT_ICON_COLOR;
};

/**
 * Estilos inline para el texto del título
 */
export const TITLE_TEXT_STYLES: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 8,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  textAlign: 'center',
} as const;

/**
 * Clases CSS comunes para la tarjeta
 */
export const CARD_CLASSES = {
  container:
    'relative w-full h-full min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[150px] rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 flex flex-col',
  glassmorphism:
    'absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-md sm:rounded-lg md:rounded-xl group-hover:border-white/20 transition-all duration-300',
  overlay:
    'absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md sm:rounded-lg md:rounded-xl',
  shine: 'absolute inset-0 overflow-hidden rounded-md sm:rounded-lg md:rounded-xl',
  shineInner:
    'absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out',
  shineGradient: 'h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent',
  content:
    'relative h-full flex flex-col items-center justify-center p-0.5 sm:p-1 md:p-2 lg:p-3 text-center flex-1 min-h-0 z-10',
  iconContainer: 'flex-shrink-0 mb-0.5 sm:mb-0.5 md:mb-1 lg:mb-2',
  iconWrapper:
    'rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300',
  iconSizes: 'w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12',
  iconInnerSizes: 'w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6',
  textContainer:
    'flex-1 flex items-center justify-center min-h-0 w-full px-0.5 sm:px-0.5 md:px-1 lg:px-2',
  textTitle:
    'text-white font-bold text-[7.5px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[11px] 2xl:text-sm leading-[1.08] sm:leading-[1.1] md:leading-[1.15] lg:leading-tight drop-shadow-lg break-words w-full',
  shadow:
    'absolute inset-0 rounded-md sm:rounded-lg md:rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none',
} as const;
