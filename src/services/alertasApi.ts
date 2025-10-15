import { ApiResponse, ApiAlerta, MappedAlerta, ApiFilters, ApiStats } from '../types/api';

// Helpers to avoid 'any' casts
const getField = (obj: unknown, key: string): unknown => {
  if (typeof obj === 'object' && obj !== null && key in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[key];
  }
  return undefined;
};

const getString = (obj: unknown, key: string): string | null => {
  const v = getField(obj, key);
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

const env =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string; VITE_API_KEY?: string } }).env || {};

export class AlertasApiService {
  private baseUrl =
    env.VITE_API_BASE ||
    'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi';
  private apiKey = env.VITE_API_KEY || 'pow3rb1_visor_3str4t3g1co_2025';

  // Datos mock para desarrollo cuando la API falle
  private mockData: ApiResponse = {
    data: [
      {
        id: 1,
        'ID OBRA': 2257,
        'NOMBRE OBRA': 'Cancha de futbol en grama natural PE_ Atanasio Girardot',
        'ESTADO OBRA': 'activo',
        DEPENDENCIA: 'Instituto de Deportes y Recreación (INDER)',
        'COMUNA O CORREGIMIENTO': '11 - Laureles - Estadio',
        'PROYECTO ESTRATÉGICO': 'Estadio Atanasio Girardot',
        'DESCRIPCIÓN ALERTA': 'Contratación e inicio de obra',
        'FECHA ALERTA': '2024-10-02',
        'IMPACTO RIESGO': 'cronograma',
        'GENERA CAMBIO PROYECTO': 'no',
        'DESCRIPCIÓN CAMBIO': '',
        'RESPONSABLE APROBAR CAMBIO': '',
        GRAVEDAD: 'leve',
        'FECHA CREACIÓN': '2025-10-02T20:44:41.908Z',
        'USUARIO CREADOR': 'Diego Armando',
        'FECHA ACTUALIZACIÓN': null,
        'USUARIO ACTUALIZADOR': null,
      },
      {
        id: 2,
        'ID OBRA': 2525,
        'NOMBRE OBRA': 'Mantenimiento Centro Educativo La Volcana',
        'ESTADO OBRA': 'activo',
        DEPENDENCIA: 'Secretaría de Educación',
        'COMUNA O CORREGIMIENTO': '50 - San Sebastián de Palmitas',
        'PROYECTO ESTRATÉGICO': 'Mantenimiento Instituciones Educativas',
        'DESCRIPCIÓN ALERTA': 'Actualización de presupuesto',
        'FECHA ALERTA': '2024-10-01',
        'IMPACTO RIESGO': 'presupuesto',
        'GENERA CAMBIO PROYECTO': 'si',
        'DESCRIPCIÓN CAMBIO': 'Se actualiza el valor en Presupuesto de Costo Total Actualizado',
        'RESPONSABLE APROBAR CAMBIO': 'Álvaro Álvarez',
        GRAVEDAD: 'media',
        'FECHA CREACIÓN': '2025-10-02T18:48:34.611Z',
        'USUARIO CREADOR': 'Alejandro',
        'FECHA ACTUALIZACIÓN': null,
        'USUARIO ACTUALIZADOR': null,
      },
      {
        id: 3,
        'ID OBRA': 3001,
        'NOMBRE OBRA': 'Construcción Puente Peatonal',
        'ESTADO OBRA': 'activo',
        DEPENDENCIA: 'Secretaría de Infraestructura',
        'COMUNA O CORREGIMIENTO': '1 - Popular',
        'PROYECTO ESTRATÉGICO': 'Infraestructura Vial',
        'DESCRIPCIÓN ALERTA': 'Retraso en cronograma de ejecución',
        'FECHA ALERTA': '2024-09-28',
        'IMPACTO RIESGO': 'cronograma',
        'GENERA CAMBIO PROYECTO': 'no',
        'DESCRIPCIÓN CAMBIO': '',
        'RESPONSABLE APROBAR CAMBIO': '',
        GRAVEDAD: 'alta',
        'FECHA CREACIÓN': '2025-09-28T10:30:00.000Z',
        'USUARIO CREADOR': 'María González',
        'FECHA ACTUALIZACIÓN': null,
        'USUARIO ACTUALIZADOR': null,
      },
      {
        id: 4,
        'ID OBRA': 3002,
        'NOMBRE OBRA': 'Mejoramiento Vías Terciarias',
        'ESTADO OBRA': 'activo',
        DEPENDENCIA: 'Secretaría de Infraestructura',
        'COMUNA O CORREGIMIENTO': '2 - Santa Cruz',
        'PROYECTO ESTRATÉGICO': 'Infraestructura Vial',
        'DESCRIPCIÓN ALERTA': 'Falta de materiales de construcción',
        'FECHA ALERTA': '2024-09-25',
        'IMPACTO RIESGO': 'recursos',
        'GENERA CAMBIO PROYECTO': 'si',
        'DESCRIPCIÓN CAMBIO': 'Se requiere ajuste en el presupuesto para compra de materiales',
        'RESPONSABLE APROBAR CAMBIO': 'Carlos Mendoza',
        GRAVEDAD: 'media',
        'FECHA CREACIÓN': '2025-09-25T14:15:00.000Z',
        'USUARIO CREADOR': 'Ana Rodríguez',
        'FECHA ACTUALIZACIÓN': null,
        'USUARIO ACTUALIZADOR': null,
      },
      {
        id: 5,
        'ID OBRA': 3003,
        'NOMBRE OBRA': 'Construcción Centro de Salud',
        'ESTADO OBRA': 'activo',
        DEPENDENCIA: 'Secretaría de Salud',
        'COMUNA O CORREGIMIENTO': '3 - Manrique',
        'PROYECTO ESTRATÉGICO': 'Infraestructura de Salud',
        'DESCRIPCIÓN ALERTA': 'Progreso según cronograma',
        'FECHA ALERTA': '2024-09-30',
        'IMPACTO RIESGO': 'ninguno',
        'GENERA CAMBIO PROYECTO': 'no',
        'DESCRIPCIÓN CAMBIO': '',
        'RESPONSABLE APROBAR CAMBIO': '',
        GRAVEDAD: 'leve',
        'FECHA CREACIÓN': '2025-09-30T09:00:00.000Z',
        'USUARIO CREADOR': 'Luis Pérez',
        'FECHA ACTUALIZACIÓN': null,
        'USUARIO ACTUALIZADOR': null,
      },
    ],
    pagination: {
      page: 1,
      limit: 10000,
      total: 5,
      pages: 1,
    },
    metadata: {
      lastUpdated: '2025-10-02T20:50:40.875Z',
    },
  };

