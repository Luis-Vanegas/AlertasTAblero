import { SeverityService } from '../severity';
import { MappedAlerta } from '../../types/api';

describe('SeverityService', () => {
  let severityService: SeverityService;

  beforeEach(() => {
    severityService = new SeverityService();
  });

  describe('calculateSeverity', () => {
    it('should return critical for high delay', () => {
      const alerta: MappedAlerta = {
        id: '1',
        obra_id: '1',
        nombre_obra: 'Test Obra',
        estado_obra: 'en_progreso',
        dependencia: 'Test Dependencia',
        comuna: 'Test Comuna',
        proyecto_estrategico: 'Test Proyecto',
        descripcion_alerta: 'Test Description',
        fecha_alerta: '2024-01-01',
        impacto_riesgo: 'presupuesto',
        genera_cambio_proyecto: true,
        descripcion_cambio: 'Test Change',
        responsable_aprobar_cambio: 'Test Responsible',
        gravedad: 'alta',
        fecha_creacion: '2024-01-01',
        usuario_creador: 'Test User',
        fecha_actualizacion: null,
        usuario_actualizador: null,
      };

      const result = severityService.calculateSeverity(alerta);
      expect(result).toBe('critical');
    });

    it('should return critical for low progress', () => {
      const alerta: MappedAlerta = {
        id: '2',
        obra_id: '2',
        nombre_obra: 'Test Obra 2',
        estado_obra: 'en_progreso',
        dependencia: 'Test Dependencia',
        comuna: 'Test Comuna',
        proyecto_estrategico: 'Test Proyecto',
        descripcion_alerta: 'Test Description',
        fecha_alerta: '2024-01-01',
        impacto_riesgo: 'presupuesto',
        genera_cambio_proyecto: true,
        descripcion_cambio: 'Test Change',
        responsable_aprobar_cambio: 'Test Responsible',
        gravedad: 'alta',
        fecha_creacion: '2024-01-01',
        usuario_creador: 'Test User',
        fecha_actualizacion: null,
        usuario_actualizador: null,
      };

      const result = severityService.calculateSeverity(alerta);
      expect(result).toBe('critical');
    });

    it('should return warning for medium delay', () => {
      const alerta: MappedAlerta = {
        id: '3',
        obra_id: '3',
        nombre_obra: 'Test Obra 3',
        estado_obra: 'en_progreso',
        dependencia: 'Test Dependencia',
        comuna: 'Test Comuna',
        proyecto_estrategico: 'Test Proyecto',
        descripcion_alerta: 'Test Description',
        fecha_alerta: '2024-01-01',
        impacto_riesgo: 'presupuesto',
        genera_cambio_proyecto: true,
        descripcion_cambio: 'Test Change',
        responsable_aprobar_cambio: 'Test Responsible',
        gravedad: 'media',
        fecha_creacion: '2024-01-01',
        usuario_creador: 'Test User',
        fecha_actualizacion: null,
        usuario_actualizador: null,
      };

      const result = severityService.calculateSeverity(alerta);
      expect(result).toBe('warning');
    });

    it('should return ok for good progress', () => {
      const alerta: MappedAlerta = {
        id: '4',
        obra_id: '4',
        nombre_obra: 'Test Obra 4',
        estado_obra: 'en_progreso',
        dependencia: 'Test Dependencia',
        comuna: 'Test Comuna',
        proyecto_estrategico: 'Test Proyecto',
        descripcion_alerta: 'Test Description',
        fecha_alerta: '2024-01-01',
        impacto_riesgo: 'presupuesto',
        genera_cambio_proyecto: false,
        descripcion_cambio: '',
        responsable_aprobar_cambio: '',
        gravedad: 'leve',
        fecha_creacion: '2024-01-01',
        usuario_creador: 'Test User',
        fecha_actualizacion: null,
        usuario_actualizador: null,
      };

      const result = severityService.calculateSeverity(alerta);
      expect(result).toBe('ok');
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct colors', () => {
      expect(severityService.getSeverityColor('ok')).toBe('#4caf50');
      expect(severityService.getSeverityColor('warning')).toBe('#ff9800');
      expect(severityService.getSeverityColor('critical')).toBe('#f44336');
    });
  });

  describe('getSeverityText', () => {
    it('should return correct texts', () => {
      expect(severityService.getSeverityText('ok')).toBe('En buen estado');
      expect(severityService.getSeverityText('warning')).toBe('Requiere atención');
      expect(severityService.getSeverityText('critical')).toBe('Estado crítico');
    });
  });

  describe('analyzeSeverityDistribution', () => {
    it('should calculate correct distribution', () => {
      const alertas: MappedAlerta[] = [
        {
          id: '1',
          obra_id: '1',
          nombre_obra: 'Obra 1',
          estado_obra: 'en_progreso',
          dependencia: 'Test Dependencia',
          comuna: 'Test Comuna',
          proyecto_estrategico: 'Test Proyecto',
          descripcion_alerta: 'Test Description',
          fecha_alerta: '2024-01-01',
          impacto_riesgo: 'presupuesto',
          genera_cambio_proyecto: false,
          descripcion_cambio: '',
          responsable_aprobar_cambio: '',
          gravedad: 'leve',
          fecha_creacion: '2024-01-01',
          usuario_creador: 'Test User',
          fecha_actualizacion: null,
          usuario_actualizador: null,
        },
        {
          id: '2',
          obra_id: '2',
          nombre_obra: 'Obra 2',
          estado_obra: 'en_progreso',
          dependencia: 'Test Dependencia',
          comuna: 'Test Comuna',
          proyecto_estrategico: 'Test Proyecto',
          descripcion_alerta: 'Test Description',
          fecha_alerta: '2024-01-01',
          impacto_riesgo: 'presupuesto',
          genera_cambio_proyecto: true,
          descripcion_cambio: 'Test Change',
          responsable_aprobar_cambio: 'Test Responsible',
          gravedad: 'media',
          fecha_creacion: '2024-01-01',
          usuario_creador: 'Test User',
          fecha_actualizacion: null,
          usuario_actualizador: null,
        },
        {
          id: '3',
          obra_id: '3',
          nombre_obra: 'Obra 3',
          estado_obra: 'en_progreso',
          dependencia: 'Test Dependencia',
          comuna: 'Test Comuna',
          proyecto_estrategico: 'Test Proyecto',
          descripcion_alerta: 'Test Description',
          fecha_alerta: '2024-01-01',
          impacto_riesgo: 'presupuesto',
          genera_cambio_proyecto: true,
          descripcion_cambio: 'Test Change',
          responsable_aprobar_cambio: 'Test Responsible',
          gravedad: 'alta',
          fecha_creacion: '2024-01-01',
          usuario_creador: 'Test User',
          fecha_actualizacion: null,
          usuario_actualizador: null,
        },
      ];

      const result = severityService.analyzeSeverityDistribution(alertas);

      expect(result.total).toBe(3);
      expect(result.ok).toBe(1);
      expect(result.warning).toBe(1);
      expect(result.critical).toBe(1);
      expect(result.percentages.ok).toBeCloseTo(33.33, 1);
      expect(result.percentages.warning).toBeCloseTo(33.33, 1);
      expect(result.percentages.critical).toBeCloseTo(33.33, 1);
    });
  });

  describe('validateThresholds', () => {
    it('should validate correct thresholds', () => {
      const validThresholds = {
        critical: { gravedad: ['alta', 'crítica'], impacto_riesgo: ['presupuesto', 'cronograma'] },
        warning: { gravedad: ['media'], impacto_riesgo: ['alcance'] },
      };

      const result = severityService.validateThresholds(validThresholds);
      expect(result).toBe(true);
    });

    it('should detect invalid thresholds', () => {
      const invalidThresholds = {
        critical: { gravedad: [], impacto_riesgo: ['presupuesto'] },
        warning: { gravedad: ['media'], impacto_riesgo: [] },
      };

      const result = severityService.validateThresholds(invalidThresholds);
      expect(result).toBe(false);
    });
  });
});
