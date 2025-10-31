/**
 * Hook para obtener y procesar proyectos estratégicos con conteo de alertas
 */

import { useMemo } from 'react';
import { useAlertas } from './useAlertas';
import { normalizeProjectName } from '../utils/textNormalize';
import { ProjectCard } from '../types/home';

export const useStrategicProjects = () => {
  const { alertas, isLoading, error } = useAlertas({ limit: 10000 });

  // Agrupar alertas por proyecto estratégico y contar
  const projects = useMemo(() => {
    const projectMap = new Map<string, { nombre: string; count: number }>();

    alertas.forEach(alerta => {
      const proyectoNombre = alerta.proyecto_estrategico || 'Sin proyecto';
      const normalizedId = normalizeProjectName(proyectoNombre);

      if (!projectMap.has(normalizedId)) {
        projectMap.set(normalizedId, { nombre: proyectoNombre, count: 0 });
      }

      const project = projectMap.get(normalizedId)!;
      project.count++;
    });

    // Convertir a array y ordenar por nombre
    const projectsList: ProjectCard[] = Array.from(projectMap.entries()).map(([id, data]) => ({
      id,
      nombre: data.nombre,
      alertCount: data.count,
    }));

    // Ordenar alfabéticamente
    return projectsList.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [alertas]);

  return {
    projects,
    isLoading,
    error,
    totalProjects: projects.length,
  };
};