  /**
   * Obtiene todas las alertas con filtros opcionales
   */
  async getAlertas(filters: ApiFilters = {}): Promise<ApiResponse> {
    try {
      // Intentar conectar a la API real
      const params = new URLSearchParams();

      // Añadir parámetros de paginación
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      // Añadir filtros
      if (filters.dependencia) params.append('dependencia', filters.dependencia);
      if (filters.comuna) params.append('comuna', filters.comuna);
      if (filters.proyecto_estrategico)
        params.append('proyecto_estrategico', filters.proyecto_estrategico);
      if (filters.impacto_riesgo) params.append('impacto_riesgo', filters.impacto_riesgo);
      if (filters.gravedad) params.append('gravedad', filters.gravedad);
      if (filters.estado_obra) params.append('estado_obra', filters.estado_obra);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `${this.baseUrl}/alertas?apikey=${this.apiKey}${queryString ? `&${queryString}` : ''}`;

      // Debug removido

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Debug: distribución cruda de campos de interés (sin exponer keys)
      try {
        const raw = Array.isArray((data as unknown as { data?: unknown[] }).data)
          ? (data as unknown as { data?: unknown[] }).data!
          : [];
        const distGravedad: Record<string, number> = {};
        const distImpacto: Record<string, number> = {};
        // Debug removido
        raw.forEach(a => {
          const g =
            getString(a, 'GRAVEDAD') ?? getString(a, 'Gravedad') ?? getString(a, 'SEVERIDAD') ?? '';
          const i = getString(a, 'IMPACTO RIESGO') ?? '';
          if (g) distGravedad[g] = (distGravedad[g] || 0) + 1;
          if (i) distImpacto[i] = (distImpacto[i] || 0) + 1;
        });
        // Debug removido
      } catch (e) {
        console.warn('No se pudo calcular distribución de campos', e);
      }

      // Debug removido
      return data;
    } catch (error) {
      console.warn('API no disponible, usando datos mock:', error);
      // Retornar datos mock cuando la API falle
      return this.getMockData(filters);
    }
  }

