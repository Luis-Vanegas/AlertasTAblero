import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

import { useSettingsStore } from '../store/settings'
import { useAlertas } from '../hooks/useAlertas'
import { TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Chip, Button } from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, InfoOutlined as InfoOutlinedIcon, AttachMoney as MoneyIcon, Schedule as TimeIcon, TrackChanges as TargetIcon, Groups as GroupsIcon } from '@mui/icons-material'
import bgImage from '../assets/image.png'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const { enableAnimations, showReducedMotion, toggleAnimations, filters, setFilters, clearFilters } = useSettingsStore()
  const { alertas } = useAlertas({ limit: 1000 })

  const dependencias = React.useMemo(() => {
    return Array.from(new Set(alertas.map(a => a.dependencia))).sort()
  }, [alertas])

  const comunas = React.useMemo(() => {
    return Array.from(new Set(alertas.map(a => a.comuna).filter(Boolean))).sort()
  }, [alertas])

  const impactoOptions = React.useMemo(() => {
    const present = new Set<string>()
    const normalize = (s: string) => s.toLowerCase()
    alertas.forEach(a => {
      const raw = (a.impacto_riesgo || '').toString()
      if (!raw) return
      raw.split(',').map(p => p.trim()).forEach(part => {
        const v = normalize(part)
        if (v.includes('presupuesto')) present.add('presupuesto')
        else if (v.includes('cronograma')) present.add('cronograma')
        else if (v.includes('alcance')) present.add('alcance')
        else if (v.includes('comunidad')) present.add('comunidad')
      })
    })
    const order = ['presupuesto', 'cronograma', 'alcance', 'comunidad']
    return order.filter(o => present.has(o))
  }, [alertas])

  const getImpactMeta = (impacto: string) => {
    const v = impacto.toLowerCase()
    if (v.includes('presupuesto')) return { icon: <MoneyIcon fontSize="small" />, color: theme.palette.secondary.main }
    if (v.includes('cronograma')) return { icon: <TimeIcon fontSize="small" />, color: theme.palette.info.main }
    if (v.includes('alcance')) return { icon: <TargetIcon fontSize="small" />, color: theme.palette.warning.main }
    if (v.includes('comunidad')) return { icon: <GroupsIcon fontSize="small" />, color: theme.palette.success.main }
    return { icon: <InfoOutlinedIcon fontSize="small" />, color: theme.palette.grey[600] }
  }

  

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen)
  }


  const menuItems: Array<{ text: string; icon: React.ReactNode; path: string }> = []

  const drawer = (
    <Box sx={{ width: 280, height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: theme.palette.text.primary }}>
          🚨 Panel de Alertas
        </Typography>
      </Toolbar>
      <Divider />

      {menuItems.length > 0 && (
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  setMobileOpen(false)
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      
      <Divider />

      {/* Panel de filtros */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
          Filtros
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            value={filters.searchTerm}
            onChange={(e) => setFilters({ searchTerm: e.target.value })}
            placeholder="Buscar..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Dependencia</InputLabel>
            <Select
              multiple
              value={filters.dependencia}
              label="Dependencia"
              onChange={(e) => setFilters({ dependencia: e.target.value as string[] })}
            >
              <MenuItem value="__ALL__" onClick={() => setFilters({ dependencia: [] })}>Todas</MenuItem>
              {dependencias.map((dep) => (
                <MenuItem key={dep} value={dep}>{dep}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Gravedad */}
        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {[
            { key: 'leve', label: 'Leve' },
            { key: 'media', label: 'Media' },
            { key: 'crítica', label: 'Crítica' },
          ].map(g => (
            <Chip
              key={g.key || 'all'}
              label={g.label}
              onClick={() => {
                const set = new Set(filters.gravedad)
                if (set.has(g.key as any)) set.delete(g.key as any)
                else set.add(g.key as any)
                setFilters({ gravedad: Array.from(set) as any })
              }}
              color={filters.gravedad.includes(g.key as any) ? 'primary' : 'default'}
              variant={filters.gravedad.includes(g.key as any) ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          ))}
          <Chip
            key="all-g"
            label="Todas"
            onClick={() => setFilters({ gravedad: [] })}
            color={filters.gravedad.length === 0 ? 'primary' : 'default'}
            variant={filters.gravedad.length === 0 ? 'filled' : 'outlined'}
            size="small"
            sx={{ cursor: 'pointer' }}
          />
        </Box>

        {/* Impacto */}
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label="Todos"
            onClick={() => setFilters({ impacto: [] })}
            color={filters.impacto.length === 0 ? 'primary' : 'default'}
            variant={filters.impacto.length === 0 ? 'filled' : 'outlined'}
            size="small"
            sx={{ cursor: 'pointer' }}
          />
          {impactoOptions.map((impacto) => {
            const meta = getImpactMeta(impacto)
            const active = filters.impacto.includes(impacto)
            return (
              <Chip
                key={impacto}
                icon={meta.icon}
                label={impacto}
                onClick={() => {
                  const set = new Set(filters.impacto)
                  if (set.has(impacto)) set.delete(impacto)
                  else set.add(impacto)
                  setFilters({ impacto: Array.from(set) })
                }}
                variant={active ? 'filled' : 'outlined'}
                color={active ? 'primary' : 'default'}
                size="small"
                sx={{
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  borderColor: meta.color,
                  color: active ? 'white' : meta.color,
                  bgcolor: active ? meta.color : 'transparent',
                  '& .MuiChip-icon': { color: active ? 'white' : meta.color },
                }}
              />
            )
          })}
        </Box>

        {/* Comuna (chips multi-select con realce) */}
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label="Todas"
            onClick={() => setFilters({ comuna: [] })}
            color={(filters.comuna?.length || 0) === 0 ? 'primary' : 'default'}
            variant={(filters.comuna?.length || 0) === 0 ? 'filled' : 'outlined'}
            size="small"
            sx={{ cursor: 'pointer' }}
          />
          {comunas.map((c) => {
            const active = (filters.comuna || []).includes(c)
            return (
              <Chip
                key={c}
                label={c}
                onClick={() => {
                  const set = new Set(filters.comuna || [])
                  if (set.has(c)) set.delete(c)
                  else set.add(c)
                  setFilters({ comuna: Array.from(set) })
                }}
                variant={active ? 'filled' : 'outlined'}
                color={active ? 'primary' : 'default'}
                size="small"
                sx={{ cursor: 'pointer', fontWeight: active ? 700 : 400 }}
              />
            )
          })}
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={clearFilters} startIcon={<ClearIcon />} size="small" variant="outlined">
            Limpiar
          </Button>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Fondo con imagen */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(rgba(5,25,38,0.6), rgba(5,25,38,0.6)), url(${bgImage}) center/cover no-repeat`,
          zIndex: -1,
        }}
      />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - 280px)` },
          ml: { sm: '280px' },
          backgroundColor: 'rgba(0, 201, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
          <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'white' }}>
            🚨 Panel de Alertas
          </Typography>
            </motion.div>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {/* Actualizar: único botón */}
            <Tooltip title="Actualizar datos">
              <IconButton color="inherit" onClick={() => window.location.reload()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer de navegación */}
      <Box
        component="nav"
        sx={{ width: { sm: 280 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              backgroundColor: 'rgba(245, 247, 249, 0.95)',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              backgroundColor: 'rgba(245, 247, 249, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 280px)` },
          mt: 8, // Altura del AppBar
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: enableAnimations && !showReducedMotion ? 0.3 : 0,
              ease: 'easeInOut'
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Drawer de configuración */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={handleSettingsToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            backgroundColor: 'rgba(245, 247, 249, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
            ⚙️ Configuración
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Interfaz
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={enableAnimations}
                  onChange={toggleAnimations}
                />
              }
              label="Habilitar animaciones"
            />
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Layout