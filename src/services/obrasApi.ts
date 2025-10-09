/**
 * Servicio para consultar datos de obras en API externa
 */

export interface ObraExtra {
  id?: number | string;
  'ID OBRA'?: number | string;
  'FECHA ESTIMADA DE ENTREGA'?: string;
  '¿OBRA ENTREGADA?'?: string | boolean;
  'FECHA REAL DE ENTREGA'?: string;
  'PORCENTAJE EJECUCIÓN OBRA'?: number | string;
  ETAPA?: string;
  NOMBRE?: string;
  DESCRIPCIÓN?: string;
  DEPENDENCIA?: string;
  'PROYECTO ESTRATÉGICO'?: string;
  [key: string]: unknown;
}

const BASE_URL = '/api/obras'; // Always use proxy to avoid CORS issues

export class ObrasApiService {
  async getObras(): Promise<ObraExtra[]> {
    try {
      const resp = await fetch(BASE_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        mode: 'cors',
      });
      if (!resp.ok) {
        throw new Error(`Obras API error: ${resp.status}`);
      }

      const data = (await resp.json()) as unknown;

      // Aceptar tanto arreglos directos como { data: [...] }
      if (Array.isArray(data)) {
        return data as ObraExtra[];
      }
      if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown[] }).data)) {
        const obras = (data as { data: ObraExtra[] }).data;
        return obras;
      }
      // Si el esquema es desconocido, devolvemos arreglo vacío
      return [];
    } catch (error) {
      console.warn('ObrasApiService: Error al obtener obras, usando datos vacíos:', error);
      return [];
    }
  }

  async getObraById(obraId: string | number): Promise<ObraExtra | null> {
    // Estrategia simple: obtener todas y buscar por id/ID OBRA/obra_id
    const obras = await this.getObras();
    const idStr = String(obraId);
    const match = obras.find(o => {
      const candidates = [
        o['id'],
        (o as Record<string, unknown>)['ID OBRA'],
        (o as Record<string, unknown>)['obra_id'],
      ];
      console.log('ObrasApiService: Checking obra:', {
        id: o['id'],
        'ID OBRA': (o as Record<string, unknown>)['ID OBRA'],
        obra_id: (o as Record<string, unknown>)['obra_id'],
        searchingFor: idStr,
      });
      return candidates.some(c => c !== undefined && String(c) === idStr);
    });
    console.log('ObrasApiService: Match found:', match);
    return match ?? null;
  }
}

// Funciones auxiliares para fechas
export const getFechaEstimada = (obra: ObraExtra | null): string | null => {
  if (!obra) return null;
  return obra['FECHA ESTIMADA DE ENTREGA'] || null;
};

export const getEstadoEntrega = (obra: ObraExtra | null): string | null => {
  if (!obra) return null;
  return obra['¿OBRA ENTREGADA?']?.toString() || null;
};

export const isEntregada = (obra: ObraExtra | null): boolean => {
  if (!obra) return false;
  const estado = getEstadoEntrega(obra);
  if (!estado) return false;
  return (
    estado.toLowerCase().includes('si') ||
    estado.toLowerCase().includes('yes') ||
    estado.toLowerCase() === 'true'
  );
};

export const getAvanceObra = (obra: ObraExtra | null): string | null => {
  if (!obra) return null;
  const avance = obra['PORCENTAJE EJECUCIÓN OBRA'];
  if (!avance) return null;
  return typeof avance === 'number' ? `${avance}%` : `${avance}`;
};

export const getEtapaObra = (obra: ObraExtra | null): string | null => {
  if (!obra) return null;
  return obra['ETAPA'] || null;
};

export const getEstadoVencimiento = (
  fechaEstimada: string | null
): {
  estado: 'normal' | 'proximo' | 'vencido';
  dias: number;
  mensaje: string;
} => {
  if (!fechaEstimada) {
    return { estado: 'normal', dias: 0, mensaje: 'Sin fecha estimada' };
  }

  const hoy = new Date();
  const fecha = new Date(fechaEstimada);

  if (isNaN(fecha.getTime())) {
    return { estado: 'normal', dias: 0, mensaje: 'Fecha inválida' };
  }

  const diffTime = fecha.getTime() - hoy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      estado: 'vencido',
      dias: Math.abs(diffDays),
      mensaje: `Atrasada por ${Math.abs(diffDays)} días`,
    };
  } else if (diffDays <= 7) {
    return {
      estado: 'proximo',
      dias: diffDays,
      mensaje: `Vence en ${diffDays} días`,
    };
  } else {
    return {
      estado: 'normal',
      dias: diffDays,
      mensaje: `Vence en ${diffDays} días`,
    };
  }
};

export const obrasApiService = new ObrasApiService();
