import React, { useState, useMemo } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
  Button,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  InfoOutlined as InfoOutlinedIcon,
  AttachMoney as MoneyIcon,
  Schedule as TimeIcon,
  TrackChanges as TargetIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useSnackbar } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useAlertas, useAlertasStats } from '../hooks/useAlertas'
import { useSettingsStore } from '../store/settings'
import { formatDate } from '../utils/dateFormatting'
import { exportByDependency } from '../utils/export'
import { MappedAlerta } from '../types/api'
import DetailDrawer from '../components/DetailDrawer'

const Dashboard: React.FC = () => {
  const theme = useTheme()
  const { filters, setFilters } = useSettingsStore()
  const searchTerm = filters.searchTerm
  const selectedDependencies = filters.dependencia
  const selectedGravedades = filters.gravedad
  const selectedImpactos = filters.impacto
  const selectedPriorityProject = filters.priorityProject
  const selectedComunas = useMemo(() => filters.comuna || [], [filters.comuna])
  // Sección de filtros propia removida; no se requiere estado local
  const [expandedDependencies, setExpandedDependencies] = useState<Set<string>>(new Set())
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedAlerta, setSelectedAlerta] = useState<MappedAlerta | null>(null)
  
  const { alertas, isLoading } = useAlertas({ limit: 1000 })
  const { stats, isLoading: loadingStats } = useAlertasStats()

  const { enqueueSnackbar } = useSnackbar()
  const isMobile = useMediaQuery('(max-width:900px)')
  const [hintShown, setHintShown] = useState(false)

  // Normalizador de strings (acentos y espacios) para comparar proyectos
  const normalizeStr = (s?: string | null) => (s || '').toString().trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

  // Proyectos estratégicos a vigilar (normalizados)
  const PRIORITY_PROJECTS = useMemo(() => (
    [
      'gran parque medellin',
      'mejores escenarios deportivos para vos',
      'recreos deportivos',
    ]
  ), [])

  // Normaliza valores de gravedad a llaves consistentes
  const normalizeGravedad = (value?: string | null): 'crítica' | 'alta' | 'media' | 'leve' | 'baja' | '' => {
    if (!value) return ''
    const v = value.toString().trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    if (v === 'critica' || v === 'critico') return 'crítica'
    if (v === 'alta' || v === 'alto') return 'alta'
    if (v === 'media' || v === 'moderada' || v === 'moderado') return 'media'
    if (v === 'leve') return 'leve'
    if (v === 'baja' || v === 'bajo') return 'baja'
    return ''
  }

  // Impacto: helpers locales para chips en tarjeta
  const getImpactMeta = (impacto: string) => {
    const v = impacto.toLowerCase()
    if (v.includes('presupuesto')) return { icon: <MoneyIcon fontSize="small" />, color: theme.palette.secondary.main, label: 'Presupuesto' }
    if (v.includes('cronograma')) return { icon: <TimeIcon fontSize="small" />, color: theme.palette.info.main, label: 'Cronograma' }
    if (v.includes('alcance')) return { icon: <TargetIcon fontSize="small" />, color: theme.palette.warning.main, label: 'Alcance' }
    if (v.includes('comunidad')) return { icon: <GroupsIcon fontSize="small" />, color: theme.palette.success.main, label: 'Comunidad' }
    return { icon: <InfoOutlinedIcon fontSize="small" />, color: theme.palette.grey[600], label: 'Impacto' }
  }

  const extractImpacts = (raw?: string | null) => {
    if (!raw) return [] as string[]
    const parts = raw.toString().split(',').map(p => p.trim().toLowerCase())
    const set = new Set<string>()
    parts.forEach(p => {
      if (p.includes('presupuesto')) set.add('presupuesto')
      else if (p.includes('cronograma')) set.add('cronograma')
      else if (p.includes('alcance')) set.add('alcance')
      else if (p.includes('comunidad')) set.add('comunidad')
    })
    return Array.from(set)
  }

  // Debug: Log para verificar datos
  console.log('Alertas cargadas:', alertas.length)
  console.log('Primera alerta:', alertas[0])
  console.log('Estadísticas:', stats)

  // Estado de carga combinado
  const loading = isLoading || loadingStats

  // Estrategia: proyectos prioritarios con incidentes (media/crítica)
  const prioritySummary = useMemo(() => {
    const counts: Record<string, { total: number; media: number; critica: number }> = {}
    alertas.forEach(a => {
      const proj = normalizeStr(a.proyecto_estrategico)
      if (!PRIORITY_PROJECTS.includes(proj)) return
      const g = normalizeGravedad(a.gravedad)
      if (!counts[proj]) counts[proj] = { total: 0, media: 0, critica: 0 }
      if (g === 'media') counts[proj].media++
      if (g === 'crítica' || g === 'alta') counts[proj].critica++
      if (g === 'media' || g === 'crítica' || g === 'alta') counts[proj].total++
    })
    const entries = Object.entries(counts).filter(([, c]) => c.total > 0)
    return entries.sort((a, b) => b[1].total - a[1].total)
  }, [alertas, PRIORITY_PROJECTS])

  // Filtrar y ordenar alertas
  const filteredAlertas = useMemo(() => {
    console.log('Filtrando alertas. Total:', alertas.length)
    
    const filtered = alertas.filter(alerta => {
      const matchesSearch = searchTerm === '' || 
        alerta.nombre_obra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alerta.dependencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alerta.descripcion_alerta.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDependency = (selectedDependencies?.length || 0) === 0 || 
        selectedDependencies.includes(alerta.dependencia)
      
      const matchesGravedad = (selectedGravedades?.length || 0) === 0 ||
        selectedGravedades.includes(normalizeGravedad(alerta.gravedad))

      const matchesImpacto = (selectedImpactos?.length || 0) === 0 ||
        (alerta.impacto_riesgo || '').toString().toLowerCase().split(',').map(p => p.trim()).some(p => selectedImpactos.includes(p))

      const matchesComuna = (selectedComunas?.length || 0) === 0 ||
        selectedComunas.includes((alerta.comuna || '').toString())

      const matchesPriority = selectedPriorityProject === '' ||
        normalizeStr(alerta.proyecto_estrategico) === selectedPriorityProject
      
      return matchesSearch && matchesDependency && matchesGravedad && matchesImpacto && matchesComuna && matchesPriority
    })

    console.log('Alertas filtradas:', filtered.length)

    // Ordenar por gravedad: alta/crítica primero, media después, leve/baja al final
    const rank = (g?: string | null) => {
      const v = normalizeGravedad(g)
      if (v === 'crítica' || v === 'alta') return 0
      if (v === 'media') return 1
      return 2
    }
    return filtered.sort((a, b) => rank(a.gravedad) - rank(b.gravedad))
  }, [alertas, searchTerm, selectedDependencies, selectedGravedades, selectedImpactos, selectedComunas, selectedPriorityProject])

  // Estadísticas de alertas
  const alertStats = useMemo(() => {
    const alta = filteredAlertas.filter(a => {
      const g = normalizeGravedad(a.gravedad)
      return g === 'crítica' || g === 'alta'
    }).length
    const media = filteredAlertas.filter(a => normalizeGravedad(a.gravedad) === 'media').length
    const leve = filteredAlertas.filter(a => {
      const g = normalizeGravedad(a.gravedad)
      return g === 'leve' || g === 'baja'
    }).length
    const total = filteredAlertas.length
    const totalObras = new Set(filteredAlertas.map(a => a.obra_id)).size
    
    return { total, totalObras, alta, media, leve }
  }, [filteredAlertas])

  // Agrupar alertas por dependencia
  const alertasPorDependencia = useMemo(() => {
    console.log('Agrupando alertas. Total filtradas:', filteredAlertas.length)
    
    const grouped = filteredAlertas.reduce((acc, alerta) => {
      const dep = alerta.dependencia
      if (!acc[dep]) {
        acc[dep] = []
      }
      acc[dep].push(alerta)
      return acc
    }, {} as Record<string, MappedAlerta[]>)
    
    const result = Object.entries(grouped).map(([dependencia, alertas]) => {
      const altas = alertas.filter(a => {
        const g = normalizeGravedad(a.gravedad)
        return g === 'crítica' || g === 'alta'
      }).length
      const medias = alertas.filter(a => normalizeGravedad(a.gravedad) === 'media').length
      const leves = alertas.filter(a => {
        const g = normalizeGravedad(a.gravedad)
        return g === 'leve' || g === 'baja'
      }).length
      return { dependencia, alertas, total: alertas.length, altas, medias, leves }
    }).sort((a, b) => b.altas - a.altas)
    
    console.log('Grupos creados:', result.length)
    
    return result
  }, [filteredAlertas])

  // Obtener dependencias únicas
  // Dependencias para selector lateral (si se requiere se puede mover a un store)

  // Handlers
  // Refetch puede llamarse desde AppBar; aquí no se usa

  const handleToggleExpand = (dependencia: string) => {
    const newExpanded = new Set(expandedDependencies)
    if (newExpanded.has(dependencia)) {
      newExpanded.delete(dependencia)
    } else {
      newExpanded.add(dependencia)
    }
    setExpandedDependencies(newExpanded)
  }

  // Limpieza de filtros se hace desde el panel lateral

  // Export general removido de la cabecera de filtros

  const handleExportByDependency = (dependency: string) => {
    exportByDependency(filteredAlertas, dependency)
  }

  const openDetail = (alerta: MappedAlerta) => {
    setSelectedAlerta(alerta)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
  }

  const getGravedadColor = (g?: string | null) => {
    const n = normalizeGravedad(g)
    if (n === 'crítica' || n === 'alta') return theme.palette.error.main
    if (n === 'media') return theme.palette.warning.main
    if (n === 'leve' || n === 'baja') return theme.palette.info.main
    return theme.palette.grey[500]
  }

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Loading
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
        <LinearProgress sx={{ width: '100%', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Cargando datos...
        </Typography>
      </Box>
    )
  }

  // Alias no usado para limpiar filtros

  const handleCardFilter = (target: 'leve' | 'media' | 'crítica' | '') => {
    if (target === '') setFilters({ gravedad: [] })
    else setFilters({ gravedad: [target] })
    if (navigator?.vibrate) navigator.vibrate(10)
    if (isMobile && !hintShown && target) {
      enqueueSnackbar(`Filtro aplicado: ${target.charAt(0).toUpperCase() + target.slice(1)}`, { variant: 'info' })
      setHintShown(true)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header con estadísticas */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 4 },
              mb: { xs: 2, md: 4 },
              backgroundColor: 'rgba(245, 247, 249, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h3" fontWeight="bold" sx={{ 
                  color: theme.palette.text.primary,
                  mb: 1
                }}>
                  Dashboard de Alertas
                </Typography>
                {/* Subtítulo removido para simplificar encabezado */}
              </motion.div>
              {/* Botón actualizar duplicado removido (queda solo en AppBar) */}
            </Box>

            {/* Tarjetas de estadísticas por gravedad real + total */}
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="stretch">
              {/* Sugerencia removida para limpiar el encabezado */}
              {[
                { label: 'Leves', value: alertStats.leve, color: theme.palette.info.main, icon: <InfoOutlinedIcon />, onClick: () => handleCardFilter('leve'), key: 'leve' },
                { label: 'Moderadas', value: alertStats.media, color: theme.palette.warning.main, icon: <WarningIcon />, onClick: () => handleCardFilter('media'), key: 'media' },
                { label: 'Críticas', value: alertStats.alta, color: theme.palette.error.main, icon: <ErrorIcon />, onClick: () => handleCardFilter('crítica'), key: 'crítica' },
                { label: 'Total Alertas', value: alertStats.total, color: theme.palette.primary.main, icon: <AssignmentIcon />, onClick: () => handleCardFilter(''), key: 'total' },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={6} lg={3} key={stat.label}>
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      onClick={stat.onClick}
                      sx={{
                        p: { xs: 2, sm: 3 },
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        borderRadius: 2,
                        transition: 'transform 0.15s ease, box-shadow 0.3s ease',
                        cursor: 'pointer',
                        outline: selectedGravedades.length === 1 && stat.key === selectedGravedades[0] ? `2px solid ${stat.color}` : 'none',
                        transform: selectedGravedades.length === 1 && stat.key === selectedGravedades[0] ? 'scale(1.02)' : 'none',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                        <Avatar sx={{ bgcolor: stat.color, mr: 2, width: 48, height: 48, boxShadow: '0 6px 14px rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.8)' }}>
                          {stat.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h3" fontWeight="bold" sx={{ 
                            color: theme.palette.text.primary,
                            lineHeight: 1
                          }}>
                            {stat.value}
                          </Typography>
                          
                        </Box>
                      </Box>
                      <Typography variant="body1" fontWeight="500" sx={{ 
                        color: theme.palette.text.primary
                      }}>
                        {stat.label}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
              {/* Botón limpiar filtros duplicado removido (queda en panel lateral) */}
            </Grid>

            {/* Proyectos estratégicos con incidentes */}
            {prioritySummary.length > 0 && (
              <Box sx={{ mt: { xs: 2, md: 3 }, mb: { xs: 1.5, md: 2 } }}>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Paper elevation={3} sx={{ p: { xs: 1.5, md: 2 }, borderLeft: `6px solid ${theme.palette.error.main}` }} aria-live="polite">
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      Proyectos estratégicos con alertas
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {prioritySummary.map(([proj, c]) => (
                        <motion.div key={proj} layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Chip
                            icon={<AssignmentIcon fontSize="small" />}
                            label={`${proj} (${c.total})`}
                        onClick={() => setFilters({ priorityProject: proj, gravedad: ['media', 'crítica', 'alta'] })}
                            variant={selectedPriorityProject === proj ? 'filled' : 'outlined'}
                            color={c.critica > 0 ? 'error' : 'warning'}
                            sx={{ textTransform: 'capitalize', cursor: 'pointer' }}
                          />
                        </motion.div>
                      ))}
                      <Chip
                        label="Quitar filtro"
                        onClick={() => setFilters({ priorityProject: '', gravedad: [] })}
                        variant={selectedPriorityProject === '' ? 'filled' : 'outlined'}
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
        <motion.div variants={itemVariants}>
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
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6">
                  No se encontraron alertas
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Total alertas: {alertas.length} | Filtradas: {filteredAlertas.length} | Grupos: {alertasPorDependencia.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Búsqueda: "{searchTerm}" | Dep: "{selectedDependencies?.join(', ') || 'Todas'}" | Sev: "{selectedGravedades?.join(', ') || 'Todas'}"
                </Typography>
              </Alert>
            </motion.div>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {alertasPorDependencia.map((grupo) => (
                <Grid item xs={12} key={grupo.dependencia}>
                  <motion.div
                    variants={itemVariants}
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
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                              <BusinessIcon sx={{ color: 'white' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="h5" fontWeight="bold" sx={{ 
                                color: theme.palette.text.primary,
                                mb: 0.5
                              }}>
                                {grupo.dependencia}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.text.secondary
                              }}>
                                {grupo.total} alertas • Última actualización: {formatDate(new Date(), 'HH:mm')}
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
                                fontWeight: 'bold'
                              }}
                            />
                            <Chip
                              label={`${grupo.medias} Moderadas`}
                              size="small"
                              sx={{ 
                                backgroundColor: theme.palette.warning.main, 
                                color: 'white', 
                                fontWeight: 'bold'
                              }}
                            />
                            <Chip
                              label={`${grupo.leves} Leves`}
                              size="small"
                              sx={{ 
                                backgroundColor: theme.palette.info.main, 
                                color: 'white', 
                                fontWeight: 'bold'
                              }}
                            />
                            <Button
                              onClick={() => handleExportByDependency(grupo.dependencia)}
                              startIcon={<DownloadIcon />}
                              size="small"
                              variant="outlined"
                            >
                              Exportar
                            </Button>
                          </Box>
                        </Box>

                        <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

                        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch">
                          {(expandedDependencies.has(grupo.dependencia) ? grupo.alertas : grupo.alertas.slice(0, 6)).map((alerta) => {
                            // const isFavorite = favorites.has(alerta.id)
                            const isPriority = PRIORITY_PROJECTS.includes(normalizeStr(alerta.proyecto_estrategico))
                            const sev = normalizeGravedad(alerta.gravedad)
                            const priorityActive = isPriority && (sev === 'media' || sev === 'crítica' || sev === 'alta')
                             
                            return (
                              <Grid item xs={12} sm={6} md={6} lg={4} key={alerta.id} sx={{ display: 'flex' }}>
                                <motion.div>
                                  <Card
                                    onClick={() => openDetail(alerta)}
                                    sx={{
                                      p: 2,
                                      borderLeft: priorityActive ? `6px solid ${sev === 'media' ? theme.palette.warning.main : theme.palette.error.main}` : `4px solid ${getGravedadColor(alerta.gravedad)}`,
                                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                      backdropFilter: 'blur(5px)',
                                      transition: 'background-color 0.2s ease',
                                      cursor: 'pointer',
                                      boxShadow: priorityActive ? `0 0 0 4px rgba(255,0,0,0.08), 0 8px 24px rgba(0,0,0,0.18)` : undefined,
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      }
                                    }}
                                  >
                                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Chip
                                          label={(alerta.gravedad || 'sin dato').toUpperCase()}
                                          size="small"
                                          sx={{ 
                                            fontWeight: 'bold', 
                                            fontSize: '0.7rem',
                                            backgroundColor: getGravedadColor(alerta.gravedad),
                                            color: 'white'
                                          }}
                                        />
                                        {extractImpacts(alerta.impacto_riesgo).slice(0,2).map((imp) => {
                                          const meta = getImpactMeta(imp)
                                          return (
                                            <Chip
                                              key={imp}
                                              icon={meta.icon}
                                              label={meta.label}
                                              size="small"
                                              sx={{
                                                borderColor: meta.color,
                                                color: meta.color,
                                                '& .MuiChip-icon': { color: meta.color },
                                              }}
                                              variant="outlined"
                                            />
                                          )
                                        })}
                                        {priorityActive && (
                                          <motion.div initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.05, 0.9] }} transition={{ duration: 1.2, repeat: 2 }}>
                                            <Chip
                                              icon={<InfoOutlinedIcon fontSize="small" />}
                                              label="Estrategico"
                                              size="small"
                                              color={sev === 'media' ? 'warning' : 'error'}
                                              sx={{ fontWeight: 'bold' }}
                                            />
                                          </motion.div>
                                        )}
                                      </Box>
                                      <Tooltip title="Ver detalle">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => { e.stopPropagation(); openDetail(alerta) }}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>

                                    <Typography variant="h6" fontWeight="bold" sx={{ 
                                      color: theme.palette.text.primary,
                                      mb: 1,
                                      fontSize: '1rem'
                                    }}>
                                      {alerta.nombre_obra}
                                    </Typography>

                                    <Typography variant="body2" sx={{ 
                                      color: theme.palette.text.secondary,
                                      mb: 2,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      flexGrow: 1
                                    }}>
                                      {alerta.descripcion_alerta}
                                    </Typography>

                                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                      <Box display="flex" alignItems="center" gap={0.5}>
                                        <LocationIcon fontSize="small" color="action" />
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                          {alerta.comuna}
                                        </Typography>
                                      </Box>
                                      <Box display="flex" alignItems="center" gap={0.5}>
                                        <ScheduleIcon fontSize="small" color="action" />
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                          {formatDate(alerta.fecha_alerta, 'dd/MM')}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Card>
                                </motion.div>
                              </Grid>
                            )
                          })}
                        </Grid>

                        {grupo.alertas.length > 6 && (
                          <Box mt={2} textAlign="center">
                            <Button
                              variant="outlined"
                              size="small"
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
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </motion.div>

      <DetailDrawer open={detailOpen} onClose={closeDetail} alerta={selectedAlerta} />
    </Box>
  )
}

export default Dashboard
