// Tipos base para la aplicación
export interface Obra {
  id: string
  nombre_obra: string
  fecha_inicio: string
  fecha_fin: string
  avance_percent: number
  dias_retraso: number
  estado: 'en_progreso' | 'pausada' | 'completada' | 'cancelada'
  prioridad: 'alta' | 'media' | 'baja'
  responsable?: string
  ubicacion?: string
  presupuesto?: number
  costo_actual?: number
  descripcion?: string
  [key: string]: any // Para campos dinámicos de la API
}

export interface Alerta {
  id: string
  obra_id: string
  tipo: 'retraso' | 'avance' | 'presupuesto' | 'general'
  severidad: 'ok' | 'warning' | 'critical'
  titulo: string
  descripcion: string
  fecha_creacion: string
  fecha_resolucion?: string
  resuelta: boolean
  metadata?: Record<string, any>
}

export interface SeverityThresholds {
  critical: {
    dias_retraso: number
    avance_percent: number
  }
  warning: {
    dias_retraso: number
    avance_percent: number
  }
}

export interface ColumnMapping {
  id: string
  nombre_obra: string
  fecha_inicio: string
  fecha_fin: string
  avance_percent: string
  dias_retraso: string
  estado: string
  prioridad: string
  [key: string]: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SocketEvent {
  type: 'alert:create' | 'alert:update' | 'alert:delete' | 'obra:update'
  data: Alerta | Obra
  timestamp: string
}

export interface NotificationConfig {
  enabled: boolean
  criticalOnly: boolean
  sound: boolean
  desktop: boolean
}

export interface AppSettings {
  columnMapping: ColumnMapping
  severityThresholds: SeverityThresholds
  notifications: NotificationConfig
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoRefresh: boolean
  refreshInterval: number
}

// Tipos para detección automática de esquema
export interface FieldMapping {
  originalField: string
  mappedField: keyof Obra
  confidence: number
  type: 'string' | 'number' | 'boolean' | 'date'
}

export interface SchemaDetection {
  fields: FieldMapping[]
  confidence: number
  suggestions: string[]
}

// Tipos para filtros y búsqueda
export interface FilterOptions {
  severidad?: ('ok' | 'warning' | 'critical')[]
  estado?: string[]
  prioridad?: string[]
  fecha_desde?: string
  fecha_hasta?: string
  responsable?: string
  ubicacion?: string
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface TableState {
  page: number
  pageSize: number
  filters: FilterOptions
  sort: SortOptions
  search: string
}

// Tipos para gráficos
export interface ChartData {
  name: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

// Tipos para formularios
export interface ObraFormData {
  nombre_obra: string
  fecha_inicio: string
  fecha_fin: string
  avance_percent: number
  estado: string
  prioridad: string
  responsable?: string
  ubicacion?: string
  presupuesto?: number
  descripcion?: string
}

export interface AlertFormData {
  obra_id: string
  tipo: string
  titulo: string
  descripcion: string
  severidad: string
  metadata?: Record<string, any>
}
