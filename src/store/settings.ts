import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SeverityThresholds {
  critical: {
    dias_retraso: number;
    avance_percent: number;
  };
  warning: {
    dias_retraso: number;
    avance_percent: number;
  };
}

export interface FieldMapping {
  [key: string]: string;
}

export interface Settings {
  // Configuración de severidad
  severityThresholds: SeverityThresholds;

  // Mapeo de campos
  fieldMapping: FieldMapping;

  // Configuración de polling
  pollingInterval: number;
  enablePolling: boolean;

  // Configuración de UI
  enableAnimations: boolean;
  showReducedMotion: boolean;

  // Configuración de tabla
  defaultPageSize: number;
  hiddenColumns: string[];

  // Configuración de filtros
  defaultFilters: {
    dependencia?: string;
    severidad?: string;
    estado?: string;
  };
  // Filtros activos (para el dashboard)
  filters: {
    searchTerm: string;
    dependencia: string[];
    gravedad: string[];
    impacto: string[];
    comuna?: string[];
    priorityProject: string;
    obraIds?: string[];
  };

  // Última sincronización
  lastSync: string | null;

  // Métodos
  updateSeverityThresholds: (thresholds: Partial<SeverityThresholds>) => void;
  updateFieldMapping: (mapping: FieldMapping) => void;
  setPollingInterval: (interval: number) => void;
  togglePolling: () => void;
  toggleAnimations: () => void;
  setReducedMotion: (enabled: boolean) => void;
  setDefaultPageSize: (size: number) => void;
  toggleColumnVisibility: (column: string) => void;
  setDefaultFilters: (filters: Partial<Settings['defaultFilters']>) => void;
  // Acciones de filtros
  setFilters: (filters: Partial<Settings['filters']>) => void;
  clearFilters: () => void;
  updateLastSync: () => void;
  resetSettings: () => void;
}

// Configuración por defecto
const defaultSeverityThresholds: SeverityThresholds = {
  critical: {
    dias_retraso: 15,
    avance_percent: 20,
  },
  warning: {
    dias_retraso: 7,
    avance_percent: 50,
  },
};

const defaultFieldMapping: FieldMapping = {
  'ID OBRA': 'obra_id',
  'NOMBRE OBRA': 'nombre_obra',
  'ESTADO OBRA': 'estado_obra',
  DEPENDENCIA: 'dependencia',
  'COMUNA O CORREGIMIENTO': 'comuna',
  'PROYECTO ESTRATÉGICO': 'proyecto_estrategico',
  'DESCRIPCIÓN ALERTA': 'descripcion_alerta',
  'FECHA ALERTA': 'fecha_alerta',
  'IMPACTO RIESGO': 'impacto_riesgo',
  'GENERA CAMBIO PROYECTO': 'genera_cambio_proyecto',
  'DESCRIPCIÓN CAMBIO': 'descripcion_cambio',
  'RESPONSABLE APROBAR CAMBIO': 'responsable_aprobar_cambio',
  GRAVEDAD: 'gravedad',
  'FECHA CREACIÓN': 'fecha_creacion',
  'USUARIO CREADOR': 'usuario_creador',
  'FECHA ACTUALIZACIÓN': 'fecha_actualizacion',
  'USUARIO ACTUALIZADOR': 'usuario_actualizador',
};

export const useSettingsStore = create<Settings>()(
  persist(
    (set, get) => ({
      // Estado inicial
      severityThresholds: defaultSeverityThresholds,
      fieldMapping: defaultFieldMapping,
      pollingInterval: 60000, // 60 segundos
      enablePolling: true,
      enableAnimations: true,
      showReducedMotion: false,
      defaultPageSize: 25,
      hiddenColumns: [],
      defaultFilters: {},
      filters: {
        searchTerm: '',
        dependencia: [],
        gravedad: [],
        impacto: [],
        comuna: [],
        priorityProject: '',
        obraIds: [],
      },
      lastSync: null,

      // Métodos
      updateSeverityThresholds: thresholds =>
        set(state => ({
          severityThresholds: {
            ...state.severityThresholds,
            ...thresholds,
          },
        })),

      updateFieldMapping: mapping => set({ fieldMapping: { ...get().fieldMapping, ...mapping } }),

      setPollingInterval: interval => set({ pollingInterval: Math.max(10000, interval) }), // Mínimo 10 segundos

      togglePolling: () => set(state => ({ enablePolling: !state.enablePolling })),

      toggleAnimations: () => set(state => ({ enableAnimations: !state.enableAnimations })),

      setReducedMotion: enabled => set({ showReducedMotion: enabled }),

      setDefaultPageSize: size => set({ defaultPageSize: Math.max(10, Math.min(100, size)) }),

      toggleColumnVisibility: column =>
        set(state => ({
          hiddenColumns: state.hiddenColumns.includes(column)
            ? state.hiddenColumns.filter(c => c !== column)
            : [...state.hiddenColumns, column],
        })),

      setDefaultFilters: filters =>
        set(state => ({
          defaultFilters: { ...state.defaultFilters, ...filters },
        })),

      setFilters: filters => set(state => ({ filters: { ...state.filters, ...filters } })),

      clearFilters: () =>
        set({
          filters: {
            searchTerm: '',
            dependencia: [],
            gravedad: [],
            impacto: [],
            comuna: [],
            priorityProject: '',
            obraIds: [],
          },
        }),

      updateLastSync: () => set({ lastSync: new Date().toISOString() }),

      resetSettings: () =>
        set({
          severityThresholds: defaultSeverityThresholds,
          fieldMapping: defaultFieldMapping,
          pollingInterval: 60000,
          enablePolling: true,
          enableAnimations: true,
          showReducedMotion: false,
          defaultPageSize: 25,
          hiddenColumns: [],
          defaultFilters: {},
          filters: {
            searchTerm: '',
            dependencia: [],
            gravedad: [],
            impacto: [],
            comuna: [],
            priorityProject: '',
            obraIds: [],
          },
          lastSync: null,
        }),
    }),
    {
      name: 'alertas-settings',
      partialize: state => ({
        severityThresholds: state.severityThresholds,
        fieldMapping: state.fieldMapping,
        pollingInterval: state.pollingInterval,
        enablePolling: state.enablePolling,
        enableAnimations: state.enableAnimations,
        showReducedMotion: state.showReducedMotion,
        defaultPageSize: state.defaultPageSize,
        hiddenColumns: state.hiddenColumns,
        defaultFilters: state.defaultFilters,
      }),
    }
  )
);

// Selectores útiles
export const useSeverityThresholds = () => useSettingsStore(state => state.severityThresholds);
export const useFieldMapping = () => useSettingsStore(state => state.fieldMapping);
export const usePollingConfig = () =>
  useSettingsStore(state => ({
    interval: state.pollingInterval,
    enabled: state.enablePolling,
  }));
export const useUIConfig = () =>
  useSettingsStore(state => ({
    animations: state.enableAnimations,
    reducedMotion: state.showReducedMotion,
  }));
export const useTableConfig = () =>
  useSettingsStore(state => ({
    pageSize: state.defaultPageSize,
    hiddenColumns: state.hiddenColumns,
  }));
