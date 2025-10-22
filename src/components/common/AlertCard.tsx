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
    return 'bg-gray-500';
  };

  const getGravedadBorderColor = (g?: string | null) => {
    const n = normalizeGravedad(g);
    if (n === 'crítica' || n === 'alta') return 'border-red-500';
    if (n === 'media') return 'border-yellow-500';
    if (n === 'leve' || n === 'baja') return 'border-blue-500';
    return 'border-gray-500';
  };

  return (
    <motion.div className='w-full h-full'>
      <div
        onClick={() => onViewDetails(alerta)}
        className={`
          relative p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-lg cursor-pointer
          transition-all duration-200 hover:bg-white/95 hover:shadow-lg
          flex flex-col h-40 sm:h-48
          ${
            priorityActive
              ? `border-l-4 ${sev === 'media' ? 'border-yellow-500' : 'border-red-500'} shadow-lg`
              : `border-l-4 ${getGravedadBorderColor(alerta.gravedad)}`
          }
        `}
      >
        {/* Header con chips y botón */}
        <div className='flex items-start justify-between mb-2'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getGravedadColor(alerta.gravedad)}`}
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
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs border'
                    style={{
                      borderColor: meta.color,
                      color: meta.color,
                    }}
                  >
                    <IconComponent className='w-3 h-3 mr-1' />
                    {meta.label}
                  </span>
                );
              })}

            {priorityActive && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 1.2, repeat: 2 }}
              >
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    sev === 'media'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  <InfoOutlinedIcon className='w-3 h-3 mr-1' />
                  Estratégico
                </span>
              </motion.div>
            )}
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              onViewDetails(alerta);
            }}
            className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
            title='Ver detalle'
          >
            <VisibilityIcon className='w-4 h-4' />
          </button>
        </div>

        {/* Título de la obra */}
        <h3 className='text-sm sm:text-base font-bold text-gray-800 mb-2 line-clamp-2'>
          {alerta.nombre_obra}
        </h3>

        {/* Descripción */}
        <p className='text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3 flex-grow'>
          {alerta.descripcion_alerta}
        </p>

        {/* Footer con comuna y fecha */}
        <div className='flex items-center justify-between text-xs text-gray-500 mt-auto'>
          <span className='truncate flex-1 mr-2'>{alerta.comuna}</span>
          <span className='flex-shrink-0'>{formatDate(alerta.fecha_alerta, 'dd/MM')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertCard;
