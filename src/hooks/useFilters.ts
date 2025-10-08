/**
 * Hook personalizado para manejo de filtros
 */

import { useMemo } from 'react';
import { MappedAlerta } from '../types/api';
import { normalizeGravedad, extractImpacts } from '../utils/severity';
import { PRIORITY_PROJECTS } from '../constants';

export interface FilterOptions {
  searchTerm: string;
  dependencia: string[];
  gravedad: string[];
  impacto: string[];
  comuna?: string[];
  priorityProject: string;
}

export interface UseFiltersProps {
  alertas: MappedAlerta[];
  filters: FilterOptions;
}

export const useFilters = ({ alertas, filters }: UseFiltersProps) => {
  // Obtener opciones únicas para filtros
  const filterOptions = useMemo(() => {
    const dependencias = Array.from(new Set(alertas.map(a => a.dependencia))).sort();
    const comunas = Array.from(new Set(alertas.map(a => a.comuna).filter(Boolean))).sort();

    const impactoOptions = Array.from(
      new Set(alertas.flatMap(a => extractImpacts(a.impacto_riesgo)))
    ).sort();

    return {
      dependencias,
      comunas,
      impactoOptions,
    };
  }, [alertas]);

  // Filtrar alertas
  const filteredAlertas = useMemo(() => {
    return alertas.filter(alerta => {
      const matchesSearch =
        filters.searchTerm === '' ||
        alerta.nombre_obra.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        alerta.dependencia.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        alerta.descripcion_alerta.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesDependency =
        (filters.dependencia?.length || 0) === 0 ||
        filters.dependencia.includes(alerta.dependencia);

      const matchesGravedad =
        (filters.gravedad?.length || 0) === 0 ||
        filters.gravedad.includes(normalizeGravedad(alerta.gravedad));

      const matchesImpacto =
        (filters.impacto?.length || 0) === 0 ||
        extractImpacts(alerta.impacto_riesgo).some(imp => filters.impacto.includes(imp));

      const matchesComuna =
        (filters.comuna?.length || 0) === 0 ||
        (filters.comuna && filters.comuna.includes((alerta.comuna || '').toString()));

      const matchesPriority =
        filters.priorityProject === '' ||
        (alerta.proyecto_estrategico || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '') === filters.priorityProject;

      return (
        matchesSearch &&
        matchesDependency &&
        matchesGravedad &&
        matchesImpacto &&
        matchesComuna &&
        matchesPriority
      );
    });
  }, [alertas, filters]);

  // Agrupar alertas por dependencia
  const alertasPorDependencia = useMemo(() => {
    const grouped = filteredAlertas.reduce(
      (acc, alerta) => {
        const dep = alerta.dependencia;
        if (!acc[dep]) {
          acc[dep] = [];
        }
        acc[dep].push(alerta);
        return acc;
      },
      {} as Record<string, MappedAlerta[]>
    );

    return Object.entries(grouped)
      .map(([dependencia, alertas]) => {
        const altas = alertas.filter(a => {
          const g = normalizeGravedad(a.gravedad);
          return g === 'crítica' || g === 'alta';
        }).length;
        const medias = alertas.filter(a => normalizeGravedad(a.gravedad) === 'media').length;
        const leves = alertas.filter(a => {
          const g = normalizeGravedad(a.gravedad);
          return g === 'leve' || g === 'baja';
        }).length;
        return {
          dependencia,
          alertas,
          total: alertas.length,
          altas,
          medias,
          leves,
        };
      })
      .sort((a, b) => b.altas - a.altas);
  }, [filteredAlertas]);

  // Estadísticas de alertas
  const alertStats = useMemo(() => {
    const alta = filteredAlertas.filter(a => {
      const g = normalizeGravedad(a.gravedad);
      return g === 'crítica' || g === 'alta';
    }).length;
    const media = filteredAlertas.filter(a => normalizeGravedad(a.gravedad) === 'media').length;
    const leve = filteredAlertas.filter(a => {
      const g = normalizeGravedad(a.gravedad);
      return g === 'leve' || g === 'baja';
    }).length;
    const total = filteredAlertas.length;
    const totalObras = new Set(filteredAlertas.map(a => a.obra_id)).size;

    return { total, totalObras, alta, media, leve };
  }, [filteredAlertas]);

  // Proyectos prioritarios con incidentes
  const prioritySummary = useMemo(() => {
    const counts: Record<string, { total: number; media: number; critica: number }> = {};
    alertas.forEach(a => {
      const proj = (a.proyecto_estrategico || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
      if (!PRIORITY_PROJECTS.includes(proj as any)) return;
      const g = normalizeGravedad(a.gravedad);
      if (!counts[proj]) counts[proj] = { total: 0, media: 0, critica: 0 };
      if (g === 'media') counts[proj].media++;
      if (g === 'crítica' || g === 'alta') counts[proj].critica++;
      if (g === 'media' || g === 'crítica' || g === 'alta') counts[proj].total++;
    });
    const entries = Object.entries(counts).filter(([, c]) => c.total > 0);
    return entries.sort((a, b) => b[1].total - a[1].total);
  }, [alertas]);

  return {
    filterOptions,
    filteredAlertas,
    alertasPorDependencia,
    alertStats,
    prioritySummary,
  };
};
