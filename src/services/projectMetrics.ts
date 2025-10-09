/**
 * Servicio para calcular métricas de proyectos basadas en datos de obras
 */

import { obrasApiService } from './obrasApi';

export interface ProjectMetrics {
  totalProjects: number;
  budgetChanges: {
    increased: number;
    decreased: number;
    totalChange: number;
    obraIds: string[];
  };
  delayedProjects: {
    count: number;
    projects: Array<{
      name: string;
      delayDays: number;
      estimatedDate: string;
      currentStage: string;
    }>;
    obraIds: string[];
  };
  defundedProjects: {
    count: number;
    obraIds: string[];
  };
  lateProjects: {
    count: number;
    obraIds: string[];
    projects: Array<{
      name: string;
      etapa: string;
      fechaEstimada: string;
      estadoEntrega: string;
      porcentajeEjecucion: number;
      dependencia: string;
      proyectoEstrategico: string;
      razon: string;
    }>;
  };
  pendingDefinitionProjects: {
    count: number;
    obraIds: string[];
    projects: Array<{
      name: string;
      etapa: string;
      fechaEstimada: string;
      estadoEntrega: string;
      porcentajeEjecucion: number;
      dependencia: string;
      proyectoEstrategico: string;
      razon: string;
    }>;
  };
  stageDistribution: Record<string, number>;
  completionRate: number;
}

