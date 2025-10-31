/**
 * Componente wrapper para páginas con animaciones consistentes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS, TRANSITIONS } from '../../constants';

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <motion.div
      initial={ANIMATION_VARIANTS.page.initial}
      animate={ANIMATION_VARIANTS.page.in}
      exit={ANIMATION_VARIANTS.page.out}
      variants={ANIMATION_VARIANTS.page}
      transition={TRANSITIONS.page}
    >
      {children}
    </motion.div>
  );
};
