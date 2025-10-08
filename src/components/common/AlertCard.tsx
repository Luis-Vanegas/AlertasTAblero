/**
 * Componente reutilizable para tarjetas de alertas
 */

import React from 'react';
import { Card, Box, Typography, Chip, IconButton, Tooltip, useTheme } from '@mui/material';
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
  const theme = useTheme();

  const sev = normalizeGravedad(alerta.gravedad);
  const priorityActive = isPriority && (sev === 'media' || sev === 'crítica' || sev === 'alta');

  const getGravedadColor = (g?: string | null) => {
    const n = normalizeGravedad(g);
    if (n === 'crítica' || n === 'alta') return theme.palette.error.main;
    if (n === 'media') return theme.palette.warning.main;
    if (n === 'leve' || n === 'baja') return theme.palette.info.main;
    return theme.palette.grey[500];
  };

  return (
    <motion.div style={{ width: '100%', height: '100%' }}>
      <Card
        onClick={() => onViewDetails(alerta)}
        sx={{
          p: { xs: 2, sm: 2 },
          borderLeft: priorityActive
            ? `6px solid ${sev === 'media' ? theme.palette.warning.main : theme.palette.error.main}`
            : `4px solid ${getGravedadColor(alerta.gravedad)}`,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(5px)',
          transition: 'background-color 0.2s ease',
          cursor: 'pointer',
          boxShadow: priorityActive
            ? `0 0 0 4px rgba(255,0,0,0.08), 0 8px 24px rgba(0,0,0,0.18)`
            : `0 2px 8px rgba(0,0,0,0.1)`,
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 200, sm: 220 },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        }}
      >
        <Box display='flex' alignItems='flex-start' justifyContent='space-between' mb={1}>
          <Box display='flex' alignItems='center' gap={1}>
            <Chip
              label={(alerta.gravedad || 'sin dato').toUpperCase()}
              size='small'
              sx={{
                fontWeight: 'bold',
                fontSize: '0.7rem',
                backgroundColor: getGravedadColor(alerta.gravedad),
                color: 'white',
              }}
            />
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
                  <Chip
                    key={imp}
                    icon={<IconComponent fontSize='small' />}
                    label={meta.label}
                    size='small'
                    sx={{
                      borderColor: meta.color,
                      color: meta.color,
                      '& .MuiChip-icon': {
                        color: meta.color,
                      },
                    }}
                    variant='outlined'
                  />
                );
              })}
            {priorityActive && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 1.2, repeat: 2 }}
              >
                <Chip
                  icon={<InfoOutlinedIcon fontSize='small' />}
                  label='Estrategico'
                  size='small'
                  color={sev === 'media' ? 'warning' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
              </motion.div>
            )}
          </Box>
          <Tooltip title='Ver detalle'>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation();
                onViewDetails(alerta);
              }}
            >
              <VisibilityIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography
          variant='h6'
          fontWeight='bold'
          sx={{
            color: theme.palette.text.primary,
            mb: 1,
            fontSize: { xs: '1rem', md: '1rem' },
            display: '-webkit-box',
            WebkitLineClamp: { xs: 2, md: 1 },
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {alerta.nombre_obra}
        </Typography>

        <Typography
          variant='body2'
          sx={{
            color: theme.palette.text.secondary,
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: { xs: 3, md: 2 },
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexGrow: 1,
            lineHeight: 1.3,
            fontSize: { xs: '0.85rem', md: '0.875rem' },
          }}
        >
          {alerta.descripcion_alerta}
        </Typography>

        <Box display='flex' gap={1} flexWrap='nowrap' alignItems='center' sx={{ minWidth: 0 }}>
          <Box display='flex' alignItems='center' gap={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant='caption'
              noWrap
              sx={{
                color: theme.palette.text.secondary,
                minWidth: 0,
                flex: 1,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {alerta.comuna}
            </Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5} sx={{ flexShrink: 0 }}>
            <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
              {formatDate(alerta.fecha_alerta, 'dd/MM')}
            </Typography>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

export default AlertCard;
