/**
 * Constantes de la aplicación
 */

// Configuración de la API
export const API_CONFIG = {
  BASE_URL:
    'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi',
  API_KEY: 'pow3rb1_visor_3str4t3g1co_2025',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Configuración de polling
export const POLLING_CONFIG = {
  DEFAULT_INTERVAL: 60000, // 60 segundos
  MIN_INTERVAL: 10000, // 10 segundos
  MAX_INTERVAL: 300000, // 5 minutos
} as const;

// Configuración de UI
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  SNACKBAR_DURATION: 4000,
  TOAST_DURATION: 4000,
  DRAWER_WIDTH: 240,
  MOBILE_BREAKPOINT: 900,
} as const;

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 25,
  MIN_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_LIMIT: 1000,
} as const;

// Proyectos estratégicos prioritarios
export const PRIORITY_PROJECTS = [
  'gran parque medellin',
  'mejores escenarios deportivos para vos',
  'recreos deportivos',
] as const;

// Opciones de gravedad
export const GRAVEDAD_OPTIONS = [
  { key: 'leve', label: 'Leve', color: 'info' },
  { key: 'media', label: 'Media', color: 'warning' },
  { key: 'crítica', label: 'Crítica', color: 'error' },
] as const;

// Opciones de impacto
export const IMPACTO_OPTIONS = [
  { key: 'presupuesto', label: 'Presupuesto', icon: 'AttachMoney' },
  { key: 'cronograma', label: 'Cronograma', icon: 'Schedule' },
  { key: 'alcance', label: 'Alcance', icon: 'TrackChanges' },
  { key: 'comunidad', label: 'Comunidad', icon: 'Groups' },
] as const;

// Configuración de filtros por defecto
export const DEFAULT_FILTERS = {
  searchTerm: '',
  dependencia: [],
  gravedad: [],
  impacto: [],
  comuna: [],
  priorityProject: '',
} as const;

// Configuración de umbrales de severidad
export const SEVERITY_THRESHOLDS = {
  critical: {
    gravedad: ['alta', 'critica'],
    impacto_riesgo: ['cronograma', 'presupuesto', 'calidad'],
  },
  warning: {
    gravedad: ['media'],
    impacto_riesgo: ['riesgo', 'administrativo'],
  },
} as const;

// Configuración de mapeo de campos
export const FIELD_MAPPING = {
  'ID OBRA': 'obra_id',
  'NOMBRE OBRA': 'nombre_obra',
  'ESTADO OBRA': 'estado_obra',
  DEPENDENCIA: 'dependencia',
  'COMUNA O CORREGIMIENTO': 'comuna',
  'PROYECTO ESTRATÉGICO': 'proyecto_estrategico',
  'DESCRIPCIÓN ALERTA': 'descripcion_alerta',
  'FECHA ALERTA': 'fecha_alerta',
  'IMPACTO RIESGO': 'impacto_riesgo',
  'GENERA CAMBIO PROYECTO': 'genera_cambio_proyecto',
  'DESCRIPCIÓN CAMBIO': 'descripcion_cambio',
  'RESPONSABLE APROBAR CAMBIO': 'responsable_aprobar_cambio',
  GRAVEDAD: 'gravedad',
  'FECHA CREACIÓN': 'fecha_creacion',
  'USUARIO CREADOR': 'usuario_creador',
  'FECHA ACTUALIZACIÓN': 'fecha_actualizacion',
  'USUARIO ACTUALIZADOR': 'usuario_actualizador',
} as const;

// Mensajes de la aplicación
export const MESSAGES = {
  LOADING: 'Cargando datos...',
  NO_DATA: 'No se encontraron alertas',
  ERROR_LOADING: 'Error al cargar las alertas. Por favor, intente nuevamente.',
  ERROR_NETWORK: 'Error de red - verificar conexión',
  SUCCESS_CONNECTION: 'Conectado en tiempo real',
  ERROR_CONNECTION: 'No se pudo conectar al servidor en tiempo real',
  RECONNECTED: 'Reconectado en tiempo real',
  CONNECTION_LOST: 'Conexión en tiempo real perdida',
} as const;

// Configuración de animaciones
export const ANIMATION_VARIANTS = {
  page: {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  },
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
} as const;

// Configuración de transiciones
export const TRANSITIONS = {
  page: {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  },
  card: {
    duration: 0.3,
    ease: 'easeInOut',
  },
} as const;
