/**
 * Botón flotante para volver arriba
 *
 * Muestra un botón flotante que permite hacer scroll al inicio de la página.
 *
 * @component
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface ScrollToTopButtonProps {
  /** Si el botón debe estar visible */
  visible: boolean;
}

/**
 * Componente que muestra un botón flotante para volver arriba
 */
const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ visible }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return createPortal(
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      onClick={scrollToTop}
      className='fixed bottom-6 right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 z-[9999] bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-300'
      aria-label='Volver arriba'
    >
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M5 10l7-7m0 0l7 7m-7-7v18'
        />
      </svg>
    </motion.button>,
    document.body
  );
};

export default ScrollToTopButton;
