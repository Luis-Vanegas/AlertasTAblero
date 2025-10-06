import Papa from 'papaparse'

export interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
  delimiter?: string
  encoding?: string
}

export interface ExportData {
  [key: string]: any
}

/**
 * Exporta datos a CSV usando PapaParse
 */
export const exportToCSV = (
  data: ExportData[],
  options: ExportOptions = {}
): void => {
  const {
    filename = 'alertas',
    includeHeaders = true,
    delimiter = ',',
    encoding = 'utf-8'
  } = options

  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar')
    return
  }

  // Configuración de PapaParse
  const config: Papa.UnparseConfig = {
    header: includeHeaders,
    delimiter,
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
  }

  // Convertir a CSV
  const csv = Papa.unparse(data, config)

  // Crear blob y descargar (forzar charset en el MIME type)
  const blob = new Blob([csv], { type: `text/csv;charset=${encoding};` })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${formatDateForFilename(new Date())}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Exporta datos filtrados por dependencia
 */
export const exportByDependency = (
  data: ExportData[],
  dependency: string,
  options: ExportOptions = {}
): void => {
  const filteredData = data.filter(item => 
    item.dependencia === dependency || 
    item['DEPENDENCIA'] === dependency
  )

  exportToCSV(filteredData, {
    ...options,
    filename: `alertas_${dependency.replace(/[^a-zA-Z0-9]/g, '_')}`
  })
}

/**
 * Exporta solo alertas críticas
 */
export const exportCriticalAlerts = (
  data: ExportData[],
  options: ExportOptions = {}
): void => {
  const criticalData = data.filter(item => 
    item.severity === 'critical' || 
    item.gravedad === 'alta' ||
    item.gravedad === 'Crítica'
  )

  exportToCSV(criticalData, {
    ...options,
    filename: 'alertas_criticas'
  })
}

/**
 * Formatea fecha para nombre de archivo
 */
const formatDateForFilename = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}${month}${day}_${hours}${minutes}`
}

/**
 * Prepara datos para exportación (limpia y formatea)
 */
export const prepareDataForExport = (data: ExportData[]): ExportData[] => {
  return data.map(item => {
    const cleaned: ExportData = {}
    
    Object.entries(item).forEach(([key, value]) => {
      // Limpiar claves
      const cleanKey = key.replace(/[^\w\s]/g, '').trim()
      
      // Limpiar valores
      let cleanValue = value
      if (typeof value === 'string') {
        cleanValue = value.replace(/\n/g, ' ').replace(/\r/g, ' ').trim()
      }
      
      cleaned[cleanKey] = cleanValue
    })
    
    return cleaned
  })
}

/**
 * Exporta estadísticas resumidas
 */
export const exportSummaryStats = (
  data: ExportData[],
  options: ExportOptions = {}
): void => {
  const stats = {
    total: data.length,
    criticas: data.filter(item => 
      item.severity === 'critical' || 
      item.gravedad === 'alta' ||
      item.gravedad === 'Crítica'
    ).length,
    advertencias: data.filter(item => 
      item.severity === 'warning' || 
      item.gravedad === 'media' ||
      item.gravedad === 'Advertencia'
    ).length,
    ok: data.filter(item => 
      item.severity === 'ok' || 
      item.gravedad === 'leve' ||
      item.gravedad === 'Normal'
    ).length,
    fecha_exportacion: new Date().toLocaleString('es-CO'),
  }

  exportToCSV([stats], {
    ...options,
    filename: 'resumen_alertas'
  })
}

