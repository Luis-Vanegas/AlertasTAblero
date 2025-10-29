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
      const obras = await obrasApiService.getObras();

      if (obras.length === 0) {
        console.warn('⚠️ No se obtuvieron obras de la API');
        return this.getEmptyMetrics();
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

        // Proyectos pendientes de definición (solo pausados)
        const estado = obra['ESTADO DE LA OBRA'];

        // Verificar si está pausado
        const isPausado =
          estado && typeof estado === 'string' && estado.toLowerCase().includes('pausado');

        if (isPausado) {
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
