import React, { useState, useEffect } from 'react'
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
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

import { useSettingsStore } from '../store/settings'
import bgImage from '../assets/image.png'
import { formatDate } from '../utils/dateFormatting'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const { enableAnimations, showReducedMotion, toggleAnimations } = useSettingsStore()

  // Actualizar última sincronización cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen)
  }


  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  ]

  const drawer = (
    <Box sx={{ width: 280, height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: theme.palette.text.primary }}>
          🚨 Panel de Alertas
        </Typography>
      </Toolbar>
      <Divider />
      
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
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
          Configuración
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={enableAnimations}
              onChange={toggleAnimations}
              size="small"
            />
          }
          label="Animaciones"
          sx={{ 
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
              color: theme.palette.text.primary
            }
          }}
        />
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
                🚨 Panel de Alertas de Proyectos
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Monitoreo en tiempo real • Última sincronización: {formatDate(lastSync, 'HH:mm')}
              </Typography>
            </motion.div>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {/* Configuración */}
            <Tooltip title="Configuración">
              <IconButton color="inherit" onClick={handleSettingsToggle}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            {/* Actualizar */}
            <Tooltip title="Actualizar datos">
              <IconButton color="inherit">
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