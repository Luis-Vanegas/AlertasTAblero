import { FieldMapping, SchemaDetection, Obra } from '../types'

export class SchemaDetectionService {
  private fieldMappings: Record<string, keyof Obra> = {
    // Mapeos comunes para ID
    'id': 'id',
    'obra_id': 'id',
    'codigo': 'id',
    'codigo_obra': 'id',
    
    // Mapeos comunes para nombre
    'nombre': 'nombre_obra',
    'nombre_obra': 'nombre_obra',
    'titulo': 'nombre_obra',
    'proyecto': 'nombre_obra',
    'descripcion': 'nombre_obra',
    
    // Mapeos comunes para fechas
    'fecha_inicio': 'fecha_inicio',
    'inicio': 'fecha_inicio',
    'start_date': 'fecha_inicio',
    'fecha_fin': 'fecha_fin',
    'fin': 'fecha_fin',
    'end_date': 'fecha_fin',
    'fecha_finalizacion': 'fecha_fin',
    
    // Mapeos comunes para avance
    'avance': 'avance_percent',
    'avance_percent': 'avance_percent',
    'avance_porcentaje': 'avance_percent',
    'porcentaje_avance': 'avance_percent',
    'progress': 'avance_percent',
    'progreso': 'avance_percent',
    '%avance': 'avance_percent',
    'avance_%': 'avance_percent',
    
    // Mapeos comunes para retraso
    'dias_retraso': 'dias_retraso',
    'retraso_dias': 'dias_retraso',
    'delay_days': 'dias_retraso',
    'dias_atraso': 'dias_retraso',
    'atraso_dias': 'dias_retraso',
    
    // Mapeos comunes para estado
    'estado': 'estado',
    'status': 'estado',
    'situacion': 'estado',
    
    // Mapeos comunes para prioridad
    'prioridad': 'prioridad',
    'priority': 'prioridad',
    'urgencia': 'prioridad',
  }

  /**
   * Detecta automáticamente el esquema de un objeto de datos
   */
  detectSchema(data: any[]): SchemaDetection {
    if (!data || data.length === 0) {
      return {
        fields: [],
        confidence: 0,
        suggestions: ['No hay datos para analizar']
      }
    }

    const sample = data[0]
    const fields: FieldMapping[] = []
    const suggestions: string[] = []

    // Analizar cada campo del objeto
    Object.keys(sample).forEach(fieldName => {
      const fieldValue = sample[fieldName]
      const fieldType = this.detectFieldType(fieldValue)
      const mappedField = this.mapFieldName(fieldName)
      const confidence = this.calculateConfidence(fieldName, fieldValue, mappedField)

      fields.push({
        originalField: fieldName,
        mappedField,
        confidence,
        type: fieldType,
      })
    })

    // Calcular confianza general
    const avgConfidence = fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length

    // Generar sugerencias
    this.generateSuggestions(fields, suggestions)

    return {
      fields,
      confidence: avgConfidence,
      suggestions,
    }
  }

  /**
   * Detecta el tipo de un campo basado en su valor
   */
  private detectFieldType(value: any): 'string' | 'number' | 'boolean' | 'date' {
    if (value === null || value === undefined) {
      return 'string' // Default para valores nulos
    }

    if (typeof value === 'boolean') {
      return 'boolean'
    }

    if (typeof value === 'number') {
      return 'number'
    }

    if (typeof value === 'string') {
      // Intentar detectar si es una fecha
      if (this.isDateString(value)) {
        return 'date'
      }
      return 'string'
    }

    return 'string'
  }

  /**
   * Verifica si una cadena parece ser una fecha
   */
  private isDateString(value: string): boolean {
    // Patrones comunes de fecha
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    ]

