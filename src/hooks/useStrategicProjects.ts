/**
 * Hook para obtener y procesar proyectos estratégicos con conteo de alertas
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAlertas } from './useAlertas';
import { obrasApiService } from '../services/obrasApi';
import { normalizeProjectName } from '../utils/textNormalize';
import { normalizeGravedad } from '../utils/severity';
import { ProjectCard } from '../types/home';

export const useStrategicProjects = () => {
  const {
    alertas,
    isLoading: isLoadingAlertas,
    error: errorAlertas,
  } = useAlertas({ limit: 10000 });

  // Obtener todas las obras para extraer todos los proyectos estratégicos
  const {
    data: obras,
    isLoading: isLoadingObras,
    error: errorObras,
  } = useQuery({
    queryKey: ['obras'],
    queryFn: () => obrasApiService.getObras(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });

  const isLoading = isLoadingAlertas || isLoadingObras;
  const error = errorAlertas || errorObras;

  // Agrupar alertas por proyecto estratégico y contar solo críticas y moderadas
  const projects = useMemo(() => {
    // Primero, obtener todos los proyectos estratégicos únicos de las obras
    const allProjectsMap = new Map<string, string>(); // normalizedId -> nombre original

    if (obras) {
      obras.forEach(obra => {
        const proyectoNombre = obra['PROYECTO ESTRATÉGICO'];
        if (proyectoNombre && typeof proyectoNombre === 'string' && proyectoNombre.trim()) {
          const normalizedId = normalizeProjectName(proyectoNombre);
          // Guardar el nombre original (el primero que encontremos)
          if (!allProjectsMap.has(normalizedId)) {
            allProjectsMap.set(normalizedId, proyectoNombre.trim());
          }
        }
      });
    }

    // También agregar proyectos que aparecen en alertas pero no en obras
    alertas.forEach(alerta => {
      const proyectoNombre = alerta.proyecto_estrategico;
      if (proyectoNombre && proyectoNombre.trim()) {
        const normalizedId = normalizeProjectName(proyectoNombre);
        if (!allProjectsMap.has(normalizedId)) {
          allProjectsMap.set(normalizedId, proyectoNombre.trim());
        }
      }
    });

    // Inicializar contador para todos los proyectos
    const projectCountMap = new Map<string, number>();
    allProjectsMap.forEach((_nombre, normalizedId) => {
      projectCountMap.set(normalizedId, 0);
    });

    // Contar solo alertas críticas y moderadas
    alertas.forEach(alerta => {
      // Solo contar alertas críticas (alta/crítica) y moderadas (media)
      const gravedad = normalizeGravedad(alerta.gravedad);
      const esCritica = gravedad === 'crítica' || gravedad === 'alta';
      const esModerada = gravedad === 'media';

      if (!esCritica && !esModerada) {
        return; // Saltar alertas que no son críticas ni moderadas
      }

      const proyectoNombre = alerta.proyecto_estrategico || 'Sin proyecto';
      const normalizedId = normalizeProjectName(proyectoNombre);

      if (projectCountMap.has(normalizedId)) {
        const currentCount = projectCountMap.get(normalizedId) || 0;
        projectCountMap.set(normalizedId, currentCount + 1);
      }
    });

    // Convertir a array y ordenar por nombre
    const projectsList: ProjectCard[] = Array.from(allProjectsMap.entries()).map(
      ([id, nombre]) => ({
        id,
        nombre,
        alertCount: projectCountMap.get(id) || 0,
      })
    );

    // Ordenar alfabéticamente
    return projectsList.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [alertas, obras]);

  return {
    projects,
    isLoading,
    error,
    totalProjects: projects.length,
  };
};
