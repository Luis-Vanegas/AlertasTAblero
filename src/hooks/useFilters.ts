/**
 * Hook personalizado para manejo de filtros
 */

import { useMemo } from 'react';
import { MappedAlerta } from '../types/api';
import { normalizeGravedad, extractImpacts } from '../utils/severity';
import { PRIORITY_PROJECTS } from '../constants';
import { useUnifiedData } from './useUnifiedData';

// Tipo de filtros que coincide con el store
export interface FilterOptions {
  searchTerm: string;
  dependencia: string[];
  gravedad: string[];
  impacto: string[];
  comuna?: string[];
  priorityProject: string;
  obraIds?: string[];
  // Filtros adicionales de obras
  etapa?: string[];
  estadoObra?: string[];
  tipoIntervencion?: string[];
}

export interface UseFiltersProps {
  alertas: MappedAlerta[];
  filters: FilterOptions;
}

export const useFilters = ({ alertas, filters }: UseFiltersProps) => {
  // Obtener datos unificados para filtros adicionales
  const { projects: unifiedProjects, filterOptions: unifiedFilterOptions } = useUnifiedData();

  const normalize = (value: string): string =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  // Obtener opciones únicas para filtros (combinando alertas y datos unificados)
  const filterOptions = useMemo(() => {
    // Opciones de alertas
    const dependencias = Array.from(new Set(alertas.map(a => a.dependencia))).sort();
    const comunas = Array.from(new Set(alertas.map(a => a.comuna).filter(Boolean))).sort();

    const impactoOptions = Array.from(
      new Set(alertas.flatMap(a => extractImpacts(a.impacto_riesgo)))
    ).sort();

    // Construir opciones de proyecto estratégico usando valores presentes en datos
    const normalizedToLabel: Record<string, string> = {};
    alertas.forEach(a => {
      const raw = (a.proyecto_estrategico || '').toString().trim();
      if (!raw) return;
      const norm = normalize(raw);
      if (!normalizedToLabel[norm]) normalizedToLabel[norm] = raw;
    });
    // Si existen PRIORITY_PROJECTS y no aparecen en datos, aún agregarlas con label capitalizado
    PRIORITY_PROJECTS.forEach(p => {
      if (!normalizedToLabel[p]) {
        const label = p
          .split(' ')
          .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
          .join(' ');
        normalizedToLabel[p] = label;
      }
    });
    const priorityProjects = Object.entries(normalizedToLabel)
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // Opciones adicionales de datos unificados
    const etapas = unifiedFilterOptions?.etapas || [];
    const estadosObra = unifiedFilterOptions?.estadosObra || [];
    const tiposIntervencion = unifiedFilterOptions?.tiposIntervencion || [];

    return {
      dependencias,
      comunas,
      impactoOptions,
      priorityProjects,
      // Opciones adicionales de obras
      etapas,
      estadosObra,
      tiposIntervencion,
    };
  }, [alertas, unifiedFilterOptions]);

  // Filtrar alertas (incluyendo filtros de obras relacionadas)
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

      const matchesPriority = (() => {
        const selected = (filters.priorityProject || '').toString().trim();
        if (selected === '') return true;
        const selectedNorm = normalize(selected);
        const projectRaw = (alerta.proyecto_estrategico || '').toString();
        const projectNorm = normalize(projectRaw);
        // aceptar si coincide por clave normalizada o por etiqueta exacta
        return projectNorm === selectedNorm || projectRaw === selected;
      })();

      const matchesObraIds =
        (filters.obraIds?.length || 0) === 0 ||
        (filters.obraIds &&
          filters.obraIds.some(obraId => String(obraId) === String(alerta.obra_id)));

      // Filtros adicionales basados en datos unificados
      const obraId = String(alerta.obra_id);
      const obraRelacionada = unifiedProjects.find(p => p.idObra === obraId);

      // Si hay obra relacionada, aplicar filtros adicionales
      let matchesObraFilters = true;
      if (obraRelacionada) {
        // Filtro por etapa de obra
        if (filters.etapa && filters.etapa.length > 0) {
          matchesObraFilters = matchesObraFilters && filters.etapa.includes(obraRelacionada.etapa);
        }

        // Filtro por estado de obra
        if (filters.estadoObra && filters.estadoObra.length > 0) {
          matchesObraFilters =
            matchesObraFilters && filters.estadoObra.includes(obraRelacionada.estadoObraDetallado);
        }

        // Filtro por tipo de intervención
        if (filters.tipoIntervencion && filters.tipoIntervencion.length > 0) {
          matchesObraFilters =
            matchesObraFilters &&
            filters.tipoIntervencion.includes(obraRelacionada.tipoIntervencion);
        }
      }

      return (
        matchesSearch &&
        matchesDependency &&
        matchesGravedad &&
        matchesImpacto &&
        matchesComuna &&
        matchesPriority &&
        matchesObraIds &&
        matchesObraFilters
      );
    });
  }, [alertas, filters, unifiedProjects]);

  // Agrupar alertas por dependencia
  const alertasPorDependencia = useMemo(() => {
    // Logs de depuración removidos

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
        const sinRiesgo = alertas.filter(a => {
          const g = normalizeGravedad(a.gravedad);
          return g === 'sin_riesgo';
        }).length;
        return {
          dependencia,
          alertas,
          total: alertas.length,
          altas,
          medias,
          leves,
          sinRiesgo,
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
    const sinRiesgo = filteredAlertas.filter(a => {
      const g = normalizeGravedad(a.gravedad);
      return g === 'sin_riesgo';
    }).length;
    const total = filteredAlertas.length;
    const totalObras = new Set(filteredAlertas.map(a => a.obra_id)).size;

    return { total, totalObras, alta, media, leve, sinRiesgo };
  }, [filteredAlertas]);

  // Proyectos prioritarios con incidentes
  const prioritySummary = useMemo(() => {
    const counts: Record<string, { total: number; media: number; critica: number }> = {};
    alertas.forEach(a => {
      const proj = normalize(a.proyecto_estrategico || '');
      if (!PRIORITY_PROJECTS.includes(proj as (typeof PRIORITY_PROJECTS)[number])) return;
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