  /**
   * Obtiene datos mock filtrados
   */
  private getMockData(filters: ApiFilters = {}): ApiResponse {
    let filteredData = [...this.mockData.data];

    // Aplicar filtros a los datos mock
    if (filters.dependencia) {
      filteredData = filteredData.filter(item =>
        getString(item, 'DEPENDENCIA')?.toLowerCase().includes(filters.dependencia!.toLowerCase())
      );
    }

    if (filters.comuna) {
      filteredData = filteredData.filter(item =>
        getString(item, 'COMUNA O CORREGIMIENTO')
          ?.toLowerCase()
          .includes(filters.comuna!.toLowerCase())
      );
    }

    if (filters.impacto_riesgo) {
      filteredData = filteredData.filter(item =>
        getString(item, 'IMPACTO RIESGO')
          ?.toLowerCase()
          .includes(filters.impacto_riesgo!.toLowerCase())
      );
    }

    if (filters.gravedad) {
      filteredData = filteredData.filter(item =>
        getString(item, 'GRAVEDAD')?.toLowerCase().includes(filters.gravedad!.toLowerCase())
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        item =>
          getString(item, 'NOMBRE OBRA')?.toLowerCase().includes(searchTerm) ||
          getString(item, 'DEPENDENCIA')?.toLowerCase().includes(searchTerm) ||
          getString(item, 'COMUNA O CORREGIMIENTO')?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      ...this.mockData,
      data: filteredData,
      pagination: {
        ...this.mockData.pagination,
        total: filteredData.length,
      },
    };
  }

  /**
   * Obtiene una alerta específica por ID
   */
  async getAlertaById(id: number): Promise<ApiAlerta | null> {
    try {
      const response = await this.getAlertas({ limit: 10000 }); // Obtener todas para buscar por ID
      const alerta = response.data.find(a => a.id === id);
      return alerta || null;
    } catch (error) {
      console.error('Error al obtener alerta por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene alertas por ID de obra
   */
  async getAlertasByObra(obraId: number): Promise<ApiAlerta[]> {
    try {
      const response = await this.getAlertas({ limit: 10000 });
      return response.data.filter(a => getField(a, 'ID OBRA') === obraId);
    } catch (error) {
      console.error('Error al obtener alertas por obra:', error);
      throw error;
    }
  }

  /**
   * Mapea una alerta de la API a nuestro formato interno
   */
  mapAlerta(apiAlerta: ApiAlerta): MappedAlerta {
    const gravedadCampoRaw =
      getString(apiAlerta, 'GRAVEDAD') ??
      getString(apiAlerta, 'Gravedad') ??
      getString(apiAlerta, 'GRAVEDAD RIESGO') ??
      getString(apiAlerta, 'SEVERIDAD');
    const gravedadCampo = gravedadCampoRaw !== null ? gravedadCampoRaw : null;

    const generaCambioRaw = getField(apiAlerta, 'GENERA CAMBIO PROYECTO');
    const generaCambio =
      typeof generaCambioRaw === 'string'
        ? generaCambioRaw.toLowerCase() === 'si' || generaCambioRaw.toLowerCase() === 'true'
        : Boolean(generaCambioRaw);

    const fechaAlertaRaw = getString(apiAlerta, 'FECHA ALERTA');
    const fecha_alerta =
      fechaAlertaRaw && String(fechaAlertaRaw).trim() !== '' ? fechaAlertaRaw : null;

    const mapped = {
      id: (apiAlerta.id || Math.random()).toString(),
      obra_id: (apiAlerta['ID OBRA'] || 0).toString(),
      nombre_obra: apiAlerta['NOMBRE OBRA'] || 'Sin nombre',
      estado_obra: apiAlerta['ESTADO OBRA'] || 'desconocido',
      dependencia: apiAlerta['DEPENDENCIA'] || 'Sin dependencia',
      comuna: apiAlerta['COMUNA O CORREGIMIENTO'] || 'Sin ubicación',
      proyecto_estrategico: apiAlerta['PROYECTO ESTRATÉGICO'] || 'Sin proyecto',
      descripcion_alerta: apiAlerta['DESCRIPCIÓN ALERTA'] || '',
      fecha_alerta,
      impacto_riesgo: apiAlerta['IMPACTO RIESGO'] || '',
      genera_cambio_proyecto: generaCambio,
      descripcion_cambio: apiAlerta['DESCRIPCIÓN CAMBIO'] || '',
      responsable_aprobar_cambio: apiAlerta['RESPONSABLE APROBAR CAMBIO'] || '',
      gravedad: gravedadCampo,
      fecha_creacion: apiAlerta['FECHA CREACIÓN'] || new Date().toISOString(),
      usuario_creador: apiAlerta['USUARIO CREADOR'] || 'Usuario desconocido',
      fecha_actualizacion: apiAlerta['FECHA ACTUALIZACIÓN'] || null,
      usuario_actualizador: apiAlerta['USUARIO ACTUALIZADOR'] || null,
    };

    // Debug removido

    return mapped;
  }

  /**
   * Mapea múltiples alertas de la API
   */
  mapAlertas(apiAlertas: ApiAlerta[]): MappedAlerta[] {
    return apiAlertas.map(alerta => this.mapAlerta(alerta));
  }

  /**
   * Calcula estadísticas de las alertas
   */
  calculateStats(alertas: MappedAlerta[]): ApiStats {
    const stats: ApiStats = {
      total_alertas: alertas.length,
      por_dependencia: {},
      por_comuna: {},
      por_proyecto: {},
      por_impacto: {},
      por_gravedad: {},
      por_estado: {},
      alertas_recientes: 0,
      alertas_criticas: 0,
    };

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    alertas.forEach(alerta => {
      // Contar por dependencia
      stats.por_dependencia[alerta.dependencia] =
        (stats.por_dependencia[alerta.dependencia] || 0) + 1;

      // Contar por comuna
      stats.por_comuna[alerta.comuna] = (stats.por_comuna[alerta.comuna] || 0) + 1;

      // Contar por proyecto
      stats.por_proyecto[alerta.proyecto_estrategico] =
        (stats.por_proyecto[alerta.proyecto_estrategico] || 0) + 1;

      // Contar por impacto
      stats.por_impacto[alerta.impacto_riesgo] =
        (stats.por_impacto[alerta.impacto_riesgo] || 0) + 1;

      // Contar por gravedad
      if (alerta.gravedad) {
        stats.por_gravedad[alerta.gravedad] = (stats.por_gravedad[alerta.gravedad] || 0) + 1;
      }

      // Contar por estado
      stats.por_estado[alerta.estado_obra] = (stats.por_estado[alerta.estado_obra] || 0) + 1;

      // Alertas recientes (últimos 7 días)
      const fechaCreacion = new Date(alerta.fecha_creacion);
      if (fechaCreacion >= sevenDaysAgo) {
        stats.alertas_recientes++;
      }

      // Alertas críticas (gravedad alta o crítica)
      if (alerta.gravedad === 'alta' || alerta.gravedad === 'critica') {
        stats.alertas_criticas++;
      }
    });

    return stats;
  }

  /**
   * Obtiene opciones únicas para filtros
   */
  async getFilterOptions(): Promise<{
    dependencias: string[];
    comunas: string[];
    proyectos: string[];
    impactos: string[];
    gravedades: string[];
    estados: string[];
  }> {
    try {
      const response = await this.getAlertas({ limit: 10000 });
      const alertas = this.mapAlertas(response.data);

      const dependencias = [...new Set(alertas.map(a => a.dependencia))].sort();
      const comunas = [...new Set(alertas.map(a => a.comuna))].sort();
      const proyectos = [...new Set(alertas.map(a => a.proyecto_estrategico))].sort();
      const impactos = [...new Set(alertas.map(a => a.impacto_riesgo))].sort();
      const gravedades = [
        ...new Set(alertas.map(a => a.gravedad).filter((g): g is string => g !== null)),
      ].sort();
      const estados = [...new Set(alertas.map(a => a.estado_obra))].sort();

      return {
        dependencias,
        comunas,
        proyectos,
        impactos,
        gravedades,
        estados,
      };
    } catch (error) {
      console.error('Error al obtener opciones de filtros:', error);
      throw error;
    }
  }

  /**
   * Busca alertas por término de búsqueda
   */
  async searchAlertas(
    searchTerm: string,
    filters: Omit<ApiFilters, 'search'> = {}
  ): Promise<ApiResponse> {
    return this.getAlertas({ ...filters, search: searchTerm });
  }
}

// Instancia singleton
export const alertasApiService = new AlertasApiService();
