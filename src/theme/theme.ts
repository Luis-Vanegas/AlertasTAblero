import { createTheme } from '@mui/material/styles'

// Colores personalizados según especificaciones
const colors = {
  primary: '#00C9FF', // Cian brillante para header
  secondary: '#00A89C', // Verde/teal para acentos
  surface: '#F5F7F9', // Gris muy claro para tarjetas
  textPrimary: '#0B2A33', // Casi negro para texto principal
  textSecondary: '#FFFFFF', // Blanco para texto en fondo oscuro
  critical: '#FF3B30', // Rojo visible solo para criticidad
  warning: '#FFA726', // Naranja para advertencias
  success: '#66BB6A', // Verde para OK
  background: '#FFFFFF', // Fondo blanco
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: '#4DD0E1',
      dark: '#00ACC1',
      contrastText: colors.textSecondary,
    },
    secondary: {
      main: colors.secondary,
      light: '#26A69A',
      dark: '#00695C',
      contrastText: colors.textSecondary,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: '#546E7A',
    },
    error: {
      main: colors.critical,
      light: '#FFCDD2',
      dark: '#D32F2F',
    },
    warning: {
      main: colors.warning,
      light: '#FFE0B2',
      dark: '#F57C00',
    },
    success: {
      main: colors.success,
      light: '#C8E6C9',
      dark: '#388E3C',
    },
    // Colores personalizados para severidad
    severity: {
      critical: colors.critical,
      warning: colors.warning,
      ok: colors.success,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 1px 48px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.textPrimary,
          color: colors.textSecondary,
          fontSize: '0.875rem',
          borderRadius: 8,
          padding: '2px 12px',
        },
        arrow: {
          color: colors.textPrimary,
        },
      },
    },
  },
})

// Declarar módulo para colores personalizados
declare module '@mui/material/styles' {
  interface Palette {
    severity: {
      critical: string
      warning: string
      ok: string
    }
  }

  interface PaletteOptions {
    severity?: {
      critical?: string
      warning?: string
      ok?: string
    }
  }
}