import Papa from 'papaparse';
import { formatForFilename } from './dateFormatting';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
}

export type ExportPrimitive = string | number | boolean | null | undefined | Date;
export interface ExportData {
  [key: string]: ExportPrimitive | ExportPrimitive[] | Record<string, ExportPrimitive>;
}

/**
 * Exporta datos a CSV usando PapaParse
 */
export const exportToCSV = <T extends object>(data: T[], options: ExportOptions = {}): void => {
  const {
    filename = 'alertas',
    includeHeaders = true,
    delimiter = ',',
    encoding = 'utf-8',
  } = options;

  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Configuración de PapaParse
  const config = {
    header: includeHeaders,
    delimiter,
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
  };

  // Normalizar datos antes de exportar
  const normalized = prepareDataForExport(data as unknown as ExportData[]);

  // Convertir a CSV
  const csv = Papa.unparse(normalized, config);

  // Crear blob y descargar (forzar charset en el MIME type)
  const blob = new Blob([csv], { type: `text/csv;charset=${encoding};` });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${formatForFilename(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Exporta datos filtrados por dependencia
 */
export const exportByDependency = <T extends object>(
  data: T[],
  dependency: string,
  options: ExportOptions = {}
): void => {
  const get = (obj: Record<string, unknown>, key: string): unknown => obj?.[key];
  const filteredData = data.filter(item => {
    const rec = item as Record<string, unknown>;
    return get(rec, 'dependencia') === dependency || get(rec, 'DEPENDENCIA') === dependency;
  });

  exportToCSV(filteredData, {
    ...options,
    filename: `alertas_${dependency.replace(/[^a-zA-Z0-9]/g, '_')}`,
  });
};

/**
 * Exporta solo alertas críticas
 */
export const exportCriticalAlerts = <T extends object>(
  data: T[],
  options: ExportOptions = {}
): void => {
  const criticalData = (data as unknown as ExportData[]).filter(
    item =>
      (item as Record<string, unknown>)['severity'] === 'critical' ||
      (item as Record<string, unknown>)['gravedad'] === 'alta' ||
      (item as Record<string, unknown>)['gravedad'] === 'Crítica'
  );

  exportToCSV(criticalData, {
    ...options,
    filename: 'alertas_criticas',
  });
};

// Nota: se reutiliza `formatForFilename` desde utils/dateFormatting

/**
 * Prepara datos para exportación (limpia y formatea)
 */
export const prepareDataForExport = (data: ExportData[]): ExportData[] => {
  return data.map(item => {
    const cleaned: ExportData = {};

    Object.entries(item).forEach(([key, value]) => {
      // Limpiar claves
      const cleanKey = key.replace(/[^\w\s]/g, '').trim();

      // Limpiar valores
      let cleanValue = value;
      if (typeof value === 'string') {
        cleanValue = value.replace(/\n/g, ' ').replace(/\r/g, ' ').trim();
      }

      cleaned[cleanKey] = cleanValue;
    });

    return cleaned;
  });
};

/**
 * Exporta estadísticas resumidas
 */
export const exportSummaryStats = (data: ExportData[], options: ExportOptions = {}): void => {
  const stats = {
    total: data.length,
    criticas: data.filter(
      item =>
        item.severity === 'critical' || item.gravedad === 'alta' || item.gravedad === 'Crítica'
    ).length,
    advertencias: data.filter(
      item =>
        item.severity === 'warning' || item.gravedad === 'media' || item.gravedad === 'Advertencia'
    ).length,
    ok: data.filter(
      item => item.severity === 'ok' || item.gravedad === 'leve' || item.gravedad === 'Normal'
    ).length,
    fecha_exportacion: new Date().toLocaleString('es-CO'),
  };

  exportToCSV([stats], {
    ...options,
    filename: 'resumen_alertas',
  });
};
