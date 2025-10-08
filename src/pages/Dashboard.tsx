import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  useTheme,
  Alert,
  Button,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Download as DownloadIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useAlertas, useAlertasStats } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import { useSettingsStore } from '../store/settings';
import { formatDate } from '../utils/dateFormatting';
import { exportByDependency } from '../utils/export';
import { MappedAlerta } from '../types/api';
import DetailDrawer from '../components/DetailDrawer';
import StatsCard from '../components/common/StatsCard';
import AlertCard from '../components/common/AlertCard';
import { ANIMATION_VARIANTS, PRIORITY_PROJECTS } from '../constants';
import { isPriorityAlert } from '../utils/severity';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { filters, setFilters } = useSettingsStore();
  const [expandedDependencies, setExpandedDependencies] = useState<Set<string>>(
    new Set()
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState<MappedAlerta | null>(
    null
  );

  const { alertas, isLoading } = useAlertas({ limit: 1000 });
  const { isLoading: loadingStats } = useAlertasStats();

  // Usar el hook de filtros
  const {
    filteredAlertas,
    alertasPorDependencia,
    alertStats,
    prioritySummary,
  } = useFilters({
    alertas,
    filters,
  });

  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [hintShown, setHintShown] = useState(false);

  // Estado de carga combinado
  const loading = isLoading || loadingStats;

  // Handlers
  const handleToggleExpand = (dependencia: string) => {
    const newExpanded = new Set(expandedDependencies);
    if (newExpanded.has(dependencia)) {
      newExpanded.delete(dependencia);
    } else {
      newExpanded.add(dependencia);
    }
    setExpandedDependencies(newExpanded);
  };

  const handleExportByDependency = (dependency: string) => {
    exportByDependency(filteredAlertas, dependency);
  };

  const openDetail = (alerta: MappedAlerta) => {
    setSelectedAlerta(alerta);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
  };

  // Loading
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
      >
        <LinearProgress sx={{ width: '100%', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Cargando datos...
        </Typography>
      </Box>
    );
  }

  const handleCardFilter = (target: 'leve' | 'media' | 'crítica' | '') => {
    if (target === '') setFilters({ gravedad: [] });
    else setFilters({ gravedad: [target] });
    if (navigator?.vibrate) navigator.vibrate(10);
    if (isMobile && !hintShown && target) {
      enqueueSnackbar(
        `Filtro aplicado: ${target.charAt(0).toUpperCase() + target.slice(1)}`,
        { variant: 'info' }
      );
      setHintShown(true);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', px: { xs: 2.5, sm: 2, md: 0 } }}>
      <motion.div
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        {/* Header con estadísticas */}
        <motion.div variants={ANIMATION_VARIANTS.item}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 4 },
              mb: { xs: 2, md: 4 },
              backgroundColor: 'rgba(245, 247, 249, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid rgba(0, 0, 0, 0.05)',
              mx: { xs: 0, md: 'auto' },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    color: theme.palette.text.primary,
                    mb: 1,
                    fontSize: { xs: '1.6rem', md: '2rem' },
                  }}
                >
                  Dashboard de Alertas
                </Typography>
                {/* Subtítulo removido para simplificar encabezado */}
              </motion.div>
              {/* Botón actualizar duplicado removido (queda solo en AppBar) */}
            </Box>

            {/* Tarjetas de estadísticas por gravedad real + total */}
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="stretch">
              <Grid item xs={12} sm={6} md={6} lg={3}>
                <StatsCard
                  label="Leves"
                  value={alertStats.leve}
                  color={theme.palette.info.main}
                  icon={<InfoOutlinedIcon />}
                  onClick={() => handleCardFilter('leve')}
                  isSelected={
                    filters.gravedad.length === 1 &&
                    filters.gravedad[0] === 'leve'
                  }
                  delay={0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={3}>
                <StatsCard
                  label="Moderadas"
                  value={alertStats.media}
                  color={theme.palette.warning.main}
                  icon={<WarningIcon />}
                  onClick={() => handleCardFilter('media')}
                  isSelected={
                    filters.gravedad.length === 1 &&
                    filters.gravedad[0] === 'media'
                  }
                  delay={0.1}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={3}>
                <StatsCard
                  label="Críticas"
                  value={alertStats.alta}
                  color={theme.palette.error.main}
                  icon={<ErrorIcon />}
                  onClick={() => handleCardFilter('crítica')}
                  isSelected={
                    filters.gravedad.length === 1 &&
                    filters.gravedad[0] === 'crítica'
                  }
                  delay={0.2}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={3}>
                <StatsCard
                  label="Total Alertas"
                  value={alertStats.total}
                  color={theme.palette.primary.main}
                  icon={<AssignmentIcon />}
                  onClick={() => handleCardFilter('')}
                  isSelected={filters.gravedad.length === 0}
                  delay={0.3}
                />
              </Grid>
            </Grid>

            {/* Proyectos estratégicos con incidentes */}
            {prioritySummary.length > 0 && (
              <Box sx={{ mt: { xs: 2, md: 3 }, mb: { xs: 1.5, md: 2 } }}>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      borderLeft: `6px solid ${theme.palette.error.main}`,
                    }}
                    aria-live="polite"
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ mb: 1 }}
                    >
                      Proyectos estratégicos con alertas
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {prioritySummary.map(([proj, c]) => (
                        <motion.div
                          key={proj}
                          layout
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Chip
                            icon={<AssignmentIcon fontSize="small" />}
                            label={`${proj} (${c.total})`}
                            onClick={() =>
                              setFilters({
                                priorityProject: proj,
                                gravedad: ['media', 'crítica', 'alta'],
                              })
                            }
                            variant={
                              filters.priorityProject === proj
                                ? 'filled'
                                : 'outlined'
                            }
                            color={c.critica > 0 ? 'error' : 'warning'}
                            sx={{
                              textTransform: 'capitalize',
                              cursor: 'pointer',
                            }}
                          />
                        </motion.div>
                      ))}
                      <Chip
                        label="Quitar filtro"
                        onClick={() =>
                          setFilters({ priorityProject: '', gravedad: [] })
                        }
                        variant={
                          filters.priorityProject === '' ? 'filled' : 'outlined'
                        }
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </Paper>
                </motion.div>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Sección de filtros eliminada: los filtros viven en el panel lateral */}

        {/* Lista de Alertas por Dependencia */}
        <motion.div variants={ANIMATION_VARIANTS.item}>
          {alertasPorDependencia.length === 0 ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(245, 247, 249, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6">No se encontraron alertas</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Total alertas: {alertas.length} | Filtradas:{' '}
                  {filteredAlertas.length} | Grupos:{' '}
                  {alertasPorDependencia.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Búsqueda: "{filters.searchTerm}" | Dep: "
                  {filters.dependencia?.join(', ') || 'Todas'}" | Sev: "
                  {filters.gravedad?.join(', ') || 'Todas'}"
                </Typography>
              </Alert>
            </motion.div>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {alertasPorDependencia.map(grupo => (
                <Grid item xs={12} key={grupo.dependencia}>
                  <motion.div
                    variants={ANIMATION_VARIANTS.item}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card
                      elevation={2}
                      sx={{
                        mb: 3,
                        overflow: 'hidden',
                        borderRadius: 2,
                        backgroundColor: 'rgba(245, 247, 249, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={2}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 40,
                                height: 40,
                              }}
                            >
                              <BusinessIcon sx={{ color: 'white' }} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{
                                  color: theme.palette.text.primary,
                                  mb: 0.5,
                                }}
                              >
                                {grupo.dependencia}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.palette.text.secondary,
                                }}
                              >
                                {grupo.total} alertas • Última actualización:{' '}
                                {formatDate(new Date(), 'HH:mm')}
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" gap={1}>
                            <Chip
                              label={`${grupo.altas} Críticas`}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.error.main,
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                            <Chip
                              label={`${grupo.medias} Moderadas`}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.warning.main,
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                            <Chip
                              label={`${grupo.leves} Leves`}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.info.main,
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                            <Button
                              onClick={() =>
                                handleExportByDependency(grupo.dependencia)
                              }
                              startIcon={<DownloadIcon />}
                              size="small"
                              variant="outlined"
                            >
                              Exportar
                            </Button>
                          </Box>
                        </Box>

                        <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

                        <Grid
                          container
                          spacing={{ xs: 3, sm: 2.5 }}
                          alignItems="stretch"
                        >
                          {(expandedDependencies.has(grupo.dependencia)
                            ? grupo.alertas
                            : grupo.alertas.slice(0, 6)
                          ).map(alerta => {
                            const isPriority = isPriorityAlert(
                              alerta,
                              PRIORITY_PROJECTS
                            );

                            return (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={6}
                                lg={4}
                                key={alerta.id}
                                sx={{ display: 'flex' }}
                              >
                                <AlertCard
                                  alerta={alerta}
                                  onViewDetails={openDetail}
                                  isPriority={isPriority}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>

                        {grupo.alertas.length > 6 && (
                          <Box mt={2} textAlign="center">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleToggleExpand(grupo.dependencia)
                              }
                              aria-expanded={expandedDependencies.has(
                                grupo.dependencia
                              )}
                              aria-controls={`grupo-${grupo.dependencia.replace(/\s+/g, '-')}`}
                            >
                              {expandedDependencies.has(grupo.dependencia)
                                ? 'Ver menos'
                                : `Ver ${grupo.alertas.length - 6} más`}
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </motion.div>

      <DetailDrawer
        open={detailOpen}
        onClose={closeDetail}
        alerta={selectedAlerta}
      />
    </Box>
  );
};

export default Dashboard;
