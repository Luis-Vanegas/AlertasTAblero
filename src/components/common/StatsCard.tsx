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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div
        onClick={onClick}
        className={`
          relative bg-white rounded-lg border-2 shadow-md transition-all duration-300
          ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'cursor-default'}
          ${isSelected ? 'ring-2' : ''}
          p-3
        `}
        style={{
          borderColor: color,
          outline: isSelected ? `2px solid ${color}` : 'none',
        }}
      >
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <div
              className='w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0'
              style={{ backgroundColor: color }}
            >
              {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-responsive-sm font-bold text-gray-800 leading-tight'>{label}</h3>
              <p className='text-responsive-sm text-transparent mt-0.5 leading-tight line-clamp-1'>
                &nbsp;
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end flex-shrink-0'>
            <span className='text-responsive-xl font-bold' style={{ color: color }}>
              {value}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
