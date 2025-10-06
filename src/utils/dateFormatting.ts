import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha para mostrar en la UI
 */
export const formatDate = (
  date: string | Date | null | undefined,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string => {
  if (!date) return 'Sin fecha'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(dateObj)) {
      return 'Fecha inválida'
    }
    
    return format(dateObj, formatString, { locale: es })
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return 'Error de fecha'
  }
}

/**
 * Formatea una fecha para mostrar tiempo relativo
 */
export const formatRelativeTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return 'Sin fecha'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(dateObj)) {
      return 'Fecha inválida'
    }
    
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: es 
    })
  } catch (error) {
    console.error('Error formateando tiempo relativo:', error)
    return 'Error de fecha'
  }
}

/**
 * Formatea una fecha para mostrar solo la fecha (sin hora)
 */
export const formatDateOnly = (
  date: string | Date | null | undefined
): string => {
  return formatDate(date, 'dd/MM/yyyy')
}

/**
 * Formatea una fecha para mostrar solo la hora
 */
export const formatTimeOnly = (
  date: string | Date | null | undefined
): string => {
  return formatDate(date, 'HH:mm')
}

/**
 * Formatea una fecha para mostrar en formato ISO
 */
export const formatISO = (
  date: string | Date | null | undefined
): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(dateObj)) {
      return ''
    }
    
    return dateObj.toISOString()
  } catch (error) {
    console.error('Error formateando ISO:', error)
    return ''
  }
}

/**
 * Formatea una fecha para mostrar en formato de archivo
 */
export const formatForFilename = (
  date: string | Date | null | undefined
): string => {
  if (!date) return 'sin_fecha'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(dateObj)) {
      return 'fecha_invalida'
    }
    
    return format(dateObj, 'yyyyMMdd_HHmm', { locale: es })
  } catch (error) {
    console.error('Error formateando para archivo:', error)
    return 'error_fecha'
  }
}

/**
 * Formatea una fecha para mostrar en formato largo
 */
export const formatLongDate = (
  date: string | Date | null | undefined
): string => {
  return formatDate(date, 'EEEE, dd \'de\' MMMM \'de\' yyyy \'a las\' HH:mm')
}

/**
 * Formatea una fecha para mostrar en formato corto
 */
export const formatShortDate = (
  date: string | Date | null | undefined
): string => {
  return formatDate(date, 'dd/MM/yy HH:mm')
}

/**
 * Valida si una fecha es válida
 */
export const isValidDate = (
  date: string | Date | null | undefined
): boolean => {
  if (!date) return false
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj)
  } catch (error) {
    return false
  }
}

/**
 * Obtiene la fecha actual formateada
 */
export const getCurrentDateFormatted = (): string => {
  return formatDate(new Date(), 'dd/MM/yyyy HH:mm')
}

/**
 * Obtiene la fecha actual en formato ISO
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString()
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const getDaysDifference = (
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): number => {
  if (!date1 || !date2) return 0
  
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
    
    if (!isValid(d1) || !isValid(d2)) return 0
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch (error) {
    console.error('Error calculando diferencia de días:', error)
    return 0
  }
}

/**
 * Formatea la diferencia en días de manera legible
 */
export const formatDaysDifference = (
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): string => {
  const days = getDaysDifference(date1, date2)
  
  if (days === 0) return 'Hoy'
  if (days === 1) return '1 día'
  if (days < 30) return `${days} días`
  if (days < 365) return `${Math.floor(days / 30)} meses`
  return `${Math.floor(days / 365)} años`
}

