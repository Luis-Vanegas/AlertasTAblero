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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
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
import { motion, AnimatePresence } from 'framer-motion'
import { useSnackbar } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useAlertas, useAlertasStats } from '../hooks/useAlertas'
import { formatDate } from '../utils/dateFormatting'
import { exportToCSV, exportByDependency } from '../utils/export'
import { MappedAlerta } from '../types/api'
import DetailDrawer from '../components/DetailDrawer'

const Dashboard: React.FC = () => {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDependency, setSelectedDependency] = useState('')
  const [selectedGravedad, setSelectedGravedad] = useState('')
  const [selectedImpacto, setSelectedImpacto] = useState<string>('')
  const [selectedPriorityProject, setSelectedPriorityProject] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedDependencies, setExpandedDependencies] = useState<Set<string>>(new Set())
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedAlerta, setSelectedAlerta] = useState<MappedAlerta | null>(null)
  
  const { alertas, isLoading, refetch } = useAlertas({ limit: 1000 })
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

  const impactoOptions = useMemo(() => {
    const counts = alertas.reduce((acc: Record<string, number>, a) => {
      const v = (a.impacto_riesgo || '').toString().trim().toLowerCase()
      if (!v) return acc
      acc[v] = (acc[v] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [alertas])

  const getImpactMeta = (impacto: string) => {
    const v = impacto.toLowerCase()
    if (v.includes('presupuesto')) return { icon: <MoneyIcon fontSize="small" />, color: theme.palette.secondary.main }
    if (v.includes('cronograma')) return { icon: <TimeIcon fontSize="small" />, color: theme.palette.info.main }
    if (v.includes('alcance')) return { icon: <TargetIcon fontSize="small" />, color: theme.palette.warning.main }
    if (v.includes('comunidad')) return { icon: <GroupsIcon fontSize="small" />, color: theme.palette.success.main }
    return { icon: <InfoOutlinedIcon fontSize="small" />, color: theme.palette.grey[600] }
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
      
      const matchesDependency = selectedDependency === '' || 
        alerta.dependencia === selectedDependency
      
      const matchesGravedad = selectedGravedad === '' ||
        normalizeGravedad(alerta.gravedad) === selectedGravedad

      const matchesImpacto = selectedImpacto === '' ||
        (alerta.impacto_riesgo || '').toString().trim().toLowerCase() === selectedImpacto

      const matchesPriority = selectedPriorityProject === '' ||
        normalizeStr(alerta.proyecto_estrategico) === selectedPriorityProject
      
      return matchesSearch && matchesDependency && matchesGravedad && matchesImpacto && matchesPriority
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
  }, [alertas, searchTerm, selectedDependency, selectedGravedad, selectedImpacto, selectedPriorityProject])

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
  const dependencias = useMemo(() => {
    const deps = [...new Set(alertas.map(a => a.dependencia))]
    return deps.sort()
  }, [alertas])

  // Handlers
  const handleRefresh = () => {
    refetch()
  }

  const handleToggleExpand = (dependencia: string) => {
    const newExpanded = new Set(expandedDependencies)
    if (newExpanded.has(dependencia)) {
      newExpanded.delete(dependencia)
    } else {
      newExpanded.add(dependencia)
    }
    setExpandedDependencies(newExpanded)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedDependency('')
    setSelectedGravedad('')
    setSelectedImpacto('')
    if (isMobile) enqueueSnackbar('Filtros limpiados', { variant: 'info' })
  }

  const handleExport = () => {
    exportToCSV(filteredAlertas, { filename: 'alertas_dashboard' })
  }

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

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedDependency('')
    setSelectedGravedad('')
    setSelectedImpacto('')
    if (isMobile) enqueueSnackbar('Filtros limpiados', { variant: 'info' })
  }

  const handleCardFilter = (target: 'leve' | 'media' | 'crítica' | '') => {
    setSelectedGravedad(target)
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
              p: 4,
              mb: 4,
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
                  🚨 Dashboard de Alertas
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: theme.palette.text.secondary
                }}>
                  Monitoreo en tiempo real de proyectos y obras
                </Typography>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Tooltip title="Actualizar datos">
                  <IconButton
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      width: 56,
                      height: 56,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        transform: 'rotate(180deg)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <RefreshIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              </motion.div>
            </Box>

            {/* Tarjetas de estadísticas por gravedad real + total */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Sugerencia: toca una tarjeta para filtrar.
                </Typography>
              </Grid>
              {[
                { label: 'Leves', value: alertStats.leve, color: theme.palette.info.main, icon: <InfoOutlinedIcon />, onClick: () => handleCardFilter('leve'), key: 'leve' },
                { label: 'Moderadas', value: alertStats.media, color: theme.palette.warning.main, icon: <WarningIcon />, onClick: () => handleCardFilter('media'), key: 'media' },
                { label: 'Críticas', value: alertStats.alta, color: theme.palette.error.main, icon: <ErrorIcon />, onClick: () => handleCardFilter('crítica'), key: 'crítica' },
                { label: 'Total Alertas', value: alertStats.total, color: theme.palette.primary.main, icon: <AssignmentIcon />, onClick: () => handleCardFilter(''), key: 'total' },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      onClick={stat.onClick}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        borderRadius: 2,
                        transition: 'transform 0.15s ease, box-shadow 0.3s ease',
                        cursor: 'pointer',
                        outline: selectedGravedad && stat.key === selectedGravedad ? `2px solid ${stat.color}` : 'none',
                        transform: selectedGravedad && stat.key === selectedGravedad ? 'scale(1.02)' : 'none',
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
              <Grid item xs={12} sm={6} md={3}>
                <Button onClick={clearAllFilters} variant="outlined" size="medium">
                  Limpiar filtros
                </Button>
              </Grid>
            </Grid>

            {/* Proyectos estratégicos con incidentes */}
            {prioritySummary.length > 0 && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Paper elevation={3} sx={{ p: 2, borderLeft: `6px solid ${theme.palette.error.main}` }} aria-live="polite">
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      Proyectos estratégicos con alertas
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {prioritySummary.map(([proj, c]) => (
                        <motion.div key={proj} layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Chip
                            icon={<AssignmentIcon fontSize="small" />}
                            label={`${proj} (${c.total})`}
                            onClick={() => setSelectedPriorityProject(proj)}
                            variant={selectedPriorityProject === proj ? 'filled' : 'outlined'}
                            color={c.critica > 0 ? 'error' : 'warning'}
                            sx={{ textTransform: 'capitalize', cursor: 'pointer' }}
                          />
                        </motion.div>
                      ))}
                      <Chip
                        label="Quitar filtro"
                        onClick={() => setSelectedPriorityProject('')}
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

        {/* Sección de búsqueda y filtros */}
        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            backgroundColor: 'rgba(245, 247, 249, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                🔍 Filtros y Búsqueda
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterIcon />}
                  variant="outlined"
                  size="small"
                >
                  Filtros
                </Button>
                <Button
                  onClick={handleExport}
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  size="small"
                >
                  Exportar
                </Button>
              </Box>
            </Box>

            {/* Filtro de Impacto (chips animados) */}
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Impacto del riesgo
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <motion.div layout>
                  <Chip
                    label={`Todos${selectedImpacto ? '' : ' ✓'}`}
                    onClick={() => setSelectedImpacto('')}
                    color={selectedImpacto === '' ? 'primary' : 'default'}
                    variant={selectedImpacto === '' ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                </motion.div>
                {impactoOptions.map(([impacto, count]) => {
                  const meta = getImpactMeta(impacto)
                  const active = selectedImpacto === impacto
                  return (
                    <motion.div key={impacto} layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Chip
                        icon={meta.icon}
                        label={`${impacto} (${count})${active ? ' ✓' : ''}`}
                        onClick={() => setSelectedImpacto(impacto)}
                        variant={active ? 'filled' : 'outlined'}
                        sx={{
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          borderColor: meta.color,
                          color: active ? 'white' : meta.color,
                          bgcolor: active ? meta.color : 'transparent',
                          '& .MuiChip-icon': { color: active ? 'white' : meta.color },
                        }}
                      />
                    </motion.div>
                  )
                })}
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por obra, dependencia, descripción..."
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} size="small">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ 
                    p: 2, 
                    border: '1px dashed rgba(0, 0, 0, 0.1)', 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    mb: 2
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={2} sx={{ color: theme.palette.text.primary }}>
                      Filtros Adicionales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Dependencia</InputLabel>
                          <Select
                            value={selectedDependency}
                            onChange={(e) => setSelectedDependency(e.target.value)}
                            label="Dependencia"
                          >
                            <MenuItem value="">Todas</MenuItem>
                            {dependencias.map((dep) => (
                              <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      {/* Select de gravedad removido: se controla con las tarjetas resumen */}
                    </Grid>
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        onClick={handleClearFilters}
                        startIcon={<ClearIcon />}
                        variant="outlined"
                        size="small"
                      >
                        Limpiar Filtros
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>

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
                  Búsqueda: "{searchTerm}" | Dep: "{selectedDependency}" | Sev: "{selectedGravedad}"
                </Typography>
              </Alert>
            </motion.div>
          ) : (
            <Grid container spacing={3}>
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

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                          {(expandedDependencies.has(grupo.dependencia) ? grupo.alertas : grupo.alertas.slice(0, 6)).map((alerta) => {
                            // const isFavorite = favorites.has(alerta.id)
                            const isPriority = PRIORITY_PROJECTS.includes(normalizeStr(alerta.proyecto_estrategico))
                            const sev = normalizeGravedad(alerta.gravedad)
                            const priorityActive = isPriority && (sev === 'media' || sev === 'crítica' || sev === 'alta')
                             
                            return (
                              <Grid item xs={12} sm={6} md={4} key={alerta.id}>
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
                                      overflow: 'hidden'
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