export class ProjectMetricsService {
  async getProjectMetrics(): Promise<ProjectMetrics> {
    try {
      console.log('🚀 INICIANDO CÁLCULO DE MÉTRICAS DE PROYECTOS...');
      console.log('🔧 Llamando a obrasApiService.getObras()...');
      const obras = await obrasApiService.getObras();
      console.log('✅ OBRAS OBTENIDAS:', obras.length);
      console.log('🔧 Tipo de obras:', typeof obras, Array.isArray(obras));
      console.log('🔧 Primeras 2 obras:', obras.slice(0, 2));

      if (obras.length === 0) {
        console.warn('⚠️ No se obtuvieron obras de la API');
        return this.getEmptyMetrics();
      }

      console.log('🔧 Continuando con el procesamiento de obras...');

      // Mostrar estructura de datos de las primeras 3 obras
      console.log('🔍 ESTRUCTURA DE DATOS DE OBRAS (primeras 3):');
      obras.slice(0, 3).forEach((obra, i) => {
        console.log(
          `${i + 1}. ID OBRA: ${obra['ID OBRA']}, NOMBRE: ${obra['NOMBRE']}, NOMBRE OBRA: ${obra['NOMBRE OBRA']}, ESTADO: ${obra['ESTADO DE LA OBRA']}`
        );
      });

      // Debug: verificar todos los estados únicos
      const estadosUnicos = [
        ...new Set(obras.map(obra => obra['ESTADO DE LA OBRA']).filter(Boolean)),
      ];
      console.log('🔍 ESTADOS ÚNICOS ENCONTRADOS:', estadosUnicos);

      // Debug: verificar campos disponibles en las primeras obras
      console.log('🔍 CAMPOS DISPONIBLES EN PRIMERA OBRA:', Object.keys(obras[0] || {}));

      // Debug: buscar obras con estado que contenga "aplaz" o "paus"
      const obrasAplazadas = obras.filter(obra => {
        const estado = obra['ESTADO DE LA OBRA'];
        return (
          estado &&
          typeof estado === 'string' &&
          (estado.toLowerCase().includes('aplaz') || estado.toLowerCase().includes('paus'))
        );
      });
      console.log('🔍 OBRAS CON ESTADO APLAZADO/PAUSADO:', obrasAplazadas.length);
      if (obrasAplazadas.length > 0) {
        console.log(
          '🔍 PRIMERAS 3 OBRAS APLAZADAS:',
          obrasAplazadas.slice(0, 3).map(obra => ({
            id: obra.id,
            nombre: obra['NOMBRE'] || obra['NOMBRE OBRA'],
            estado: obra['ESTADO DE LA OBRA'],
          }))
        );
      }

      const metrics: ProjectMetrics = {
        totalProjects: obras.length,
        budgetChanges: {
          increased: 0,
          decreased: 0,
          totalChange: 0,
          obraIds: [],
        },
        delayedProjects: {
          count: 0,
          projects: [],
          obraIds: [],
        },
        defundedProjects: {
          count: 0,
          obraIds: [],
        },
        lateProjects: {
          count: 0,
          obraIds: [],
          projects: [],
        },
        pendingDefinitionProjects: {
          count: 0,
          obraIds: [],
          projects: [],
        },
        stageDistribution: {},
        completionRate: 0,
      };

      let totalBudgetChange = 0;
      let completedProjects = 0;

      obras.forEach(obra => {
        // Usar el ID de la obra como identificador principal para relacionar con alertas
        const obraId = String(obra.id || 'unknown');

        // Calcular cambios de presupuesto
        const costoEstimado = this.parseNumber(obra['COSTO ESTIMADO TOTAL']);
        const costoActualizado = this.parseNumber(obra['COSTO TOTAL ACTUALIZADO']);

        if (costoEstimado && costoActualizado) {
          const change = costoActualizado - costoEstimado;
          totalBudgetChange += change;

          if (change > 500000000) {
            // Más de 500 millones
            metrics.budgetChanges.obraIds.push(String(obraId));
            if (change > 0) {
              metrics.budgetChanges.increased++;
            } else if (change < 0) {
              metrics.budgetChanges.decreased++;
            }
          }
        }

        // Calcular retrasos
        const fechaEstimada = obra['FECHA ESTIMADA DE ENTREGA'];
        const entregada = obra['¿OBRA ENTREGADA?'];

        if (fechaEstimada && !this.isEntregada(entregada)) {
          const delayDays = this.calculateDelay(fechaEstimada);
          if (delayDays > 60) {
            // Más de 2 meses
            console.log('🏗️ OBRA CON RETRASO ENCONTRADA:', {
              obraId,
              'ID OBRA': obra['ID OBRA'],
              nombre: obra['NOMBRE'],
              delayDays,
              fechaEstimada,
            });
            metrics.delayedProjects.count++;
            metrics.delayedProjects.obraIds.push(String(obraId));
            metrics.delayedProjects.projects.push({
              name: obra['NOMBRE'] || 'Sin nombre',
              delayDays,
              estimatedDate: fechaEstimada,
              currentStage: obra['ETAPA'] || 'Desconocida',
            });
          }
        }

        // Proyectos desfinanciados (sin presupuesto o con presupuesto 0)
        const presupuesto = this.parseNumber(obra['COSTO ESTIMADO TOTAL']);
        if (!presupuesto || presupuesto === 0) {
          metrics.defundedProjects.count++;
          metrics.defundedProjects.obraIds.push(String(obraId));
        }

        // Proyectos que terminan después de 01/07/2027
        if (fechaEstimada) {
          const fechaEntrega = new Date(fechaEstimada);
          const fechaLimite = new Date('2027-07-01');
          if (fechaEntrega > fechaLimite) {
            metrics.lateProjects.count++;
            metrics.lateProjects.obraIds.push(String(obraId));
            metrics.lateProjects.projects.push({
              name: String(obra['NOMBRE'] || obra['NOMBRE OBRA'] || 'Sin nombre'),
              etapa: obra['ETAPA'] || 'Desconocida',
              fechaEstimada: fechaEstimada,
              estadoEntrega: String(obra['¿OBRA ENTREGADA?'] || 'No especificado'),
              porcentajeEjecucion: this.parseNumber(obra['PORCENTAJE EJECUCIÓN OBRA']) || 0,
              dependencia: obra['DEPENDENCIA'] || 'Sin dependencia',
              proyectoEstrategico: obra['PROYECTO ESTRATÉGICO'] || 'Sin proyecto',
              razon: 'Fecha estimada después de 01/07/2027',
            });
          }
        }

        // Proyectos pendientes de definición (solo aplazados y pausados)
        const estado = obra['ESTADO DE LA OBRA'];

        // Debug: verificar datos de estado
        if (
          estado &&
          typeof estado === 'string' &&
          (estado.toLowerCase().includes('aplazado') || estado.toLowerCase().includes('pausado'))
        ) {
          console.log('🏗️ OBRA APLAZADA/PAUSADA ENCONTRADA:', {
            id: obraId,
            nombre: obra['NOMBRE'] || obra['NOMBRE OBRA'],
            estado: estado,
            dependencia: obra['DEPENDENCIA'],
          });
        }

        // Verificar si está aplazado o pausado
        const isAplazadoPausado =
          estado &&
          typeof estado === 'string' &&
          (estado.toLowerCase().includes('aplazado') || estado.toLowerCase().includes('pausado'));

        if (isAplazadoPausado) {
          metrics.pendingDefinitionProjects.count++;
          metrics.pendingDefinitionProjects.obraIds.push(String(obraId));
          metrics.pendingDefinitionProjects.projects.push({
            name: String(obra['NOMBRE'] || obra['NOMBRE OBRA'] || 'Sin nombre'),
            etapa: obra['ETAPA'] || 'Desconocida',
            fechaEstimada: fechaEstimada || 'No especificada',
            estadoEntrega: String(obra['¿OBRA ENTREGADA?'] || 'No especificado'),
            porcentajeEjecucion: this.parseNumber(obra['PORCENTAJE EJECUCIÓN OBRA']) || 0,
            dependencia: obra['DEPENDENCIA'] || 'Sin dependencia',
            proyectoEstrategico: obra['PROYECTO ESTRATÉGICO'] || 'Sin proyecto',
            razon: `Estado: ${estado}`,
          });
        }

        // Distribución por etapa
        const etapa = obra['ETAPA'];
        if (etapa) {
          metrics.stageDistribution[etapa] = (metrics.stageDistribution[etapa] || 0) + 1;
        }

        // Tasa de finalización
        if (this.isEntregada(entregada)) {
          completedProjects++;
        }
      });

      metrics.budgetChanges.totalChange = totalBudgetChange;
      metrics.completionRate = obras.length > 0 ? (completedProjects / obras.length) * 100 : 0;

      console.log('📊 MÉTRICAS CALCULADAS:');
      console.log(`Total obras: ${obras.length}`);
      console.log(`Obras con retrasos: ${metrics.delayedProjects.obraIds.length}`);
      console.log(`Obras pendientes de definición: ${metrics.pendingDefinitionProjects.count}`);
      console.log('IDs de obras con retrasos:', metrics.delayedProjects.obraIds);
      console.log(
        'IDs de obras pendientes de definición:',
        metrics.pendingDefinitionProjects.obraIds
      );

      // Mostrar algunos ejemplos de obras para comparar con alertas
      console.log(
        '🔍 EJEMPLOS DE OBRAS (primeras 3):',
        obras.slice(0, 3).map(obra => ({
          'ID OBRA': obra['ID OBRA'],
          NOMBRE: obra['NOMBRE'],
          'FECHA ESTIMADA': obra['FECHA ESTIMADA DE ENTREGA'],
          'NOMBRE OBRA': obra['NOMBRE OBRA'], // Campo que podría relacionar
          'PROYECTO ESTRATÉGICO': obra['PROYECTO ESTRATÉGICO'], // Otro campo posible
        }))
      );

      return metrics;
    } catch (error) {
      console.error('❌ ERROR AL CALCULAR MÉTRICAS DE PROYECTOS:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack available');
      return this.getEmptyMetrics();
    }
  }

  private parseNumber(value: unknown): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private isEntregada(estado: unknown): boolean {
    if (!estado) return false;
    const estadoStr = String(estado).toLowerCase();
    return estadoStr.includes('si') || estadoStr.includes('yes') || estadoStr === 'true';
  }

  private calculateDelay(fechaEstimada: string): number {
    const hoy = new Date();
    const fecha = new Date(fechaEstimada);

    if (isNaN(fecha.getTime())) return 0;

    const diffTime = hoy.getTime() - fecha.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getEmptyMetrics(): ProjectMetrics {
    return {
      totalProjects: 0,
      budgetChanges: { increased: 0, decreased: 0, totalChange: 0, obraIds: [] },
      delayedProjects: { count: 0, projects: [], obraIds: [] },
      defundedProjects: { count: 0, obraIds: [] },
      lateProjects: { count: 0, obraIds: [], projects: [] },
      pendingDefinitionProjects: { count: 0, obraIds: [], projects: [] },
      stageDistribution: {},
      completionRate: 0,
    };
  }
}

export const projectMetricsService = new ProjectMetricsService();
