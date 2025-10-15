/**
 * Utilidades para formateo de moneda colombiana
 */

/**
 * Formatea un número como moneda colombiana con puntos de miles
 * @param value - El valor numérico a formatear
 * @returns String formateado como moneda colombiana (ej: $1.000.000)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea un número como moneda colombiana sin el símbolo de moneda
 * @param value - El valor numérico a formatear
 * @returns String formateado con puntos de miles (ej: 1.000.000)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Convierte un string a número, manejando diferentes formatos
 * @param value - El string a convertir
 * @returns Número o null si no se puede convertir
 */
export const parseCurrency = (value: string): number | null => {
  if (!value || value === 'N/A' || value === 'Sin información') return null;

  // Remover caracteres no numéricos excepto puntos y comas
  const valorLimpio = value.replace(/[^\d.,]/g, '');

  // Convertir a número
  const numero = parseFloat(valorLimpio.replace(',', '.'));

  return isNaN(numero) ? null : numero;
};
