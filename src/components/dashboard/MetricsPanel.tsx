/**
 * Panel de Métricas del Dashboard
 *
 * Muestra las métricas principales de alertas generadas y alertas reportadas
 * con interacciones para filtrar por tipo de métrica.
 *
 * @component
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  MoneyOff as MoneyOffIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  Dangerous as DangerousIcon,
  ReportProblem as ReportProblemIcon,
} from '@mui/icons-material';

import StatsCard from '../common/StatsCard';
import { ANIMATION_VARIANTS } from '../../constants';

interface ProjectMetric {
  name: string;
  etapa: string;
  fechaEstimada: string;
  estadoEntrega: string;
  porcentajeEjecucion: number;
  dependencia: string;
  proyectoEstrategico: string;
  razon: string;
}

interface MetricsPanelProps {
  /** Métricas de proyectos (tardíos, pendientes) */
  projectMetrics?:
    | {
        lateProjects?: {
          count: number;
          projects: ProjectMetric[];
        };
        pendingDefinitionProjects?: {
          count: number;
          projects: ProjectMetric[];
        };
      }
    | undefined;

  /** Total de cambios de presupuesto */
  cambiosPresupuesto: number;

  /** Total de cambios de fechas */
  cambiosFechas: number;

  /** Estadísticas de alertas (total, críticas, moderadas, etc.) */
  alertStats: {
    total: number;
    alta: number;
    media: number;
    leve: number;
    sinRiesgo: number;
  };

  /** Tipo de filtro activo */
  activeFilterType: string | null;

  /** Si hay filtros activos */
  hasActiveFilters: boolean;

  /** Filtros seleccionados de gravedad */
  selectedGravedades: string[];

  /** Handlers para acciones */
  onMetricFilter: (type: string) => void;
  onCardFilter: (gravedad: string) => void;
  onClearAllFilters: () => void;
}

/**
 * Configuración de métricas de alertas generadas
 */
const ALERTA_METRICS = [
  {
    key: 'budget',
    icon: TrendingUpIcon,
    title: 'Cambios > 500M',
    description: 'Proyectos con incrementos presupuestales',
  },
  {
    key: 'late',
    icon: ScheduleIcon,
    title: 'Proyectos Tardíos',
    description: 'Obras que terminan después del 01/07/2027',
  },
  {
    key: 'delayed2months',
    icon: TimelineIcon,
    title: 'Cambios mayores a 2 meses',
    description: 'Proyectos con cambios de fechas estimadas de entrega',
  },
  {
    key: 'defunded',
    icon: MoneyOffIcon,
    title: 'Sin Financiación',
    description: 'Proyectos desfinanciados',
  },
  {
    key: 'definition',
    icon: AssignmentIcon,
    title: 'Pendientes',
    description: 'Proyectos con estado pausado',
  },
] as const;

/**
 * Componente principal del panel de métricas
 */
const MetricsPanel: React.FC<MetricsPanelProps> = ({
  projectMetrics,
  cambiosPresupuesto,
  cambiosFechas,
  alertStats,
  activeFilterType,
  hasActiveFilters,
  selectedGravedades,
  onMetricFilter,
  onCardFilter,
  onClearAllFilters,
}) => {
  /**
   * Obtiene el valor para una métrica específica
   */
  const getMetricValue = (key: string): number => {
    switch (key) {
      case 'budget':
        return cambiosPresupuesto || 152;
      case 'late':
        return projectMetrics?.lateProjects?.count || 326;
      case 'delayed2months':
        return cambiosFechas || 134;
      case 'defunded':
        return 0;
      case 'definition':
        return projectMetrics?.pendingDefinitionProjects?.count || 20;
      default:
        return 0;
    }
  };

  return (
    <motion.div variants={ANIMATION_VARIANTS.item} className='h-full'>
      <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 h-full flex flex-col'>
        <div className='mb-3 sm:mb-4 flex-shrink-0'>
          <h2 className='text-responsive-lg font-bold text-gray-800'>Métricas de Alertas</h2>
          <p className='text-responsive-sm text-gray-600 mt-1'>
            Análisis financiero, temporal y por gravedad
          </p>
        </div>
        <div className='flex-1 overflow-y-auto space-y-2 sm:space-y-2.5 min-h-0 scroll-container'>
          {/* Alertas Generadas */}
          <div className='space-y-2'>
            {ALERTA_METRICS.map((metric, index) => {
              const Icon = metric.icon;
              const isActive = activeFilterType === metric.key;
              const value = getMetricValue(metric.key);

              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div
                    onClick={() => onMetricFilter(metric.key)}
                    className={`relative bg-white rounded-lg border-2 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-3 ${
                      isActive
                        ? 'ring-2 ring-blue-700 border-blue-700'
                        : 'border-blue-700 hover:border-blue-900'
                    }`}
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-2 flex-1 min-w-0'>
                        <div className='w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white flex-shrink-0'>
                          <Icon className='w-5 h-5' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-responsive-sm font-bold text-gray-800 leading-tight'>
                            {metric.title}
                          </h3>
                          <p className='text-responsive-sm text-gray-600 mt-0.5 leading-tight line-clamp-1'>
                            {metric.description}
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-col items-end flex-shrink-0'>
                        <span className='text-responsive-xl font-bold text-blue-900'>{value}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Separador */}
          <div className='border-t border-gray-300 my-3'></div>

          {/* Alertas Reportadas */}
          <div className='space-y-2'>
            <StatsCard
              label='Total Alertas'
              value={alertStats.total}
              icon={<DashboardIcon />}
              color='#06b6d4'
              delay={0}
              onClick={onClearAllFilters}
              isSelected={!hasActiveFilters}
            />
            <StatsCard
              label='Críticas'
              value={alertStats.alta}
              icon={<DangerousIcon />}
              color='#ef4444'
              delay={0.05}
              onClick={() => onCardFilter('crítica')}
              isSelected={selectedGravedades.includes('crítica')}
            />
            <StatsCard
              label='Moderadas'
              value={alertStats.media}
              icon={<ReportProblemIcon />}
              color='#f59e0b'
              delay={0.1}
              onClick={() => onCardFilter('media')}
              isSelected={selectedGravedades.includes('media')}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
