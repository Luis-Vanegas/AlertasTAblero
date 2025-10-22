/**
 * Servicio unificado para manejar datos de alertas y obras relacionadas
 */

import { alertasApiService } from './alertasApi';
import { obrasApiService } from './obrasApi';

export interface UnifiedProject {
  // Datos de alerta
  alertaId: string;
  idObra: string;
  nombreObra: string;
  estadoObra: string;
  dependencia: string;
  comuna: string;
  proyectoEstrategico: string;
  descripcionAlerta: string;
  fechaAlerta: string;
  impactoRiesgo: string;
  generaCambioProyecto: boolean;
  descripcionCambio: string;
  responsableAprobarCambio: string;
  gravedad: string;
  fechaCreacion: string;
  usuarioCreador: string;
  fechaActualizacion: string;
  usuarioActualizador: string;

  // Datos de obra
  obraId: string;
  urlImagen?: string;
  estadoObraDetallado: string;
  descripcion: string;
  tipoIntervencion: string;
  direccion: string;
  longitud?: number;
  latitud?: number;
  costoEstimadoTotal: number;
  costoTotalActualizado: number;
  presupuestoEjecutado: number;
  presupuestoPorcentajeEjecutado: number;
  avance2024: number;
  presupuestoEjecutado2024: number;
  avance2025: number;
  presupuestoEjecutado2025: number;
  avance2026: number;
  presupuestoEjecutado2026: number;
  avance2027: number;
  presupuestoEjecutado2027: number;
  codigoProyecto1?: string;
  codigoProyecto2?: string;
  codigoProyecto3?: string;
  subproyectoEstrategico?: string;
  relacionPot?: string;
  codigoProgramaPdd?: string;
  indicador1?: string;
  indicador2?: string;
  indicador3?: string;
  periodoAdministrativo?: string;
  etapa: string;
  contratosAsociados?: string;
  contratistaOperador?: string;
  convenio?: string;
  responsableSupervisor?: string;
  empleosGenerados?: number;
  areaConstruida?: number;
  areaEspacioPublico?: number;
  fechaEstimadaEntrega?: string;
  obraEntregada: boolean;
  fechaRealEntrega?: string;
  porcentajePlaneacionMga?: number;
  inversionPlaneacionMga?: number;
  fechaInicioEstimadaPlaneacionMga?: string;
  fechaInicioRealPlaneacionMga?: string;
  fechaFinEstimadaPlaneacionMga?: string;
  fechaFinRealPlaneacionMga?: string;
  noAplicaPlaneacionMga: boolean;
  porcentajeEstudiosPreliminares?: number;
  inversionEstudiosPreliminares?: number;
  fechaInicioEstimadaEstudiosPreliminares?: string;
  fechaInicioRealEstudiosPreliminares?: string;
  fechaFinEstimadaEstudiosPreliminares?: string;
  fechaFinRealEstudiosPreliminares?: string;
  noAplicaEstudiosPreliminares: boolean;
  porcentajeViabilizacionDap?: number;
  inversionViabilizacionDap?: number;
  fechaInicioEstimadaViabilizacionDap?: string;
  fechaInicioRealViabilizacionDap?: string;
  fechaFinEstimadaViabilizacionDap?: string;
  fechaFinRealViabilizacionDap?: string;
  noAplicaViabilizacionDap: boolean;
  porcentajeLicenciasCuraduria?: number;
  inversionLicenciasCuraduria?: number;
  fechaInicioEstimadaLicenciasCuraduria?: string;
  fechaInicioRealLicenciasCuraduria?: string;
  fechaFinEstimadaLicenciasCuraduria?: string;
  fechaFinRealLicenciasCuraduria?: string;
  noAplicaLicenciasCuraduria: boolean;
  porcentajeGestionPredial?: number;
  inversionGestionPredial?: number;
  fechaInicioEstimadaGestionPredial?: string;
  fechaInicioRealGestionPredial?: string;
  fechaFinEstimadaGestionPredial?: string;
  fechaFinRealGestionPredial?: string;
  noAplicaGestionPredial: boolean;
  porcentajeContratacion?: number;
  inversionContratacion?: number;
  fechaInicioEstimadaContratacion?: string;
  fechaInicioRealContratacion?: string;
  fechaFinEstimadaContratacion?: string;
  fechaFinRealContratacion?: string;
  noAplicaContratacion: boolean;
  porcentajeInicio?: number;
  inversionInicio?: number;
  fechaInicioEstimadaInicio?: string;
  fechaInicioRealInicio?: string;
  fechaFinEstimadaInicio?: string;
  fechaFinRealInicio?: string;
  noAplicaInicio: boolean;
  porcentajeDisenos?: number;
  inversionDisenos?: number;
  fechaInicioEstimadaDisenos?: string;
  fechaInicioRealDisenos?: string;
  fechaFinEstimadaDisenos?: string;
  fechaFinRealDisenos?: string;
  noAplicaDisenos: boolean;
  porcentajeEjecucion?: number;
  inversionEjecucion?: number;
  fechaInicioEstimadaEjecucion?: string;
  fechaInicioRealEjecucion?: string;
  fechaFinEstimadaEjecucion?: string;
  fechaFinRealEjecucion?: string;
  noAplicaEjecucion: boolean;
  porcentajeLiquidacion?: number;
  inversionLiquidacion?: number;
  fechaInicioEstimadaLiquidacion?: string;
  fechaInicioRealLiquidacion?: string;
  fechaFinEstimadaLiquidacion?: string;
  fechaFinRealLiquidacion?: string;
  noAplicaLiquidacion: boolean;

