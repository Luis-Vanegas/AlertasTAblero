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
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import StatsCard from '../common/StatsCard';
import { ANIMATION_VARIANTS } from '../../constants';

interface MetricsPanelProps {
  /** Métricas de proyectos (tardíos, pendientes) */
  projectMetrics?:
    | {
        lateProjects?: {
          count: number;
          projects: any[];
        };
        pendingDefinitionProjects?: {
          count: number;
          projects: any[];
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
    changePercent: -12,
  },
  {
    key: 'late',
    icon: ScheduleIcon,
    title: 'Proyectos Tardíos',
    description: 'Obras que terminan después del 01/07/2027',
    changePercent: 8,
  },
  {
    key: 'delayed2months',
    icon: TimelineIcon,
    title: 'Cambios mayores a 2 meses',
    description: 'Proyectos con cambios de fechas estimdas de entrega',
    changePercent: -15,
  },
  {
    key: 'defunded',
    icon: MoneyOffIcon,
    title: 'Sin Financiación',
    description: 'Proyectos desfinanciados',
    changePercent: 0,
  },
  {
    key: 'definition',
    icon: AssignmentIcon,
    title: 'Pendientes',
    description: 'Proyectos con estado pausado',
    changePercent: 3,
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
    <motion.div variants={ANIMATION_VARIANTS.item}>
      <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 relative'>
          {/* Línea divisoria vertical */}
          <div className='hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2'></div>

          {/* Columna Izquierda - Alertas Generadas */}
          <div className='pr-4'>
            <div className='mb-5'>
              <h2 className='text-lg font-bold text-gray-800'>Alertas Generadas</h2>
              <p className='text-sm text-gray-600 mt-1'>Análisis financiero y temporal de obras</p>
            </div>
            <div className='space-y-3'>
              {ALERTA_METRICS.map((metric, index) => {
                const Icon = metric.icon;
                const isActive = activeFilterType === metric.key;
                const value = getMetricValue(metric.key);

                return (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div
                      onClick={() => onMetricFilter(metric.key)}
                      className={`relative bg-white rounded-lg border-2 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 ${
                        isActive
                          ? 'ring-2 ring-blue-700 border-blue-700'
                          : 'border-blue-700 hover:border-blue-900'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white flex-shrink-0'>
                            <Icon className='w-6 h-6' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-bold text-gray-800 leading-tight'>
                              {metric.title}
                            </h3>
                            <p className='text-sm text-gray-700 mt-0.5 leading-tight'>
                              {metric.description}
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-end flex-shrink-0'>
                          <span className='absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-medium rounded-full'>
                            {metric.changePercent >= 0 ? '+' : ''}
                            {metric.changePercent}%
                          </span>
                          <span className='text-2xl font-bold text-blue-900'>{value}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha - Dashboard de Alertas */}
          <div className='pl-4'>
            <div className='mb-5'>
              <h2 className='text-lg font-bold text-gray-800'>Alertas Reportadas</h2>
              <p className='text-sm text-gray-600 mt-1'>Resumen por dependencia</p>
            </div>
            <div className='space-y-3'>
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
                delay={0.1}
                onClick={() => onCardFilter('crítica')}
                isSelected={selectedGravedades.includes('crítica')}
              />
              <StatsCard
                label='Moderadas'
                value={alertStats.media}
                icon={<ReportProblemIcon />}
                color='#f59e0b'
                delay={0.2}
                onClick={() => onCardFilter('media')}
                isSelected={selectedGravedades.includes('media')}
              />
              <StatsCard
                label='Leves'
                value={alertStats.leve}
                icon={<SecurityIcon />}
                color='#3b82f6'
                delay={0.3}
                onClick={() => onCardFilter('leve')}
                isSelected={selectedGravedades.includes('leve')}
              />
              <StatsCard
                label='Sin riesgo'
                value={alertStats.sinRiesgo}
                icon={<CheckCircleIcon />}
                color='#10b981'
                delay={0.4}
                onClick={() => onCardFilter('sin_riesgo')}
                isSelected={selectedGravedades.includes('sin_riesgo')}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
