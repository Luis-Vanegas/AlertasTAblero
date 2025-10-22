/**
 * Hook para manejar datos unificados de alertas y obras
 */

import { useState, useEffect, useMemo } from 'react';
import { unifiedDataService, UnifiedProject, UnifiedFilters } from '../services/unifiedDataService';

export interface UseUnifiedDataProps {
  filters?: Partial<UnifiedFilters>;
  forceRefresh?: boolean;
}

export const useUnifiedData = ({
  filters = {},
  forceRefresh = false,
}: UseUnifiedDataProps = {}) => {
  const [projects, setProjects] = useState<UnifiedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos unificados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await unifiedDataService.getUnifiedData(forceRefresh);
        setProjects(data);
      } catch (err) {
        console.error('Error obteniendo datos unificados:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [forceRefresh]);

  // Filtrar proyectos
  const filteredProjects = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return projects;
    }
    return unifiedDataService.filterProjects(projects, filters);
  }, [projects, filters]);

  // Obtener opciones de filtro
  const filterOptions = useMemo(() => {
    return unifiedDataService.getFilterOptions(projects);
  }, [projects]);

  // Estadísticas generales
  const stats = useMemo(() => {
    const total = projects.length;
    const conAlertas = projects.filter(p => p.tieneAlertas).length;
    const sinAlertas = total - conAlertas;
    const atrasados = projects.filter(p => p.estaAtrasado).length;
    const requierenAtencion = projects.filter(p => p.requiereAtencion).length;
    const entregados = projects.filter(p => p.obraEntregada).length;

    // Estadísticas de alertas
    const totalAlertas = projects.reduce((sum, p) => sum + p.totalAlertas, 0);
    const alertasCriticas = projects.reduce((sum, p) => sum + p.alertasCriticas, 0);
    const alertasModeradas = projects.reduce((sum, p) => sum + p.alertasModeradas, 0);
    const alertasLeves = projects.reduce((sum, p) => sum + p.alertasLeves, 0);

    // Estadísticas de presupuesto
    const presupuestoTotal = projects.reduce((sum, p) => sum + p.costoTotalActualizado, 0);
    const presupuestoEjecutado = projects.reduce((sum, p) => sum + p.presupuestoEjecutado, 0);
    const presupuestoDisponible = presupuestoTotal - presupuestoEjecutado;

    // Estadísticas de progreso
    const progresoPromedio =
      projects.length > 0
        ? projects.reduce((sum, p) => sum + p.progresoTotal, 0) / projects.length
        : 0;

    return {
      total,
      conAlertas,
      sinAlertas,
      atrasados,
      requierenAtencion,
      entregados,
      totalAlertas,
      alertasCriticas,
      alertasModeradas,
      alertasLeves,
      presupuestoTotal,
      presupuestoEjecutado,
      presupuestoDisponible,
      progresoPromedio,
    };
  }, [projects]);

  // Estadísticas de proyectos filtrados
  const filteredStats = useMemo(() => {
    const total = filteredProjects.length;
    const conAlertas = filteredProjects.filter(p => p.tieneAlertas).length;
    const sinAlertas = total - conAlertas;
    const atrasados = filteredProjects.filter(p => p.estaAtrasado).length;
    const requierenAtencion = filteredProjects.filter(p => p.requiereAtencion).length;
    const entregados = filteredProjects.filter(p => p.obraEntregada).length;

    const totalAlertas = filteredProjects.reduce((sum, p) => sum + p.totalAlertas, 0);
    const alertasCriticas = filteredProjects.reduce((sum, p) => sum + p.alertasCriticas, 0);
    const alertasModeradas = filteredProjects.reduce((sum, p) => sum + p.alertasModeradas, 0);
    const alertasLeves = filteredProjects.reduce((sum, p) => sum + p.alertasLeves, 0);

    const presupuestoTotal = filteredProjects.reduce((sum, p) => sum + p.costoTotalActualizado, 0);
    const presupuestoEjecutado = filteredProjects.reduce(
      (sum, p) => sum + p.presupuestoEjecutado,
      0
    );
    const presupuestoDisponible = presupuestoTotal - presupuestoEjecutado;

    const progresoPromedio =
      filteredProjects.length > 0
        ? filteredProjects.reduce((sum, p) => sum + p.progresoTotal, 0) / filteredProjects.length
        : 0;

    return {
      total,
      conAlertas,
      sinAlertas,
      atrasados,
      requierenAtencion,
      entregados,
      totalAlertas,
      alertasCriticas,
      alertasModeradas,
      alertasLeves,
      presupuestoTotal,
      presupuestoEjecutado,
      presupuestoDisponible,
      progresoPromedio,
    };
  }, [filteredProjects]);

  // Agrupar por dependencia
  const projectsByDependency = useMemo(() => {
    const grouped = filteredProjects.reduce(
      (acc, project) => {
        const dep = project.dependencia;
        if (!acc[dep]) {
          acc[dep] = [];
        }
        acc[dep].push(project);
        return acc;
      },
      {} as Record<string, UnifiedProject[]>
    );

    return Object.entries(grouped)
      .map(([dependencia, projects]) => ({
        dependencia,
        projects,
        total: projects.length,
        conAlertas: projects.filter(p => p.tieneAlertas).length,
        atrasados: projects.filter(p => p.estaAtrasado).length,
        requierenAtencion: projects.filter(p => p.requiereAtencion).length,
        totalAlertas: projects.reduce((sum, p) => sum + p.totalAlertas, 0),
        alertasCriticas: projects.reduce((sum, p) => sum + p.alertasCriticas, 0),
        alertasModeradas: projects.reduce((sum, p) => sum + p.alertasModeradas, 0),
        alertasLeves: projects.reduce((sum, p) => sum + p.alertasLeves, 0),
      }))
      .sort((a, b) => b.alertasCriticas - a.alertasCriticas);
  }, [filteredProjects]);

  // Agrupar por proyecto estratégico
  const projectsByStrategicProject = useMemo(() => {
    const grouped = filteredProjects.reduce(
      (acc, project) => {
        const proj = project.proyectoEstrategico;
        if (!proj) return acc;
        if (!acc[proj]) {
          acc[proj] = [];
        }
        acc[proj].push(project);
        return acc;
      },
      {} as Record<string, UnifiedProject[]>
    );

    return Object.entries(grouped)
      .map(([proyecto, projects]) => ({
        proyecto,
        projects,
        total: projects.length,
        conAlertas: projects.filter(p => p.tieneAlertas).length,
        atrasados: projects.filter(p => p.estaAtrasado).length,
        requierenAtencion: projects.filter(p => p.requiereAtencion).length,
        totalAlertas: projects.reduce((sum, p) => sum + p.totalAlertas, 0),
        alertasCriticas: projects.reduce((sum, p) => sum + p.alertasCriticas, 0),
        alertasModeradas: projects.reduce((sum, p) => sum + p.alertasModeradas, 0),
        alertasLeves: projects.reduce((sum, p) => sum + p.alertasLeves, 0),
      }))
      .sort((a, b) => b.alertasCriticas - a.alertasCriticas);
  }, [filteredProjects]);

  // Función para refrescar datos
  const refreshData = () => {
    unifiedDataService.clearCache();
    setProjects([]);
    setIsLoading(true);
    setError(null);
  };

  return {
    // Datos
    projects: filteredProjects,
    allProjects: projects,

    // Estados
    isLoading,
    error,

    // Estadísticas
    stats,
    filteredStats,

    // Agrupaciones
    projectsByDependency,
    projectsByStrategicProject,

    // Opciones de filtro
    filterOptions,

    // Acciones
    refreshData,
  };
};
