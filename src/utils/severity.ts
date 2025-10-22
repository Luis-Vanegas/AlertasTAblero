/**
 * Utilidades para manejo de severidad y gravedad de alertas
 */

import { MappedAlerta } from '../types/api';
import { severityService } from '../services/severity';

/**
 * Normaliza valores de gravedad a llaves consistentes
 */
export const normalizeGravedad = (
  value?: string | null
): 'crítica' | 'alta' | 'media' | 'leve' | 'baja' | 'sin_riesgo' | '' => {
  if (!value) return '';
  const v = value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  if (v === 'critica' || v === 'critico') return 'crítica';
  if (v === 'alta' || v === 'alto') return 'alta';
  if (v === 'media' || v === 'moderada' || v === 'moderado') return 'media';
  if (v === 'leve') return 'leve';
  if (v === 'baja' || v === 'bajo') return 'baja';
  if (v === 'sin riesgo' || v === 'sin_riesgo' || v === 'sinriesgo') return 'sin_riesgo';
  return '';
};

/**
 * Extrae impactos de una cadena de texto
 */
export const extractImpacts = (raw?: string | null): string[] => {
  if (!raw) return [];
  const parts = raw
    .toString()
    .split(',')
    .map(p => p.trim().toLowerCase());
  const set = new Set<string>();
  parts.forEach(p => {
    if (p.includes('presupuesto')) set.add('presupuesto');
    else if (p.includes('cronograma')) set.add('cronograma');
    else if (p.includes('alcance')) set.add('alcance');
    else if (p.includes('comunidad')) set.add('comunidad');
  });
  return Array.from(set);
};

/**
 * Obtiene metadatos de impacto para UI
 */
export const getImpactMeta = (impacto: string) => {
  const v = impacto.toLowerCase();
  if (v.includes('presupuesto'))
    return {
      icon: 'AttachMoney',
      color: '#9c27b0',
      label: 'Presupuesto',
    };
  if (v.includes('cronograma'))
    return {
      icon: 'Schedule',
      color: '#2196f3',
      label: 'Cronograma',
    };
  if (v.includes('alcance'))
    return {
      icon: 'TrackChanges',
      color: '#ff9800',
      label: 'Alcance',
    };
  if (v.includes('comunidad'))
    return {
      icon: 'Groups',
      color: '#4caf50',
      label: 'Comunidad',
    };
  return {
    icon: 'InfoOutlined',
    color: '#9e9e9e',
    label: 'Impacto',
  };
};

/**
 * Calcula la severidad de una alerta
 */
export const calculateSeverity = (alerta: MappedAlerta): 'ok' | 'warning' | 'critical' => {
  return severityService.calculateSeverity(alerta);
};

/**
 * Obtiene el color de gravedad para UI
 */
export const getGravedadColor = (gravedad?: string | null): string => {
  const n = normalizeGravedad(gravedad);
  if (n === 'crítica' || n === 'alta') return 'error';
  if (n === 'media') return 'warning';
  if (n === 'leve' || n === 'baja') return 'info';
  if (n === 'sin_riesgo') return 'success';
  return 'default';
};

/**
 * Verifica si una alerta es prioritaria
 */
export const isPriorityAlert = (
  alerta: MappedAlerta,
  priorityProjects: readonly string[]
): boolean => {
  const project = (alerta.proyecto_estrategico || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  return priorityProjects.includes(project);
};

/**
 * Obtiene estadísticas de severidad
 */
export const getSeverityStats = (alertas: MappedAlerta[]) => {
  const stats = {
    total: alertas.length,
    critical: 0,
    warning: 0,
    ok: 0,
    alta: 0,
    media: 0,
    leve: 0,
    sinRiesgo: 0,
  };

  alertas.forEach(alerta => {
    const severity = calculateSeverity(alerta);
    const gravedad = normalizeGravedad(alerta.gravedad);

    stats[severity]++;

    if (gravedad === 'crítica' || gravedad === 'alta') stats.alta++;
    else if (gravedad === 'media') stats.media++;
    else if (gravedad === 'leve' || gravedad === 'baja') stats.leve++;
    else if (gravedad === 'sin_riesgo') stats.sinRiesgo++;
  });

  return stats;
};

/**
 * Filtra alertas por severidad
 */
export const filterBySeverity = (
  alertas: MappedAlerta[],
  severity: 'ok' | 'warning' | 'critical' | 'all'
): MappedAlerta[] => {
  if (severity === 'all') return alertas;
  return alertas.filter(alerta => calculateSeverity(alerta) === severity);
};

/**
 * Ordena alertas por severidad (críticas primero)
 */
export const sortBySeverity = (alertas: MappedAlerta[]): MappedAlerta[] => {
  return [...alertas].sort((a, b) => {
    const severityA = calculateSeverity(a);
    const severityB = calculateSeverity(b);

    const order = { critical: 0, warning: 1, ok: 2 };
    return order[severityA] - order[severityB];
  });
};