  // Campos calculados
  tieneAlertas: boolean;
  totalAlertas: number;
  alertasCriticas: number;
  alertasModeradas: number;
  alertasLeves: number;
  ultimaAlerta: string | undefined;
  progresoTotal: number;
  presupuestoDisponible: number;
  diasRestantes: number | undefined;
  estaAtrasado: boolean;
  requiereAtencion: boolean;
}

export interface UnifiedFilters {
  // Filtros de alertas
  gravedad: string[];
  impacto: string[];
  searchTerm: string;

  // Filtros de obras
  etapa: string[];
  estadoObra: string[];
  dependencia: string[];
  comuna: string[];
  proyectoEstrategico: string[];
  tipoIntervencion: string[];
  periodoAdministrativo: string[];

  // Filtros de presupuesto
  rangoPresupuesto: {
    min: number;
    max: number;
  };

  // Filtros de fechas
  rangoFechas: {
    inicio: string;
    fin: string;
  };

  // Filtros de progreso
  rangoProgreso: {
    min: number;
    max: number;
  };

  // Filtros de alertas
  tieneAlertas: boolean;
  soloConAlertas: boolean;
  soloSinAlertas: boolean;

  // Filtros de estado
  obraEntregada: boolean;
  estaAtrasado: boolean;
  requiereAtencion: boolean;
}

class UnifiedDataService {
  private cache: Map<string, UnifiedProject[]> = new Map();
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene datos unificados de alertas y obras
   */
  async getUnifiedData(forceRefresh = false): Promise<UnifiedProject[]> {
    const cacheKey = 'unified_data';
    const now = Date.now();

    if (!forceRefresh && this.cache.has(cacheKey) && now - this.lastFetch < this.CACHE_DURATION) {
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log('🔄 Obteniendo datos unificados...');

      // Obtener datos de ambas APIs
      const [alertasResponse, obrasResponse] = await Promise.all([
        alertasApiService.getAlertas(),
        obrasApiService.getObras(),
      ]);

      const alertas = alertasResponse.data || [];
      const obras = obrasResponse || [];

      console.log(`📊 Procesando ${alertas.length} alertas y ${obras.length} obras...`);

      // Crear mapa de obras por ID para búsqueda rápida
      const obrasMap = new Map();
      obras.forEach(obra => {
        obrasMap.set(String(obra.id), obra);
      });

      // Agrupar alertas por ID OBRA
      const alertasPorObra = new Map<string, unknown[]>();
      alertas.forEach(alerta => {
        const idObra = String(alerta['ID OBRA']);
        if (!alertasPorObra.has(idObra)) {
          alertasPorObra.set(idObra, []);
        }
        alertasPorObra.get(idObra)!.push(alerta);
      });

      // Crear proyectos unificados
      const unifiedProjects: UnifiedProject[] = [];

      // Procesar obras que tienen alertas
      alertasPorObra.forEach((alertasDeObra, idObra) => {
        const obra = obrasMap.get(idObra);
        if (obra) {
          const proyecto = this.createUnifiedProject(obra, alertasDeObra);
          unifiedProjects.push(proyecto);
        }
      });

      // Procesar obras sin alertas (opcional)
      obras.forEach(obra => {
        const idObra = String(obra.id);
        if (!alertasPorObra.has(idObra)) {
          const proyecto = this.createUnifiedProject(obra, []);
          unifiedProjects.push(proyecto);
        }
      });

      console.log(`✅ Datos unificados creados: ${unifiedProjects.length} proyectos`);

      this.cache.set(cacheKey, unifiedProjects);
      this.lastFetch = now;

      return unifiedProjects;
    } catch (error) {
      console.error('❌ Error obteniendo datos unificados:', error);
      throw error;
    }
  }

