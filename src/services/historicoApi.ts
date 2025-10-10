import { ApiHistoricoResponse, ApiHistoricoItem, CambioFechaEstimada } from '../types/api';

const env =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string; VITE_API_KEY?: string } }).env || {};

export class HistoricoApiService {
  private baseUrl =
    env.VITE_API_BASE ||
    'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi';
  private apiKey = env.VITE_API_KEY || 'pow3rb1_visor_3str4t3g1co_2025';

  /**
   * Obtiene el histórico de cambios
   */
  async getHistorico(): Promise<ApiHistoricoResponse> {
    try {
      const url = `${this.baseUrl}/historico?apikey=${this.apiKey}`;

      console.log('Fetching histórico URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: ApiHistoricoResponse = await response.json();

      console.log('📊 Histórico data received:', {
        count: data.data?.length,
        pagination: data.pagination,
        metadata: data.metadata,
      });

      // Mostrar algunos ejemplos de la respuesta
      if (data.data && data.data.length > 0) {
        console.log('📋 Primeros 3 registros del histórico:', data.data.slice(0, 3));
      }

      return data;
    } catch (error) {
      console.error('Error al obtener histórico:', error);
      throw error;
    }
  }

  /**
   * Calcula las obras que cambiaron su fecha estimada de entrega más de 2 meses
   * Filtra desde agosto 1, 2025 (2 meses antes de septiembre)
   * Detecta alertas porque "eso no se puede" (no debería pasar)
   */
  calculateCambiosFechasEstimadas(historicoData: ApiHistoricoItem[]): CambioFechaEstimada[] {
    console.log('📊 Procesando histórico:', historicoData.length, 'registros');

    // Mostrar algunos ejemplos de los datos que llegan
    if (historicoData.length > 0) {
      console.log(
        '📋 Ejemplos de datos del histórico:',
        historicoData.slice(0, 3).map(item => ({
          id: item.id,
          obra: item['ID OBRA'],
          campo: item['CAMPO MODIFICADO'],
          valorAnterior: item['VALOR ANTERIOR'],
          valorNuevo: item['VALOR NUEVO'],
          fechaModificacion: item['FECHA MODIFICACIÓN'],
        }))
      );
    }

    // Filtrar desde 2 meses antes de septiembre 2025 (agosto 2025)
    const fechaLimite = new Date('2025-08-01');
    const cambios: CambioFechaEstimada[] = [];

    // Filtrar solo cambios de fechas estimadas desde agosto 1, 2025
    const cambiosFechas = historicoData.filter(item => {
      // Verificar que la fecha de modificación existe
      if (!item['FECHA MODIFICACIÓN']) return false;

      const fechaModificacion = new Date(item['FECHA MODIFICACIÓN']);
      const campoModificado = item['CAMPO MODIFICADO'];

      // Verificar que el campo modificado es fecha estimada de entrega
      const esFechaEstimadaEntrega =
        campoModificado &&
        campoModificado.includes('fecha_') &&
        campoModificado.includes('estimada') &&
        (campoModificado.includes('fin') || campoModificado.includes('entrega'));

      // Verificar que la fecha es válida y está dentro del rango
      return (
        !isNaN(fechaModificacion.getTime()) &&
        fechaModificacion >= fechaLimite &&
        esFechaEstimadaEntrega
      );
    });

    console.log('📅 Cambios de fechas filtrados:', cambiosFechas.length, 'registros');

    // Ordenar por fecha de modificación (mayor a menor)
    const cambiosOrdenados = cambiosFechas.sort(
      (a, b) =>
        new Date(b['FECHA MODIFICACIÓN']).getTime() - new Date(a['FECHA MODIFICACIÓN']).getTime()
    );

    console.log('📅 Cambios ordenados por fecha de modificación');

    // Agrupar por obra para encontrar el cambio más significativo de cada obra
    const cambiosPorObra = new Map<number, ApiHistoricoItem[]>();

    cambiosOrdenados.forEach(cambio => {
      const obraId = cambio['ID OBRA'];
      if (!cambiosPorObra.has(obraId)) {
        cambiosPorObra.set(obraId, []);
      }
      cambiosPorObra.get(obraId)!.push(cambio);
    });

    // Procesar cada obra para encontrar el cambio más significativo
    cambiosPorObra.forEach((cambiosObra, obraId) => {
      let mejorCambio: ApiHistoricoItem | null = null;
      let mayorDiferencia = 0;

      // Buscar el cambio con mayor diferencia en meses para esta obra
      cambiosObra.forEach(cambio => {
        // Solo procesar cambios con valores válidos
        if (
          cambio['VALOR ANTERIOR'] &&
          cambio['VALOR NUEVO'] &&
          cambio['VALOR ANTERIOR'] !== 'N/A' &&
          cambio['VALOR NUEVO'] !== 'N/A'
        ) {
          const fechaAnterior = new Date(cambio['VALOR ANTERIOR']);
          const fechaNueva = new Date(cambio['VALOR NUEVO']);

          // Verificar que las fechas sean válidas
          if (!isNaN(fechaAnterior.getTime()) && !isNaN(fechaNueva.getTime())) {
            const mesesDiferencia = Math.abs(
              this.calcularDiferenciaMeses(fechaAnterior, fechaNueva)
            );

            console.log(`📅 Analizando cambio obra ${obraId}:`, {
              campo: cambio['CAMPO MODIFICADO'],
              fechaAnterior: fechaAnterior.toLocaleDateString(),
              fechaNueva: fechaNueva.toLocaleDateString(),
              mesesDiferencia: mesesDiferencia,
            });

            // Si es mayor a 2 meses y es el mayor cambio encontrado para esta obra
            if (mesesDiferencia > 2 && mesesDiferencia > mayorDiferencia) {
              mejorCambio = cambio;
              mayorDiferencia = mesesDiferencia;
            }
          }
        }
      });

      // Si encontramos un cambio significativo para esta obra, agregarlo
      if (mejorCambio !== null) {
        console.log(`✅ ALERTA: Obra ${obraId} tiene ${mayorDiferencia} meses de diferencia`);
        cambios.push({
          obra_id: obraId,
          nombre_obra: mejorCambio['NOMBRE OBRA'] || 'Sin nombre',
          dependencia: mejorCambio['DEPENDENCIA'] || 'Sin dependencia',
          comuna: mejorCambio['COMUNA O CORREGIMIENTO'] || 'Sin ubicación',
          proyecto_estrategico: mejorCambio['PROYECTO ESTRATÉGICO'] || 'Sin proyecto',
          campo_modificado: mejorCambio['CAMPO MODIFICADO'] || 'Campo desconocido',
          fecha_anterior: mejorCambio['VALOR ANTERIOR']!,
          fecha_nueva: mejorCambio['VALOR NUEVO']!,
          meses_atraso: mayorDiferencia,
          fecha_modificacion: mejorCambio['FECHA MODIFICACIÓN'] || new Date().toISOString(),
          usuario_modificador: mejorCambio['USUARIO MODIFICADOR'] || 'Usuario desconocido',
        });
      }
    });

    // Ordenar por meses de atraso (mayor atraso primero)
    const cambiosFinales = cambios.sort((a, b) => b.meses_atraso - a.meses_atraso);
    console.log(
      '✅ Obras con cambios de fecha estimada > 2 meses:',
      cambiosFinales.length,
      'obras'
    );
    return cambiosFinales;
  }

  /**
   * Calcula la diferencia en meses entre dos fechas
   */
  private calcularDiferenciaMeses(fecha1: Date, fecha2: Date): number {
    const year1 = fecha1.getFullYear();
    const month1 = fecha1.getMonth();
    const year2 = fecha2.getFullYear();
    const month2 = fecha2.getMonth();

    return (year2 - year1) * 12 + (month2 - month1);
  }

  /**
   * Calcula las obras que cambiaron su presupuesto más de 500 millones
   * Filtra desde septiembre 1, 2025
   * Detecta alertas por cambios significativos de presupuesto
   */
  calculateCambiosPresupuesto(historicoData: ApiHistoricoItem[]): CambioFechaEstimada[] {
    console.log('💰 Procesando cambios de presupuesto:', historicoData.length, 'registros');

    // Mostrar algunos ejemplos de los datos que llegan
    if (historicoData.length > 0) {
      console.log(
        '📋 Ejemplos de datos del histórico (presupuesto):',
        historicoData.slice(0, 3).map(item => ({
          id: item.id,
          obra: item['ID OBRA'],
          campo: item['CAMPO MODIFICADO'],
          valorAnterior: item['VALOR ANTERIOR'],
          valorNuevo: item['VALOR NUEVO'],
          fechaModificacion: item['FECHA MODIFICACIÓN'],
        }))
      );
    }

    // Filtrar desde septiembre 1, 2025
    const fechaLimite = new Date('2025-09-01');
    const cambios: CambioFechaEstimada[] = [];

    // Filtrar solo cambios de presupuesto desde septiembre 1, 2025
    const cambiosPresupuesto = historicoData.filter(item => {
      // Verificar que la fecha de modificación existe
      if (!item['FECHA MODIFICACIÓN']) return false;

      const fechaModificacion = new Date(item['FECHA MODIFICACIÓN']);
      const campoModificado = item['CAMPO MODIFICADO'];

      // Verificar que el campo modificado es de presupuesto/costo
      const esPresupuesto =
        campoModificado &&
        (campoModificado.includes('costo') ||
          campoModificado.includes('presupuesto') ||
          campoModificado.includes('inversion') ||
          campoModificado.includes('dinero'));

      // Verificar que la fecha es válida y está dentro del rango
      return (
        !isNaN(fechaModificacion.getTime()) && fechaModificacion >= fechaLimite && esPresupuesto
      );
    });

    console.log('💰 Cambios de presupuesto filtrados:', cambiosPresupuesto.length, 'registros');

    // Ordenar por fecha de modificación (mayor a menor)
    const cambiosOrdenados = cambiosPresupuesto.sort(
      (a, b) =>
        new Date(b['FECHA MODIFICACIÓN']).getTime() - new Date(a['FECHA MODIFICACIÓN']).getTime()
    );

    console.log('💰 Cambios ordenados por fecha de modificación');

    // Agrupar por obra para encontrar el cambio más significativo de cada obra
    const cambiosPorObra = new Map<number, ApiHistoricoItem[]>();

    cambiosOrdenados.forEach(cambio => {
      const obraId = cambio['ID OBRA'];
      if (!cambiosPorObra.has(obraId)) {
        cambiosPorObra.set(obraId, []);
      }
      cambiosPorObra.get(obraId)!.push(cambio);
    });

    // Procesar cada obra para encontrar el cambio más significativo
    cambiosPorObra.forEach((cambiosObra, obraId) => {
      let mejorCambio: ApiHistoricoItem | null = null;
      let mayorDiferencia = 0;

      // Buscar el cambio con mayor diferencia en presupuesto para esta obra
      cambiosObra.forEach(cambio => {
        // Solo procesar cambios con valores válidos
        if (
          cambio['VALOR ANTERIOR'] &&
          cambio['VALOR NUEVO'] &&
          cambio['VALOR ANTERIOR'] !== 'N/A' &&
          cambio['VALOR NUEVO'] !== 'N/A'
        ) {
          // Convertir valores a números
          const costoAnterior = this.parseCosto(cambio['VALOR ANTERIOR']);
          const costoNuevo = this.parseCosto(cambio['VALOR NUEVO']);

          if (costoAnterior !== null && costoNuevo !== null) {
            const diferenciaCosto = Math.abs(costoNuevo - costoAnterior);

            console.log(`💰 Analizando cambio presupuesto obra ${obraId}:`, {
              campo: cambio['CAMPO MODIFICADO'],
              costoAnterior: costoAnterior,
              costoNuevo: costoNuevo,
              diferencia: diferenciaCosto,
            });

            // Si la diferencia es mayor a 500 millones y es el mayor cambio encontrado para esta obra
            if (diferenciaCosto > 500000000 && diferenciaCosto > mayorDiferencia) {
              mejorCambio = cambio;
              mayorDiferencia = diferenciaCosto;
            }
          }
        }
      });

      // Si encontramos un cambio significativo para esta obra, agregarlo
      if (mejorCambio !== null) {
        console.log(`✅ ALERTA PRESUPUESTO: Obra ${obraId} tiene ${mayorDiferencia} de diferencia`);
        cambios.push({
          obra_id: obraId,
          nombre_obra: mejorCambio['NOMBRE OBRA'] || 'Sin nombre',
          dependencia: mejorCambio['DEPENDENCIA'] || 'Sin dependencia',
          comuna: mejorCambio['COMUNA O CORREGIMIENTO'] || 'Sin ubicación',
          proyecto_estrategico: mejorCambio['PROYECTO ESTRATÉGICO'] || 'Sin proyecto',
          campo_modificado: mejorCambio['CAMPO MODIFICADO'] || 'Campo desconocido',
          fecha_anterior: mejorCambio['VALOR ANTERIOR']!,
          fecha_nueva: mejorCambio['VALOR NUEVO']!,
          meses_atraso: Math.round(mayorDiferencia / 1000000), // Convertir a millones para mostrar
          fecha_modificacion: mejorCambio['FECHA MODIFICACIÓN'] || new Date().toISOString(),
          usuario_modificador: mejorCambio['USUARIO MODIFICADOR'] || 'Usuario desconocido',
        });
      }
    });

    // Ordenar por diferencia de presupuesto (mayor diferencia primero)
    const cambiosFinales = cambios.sort((a, b) => b.meses_atraso - a.meses_atraso);
    console.log('✅ Obras con cambios de presupuesto > 500M:', cambiosFinales.length, 'obras');
    return cambiosFinales;
  }

  /**
   * Convierte un valor de texto a número (maneja diferentes formatos)
   */
  private parseCosto(valor: string): number | null {
    if (!valor || valor === 'N/A' || valor === 'Sin información') return null;

    // Remover caracteres no numéricos excepto puntos y comas
    const valorLimpio = valor.replace(/[^\d.,]/g, '');

    // Convertir a número
    const numero = parseFloat(valorLimpio.replace(',', '.'));

    return isNaN(numero) ? null : numero;
  }

  /**
   * Obtiene estadísticas de cambios de fechas estimadas
   */
  async getCambiosFechasEstimadas(): Promise<{
    total_cambios: number;
    cambios: CambioFechaEstimada[];
    por_dependencia: Record<string, number>;
    por_comuna: Record<string, number>;
    por_proyecto: Record<string, number>;
  }> {
    try {
      console.log('🚀 Iniciando cálculo de cambios de fechas estimadas...');
      const historicoResponse = await this.getHistorico();
      console.log('📊 Datos del histórico obtenidos, iniciando cálculo...');
      const cambios = this.calculateCambiosFechasEstimadas(historicoResponse.data);

      // Calcular estadísticas
      const por_dependencia: Record<string, number> = {};
      const por_comuna: Record<string, number> = {};
      const por_proyecto: Record<string, number> = {};

      cambios.forEach(cambio => {
        por_dependencia[cambio.dependencia] = (por_dependencia[cambio.dependencia] || 0) + 1;
        por_comuna[cambio.comuna] = (por_comuna[cambio.comuna] || 0) + 1;
        por_proyecto[cambio.proyecto_estrategico] =
          (por_proyecto[cambio.proyecto_estrategico] || 0) + 1;
      });

      return {
        total_cambios: cambios.length,
        cambios,
        por_dependencia,
        por_comuna,
        por_proyecto,
      };
    } catch (error) {
      console.error('Error al obtener cambios de fechas estimadas:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de cambios de presupuesto
   */
  async getCambiosPresupuesto(): Promise<{
    total_cambios: number;
    cambios: CambioFechaEstimada[];
    por_dependencia: Record<string, number>;
    por_comuna: Record<string, number>;
    por_proyecto: Record<string, number>;
  }> {
    try {
      console.log('🚀 Iniciando cálculo de cambios de presupuesto...');
      const historicoResponse = await this.getHistorico();
      console.log('📊 Datos del histórico obtenidos, iniciando cálculo de presupuesto...');
      const cambios = this.calculateCambiosPresupuesto(historicoResponse.data);

      // Calcular estadísticas
      const por_dependencia: Record<string, number> = {};
      const por_comuna: Record<string, number> = {};
      const por_proyecto: Record<string, number> = {};

      cambios.forEach(cambio => {
        por_dependencia[cambio.dependencia] = (por_dependencia[cambio.dependencia] || 0) + 1;
        por_comuna[cambio.comuna] = (por_comuna[cambio.comuna] || 0) + 1;
        por_proyecto[cambio.proyecto_estrategico] =
          (por_proyecto[cambio.proyecto_estrategico] || 0) + 1;
      });

      return {
        total_cambios: cambios.length,
        cambios,
        por_dependencia,
        por_comuna,
        por_proyecto,
      };
    } catch (error) {
      console.error('Error al obtener cambios de presupuesto:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const historicoApiService = new HistoricoApiService();
