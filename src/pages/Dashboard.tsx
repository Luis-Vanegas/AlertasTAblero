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
  Button,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  Download as DownloadIcon,
  InfoOutlined as InfoOutlinedIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  MoneyOff as MoneyOffIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useAlertas, useAlertasStats } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import { useProjectMetrics } from '../hooks/useProjectMetrics';
import { useCambiosFechasEstimadas, useCambiosPresupuesto } from '../hooks/useHistorico';
import { useSettingsStore } from '../store/settings';
import { alertasApiService } from '../services/alertasApi';
import { obrasApiService } from '../services/obrasApi';
import { formatDate } from '../utils/dateFormatting';
import { exportByDependency } from '../utils/export';
import { formatCurrency, parseCurrency } from '../utils/currencyFormatting';
import { MappedAlerta } from '../types/api';
import DetailDrawer from '../components/DetailDrawer';
import StatsCard from '../components/common/StatsCard';
import AlertCard from '../components/common/AlertCard';
import { ANIMATION_VARIANTS, PRIORITY_PROJECTS } from '../constants';
import { isPriorityAlert } from '../utils/severity';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { filters, setFilters } = useSettingsStore();
  const [expandedDependencies, setExpandedDependencies] = useState<Set<string>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState<MappedAlerta | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showCambiosFechas, setShowCambiosFechas] = useState(false);
  const [showCambiosPresupuesto, setShowCambiosPresupuesto] = useState(false);

  const { alertas, isLoading } = useAlertas({ limit: 1000 });
  const { isLoading: loadingStats } = useAlertasStats();
  const { metrics: projectMetrics, isLoading: loadingMetrics } = useProjectMetrics();
  const {
    total_cambios: cambiosFechas,
    cambios: cambiosFechasLista,
    isLoading: loadingCambios,
  } = useCambiosFechasEstimadas();
  const {
    total_cambios: cambiosPresupuesto,
    cambios: cambiosPresupuestoLista,
    isLoading: loadingPresupuesto,
  } = useCambiosPresupuesto();

  // Usar el hook de filtros
  const { filteredAlertas, alertasPorDependencia, alertStats } = useFilters({
    alertas,
    filters,
  });

  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [hintShown, setHintShown] = useState(false);

  // Estado de carga combinado
  const loading =
    isLoading || loadingStats || loadingMetrics || loadingCambios || loadingPresupuesto;

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filters.gravedad.length > 0 ||
    filters.dependencia.length > 0 ||
    (filters.comuna && filters.comuna.length > 0) ||
    filters.impacto.length > 0 ||
    filters.searchTerm ||
    (filters.obraIds && filters.obraIds.length > 0);

  // Debug removido

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

  const handleCardFilter = (target: 'leve' | 'media' | 'crítica' | '') => {
    if (target === '') setFilters({ gravedad: [] });
    else setFilters({ gravedad: [target] });
    if (navigator?.vibrate) navigator.vibrate(10);
    if (isMobile && !hintShown && target) {
      enqueueSnackbar(`Filtro aplicado: ${target.charAt(0).toUpperCase() + target.slice(1)}`, {
        variant: 'info',
      });
      setHintShown(true);
    }
  };

  // Función para limpiar todos los filtros
  const handleClearAllFilters = () => {
    setFilters({
      gravedad: [],
      dependencia: [],
      comuna: [],
      impacto: [],
      searchTerm: '',
      obraIds: [],
    });
    setActiveFilterType(null);
    setShowCambiosFechas(false);
    setShowCambiosPresupuesto(false);
    enqueueSnackbar('Todos los filtros han sido limpiados', { variant: 'info' });
  };

  // Funciones de filtrado para las tarjetas de métricas
  const handleMetricFilter = (filterType: string) => {
    if (!projectMetrics) {
      enqueueSnackbar('No hay métricas disponibles', { variant: 'warning' });
      return;
    }

    // Establecer el tipo de filtro activo
    setActiveFilterType(filterType);

    switch (filterType) {
      case 'budget':
        // Mostrar la lista de cambios de presupuesto
        setShowCambiosPresupuesto(true);
        setActiveFilterType('budget');
        enqueueSnackbar(`Mostrando ${cambiosPresupuesto} obras con cambios de presupuesto > 500M`, {
          variant: 'info',
        });
        break;
      case 'delayed':
        // Filtrar solo las obras con retrasos > 2 meses
        setFilters({
          obraIds: projectMetrics.delayedProjects.obraIds,
          gravedad: [],
          impacto: [],
        });
        enqueueSnackbar(
          `Filtro aplicado: ${projectMetrics.delayedProjects.obraIds.length} obras con retrasos > 2 meses`,
          { variant: 'info' }
        );
        break;
      case 'delayed2months':
        // Mostrar la lista de cambios de fechas estimadas
        setShowCambiosFechas(true);
        setActiveFilterType('delayed2months');
        enqueueSnackbar(`Mostrando ${cambiosFechas} obras con cambios de fechas > 2 meses`, {
          variant: 'info',
        });
        break;
      case 'defunded':
        // Filtrar solo las obras desfinanciadas
        setFilters({
          obraIds: projectMetrics.defundedProjects.obraIds,
          gravedad: [],
          impacto: [],
        });
        enqueueSnackbar(
          `Filtro aplicado: ${projectMetrics.defundedProjects.obraIds.length} obras desfinanciadas`,
          { variant: 'info' }
        );
        break;
      case 'late':
        // Filtrar solo las obras que terminan después de 01/07/2027
        setFilters({
          obraIds: projectMetrics.lateProjects.obraIds,
          gravedad: [],
          impacto: [],
        });
        enqueueSnackbar(
          `Filtro aplicado: ${projectMetrics.lateProjects.obraIds.length} obras que terminan después de 01/07/2027`,
          { variant: 'info' }
        );
        break;
      case 'definition':
        // Filtrar solo las obras pendientes de definición
        setFilters({
          obraIds: projectMetrics.pendingDefinitionProjects.obraIds,
          gravedad: [],
          impacto: [],
        });
        enqueueSnackbar(
          `Filtro aplicado: ${projectMetrics.pendingDefinitionProjects.obraIds.length} obras pendientes de definición`,
          { variant: 'info' }
        );
        break;
      default:
        setFilters({ gravedad: [], impacto: [], obraIds: [] });
    }
    if (navigator?.vibrate) navigator.vibrate(10);
  };

  // Loading
  if (loading) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight='50vh'
      >
        <LinearProgress sx={{ width: '100%', mb: 2 }} />
        <Typography variant='body1' color='text.secondary'>
          Cargando datos...
        </Typography>
      </Box>
    );
  }

  // Función global para análisis de APIs (solo para desarrollo)
  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).analyzeAPIs = async (): Promise<unknown> => {
      console.log('🔍 ANÁLISIS COMPLETO DE APIs');
      console.log('============================');

      try {
        // Obtener datos de alertas
        const alertasResponse = await alertasApiService.getAlertas();
        const alertas = alertasResponse.data || [];
        console.log('📊 ALERTAS:', alertas.length, 'registros');

        // Obtener datos de obras
        const obras = await obrasApiService.getObras();
        console.log('🏗️ OBRAS:', obras.length, 'registros');

        // Analizar campos comunes
        const alertaFields = alertas.length > 0 ? Object.keys(alertas[0]) : [];
        const obraFields = obras.length > 0 ? Object.keys(obras[0]) : [];
        const commonFields = alertaFields.filter(field => obraFields.includes(field));

        console.log('🔗 CAMPOS COMUNES:', commonFields);

        // Buscar coincidencias por diferentes campos
        const matches = {
          byIdObra: 0,
          byNombre: 0,
          byProyectoEstrategico: 0,
          byDependencia: 0,
        };

        // Coincidencias por ID OBRA
        alertas.forEach(alerta => {
          const alertaIdObra = alerta['ID OBRA'];
          const matchingObras = obras.filter(
            obra => String(obra['ID OBRA']) === String(alertaIdObra)
          );
          if (matchingObras.length > 0) matches.byIdObra++;
        });

        // Coincidencias por NOMBRE
        alertas.forEach(alerta => {
          const alertaNombre = alerta['NOMBRE OBRA'];
          const matchingObras = obras.filter(
            obra => String(obra['NOMBRE OBRA'] || obra['NOMBRE']) === String(alertaNombre)
          );
          if (matchingObras.length > 0) matches.byNombre++;
        });

        // Coincidencias por PROYECTO ESTRATÉGICO
        alertas.forEach(alerta => {
          const alertaProyecto = alerta['PROYECTO ESTRATÉGICO'];
          const matchingObras = obras.filter(
            obra => String(obra['PROYECTO ESTRATÉGICO']) === String(alertaProyecto)
          );
          if (matchingObras.length > 0) matches.byProyectoEstrategico++;
        });

        // Coincidencias por DEPENDENCIA
        alertas.forEach(alerta => {
          const alertaDependencia = alerta['DEPENDENCIA'];
          const matchingObras = obras.filter(
            obra => String(obra['DEPENDENCIA']) === String(alertaDependencia)
          );
          if (matchingObras.length > 0) matches.byDependencia++;
        });

        console.log('🎯 COINCIDENCIAS ENCONTRADAS:');
        console.log('Por ID OBRA:', matches.byIdObra);
        console.log('Por NOMBRE:', matches.byNombre);
        console.log('Por PROYECTO ESTRATÉGICO:', matches.byProyectoEstrategico);
        console.log('Por DEPENDENCIA:', matches.byDependencia);

        // Mostrar ejemplos de datos
        console.log('📋 EJEMPLOS DE ALERTAS (primeras 3):');
        alertas.slice(0, 3).forEach((a, i: number) => {
          console.log(
            `${i + 1}. ID OBRA: ${a['ID OBRA']}, NOMBRE: ${a['NOMBRE OBRA']}, PROYECTO: ${a['PROYECTO ESTRATÉGICO']}`
          );
        });

        console.log('📋 EJEMPLOS DE OBRAS (primeras 3):');
        obras.slice(0, 3).forEach((o, i) => {
          console.log(
            `${i + 1}. ID OBRA: ${o['ID OBRA']}, NOMBRE: ${o['NOMBRE OBRA'] || o['NOMBRE']}, PROYECTO: ${o['PROYECTO ESTRATÉGICO']}`
          );
        });

        return { alertas, obras, matches };
      } catch (error) {
        console.error('❌ Error:', error);
        return null;
      }
    };

    // Utilidad: listar valores únicos de proyecto_estrategico y sus conteos
    (window as unknown as Record<string, unknown>).listProyectosEstrategicos = (): Array<{
      proyecto: string;
      total: number;
    }> => {
      try {
        const values = alertas.map(a => (a.proyecto_estrategico ?? '').toString().trim());
        const normalized = values.map(
          v =>
            v
              .toLowerCase()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '')
              .trim() || '(vacío)'
        );

        const counts: Record<string, number> = {};
        normalized.forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
        });
        const entries = Object.entries(counts)
          .map(([proyecto, total]) => ({ proyecto, total }))
          .sort((a, b) => b.total - a.total);

        // Mostrar en tabla en consola
        // eslint-disable-next-line no-console
        console.table(entries);
        return entries;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error listando proyectos estratégicos:', e);
        return [];
      }
    };
  }

  return (
    <Box sx={{ minHeight: '100vh', px: { xs: 2.5, sm: 2, md: 0 } }}>
      <motion.div variants={ANIMATION_VARIANTS.container} initial='hidden' animate='visible'>
        {/* Panel de métricas de proyectos */}
        <motion.div variants={ANIMATION_VARIANTS.item}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 3 },
              mb: { xs: 2, md: 3 },
              backgroundColor: '#ffffff',
              borderRadius: { xs: 2, md: 3 },
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant='h4'
                  fontWeight='bold'
                  sx={{
                    color: theme.palette.text.primary,
                    mb: 0.5,
                    fontSize: { xs: '1.4rem', md: '1.6rem' },
                  }}
                >
                  Métricas de Proyectos
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Análisis financiero y temporal de obras
                </Typography>
              </motion.div>
            </Box>

            <Grid container spacing={{ xs: 1, sm: 1.2 }} alignItems='stretch'>
              {/* Cambios Presupuesto */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0 }}
                >
                  <Card
                    elevation={3}
                    onClick={() => handleMetricFilter('budget')}
                    sx={{
                      height: { xs: 120, sm: 140 },
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      border: '2px solid #fca5a5',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
                        border: '2px solid #dc2626',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: { xs: 1, sm: 1.5 },
                      }}
                    >
                      <Chip
                        label='-12%'
                        size='small'
                        color='error'
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                      <Box display='flex' alignItems='center' gap={1.5} minWidth={0}>
                        <Avatar sx={{ bgcolor: 'error.main', width: 36, height: 36 }}>
                          <TrendingUpIcon />
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography
                            variant='subtitle1'
                            fontWeight='bold'
                            color='text.primary'
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: { xs: 2, md: 1 },
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            Cambios &gt; 500M
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            Proyectos con incrementos presupuestales
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant='h4'
                        fontWeight='bold'
                        color='error.main'
                        sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                      >
                        {cambiosPresupuesto || 152}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Proyectos Tardíos */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card
                    elevation={3}
                    onClick={() => handleMetricFilter('late')}
                    sx={{
                      height: { xs: 120, sm: 140 },
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      border: '2px solid #fbbf24',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
                        border: '2px solid #d97706',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: { xs: 1, sm: 1.5 },
                      }}
                    >
                      <Chip
                        label='-8%'
                        size='small'
                        color='warning'
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                      <Box display='flex' alignItems='center' gap={1.5} minWidth={0}>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 36, height: 36 }}>
                          <ScheduleIcon />
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography
                            variant='subtitle1'
                            fontWeight='bold'
                            color='text.primary'
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: { xs: 2, md: 1 },
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            Proyectos Tardíos
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            Obras que terminan después del 01/07/2027
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant='h4' fontWeight='bold' color='warning.main'>
                        {projectMetrics?.lateProjects.count || 326}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Retrasos */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card
                    elevation={3}
                    onClick={() => handleMetricFilter('delayed2months')}
                    sx={{
                      height: { xs: 120, sm: 140 },
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      border: '2px solid #0ea5e9',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
                        border: '2px solid #0284c7',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: { xs: 1, sm: 1.5 },
                      }}
                    >
                      <Chip
                        label='-15%'
                        size='small'
                        color='info'
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                      <Box display='flex' alignItems='center' gap={1.5} minWidth={0}>
                        <Avatar sx={{ bgcolor: 'info.main', width: 36, height: 36 }}>
                          <TimelineIcon />
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography
                            variant='subtitle1'
                            fontWeight='bold'
                            color='text.primary'
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: { xs: 2, md: 1 },
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            Cambios mayores a &gt; 2 meses
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            Proyectos con cambios de fechas
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant='h4' fontWeight='bold' color='info.main'>
                        {cambiosFechas || 134}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Fila 2 (centrada): 2 tarjetas */}
            <Grid
              container
              spacing={{ xs: 1, sm: 1.2 }}
              alignItems='stretch'
              justifyContent='center'
              sx={{ mt: { xs: 1.3, sm: 1 } }}
            >
              {/* Sin Financiación */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card
                    elevation={3}
                    onClick={() => handleMetricFilter('defunded')}
                    sx={{
                      height: '140px',
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      border: '2px solid #fca5a5',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
                        border: '2px solid #dc2626',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                      }}
                    >
                      <Box display='flex' alignItems='center' gap={1.5} minWidth={0}>
                        <Avatar sx={{ bgcolor: 'error.main', width: 36, height: 36 }}>
                          <MoneyOffIcon />
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography
                            variant='subtitle1'
                            fontWeight='bold'
                            color='text.primary'
                            noWrap
                          >
                            Sin Financiación
                          </Typography>
                          <Typography variant='caption' color='text.secondary' noWrap>
                            Proyectos desfinanciados
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant='h4' fontWeight='bold' color='error.main'>
                        0
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Pendientes */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card
                    elevation={3}
                    onClick={() => handleMetricFilter('definition')}
                    sx={{
                      height: '140px',
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      border: '2px solid #fbbf24',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
                        border: '2px solid #d97706',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                      }}
                    >
                      <Chip
                        label='+5%'
                        size='small'
                        color='warning'
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                      <Box display='flex' alignItems='center' gap={1.5} minWidth={0}>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 36, height: 36 }}>
                          <AssignmentIcon />
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography
                            variant='subtitle1'
                            fontWeight='bold'
                            color='text.primary'
                            noWrap
                          >
                            Pendientes
                          </Typography>
                          <Typography variant='caption' color='text.secondary' noWrap>
                            Proyectos en espera de definición
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant='h4' fontWeight='bold' color='warning.main'>
                        {projectMetrics?.pendingDefinitionProjects.count || 20}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Panel de estadísticas de alertas */}
        <motion.div variants={ANIMATION_VARIANTS.item}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 3 },
              mb: { xs: 2, md: 3 },
              backgroundColor: '#ffffff',
              borderRadius: { xs: 2, md: 3 },
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant='h3'
                  fontWeight='bold'
                  sx={{
                    color: theme.palette.text.primary,
                    mb: 1,
                    fontSize: { xs: '1.6rem', md: '2rem' },
                  }}
                >
                  Dashboard de Alertas
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Resumen estadístico de alertas por dependencia
                </Typography>
              </motion.div>
            </Box>

            {/* Tarjetas de estadísticas */}
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems='stretch'>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  label='Total Alertas'
                  value={alertStats.total}
                  icon={<WarningIcon />}
                  color={theme.palette.primary.main}
                  delay={0}
                  onClick={handleClearAllFilters}
                  isSelected={!hasActiveFilters}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  label='Críticas'
                  value={alertStats.alta}
                  icon={<ErrorIcon />}
                  color={theme.palette.error.main}
                  delay={0.1}
                  onClick={() => handleCardFilter('crítica')}
                  isSelected={filters.gravedad.includes('crítica')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  label='Moderadas'
                  value={alertStats.media}
                  icon={<WarningIcon />}
                  color={theme.palette.warning.main}
                  delay={0.2}
                  onClick={() => handleCardFilter('media')}
                  isSelected={filters.gravedad.includes('media')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  label='Leves'
                  value={alertStats.leve}
                  icon={<InfoOutlinedIcon />}
                  color={theme.palette.info.main}
                  delay={0.3}
                  onClick={() => handleCardFilter('leve')}
                  isSelected={filters.gravedad.includes('leve')}
                />
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Mensaje cuando no hay filtros activos */}
        {!hasActiveFilters && (
          <motion.div variants={ANIMATION_VARIANTS.item}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                mb: { xs: 2, md: 3 },
                backgroundColor: '#ffffff',
                borderRadius: { xs: 2, md: 3 },
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                textAlign: 'center',
              }}
            >
              <Typography variant='h5' fontWeight='bold' color='text.primary' mb={2}>
                Aplicar Filtros para Ver Alertas
              </Typography>
              <Typography variant='body1' color='text.secondary' mb={3}>
                Usa los filtros del panel lateral para ver las alertas específicas por dependencia,
                gravedad, comuna o proyecto estratégico.
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Total de alertas disponibles: <strong>{alertas.length}</strong>
              </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Lista de Obras que terminan después de 01/07/2027 - Solo se muestra cuando se filtra por late */}
        {activeFilterType === 'late' &&
          projectMetrics?.lateProjects.projects &&
          projectMetrics.lateProjects.projects.length > 0 && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: { xs: 2, md: 3 },
                  backgroundColor: '#ffffff',
                  borderRadius: { xs: 2, md: 3 },
                  border: '2px solid #e5e7eb',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Typography variant='h5' fontWeight='bold' color='text.primary' mb={2}>
                  Proyectos que terminan después de 01/07/2027
                </Typography>
                <Typography variant='body2' color='text.secondary' mb={3}>
                  Información detallada de las obras con fecha de entrega estimada después del
                  01/07/2027 ({projectMetrics.lateProjects.projects.length} obras)
                </Typography>

                <Grid container spacing={2}>
                  {projectMetrics.lateProjects.projects
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((proyecto, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card elevation={2} sx={{ p: 1.5, height: '100%' }}>
                          <Typography
                            variant='subtitle1'
                            fontWeight='bold'
                            color='primary.main'
                            mb={0.5}
                          >
                            {proyecto.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Etapa:</strong> {proyecto.etapa}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Fecha de entrega real:</strong> {proyecto.fechaEstimada}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Estado Entrega:</strong> {proyecto.estadoEntrega}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Progreso:</strong> {proyecto.porcentajeEjecucion}%
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Dependencia:</strong> {proyecto.dependencia}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Proyecto Estratégico:</strong> {proyecto.proyectoEstrategico}
                          </Typography>
                          <Typography variant='caption' color='warning.main' fontWeight='bold'>
                            <strong>Razón:</strong> {proyecto.razon}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                </Grid>

                {/* Controles de paginación */}
                {projectMetrics.lateProjects.projects.length > itemsPerPage && (
                  <Box display='flex' justifyContent='center' alignItems='center' mt={3} gap={2}>
                    <Button
                      variant='outlined'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Typography variant='body2' color='text.secondary'>
                      Página {currentPage} de{' '}
                      {Math.ceil(projectMetrics.lateProjects.projects.length / itemsPerPage)}
                    </Typography>
                    <Button
                      variant='outlined'
                      disabled={
                        currentPage >=
                        Math.ceil(projectMetrics.lateProjects.projects.length / itemsPerPage)
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

        {/* Lista de Obras Pendientes de Definición - Solo se muestra cuando se filtra por definition */}
        {activeFilterType === 'definition' &&
          projectMetrics?.pendingDefinitionProjects.projects &&
          projectMetrics.pendingDefinitionProjects.projects.length > 0 && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: { xs: 2, md: 3 },
                  backgroundColor: '#ffffff',
                  borderRadius: { xs: 2, md: 3 },
                  border: '2px solid #e5e7eb',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Typography variant='h5' fontWeight='bold' color='text.primary' mb={2}>
                  Proyectos Pendientes de Definición
                </Typography>
                <Typography variant='body2' color='text.secondary' mb={3}>
                  Información detallada de las obras que requieren atención (
                  {projectMetrics.pendingDefinitionProjects.projects.length} obras)
                </Typography>

                <Grid container spacing={2}>
                  {projectMetrics.pendingDefinitionProjects.projects
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((proyecto, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card elevation={2} sx={{ p: 1.5, height: '100%' }}>
                          <Typography
                            variant='subtitle1'
                            fontWeight='bold'
                            color='primary.main'
                            mb={0.5}
                          >
                            {proyecto.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Etapa:</strong> {proyecto.etapa}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Fecha Estimada:</strong> {proyecto.fechaEstimada}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Estado Entrega:</strong> {proyecto.estadoEntrega}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Progreso:</strong> {proyecto.porcentajeEjecucion}%
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Dependencia:</strong> {proyecto.dependencia}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' mb={0.5}>
                            <strong>Proyecto Estratégico:</strong> {proyecto.proyectoEstrategico}
                          </Typography>
                          <Typography variant='caption' color='warning.main' fontWeight='bold'>
                            <strong>Razón:</strong> {proyecto.razon}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                </Grid>

                {/* Controles de paginación */}
                {projectMetrics.pendingDefinitionProjects.projects.length > itemsPerPage && (
                  <Box display='flex' justifyContent='center' alignItems='center' mt={3} gap={2}>
                    <Button
                      variant='outlined'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Typography variant='body2' color='text.secondary'>
                      Página {currentPage} de{' '}
                      {Math.ceil(
                        projectMetrics.pendingDefinitionProjects.projects.length / itemsPerPage
                      )}
                    </Typography>
                    <Button
                      variant='outlined'
                      disabled={
                        currentPage >=
                        Math.ceil(
                          projectMetrics.pendingDefinitionProjects.projects.length / itemsPerPage
                        )
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

        {/* Lista de Cambios de Fechas Estimadas - Solo se muestra cuando se filtra por delayed2months */}
        {activeFilterType === 'delayed2months' &&
          showCambiosFechas &&
          cambiosFechasLista.length > 0 && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: { xs: 2, md: 3 },
                  backgroundColor: '#ffffff',
                  borderRadius: { xs: 2, md: 3 },
                  border: '2px solid #e5e7eb',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                  <Typography variant='h5' fontWeight='bold' color='text.primary'>
                    Cambios de Fechas Estimadas &gt; 2 meses
                  </Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => {
                      setShowCambiosFechas(false);
                      setActiveFilterType(null);
                    }}
                  >
                    Cerrar
                  </Button>
                </Box>
                <Typography variant='body2' color='text.secondary' mb={3}>
                  Lista de obras que han tenido cambios significativos en sus fechas estimadas desde
                  septiembre 2025 ({cambiosFechasLista.length} obras)
                </Typography>

                <Grid container spacing={2}>
                  {cambiosFechasLista
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((cambio, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card elevation={2} sx={{ p: 2, height: '100%' }}>
                          <Typography variant='h6' fontWeight='bold' color='primary.main' mb={1}>
                            {cambio.nombre_obra}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>ID Obra:</strong> {cambio.obra_id}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Dependencia:</strong> {cambio.dependencia}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Comuna:</strong> {cambio.comuna}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Proyecto Estratégico:</strong> {cambio.proyecto_estrategico}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Campo Modificado:</strong> {cambio.campo_modificado}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Fecha Anterior:</strong>{' '}
                            {new Date(cambio.fecha_anterior).toLocaleDateString()}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Fecha Nueva:</strong>{' '}
                            {new Date(cambio.fecha_nueva).toLocaleDateString()}
                          </Typography>
                          <Typography variant='body2' color='error.main' fontWeight='bold' mb={1}>
                            <strong>Diferencia de fechas:</strong> {cambio.meses_atraso} meses
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Fecha Modificación:</strong>{' '}
                            {new Date(cambio.fecha_modificacion).toLocaleDateString()}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            <strong>Usuario:</strong> {cambio.usuario_modificador}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                </Grid>

                {/* Controles de paginación */}
                {cambiosFechasLista.length > itemsPerPage && (
                  <Box display='flex' justifyContent='center' alignItems='center' mt={3} gap={2}>
                    <Button
                      variant='outlined'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Typography variant='body2' color='text.secondary'>
                      Página {currentPage} de {Math.ceil(cambiosFechasLista.length / itemsPerPage)}
                    </Typography>
                    <Button
                      variant='outlined'
                      disabled={currentPage >= Math.ceil(cambiosFechasLista.length / itemsPerPage)}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

        {/* Lista de Cambios de Presupuesto - Solo se muestra cuando se filtra por budget */}
        {activeFilterType === 'budget' &&
          showCambiosPresupuesto &&
          cambiosPresupuestoLista.length > 0 && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: { xs: 2, md: 3 },
                  backgroundColor: '#ffffff',
                  borderRadius: { xs: 2, md: 3 },
                  border: '2px solid #e5e7eb',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                  <Typography variant='h5' fontWeight='bold' color='text.primary'>
                    Cambios de Presupuesto &gt; 500M
                  </Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => {
                      setShowCambiosPresupuesto(false);
                      setActiveFilterType(null);
                    }}
                  >
                    Cerrar
                  </Button>
                </Box>
                <Typography variant='body2' color='text.secondary' mb={3}>
                  Lista de obras que han tenido cambios significativos en su presupuesto desde
                  septiembre 2025 ({cambiosPresupuestoLista.length} obras)
                </Typography>

                <Grid container spacing={2}>
                  {cambiosPresupuestoLista
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((cambio, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card elevation={2} sx={{ p: 2, height: '100%' }}>
                          <Typography variant='h6' fontWeight='bold' color='primary.main' mb={1}>
                            {cambio.nombre_obra}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>ID Obra:</strong> {cambio.obra_id}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Dependencia:</strong> {cambio.dependencia}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Comuna:</strong> {cambio.comuna}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Proyecto Estratégico:</strong> {cambio.proyecto_estrategico}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Campo Modificado:</strong> {cambio.campo_modificado}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Presupuesto Anterior:</strong>{' '}
                            {formatCurrency(parseCurrency(cambio.fecha_anterior) || 0)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Presupuesto Nuevo:</strong>{' '}
                            {formatCurrency(parseCurrency(cambio.fecha_nueva) || 0)}
                          </Typography>
                          <Typography variant='body2' color='error.main' fontWeight='bold' mb={1}>
                            <strong>Diferencia:</strong>{' '}
                            {formatCurrency(cambio.meses_atraso * 1000000)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' mb={1}>
                            <strong>Fecha Modificación:</strong>{' '}
                            {new Date(cambio.fecha_modificacion).toLocaleDateString()}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            <strong>Usuario:</strong> {cambio.usuario_modificador}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                </Grid>

                {/* Controles de paginación */}
                {cambiosPresupuestoLista.length > itemsPerPage && (
                  <Box display='flex' justifyContent='center' alignItems='center' mt={3} gap={2}>
                    <Button
                      variant='outlined'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Typography variant='body2' color='text.secondary'>
                      Página {currentPage} de{' '}
                      {Math.ceil(cambiosPresupuestoLista.length / itemsPerPage)}
                    </Typography>
                    <Button
                      variant='outlined'
                      disabled={
                        currentPage >= Math.ceil(cambiosPresupuestoLista.length / itemsPerPage)
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

        {/* Lista de Alertas por Dependencia - Solo se muestra con filtros activos, excepto late, definition, delayed2months y budget */}
        {hasActiveFilters &&
          activeFilterType !== 'late' &&
          activeFilterType !== 'definition' &&
          activeFilterType !== 'delayed2months' &&
          activeFilterType !== 'budget' && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              {alertasPorDependencia.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: '#eff6ff',
                      borderRadius: 2,
                      border: '1px solid #dbeafe',
                    }}
                  >
                    <Typography variant='h6'>No se encontraron alertas</Typography>
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Total alertas: {alertas.length} | Filtradas: {filteredAlertas.length} |
                      Grupos: {alertasPorDependencia.length}
                    </Typography>
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Búsqueda: "{filters.searchTerm}" | Dep: "
                      {filters.dependencia?.join(', ') || 'Todas'}" | Sev: "
                      {filters.gravedad?.join(', ') || 'Todas'}"
                    </Typography>
                  </Paper>
                </motion.div>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {alertasPorDependencia.map(grupo => (
                    <Grid item xs={12} key={grupo.dependencia}>
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        initial='hidden'
                        animate='visible'
                      >
                        <Paper
                          elevation={3}
                          sx={{
                            p: { xs: 2, md: 3 },
                            mb: { xs: 2, md: 3 },
                            backgroundColor: '#ffffff',
                            borderRadius: { xs: 2, md: 3 },
                            border: '2px solid #e5e7eb',
                            boxShadow:
                              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                        >
                          <CardContent>
                            <Box
                              display='flex'
                              alignItems='center'
                              justifyContent='space-between'
                              mb={2}
                            >
                              <Box display='flex' alignItems='center' gap={2}>
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
                                    variant='h5'
                                    fontWeight='bold'
                                    sx={{
                                      color: theme.palette.text.primary,
                                      mb: 0.5,
                                    }}
                                  >
                                    {grupo.dependencia}
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      color: theme.palette.text.secondary,
                                    }}
                                  >
                                    {grupo.total} alertas • Última actualización:{' '}
                                    {formatDate(new Date(), 'HH:mm')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display='flex' gap={1}>
                                <Chip
                                  label={`${grupo.altas} Críticas`}
                                  size='small'
                                  sx={{
                                    backgroundColor: theme.palette.error.main,
                                    color: 'white',
                                    fontWeight: 'bold',
                                  }}
                                />
                                <Chip
                                  label={`${grupo.medias} Moderadas`}
                                  size='small'
                                  sx={{
                                    backgroundColor: theme.palette.warning.main,
                                    color: 'white',
                                    fontWeight: 'bold',
                                  }}
                                />
                                <Chip
                                  label={`${grupo.leves} Leves`}
                                  size='small'
                                  sx={{
                                    backgroundColor: theme.palette.info.main,
                                    color: 'white',
                                    fontWeight: 'bold',
                                  }}
                                />
                                <Button
                                  onClick={() => handleExportByDependency(grupo.dependencia)}
                                  startIcon={<DownloadIcon />}
                                  size='small'
                                  variant='outlined'
                                >
                                  Exportar
                                </Button>
                              </Box>
                            </Box>

                            <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

                            <Grid container spacing={{ xs: 3, sm: 2.5 }} alignItems='stretch'>
                              {(expandedDependencies.has(grupo.dependencia)
                                ? grupo.alertas
                                : grupo.alertas.slice(0, 6)
                              ).map(alerta => {
                                const isPriority = isPriorityAlert(alerta, PRIORITY_PROJECTS);

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
                              <Box mt={2} textAlign='center'>
                                <Button
                                  variant='outlined'
                                  size='small'
                                  onClick={() => handleToggleExpand(grupo.dependencia)}
                                  aria-expanded={expandedDependencies.has(grupo.dependencia)}
                                  aria-controls={`grupo-${grupo.dependencia.replace(/\s+/g, '-')}`}
                                >
                                  {expandedDependencies.has(grupo.dependencia)
                                    ? 'Ver menos'
                                    : `Ver ${grupo.alertas.length - 6} más`}
                                </Button>
                              </Box>
                            )}
                          </CardContent>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </motion.div>
          )}
      </motion.div>

      <DetailDrawer open={detailOpen} onClose={closeDetail} alerta={selectedAlerta} />
    </Box>
  );
};

export default Dashboard;
