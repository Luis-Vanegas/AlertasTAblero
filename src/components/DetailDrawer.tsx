import React from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Stack,
  useTheme,
  Tooltip,
} from '@mui/material'
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  ReportProblem as ImpactIcon,
  WarningAmber as GravedadIcon,
  ChangeCircle as CambioIcon,
} from '@mui/icons-material'
import { MappedAlerta } from '../types/api'
import { formatDate, formatRelativeTime } from '../utils/dateFormatting'

interface DetailDrawerProps {
  open: boolean
  onClose: () => void
  alerta: MappedAlerta | null
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ open, onClose, alerta }) => {
  const theme = useTheme()
  const labelSx = { color: 'text.secondary', fontWeight: 600, minWidth: 170 }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 520,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
        }
      }}
    >
      <Box sx={{ p: 3 }} role="dialog" aria-labelledby="detalle-alerta-title">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: 'sticky', top: 0, backgroundColor: 'inherit', zIndex: 1, pb: 1 }}
        >
          <Box>
            <Typography id="detalle-alerta-title" variant="h6" fontWeight={800}>
              Detalle de la alerta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {alerta ? alerta.nombre_obra : ''}
            </Typography>
          </Box>
          <Tooltip title="Cerrar">
            <IconButton aria-label="Cerrar" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }} />

        {alerta && (
          <Stack spacing={2}>
            <Box display="flex" gap={2} alignItems="center">
              <BusinessIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="body2" sx={labelSx}>Dependencia</Typography>
              <Typography variant="body2">{alerta.dependencia}</Typography>
            </Box>

            <Box>
              <Box display="flex" gap={2} alignItems="center" mb={0.5}>
                <DescriptionIcon sx={{ color: theme.palette.secondary.main }} />
                <Typography variant="body2" sx={labelSx}>Descripción</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {alerta.descripcion_alerta || 'Sin descripción'}
              </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <EventIcon sx={{ color: theme.palette.info.main }} />
              <Typography variant="body2" sx={labelSx}>Fecha de la alerta</Typography>
              <Typography variant="body2">{formatDate(alerta.fecha_alerta)}</Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <UpdateIcon sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={labelSx}>Última actualización</Typography>
              <Typography variant="body2">
                {formatDate(alerta.fecha_actualizacion)}
                {alerta.fecha_actualizacion ? ` • ${formatRelativeTime(alerta.fecha_actualizacion)}` : ''}
              </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <ImpactIcon sx={{ color: theme.palette.info.main }} />
              <Typography variant="body2" sx={labelSx}>Impacto</Typography>
              <Chip size="small" label={alerta.impacto_riesgo || '—'} color="info" variant="outlined" />
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <GravedadIcon sx={{ color: theme.palette.warning.main }} />
              <Typography variant="body2" sx={labelSx}>Gravedad</Typography>
              <Chip size="small" label={alerta.gravedad || '—'} color="warning" variant="outlined" />
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <CambioIcon sx={{ color: alerta.genera_cambio_proyecto ? theme.palette.error.main : theme.palette.text.secondary }} />
              <Typography variant="body2" sx={labelSx}>Genera cambio</Typography>
              <Chip
                size="small"
                label={alerta.genera_cambio_proyecto ? 'Sí' : 'No'}
                color={alerta.genera_cambio_proyecto ? 'error' : 'default'}
                variant={alerta.genera_cambio_proyecto ? 'filled' : 'outlined'}
              />
            </Box>

            {alerta.descripcion_cambio && (
              <Box>
                <Box display="flex" gap={2} alignItems="center" mb={0.5}>
                  <CambioIcon sx={{ color: theme.palette.error.main }} />
                  <Typography variant="body2" sx={labelSx}>Descripción del cambio</Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{alerta.descripcion_cambio}</Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Drawer>
  )
}

export default DetailDrawer


