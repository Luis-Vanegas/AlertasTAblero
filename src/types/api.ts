// Tipos específicos para la API real de alertas
export interface ApiAlerta {
  id: number;
  'ID OBRA': number;
  'NOMBRE OBRA': string;
  'ESTADO OBRA': string;
  DEPENDENCIA: string;
  'COMUNA O CORREGIMIENTO': string;
  'PROYECTO ESTRATÉGICO': string;
  'DESCRIPCIÓN ALERTA': string | null;
  'FECHA ALERTA': string | null;
  'IMPACTO RIESGO': string;
  'GENERA CAMBIO PROYECTO': string;
  'DESCRIPCIÓN CAMBIO': string | null;
  'RESPONSABLE APROBAR CAMBIO': string | null;
  GRAVEDAD: string | null;
  'FECHA CREACIÓN': string;
  'USUARIO CREADOR': string;
  'FECHA ACTUALIZACIÓN': string | null;
  'USUARIO ACTUALIZADOR': string | null;
}

export interface ApiResponse<T = ApiAlerta[]> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metadata: {
    lastUpdated: string;
  };
}

// Mapeo de campos de la API a nuestros tipos internos
export interface MappedAlerta {
  id: string;
  obra_id: string;
  nombre_obra: string;
  estado_obra: string;
  dependencia: string;
  comuna: string;
  proyecto_estrategico: string;
  descripcion_alerta: string;
  fecha_alerta: string | null;
  impacto_riesgo: string;
  genera_cambio_proyecto: boolean;
  descripcion_cambio: string | null;
  responsable_aprobar_cambio: string | null;
  gravedad: string | null;
  fecha_creacion: string;
  usuario_creador: string;
  fecha_actualizacion: string | null;
  usuario_actualizador: string | null;
}

// Tipos para filtros de la API
export interface ApiFilters {
  page?: number;
  limit?: number;
  dependencia?: string;
  comuna?: string;
  proyecto_estrategico?: string;
  impacto_riesgo?: string;
  gravedad?: string;
  estado_obra?: string;
  search?: string;
}

// Tipos para estadísticas
export interface ApiStats {
  total_alertas: number;
  por_dependencia: Record<string, number>;
  por_comuna: Record<string, number>;
  por_proyecto: Record<string, number>;
  por_impacto: Record<string, number>;
  por_gravedad: Record<string, number>;
  por_estado: Record<string, number>;
  alertas_recientes: number;
  alertas_criticas: number;
}

// Tipos para el histórico de cambios
export interface ApiHistoricoItem {
  id: number;
  'ID OBRA': number;
  'NOMBRE OBRA': string;
  'ESTADO OBRA': string;
  DEPENDENCIA: string;
  'COMUNA O CORREGIMIENTO': string;
  'PROYECTO ESTRATÉGICO': string;
  ACCIÓN: string;
  'CAMPO MODIFICADO': string;
  'VALOR ANTERIOR': string | null;
  'VALOR NUEVO': string | null;
  'FECHA MODIFICACIÓN': string;
  'USUARIO MODIFICADOR': string;
}

export interface ApiHistoricoResponse {
  data: ApiHistoricoItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metadata: {
    lastUpdated: string;
  };
}

// Tipo para cambios de fechas estimadas
export interface CambioFechaEstimada {
  obra_id: number;
  nombre_obra: string;
  dependencia: string;
  comuna: string;
  proyecto_estrategico: string;
  campo_modificado: string;
  fecha_anterior: string;
  fecha_nueva: string;
  meses_atraso: number;
  fecha_modificacion: string;
  usuario_modificador: string;
}