    return datePatterns.some(pattern => pattern.test(value)) || !isNaN(Date.parse(value))
  }

  /**
   * Mapea el nombre de un campo a un campo estándar
   */
  private mapFieldName(fieldName: string): keyof Obra {
    const normalizedName = fieldName.toLowerCase().trim()
    return this.fieldMappings[normalizedName] || 'id' // Default a 'id' si no se encuentra mapeo
  }

  /**
   * Calcula la confianza de un mapeo de campo
   */
  private calculateConfidence(fieldName: string, fieldValue: any, mappedField: keyof Obra): number {
    let confidence = 0

    // Confianza basada en el nombre del campo
    const normalizedName = fieldName.toLowerCase().trim()
    if (this.fieldMappings[normalizedName]) {
      confidence += 0.7
    }

    // Confianza basada en el tipo de valor
    const fieldType = this.detectFieldType(fieldValue)
    const expectedType = this.getExpectedFieldType(mappedField)
    
    if (fieldType === expectedType) {
      confidence += 0.3
    }

    // Confianza basada en patrones específicos
    if (this.matchesFieldPattern(fieldName, fieldValue, mappedField)) {
      confidence += 0.2
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Obtiene el tipo esperado para un campo mapeado
   */
  private getExpectedFieldType(field: keyof Obra): 'string' | 'number' | 'boolean' | 'date' {
    const typeMap: Record<keyof Obra, 'string' | 'number' | 'boolean' | 'date'> = {
      id: 'string',
      nombre_obra: 'string',
      fecha_inicio: 'date',
      fecha_fin: 'date',
      avance_percent: 'number',
      dias_retraso: 'number',
      estado: 'string',
      prioridad: 'string',
      responsable: 'string',
      ubicacion: 'string',
      presupuesto: 'number',
      costo_actual: 'number',
      descripcion: 'string',
    }

    return typeMap[field] || 'string'
  }

  /**
   * Verifica si un campo coincide con patrones específicos
   */
  private matchesFieldPattern(fieldName: string, fieldValue: any, mappedField: keyof Obra): boolean {
    const name = fieldName.toLowerCase()
    const value = String(fieldValue).toLowerCase()

    switch (mappedField) {
      case 'avance_percent':
        return name.includes('avance') || name.includes('progress') || 
               (typeof fieldValue === 'number' && fieldValue >= 0 && fieldValue <= 100)
      
      case 'dias_retraso':
        return name.includes('retraso') || name.includes('delay') || 
               name.includes('atraso') || name.includes('dias')
      
      case 'estado':
        return name.includes('estado') || name.includes('status') || 
               ['en_progreso', 'pausada', 'completada', 'cancelada'].includes(value)
      
      case 'prioridad':
        return name.includes('prioridad') || name.includes('priority') || 
               ['alta', 'media', 'baja'].includes(value)
      
      default:
        return false
    }
  }

  /**
   * Genera sugerencias basadas en el análisis de campos
   */
  private generateSuggestions(fields: FieldMapping[], suggestions: string[]): void {
    const mappedFields = new Set(fields.map(f => f.mappedField))
    const requiredFields: (keyof Obra)[] = ['id', 'nombre_obra', 'fecha_inicio', 'fecha_fin', 'avance_percent', 'dias_retraso']

    // Verificar campos requeridos faltantes
    requiredFields.forEach(field => {
      if (!mappedFields.has(field)) {
        suggestions.push(`Falta mapear el campo requerido: ${field}`)
      }
    })

    // Sugerir campos con baja confianza
    fields.forEach(field => {
      if (field.confidence < 0.5) {
        suggestions.push(`El campo "${field.originalField}" tiene baja confianza de mapeo (${Math.round(field.confidence * 100)}%)`)
      }
    })

    // Sugerir campos duplicados
    const fieldCounts = fields.reduce((acc, field) => {
      acc[field.mappedField] = (acc[field.mappedField] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(fieldCounts).forEach(([field, count]) => {
      if (count > 1) {
        suggestions.push(`Múltiples campos mapeados a "${field}" (${count} campos)`)
      }
    })
  }

  /**
   * Aplica un mapeo de campos a los datos
   */
  applyFieldMapping(data: any[], fieldMapping: Record<string, string>): Obra[] {
    return data.map(item => {
      const mappedItem: Partial<Obra> = {}
      
      Object.entries(fieldMapping).forEach(([originalField, mappedField]) => {
        if (item[originalField] !== undefined) {
          (mappedItem as any)[mappedField] = item[originalField]
        }
      })

      return mappedItem as Obra
    })
  }

  /**
   * Valida que un mapeo de campos sea válido
   */
  validateFieldMapping(fieldMapping: Record<string, string>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const validFields = Object.keys(this.fieldMappings)

    Object.entries(fieldMapping).forEach(([, mappedField]) => {
      if (!validFields.includes(mappedField)) {
        errors.push(`Campo mapeado inválido: ${mappedField}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Instancia singleton
export const schemaDetectionService = new SchemaDetectionService()
