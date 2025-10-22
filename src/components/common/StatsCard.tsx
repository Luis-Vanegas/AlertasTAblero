/**
 * Componente reutilizable para tarjetas de estadísticas
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface StatsCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  color,
  icon,
  onClick,
  isSelected = false,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <div
        onClick={onClick}
        className={`
          relative p-4 sm:p-6 text-center bg-white/90 backdrop-blur-lg 
          border border-gray-200 rounded-xl transition-all duration-300
          ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-default'}
          ${isSelected ? 'ring-2 ring-cyan-500 scale-105' : ''}
          h-28 sm:h-32 flex flex-col justify-center
        `}
        style={{
          outline: isSelected ? `2px solid ${color}` : 'none',
        }}
      >
        <div className='flex items-center justify-center flex-1 mb-2'>
          <div
            className='flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full mr-3 shadow-lg border-2 border-white/80'
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div>
            <div className='text-2xl sm:text-3xl font-bold text-gray-800 leading-none'>{value}</div>
          </div>
        </div>
        <div className='text-sm font-medium text-gray-700 text-center flex-shrink-0'>{label}</div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
