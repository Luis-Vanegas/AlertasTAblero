import { MappedAlerta } from '../types/api'

// Tipos para umbrales de severidad
export interface SeverityThresholds {
  critical: {
    gravedad: string[]
    impacto_riesgo: string[]
  }
  warning: {
    gravedad: string[]
    impacto_riesgo: string[]
  }
}

// Umbrales por defecto basados en los datos de la API
const DEFAULT_THRESHOLDS: SeverityThresholds = {
  critical: {
    gravedad: ['alta', 'critica'],
    impacto_riesgo: ['cronograma', 'presupuesto', 'calidad']
  },
  warning: {
    gravedad: ['media'],
    impacto_riesgo: ['riesgo', 'administrativo']
  }
}

export class SeverityService {
  private thresholds: SeverityThresholds

  constructor(thresholds?: Partial<SeverityThresholds>) {
    this.thresholds = {
      critical: { ...DEFAULT_THRESHOLDS.critical, ...thresholds?.critical },
      warning: { ...DEFAULT_THRESHOLDS.warning, ...thresholds?.warning },
    }
  }

  /**
   * Calcula la severidad de una alerta basada en los umbrales configurados
   */
  calculateSeverity(alerta: MappedAlerta): 'ok' | 'warning' | 'critical' {
    const gravedad = (alerta.gravedad || '').toLowerCase()
    const impacto = (alerta.impacto_riesgo || '').toLowerCase()
    const generaCambio = alerta.genera_cambio_proyecto === true

    // 1) Clasificación base por gravedad (prioritaria)
    let level: 'ok' | 'warning' | 'critical'
    if (this.thresholds.critical.gravedad.includes(gravedad) || gravedad === 'crítica') {
      level = 'critical'
    } else if (this.thresholds.warning.gravedad.includes(gravedad)) {
      level = 'warning'
    } else {
      // Leve/baja/normal/null => ok
      level = 'ok'
    }

    // 2) Ajuste por impacto (solo sube si aún no es crítico)
    if (level !== 'critical') {
      if (this.thresholds.critical.impacto_riesgo.includes(impacto)) {
        level = 'warning'
      } else if (this.thresholds.warning.impacto_riesgo.includes(impacto)) {
        level = level === 'ok' ? 'warning' : level
      }
    }

    // 3) Genera cambio: escalar un nivel, no forzar crítico siempre
    if (generaCambio) {
      if (level === 'ok') level = 'warning'
      else if (level === 'warning') level = 'critical'
    }

    return level
  }

  /**
   * Obtiene el color asociado a una severidad
   */
  getSeverityColor(severity: 'ok' | 'warning' | 'critical'): string {
    switch (severity) {
      case 'critical':
        return '#f44336' // Rojo
      case 'warning':
        return '#ff9800' // Naranja
      case 'ok':
        return '#4caf50' // Verde
      default:
        return '#9e9e9e' // Gris
    }
  }

  /**
   * Obtiene el texto asociado a una severidad
   */
  getSeverityText(severity: 'ok' | 'warning' | 'critical'): string {
    switch (severity) {
      case 'critical':
        return 'Estado Crítico'
      case 'warning':
        return 'Requiere Atención'
      case 'ok':
        return 'En Buen Estado'
      default:
        return 'Sin Clasificar'
    }
  }

  /**
   * Obtiene el icono asociado a una severidad
   */
  getSeverityIcon(severity: 'ok' | 'warning' | 'critical'): string {
    switch (severity) {
      case 'critical':
        return 'error'
      case 'warning':
        return 'warning'
      case 'ok':
        return 'check_circle'
      default:
        return 'help'
    }
  }

  /**
   * Obtiene la descripción detallada de la severidad
   */
  getSeverityDescription(severity: 'ok' | 'warning' | 'critical'): string {
    switch (severity) {
      case 'critical':
        return 'Esta alerta requiere atención inmediata. Puede afectar significativamente el proyecto.'
      case 'warning':
        return 'Esta alerta necesita seguimiento. Monitoree de cerca el progreso.'
      case 'ok':
        return 'El proyecto está funcionando dentro de los parámetros normales.'
      default:
        return 'No se pudo determinar el estado de la alerta.'
    }
  }

  /**
   * Analiza la distribución de severidades en un conjunto de alertas
   */
  analyzeSeverityDistribution(alertas: MappedAlerta[]): {
    total: number
    critical: number
    warning: number
    ok: number
    percentages: {
      critical: number
      warning: number
      ok: number
    }
  } {
    const total = alertas.length
    const critical = alertas.filter(a => this.calculateSeverity(a) === 'critical').length
    const warning = alertas.filter(a => this.calculateSeverity(a) === 'warning').length
    const ok = alertas.filter(a => this.calculateSeverity(a) === 'ok').length

    return {
      total,
      critical,
      warning,
      ok,
      percentages: {
        critical: total > 0 ? Math.round((critical / total) * 100) : 0,
        warning: total > 0 ? Math.round((warning / total) * 100) : 0,
        ok: total > 0 ? Math.round((ok / total) * 100) : 0,
      }
    }
  }

  /**
   * Valida si los umbrales son correctos
   */
  validateThresholds(thresholds: Partial<SeverityThresholds>): boolean {
    try {
      // Verificar que no haya solapamiento entre critical y warning
      const critical = thresholds.critical || this.thresholds.critical
      const warning = thresholds.warning || this.thresholds.warning

      // Verificar que los arrays no estén vacíos
      if (!critical.gravedad.length || !critical.impacto_riesgo.length ||
          !warning.gravedad.length || !warning.impacto_riesgo.length) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Obtiene los umbrales actuales
   */
  getThresholds(): SeverityThresholds {
    return { ...this.thresholds }
  }

  /**
   * Actualiza los umbrales
   */
  updateThresholds(newThresholds: Partial<SeverityThresholds>): void {
    this.thresholds = {
      critical: { ...this.thresholds.critical, ...newThresholds.critical },
      warning: { ...this.thresholds.warning, ...newThresholds.warning },
    }
  }

  /**
   * Resetea los umbrales a los valores por defecto
   */
  resetThresholds(): void {
    this.thresholds = { ...DEFAULT_THRESHOLDS }
  }
}

// Instancia singleton del servicio
export const severityService = new SeverityService()