import React, { useState } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

import { useSettingsStore } from '../store/settings';
import { useAlertas } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import FilterPanel from './common/FilterPanel';
import { ANIMATION_VARIANTS, TRANSITIONS, UI_CONFIG } from '../constants';
import bgImage from '../assets/image.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    enableAnimations,
    showReducedMotion,
    toggleAnimations,
    filters,
    setFilters,
    clearFilters,
  } = useSettingsStore();
  const { alertas } = useAlertas({ limit: 1000 });
  const isPortrait = useMediaQuery('(orientation: portrait)');

  // Usar el hook de filtros
  const { filterOptions } = useFilters({ alertas, filters });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen);
  };

  const menuItems: Array<{
    text: string;
    icon: React.ReactNode;
    path: string;
  }> = [];

  const appTitle = import.meta.env.VITE_APP_TITLE || 'Alertas';

  const GAP_BETWEEN_DRAWER_AND_APPBAR = 2; // px
  const drawerWidth = UI_CONFIG.DRAWER_WIDTH;

  const drawer = (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Toolbar>
        <Typography variant='h6' noWrap component='div' sx={{ color: theme.palette.text.primary }}>
          {appTitle}
        </Typography>
      </Toolbar>
      <Divider />

      {menuItems.length > 0 && (
        <List>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Divider />

      {/* Panel de filtros */}
      <FilterPanel
        searchTerm={filters.searchTerm}
        dependencias={filterOptions.dependencias}
        comunas={filterOptions.comunas}
        impactoOptions={filterOptions.impactoOptions}
        priorityProjects={filterOptions.priorityProjects as Array<{ key: string; label: string }>}
        selectedDependencies={filters.dependencia}
        selectedGravedades={filters.gravedad}
        selectedImpactos={filters.impacto}
        selectedComunas={filters.comuna || []}
        selectedPriorityProject={filters.priorityProject}
        onSearchChange={value => setFilters({ searchTerm: value })}
        onDependencyChange={dependencies => setFilters({ dependencia: dependencies })}
        onGravedadChange={gravedades => setFilters({ gravedad: gravedades })}
        onImpactoChange={impactos => setFilters({ impacto: impactos })}
        onComunaChange={comunas => setFilters({ comuna: comunas })}
        onPriorityProjectChange={projectKey => setFilters({ priorityProject: projectKey })}
        onClearFilters={clearFilters}
      />
    </Box>
  );

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
        position='fixed'
        sx={{
          width: isPortrait
            ? '100%'
            : { md: `calc(100% - ${drawerWidth + GAP_BETWEEN_DRAWER_AND_APPBAR}px)` },
          ml: isPortrait ? 0 : { md: `${drawerWidth + GAP_BETWEEN_DRAWER_AND_APPBAR}px` },
          backgroundColor: 'rgba(0, 201, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderTopLeftRadius: { md: 2 },
        }}
      >
        <Toolbar sx={{ px: 2, minHeight: 64 }}>
          <IconButton
            color='inherit'
            aria-label='abrir menú'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant='h5' component='div' sx={{ fontWeight: 700, color: 'white' }}>
                {appTitle}
              </Typography>
            </motion.div>
          </Box>

          <Box display='flex' alignItems='center' gap={1}>
            {/* Actualizar: único botón */}
            <Tooltip title='Actualizar datos'>
              <IconButton color='inherit' onClick={() => window.location.reload()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer de navegación */}
      <Box component='nav' sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: isPortrait ? { xs: 'block' } : 'none',
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'rgba(245, 247, 249, 0.95)',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: isPortrait ? 'none' : { md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
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
        component='main'
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          px: { xs: 2.5, sm: 2.5, md: 3 },
          width: isPortrait ? '100%' : { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Altura del AppBar
        }}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={window.location.pathname}
            initial={ANIMATION_VARIANTS.page.initial}
            animate={ANIMATION_VARIANTS.page.in}
            exit={ANIMATION_VARIANTS.page.out}
            transition={{
              duration: enableAnimations && !showReducedMotion ? TRANSITIONS.card.duration : 0,
              ease: TRANSITIONS.card.ease,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Drawer de configuración */}
      <Drawer
        anchor='right'
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
          <Typography variant='h6' sx={{ mb: 3, color: theme.palette.text.primary }}>
            ⚙️ Configuración
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Interfaz
            </Typography>
            <FormControlLabel
              control={<Switch checked={enableAnimations} onChange={toggleAnimations} />}
              label='Habilitar animaciones'
            />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Layout;
