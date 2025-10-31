/**
 * Utilidades para normalización de texto
 */

/**
 * Normaliza un string removiendo acentos, convirtiendo a minúsculas y trim
 * Útil para comparaciones y búsquedas que deben ignorar acentos
 */
export const normalizeText = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
};

/**
 * Normaliza el nombre de un proyecto estratégico para usar como clave
 */
export const normalizeProjectName = (projectName: string): string => {
  return normalizeText(projectName || 'Sin proyecto');
};