  /**
   * Crea un proyecto unificado a partir de una obra y sus alertas
   */
  private createUnifiedProject(obra: unknown, alertas: unknown[]): UnifiedProject {
    // Type assertions for dynamic property access
    const obraData = obra as Record<string, unknown>;
    const alertasData = alertas as Record<string, unknown>[];

    // Calcular estadísticas de alertas
    const alertasCriticas = alertasData.filter(a =>
      ['crítica', 'alta', 'critical', 'high'].includes((a.GRAVEDAD as string)?.toLowerCase())
    ).length;

    const alertasModeradas = alertasData.filter(a =>
      ['media', 'moderada', 'medium', 'moderate'].includes((a.GRAVEDAD as string)?.toLowerCase())
    ).length;

    const alertasLeves = alertasData.filter(a =>
      ['leve', 'baja', 'low', 'info'].includes((a.GRAVEDAD as string)?.toLowerCase())
    ).length;

    // Calcular progreso total
    const progresoTotal = (obraData['PRESUPUESTO PORCENTAJE EJECUTADO'] as number) || 0;

    // Calcular presupuesto disponible
    const presupuestoDisponible =
      ((obraData['COSTO TOTAL ACTUALIZADO'] as number) || 0) -
      ((obraData['PRESUPUESTO EJECUTADO'] as number) || 0);

    // Calcular días restantes
    const fechaEstimada = obraData['FECHA ESTIMADA DE ENTREGA'] as string;
    const diasRestantes = fechaEstimada
      ? Math.ceil(
          (new Date(fechaEstimada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      : undefined;

    // Determinar si está atrasado
    const estaAtrasado = diasRestantes !== undefined && diasRestantes < 0;

    // Determinar si requiere atención
    const requiereAtencion = alertasCriticas > 0 || estaAtrasado || progresoTotal < 10;

    return {
      // Datos de alerta (del primer alerta o valores por defecto)
      alertaId: (alertasData[0]?.id as string) || '',
      idObra: String(obraData.id),
      nombreObra: (obraData.NOMBRE as string) || '',
      estadoObra:
        (alertasData[0]?.['ESTADO OBRA'] as string) ||
        (obraData['ESTADO DE LA OBRA'] as string) ||
        '',
      dependencia:
        (alertasData[0]?.DEPENDENCIA as string) || (obraData.DEPENDENCIA as string) || '',
      comuna:
        (alertasData[0]?.['COMUNA O CORREGIMIENTO'] as string) ||
        (obraData['COMUNA O CORREGIMIENTO'] as string) ||
        '',
      proyectoEstrategico:
        (alertasData[0]?.['PROYECTO ESTRATÉGICO'] as string) ||
        (obraData['PROYECTO ESTRATÉGICO'] as string) ||
        '',
      descripcionAlerta: (alertasData[0]?.['DESCRIPCIÓN ALERTA'] as string) || '',
      fechaAlerta: (alertasData[0]?.['FECHA ALERTA'] as string) || '',
      impactoRiesgo: (alertasData[0]?.['IMPACTO RIESGO'] as string) || '',
      generaCambioProyecto: (alertasData[0]?.['GENERA CAMBIO PROYECTO'] as boolean) || false,
      descripcionCambio: (alertasData[0]?.['DESCRIPCIÓN CAMBIO'] as string) || '',
      responsableAprobarCambio: (alertasData[0]?.['RESPONSABLE APROBAR CAMBIO'] as string) || '',
      gravedad: (alertasData[0]?.GRAVEDAD as string) || '',
      fechaCreacion: (alertasData[0]?.['FECHA CREACIÓN'] as string) || '',
      usuarioCreador: (alertasData[0]?.['USUARIO CREADOR'] as string) || '',
      fechaActualizacion: (alertasData[0]?.['FECHA ACTUALIZACIÓN'] as string) || '',
      usuarioActualizador: (alertasData[0]?.['USUARIO ACTUALIZADOR'] as string) || '',

      // Datos de obra
      obraId: String(obraData.id),
      urlImagen: obraData['URL IMAGEN'] as string,
      estadoObraDetallado: (obraData['ESTADO DE LA OBRA'] as string) || '',
      descripcion: (obraData.DESCRIPCIÓN as string) || '',
      tipoIntervencion: (obraData['TIPO DE INTERVECIÓN'] as string) || '',
      direccion: (obraData.DIRECCIÓN as string) || '',
      longitud: obraData.LONGITUD as number,
      latitud: obraData.LATITUD as number,
      costoEstimadoTotal: (obraData['COSTO ESTIMADO TOTAL'] as number) || 0,
      costoTotalActualizado: (obraData['COSTO TOTAL ACTUALIZADO'] as number) || 0,
      presupuestoEjecutado: (obraData['PRESUPUESTO EJECUTADO'] as number) || 0,
      presupuestoPorcentajeEjecutado: (obraData['PRESUPUESTO PORCENTAJE EJECUTADO'] as number) || 0,
      avance2024: (obraData['AVANCE 2024'] as number) || 0,
      presupuestoEjecutado2024: (obraData['PRESUPUESTO EJECUTADO 2024'] as number) || 0,
      avance2025: (obraData['AVANCE 2025'] as number) || 0,
      presupuestoEjecutado2025: (obraData['PRESUPUESTO EJECUTADO 2025'] as number) || 0,
      avance2026: (obraData['AVANCE 2026'] as number) || 0,
      presupuestoEjecutado2026: (obraData['PRESUPUESTO EJECUTADO 2026'] as number) || 0,
      avance2027: (obraData['AVANCE 2027'] as number) || 0,
      presupuestoEjecutado2027: (obraData['PRESUPUESTO EJECUTADO 2027'] as number) || 0,
      codigoProyecto1: obraData['CÓDIGO PROYECTO 1'] as string,
      codigoProyecto2: obraData['CÓDIGO PROYECTO 2'] as string,
      codigoProyecto3: obraData['CÓDIGO PROYECTO 3'] as string,
      subproyectoEstrategico: obraData['SUBPROYECTO ESTRATÉGICO'] as string,
      relacionPot: obraData['RELACIÓN POT'] as string,
      codigoProgramaPdd: obraData['CÓDIGO DEL PROGRAMA PDD'] as string,
      indicador1: obraData['INDICADOR 1'] as string,
      indicador2: obraData['INDICADOR 2'] as string,
      indicador3: obraData['INDICADOR 3'] as string,
      periodoAdministrativo: obraData['PERIODO ADMINISTRATIVO'] as string,
      etapa: (obraData.ETAPA as string) || '',
      contratosAsociados: obraData['CONTRATOS ASOCIADOS'] as string,
      contratistaOperador: obraData['CONTRATISTA OPERADOR'] as string,
      convenio: obraData.CONVENIO as string,
      responsableSupervisor: obraData['RESPONSABLE SUPERVISOR'] as string,
      empleosGenerados: obraData['EMPLEOS GENERADOS'] as number,
      areaConstruida: obraData['ÁREA CONSTRUIDA'] as number,
      areaEspacioPublico: obraData['ÁREA DE ESPACIO PÚBLICO'] as number,
      fechaEstimadaEntrega: obraData['FECHA ESTIMADA DE ENTREGA'] as string,
      obraEntregada: (obraData['¿OBRA ENTREGADA?'] as boolean) || false,
      fechaRealEntrega: obraData['FECHA REAL DE ENTREGA'] as string,
      porcentajePlaneacionMga: obraData['PORCENTAJE PLANEACIÓN (MGA)'] as number,
      inversionPlaneacionMga: obraData['INVERSIÓN PLANEACIÓN (MGA)'] as number,
      fechaInicioEstimadaPlaneacionMga: obraData[
        'FECHA INICIO ESTIMADA PLANEACIÓN (MGA)'
      ] as string,
      fechaInicioRealPlaneacionMga: obraData['FECHA INICIO REAL PLANEACIÓN (MGA)'] as string,
      fechaFinEstimadaPlaneacionMga: obraData['FECHA FIN ESTIMADA PLANEACIÓN (MGA)'] as string,
      fechaFinRealPlaneacionMga: obraData['FECHA FIN REAL PLANEACIÓN (MGA)'] as string,
      noAplicaPlaneacionMga: (obraData['NO APLICA PLANEACIÓN (MGA)'] as boolean) || false,
      porcentajeEstudiosPreliminares: obraData['PORCENTAJE ESTUDIOS PRELIMINARES'] as number,
      inversionEstudiosPreliminares: obraData['INVERSIÓN ESTUDIOS PRELIMINARES'] as number,
      fechaInicioEstimadaEstudiosPreliminares: obraData[
        'FECHA INICIO ESTIMADA ESTUDIOS PRELIMINARES'
      ] as string,
      fechaInicioRealEstudiosPreliminares: obraData[
        'FECHA INICIO REAL ESTUDIOS PRELIMINARES'
      ] as string,
      fechaFinEstimadaEstudiosPreliminares: obraData[
        'FECHA FIN ESTIMADA ESTUDIOS PRELIMINARES'
      ] as string,
      fechaFinRealEstudiosPreliminares: obraData['FECHA FIN REAL ESTUDIOS PRELIMINARES'] as string,
      noAplicaEstudiosPreliminares:
        (obraData['NO APLICA ESTUDIOS PRELIMINARES'] as boolean) || false,
      porcentajeViabilizacionDap: obraData['PORCENTAJE VIABILIZACIÓN (DAP)'] as number,
      inversionViabilizacionDap: obraData['INVERSIÓN VIABILIZACIÓN (DAP)'] as number,
      fechaInicioEstimadaViabilizacionDap: obraData[
        'FECHA INICIO ESTIMADA VIABILIZACIÓN (DAP)'
      ] as string,
      fechaInicioRealViabilizacionDap: obraData['FECHA INICIO REAL VIABILIZACIÓN (DAP)'] as string,
      fechaFinEstimadaViabilizacionDap: obraData[
        'FECHA FIN ESTIMADA VIABILIZACIÓN (DAP)'
      ] as string,
      fechaFinRealViabilizacionDap: obraData['FECHA FIN REAL VIABILIZACIÓN (DAP)'] as string,
      noAplicaViabilizacionDap: (obraData['NO APLICA VIABILIZACIÓN (DAP)'] as boolean) || false,
      porcentajeLicenciasCuraduria: obraData['PORCENTAJE LICENCIAS (CURADURÍA)'] as number,
      inversionLicenciasCuraduria: obraData['INVERSIÓN LICENCIAS (CURADURÍA)'] as number,
      fechaInicioEstimadaLicenciasCuraduria: obraData[
        'FECHA INICIO ESTIMADA LICENCIAS (CURADURÍA)'
      ] as string,
      fechaInicioRealLicenciasCuraduria: obraData[
        'FECHA INICIO REAL LICENCIAS (CURADURÍA)'
      ] as string,
      fechaFinEstimadaLicenciasCuraduria: obraData[
        'FECHA FIN ESTIMADA LICENCIAS (CURADURÍA)'
      ] as string,
      fechaFinRealLicenciasCuraduria: obraData['FECHA FIN REAL LICENCIAS (CURADURÍA)'] as string,
      noAplicaLicenciasCuraduria: (obraData['NO APLICA LICENCIAS (CURADURÍA)'] as boolean) || false,
      porcentajeGestionPredial: obraData['PORCENTAJE GESTIÓN PREDIAL'] as number,
      inversionGestionPredial: obraData['INVERSIÓN GESTIÓN PREDIAL'] as number,
      fechaInicioEstimadaGestionPredial: obraData[
        'FECHA INICIO ESTIMADA GESTIÓN PREDIAL'
      ] as string,
      fechaInicioRealGestionPredial: obraData['FECHA INICIO REAL GESTIÓN PREDIAL'] as string,
      fechaFinEstimadaGestionPredial: obraData['FECHA FIN ESTIMADA GESTIÓN PREDIAL'] as string,
      fechaFinRealGestionPredial: obraData['FECHA FIN REAL GESTIÓN PREDIAL'] as string,
      noAplicaGestionPredial: (obraData['NO APLICA GESTIÓN PREDIAL'] as boolean) || false,
      porcentajeContratacion: obraData['PORCENTAJE CONTRATACIÓN'] as number,
      inversionContratacion: obraData['INVERSIÓN CONTRATACIÓN'] as number,
      fechaInicioEstimadaContratacion: obraData['FECHA INICIO ESTIMADA CONTRATACIÓN'] as string,
      fechaInicioRealContratacion: obraData['FECHA INICIO REAL CONTRATACIÓN'] as string,
      fechaFinEstimadaContratacion: obraData['FECHA FIN ESTIMADA CONTRATACIÓN'] as string,
      fechaFinRealContratacion: obraData['FECHA FIN REAL CONTRATACIÓN'] as string,
      noAplicaContratacion: (obraData['NO APLICA CONTRATACIÓN'] as boolean) || false,
      porcentajeInicio: obraData['PORCENTAJE INICIO'] as number,
      inversionInicio: obraData['INVERSIÓN INICIO'] as number,
      fechaInicioEstimadaInicio: obraData['FECHA INICIO ESTIMADA INICIO'] as string,
      fechaInicioRealInicio: obraData['FECHA INICIO REAL INICIO'] as string,
      fechaFinEstimadaInicio: obraData['FECHA FIN ESTIMADA INICIO'] as string,
      fechaFinRealInicio: obraData['FECHA FIN REAL INICIO'] as string,
      noAplicaInicio: (obraData['NO APLICA INICIO'] as boolean) || false,
      porcentajeDisenos: obraData['PORCENTAJE DISEÑOS'] as number,
      inversionDisenos: obraData['INVERSIÓN DISEÑOS'] as number,
      fechaInicioEstimadaDisenos: obraData['FECHA INICIO ESTIMADA DISEÑOS'] as string,
      fechaInicioRealDisenos: obraData['FECHA INICIO REAL DISEÑOS'] as string,
      fechaFinEstimadaDisenos: obraData['FECHA FIN ESTIMADA DISEÑOS'] as string,
      fechaFinRealDisenos: obraData['FECHA FIN REAL DISEÑOS'] as string,
      noAplicaDisenos: (obraData['NO APLICA DISEÑOS'] as boolean) || false,
      porcentajeEjecucion: (obraData['PORCENTAJE EJECUCIÓN'] as number) || 0,
      inversionEjecucion: obraData['INVERSIÓN EJECUCIÓN'] as number,
      fechaInicioEstimadaEjecucion: obraData['FECHA INICIO ESTIMADA EJECUCIÓN'] as string,
      fechaInicioRealEjecucion: obraData['FECHA INICIO REAL EJECUCIÓN'] as string,
      fechaFinEstimadaEjecucion: obraData['FECHA FIN ESTIMADA EJECUCIÓN'] as string,
      fechaFinRealEjecucion: obraData['FECHA FIN REAL EJECUCIÓN'] as string,
      noAplicaEjecucion: (obraData['NO APLICA EJECUCIÓN'] as boolean) || false,
      porcentajeLiquidacion: obraData['PORCENTAJE LIQUIDACIÓN'] as number,
      inversionLiquidacion: obraData['INVERSIÓN LIQUIDACIÓN'] as number,
      fechaInicioEstimadaLiquidacion: obraData['FECHA INICIO ESTIMADA LIQUIDACIÓN'] as string,
      fechaInicioRealLiquidacion: obraData['FECHA INICIO REAL LIQUIDACIÓN'] as string,
      fechaFinEstimadaLiquidacion: obraData['FECHA FIN ESTIMADA LIQUIDACIÓN'] as string,
      fechaFinRealLiquidacion: obraData['FECHA FIN REAL LIQUIDACIÓN'] as string,
      noAplicaLiquidacion: (obraData['NO APLICA LIQUIDACIÓN'] as boolean) || false,

      // Campos calculados
      tieneAlertas: alertasData.length > 0,
      totalAlertas: alertasData.length,
      alertasCriticas,
      alertasModeradas,
      alertasLeves,
      ultimaAlerta: alertasData.length > 0 ? (alertasData[0]['FECHA ALERTA'] as string) : undefined,
      progresoTotal: progresoTotal,
      presupuestoDisponible: presupuestoDisponible,
      diasRestantes,
      estaAtrasado,
      requiereAtencion,
    };
  }

  /**
   * Filtra proyectos unificados según los criterios especificados
   */
  filterProjects(projects: UnifiedProject[], filters: Partial<UnifiedFilters>): UnifiedProject[] {
    return projects.filter(project => {
      // Filtro por gravedad de alertas
      if (filters.gravedad && filters.gravedad.length > 0) {
        if (!filters.gravedad.includes(project.gravedad.toLowerCase())) {
          return false;
        }
      }

      // Filtro por etapa de obra
      if (filters.etapa && filters.etapa.length > 0) {
        if (!filters.etapa.includes(project.etapa)) {
          return false;
        }
      }

      // Filtro por estado de obra
      if (filters.estadoObra && filters.estadoObra.length > 0) {
        if (!filters.estadoObra.includes(project.estadoObraDetallado)) {
          return false;
        }
      }

      // Filtro por dependencia
      if (filters.dependencia && filters.dependencia.length > 0) {
        if (!filters.dependencia.includes(project.dependencia)) {
          return false;
        }
      }

      // Filtro por comuna
      if (filters.comuna && filters.comuna.length > 0) {
        if (!filters.comuna.includes(project.comuna)) {
          return false;
        }
      }

      // Filtro por proyecto estratégico
      if (filters.proyectoEstrategico && filters.proyectoEstrategico.length > 0) {
        if (!filters.proyectoEstrategico.includes(project.proyectoEstrategico)) {
          return false;
        }
      }

      // Filtro por tipo de intervención
      if (filters.tipoIntervencion && filters.tipoIntervencion.length > 0) {
        if (!filters.tipoIntervencion.includes(project.tipoIntervencion)) {
          return false;
        }
      }

      // Filtro por rango de presupuesto
      if (filters.rangoPresupuesto) {
        const presupuesto = project.costoTotalActualizado;
        if (
          presupuesto < filters.rangoPresupuesto.min ||
          presupuesto > filters.rangoPresupuesto.max
        ) {
          return false;
        }
      }

      // Filtro por rango de progreso
      if (filters.rangoProgreso) {
        const progreso = project.progresoTotal;
        if (progreso < filters.rangoProgreso.min || progreso > filters.rangoProgreso.max) {
          return false;
        }
      }

      // Filtro por búsqueda de texto
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchableFields = [
          project.nombreObra,
          project.dependencia,
          project.comuna,
          project.proyectoEstrategico,
          project.descripcion,
          project.tipoIntervencion,
          project.descripcionAlerta,
        ];

        if (!searchableFields.some(field => field && field.toLowerCase().includes(searchTerm))) {
          return false;
        }
      }

      // Filtro por estado de alertas
      if (filters.tieneAlertas !== undefined) {
        if (project.tieneAlertas !== filters.tieneAlertas) {
          return false;
        }
      }

      if (filters.soloConAlertas && !project.tieneAlertas) {
        return false;
      }

      if (filters.soloSinAlertas && project.tieneAlertas) {
        return false;
      }

      // Filtro por estado de obra
      if (filters.obraEntregada !== undefined) {
        if (project.obraEntregada !== filters.obraEntregada) {
          return false;
        }
      }

      if (filters.estaAtrasado !== undefined) {
        if (project.estaAtrasado !== filters.estaAtrasado) {
          return false;
        }
      }

      if (filters.requiereAtencion !== undefined) {
        if (project.requiereAtencion !== filters.requiereAtencion) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Obtiene opciones de filtro disponibles
   */
  getFilterOptions(projects: UnifiedProject[]) {
    const etapas = [...new Set(projects.map(p => p.etapa).filter(Boolean))].sort();
    const estadosObra = [
      ...new Set(projects.map(p => p.estadoObraDetallado).filter(Boolean)),
    ].sort();
    const dependencias = [...new Set(projects.map(p => p.dependencia).filter(Boolean))].sort();
    const comunas = [...new Set(projects.map(p => p.comuna).filter(Boolean))].sort();
    const proyectosEstrategicos = [
      ...new Set(projects.map(p => p.proyectoEstrategico).filter(Boolean)),
    ].sort();
    const tiposIntervencion = [
      ...new Set(projects.map(p => p.tipoIntervencion).filter(Boolean)),
    ].sort();
    const periodosAdministrativos = [
      ...new Set(projects.map(p => p.periodoAdministrativo).filter(Boolean)),
    ].sort();
    const gravedades = [...new Set(projects.map(p => p.gravedad).filter(Boolean))].sort();

    return {
      etapas,
      estadosObra,
      dependencias,
      comunas,
      proyectosEstrategicos,
      tiposIntervencion,
      periodosAdministrativos,
      gravedades,
    };
  }

  /**
   * Limpia la caché
   */
  clearCache() {
    this.cache.clear();
    this.lastFetch = 0;
  }
}

export const unifiedDataService = new UnifiedDataService();
