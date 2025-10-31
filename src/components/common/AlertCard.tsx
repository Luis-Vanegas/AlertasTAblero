/**
 * Componente reutilizable para tarjetas de alertas
 */

import React from 'react';
import {
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Schedule as TimeIcon,
  TrackChanges as TargetIcon,
  Groups as GroupsIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { MappedAlerta } from '../../types/api';
import { extractImpacts, getImpactMeta, normalizeGravedad } from '../../utils/severity';
import { formatDate } from '../../utils/dateFormatting';

export interface AlertCardProps {
  alerta: MappedAlerta;
  onViewDetails: (alerta: MappedAlerta) => void;
  isPriority?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ alerta, onViewDetails, isPriority = false }) => {
  const sev = normalizeGravedad(alerta.gravedad);
  const priorityActive = isPriority && (sev === 'media' || sev === 'crítica' || sev === 'alta');

  const getGravedadColor = (g?: string | null) => {
    const n = normalizeGravedad(g);
    if (n === 'crítica' || n === 'alta') return 'bg-red-500';
    if (n === 'media') return 'bg-yellow-500';
    if (n === 'leve' || n === 'baja') return 'bg-blue-500';
    if (n === 'sin_riesgo') return 'bg-green-100 text-green-700 border border-green-300';
    return 'bg-gray-500';
  };

  const getGravedadBorderColor = (g?: string | null) => {
    const n = normalizeGravedad(g);
    if (n === 'crítica' || n === 'alta') return 'border-red-500';
    if (n === 'media') return 'border-yellow-500';
    if (n === 'leve' || n === 'baja') return 'border-blue-500';
    if (n === 'sin_riesgo') return 'border-green-300';
    return 'border-gray-500';
  };

  return (
    <motion.div className='w-full h-full flex min-h-0'>
      <div
        onClick={() => onViewDetails(alerta)}
        className={`
          relative p-2 sm:p-2.5 md:p-3 bg-white/80 backdrop-blur-sm rounded-lg cursor-pointer
          transition-all duration-200 hover:bg-white/95 hover:shadow-lg
          flex flex-col h-full w-full
          ${
            priorityActive
              ? `border-l-4 ${sev === 'media' ? 'border-yellow-500' : 'border-red-500'} shadow-lg`
              : `border-l-4 ${getGravedadBorderColor(alerta.gravedad)}`
          }
        `}
      >
        {/* Header con chips y botón - Compacto */}
        <div className='flex items-start justify-between mb-1.5 flex-shrink-0'>
          <div className='flex items-center gap-1.5 flex-wrap flex-1 min-w-0'>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold text-white ${getGravedadColor(alerta.gravedad)} whitespace-nowrap`}
            >
              {(alerta.gravedad || 'sin dato').toUpperCase()}
            </span>

            {extractImpacts(alerta.impacto_riesgo)
              .slice(0, 2)
              .map(imp => {
                const meta = getImpactMeta(imp);
                const IconComponent =
                  {
                    AttachMoney: MoneyIcon,
                    Schedule: TimeIcon,
                    TrackChanges: TargetIcon,
                    Groups: GroupsIcon,
                    InfoOutlined: InfoOutlinedIcon,
                  }[meta.icon] || InfoOutlinedIcon;

                return (
                  <span
                    key={imp}
                    className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs border flex-shrink-0'
                    style={{
                      borderColor: meta.color,
                      color: meta.color,
                    }}
                  >
                    <IconComponent className='w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5' />
                    <span className='hidden sm:inline'>{meta.label}</span>
                  </span>
                );
              })}

            {priorityActive && (
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 1.2, repeat: 2 }}
                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 ${
                  sev === 'media'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                <InfoOutlinedIcon className='w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5' />
                <span className='hidden sm:inline'>Estratégico</span>
              </motion.span>
            )}
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              onViewDetails(alerta);
            }}
            className='p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0'
            title='Ver detalle'
          >
            <VisibilityIcon className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
          </button>
        </div>

        {/* Título de la obra - Más compacto */}
        <h3 className='text-[11px] sm:text-xs md:text-sm font-bold text-gray-800 mb-1.5 line-clamp-2 flex-shrink-0'>
          {alerta.nombre_obra}
        </h3>

        {/* Descripción - Más compacta */}
        <p className='text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-2 flex-grow min-h-0'>
          {alerta.descripcion_alerta}
        </p>

        {/* Footer con comuna y fecha - Más compacto */}
        <div className='flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mt-auto flex-shrink-0'>
          <span className='truncate flex-1 mr-2'>{alerta.comuna}</span>
          <span className='flex-shrink-0'>{formatDate(alerta.fecha_alerta, 'dd/MM')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertCard;
