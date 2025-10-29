import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  MoneyOff as MoneyOffIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  // Nuevos iconos más bonitos y contextuales
  Dashboard as DashboardIcon,
  Dangerous as DangerousIcon,
  ReportProblem as ReportProblemIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useAlertas, useAlertasStats } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import { useProjectMetrics } from '../hooks/useProjectMetrics';
import { useCambiosFechasEstimadas, useCambiosPresupuesto } from '../hooks/useHistorico';
import { useSettingsStore } from '../store/settings';
import { formatDate } from '../utils/dateFormatting';
import { MappedAlerta } from '../types/api';
import DetailDrawer from '../components/DetailDrawer';
import StatsCard from '../components/common/StatsCard';
import AlertCard from '../components/common/AlertCard';
import { ANIMATION_VARIANTS, PRIORITY_PROJECTS } from '../constants';
import { isPriorityAlert } from '../utils/severity';

const Dashboard: React.FC = () => {
  const { filters, setFilters } = useSettingsStore();
  const [expandedDependencies, setExpandedDependencies] = useState<Set<string>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState<MappedAlerta | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showCambiosFechas, setShowCambiosFechas] = useState(false);
  const [showCambiosPresupuesto, setShowCambiosPresupuesto] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);

  const { alertas, isLoading, pagination } = useAlertas({ limit: 10000 });
  const { isLoading: loadingStats } = useAlertasStats();
  const { metrics: projectMetrics, isLoading: loadingMetrics } = useProjectMetrics();
  const {
    total_cambios: cambiosFechas,
    cambios: cambiosFechasLista,
    isLoading: loadingCambios,
  } = useCambiosFechasEstimadas();
  const {
    total_cambios: cambiosPresupuesto,
    cambios: cambiosPresupuestoLista,
    isLoading: loadingPresupuesto,
  } = useCambiosPresupuesto();

  // Usar el hook de filtros
  const { filteredAlertas, alertasPorDependencia, alertStats } = useFilters({
    alertas,
    filters,
  });

  // Estado de carga combinado
  const loading =
    isLoading || loadingStats || loadingMetrics || loadingCambios || loadingPresupuesto;

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filters.gravedad.length > 0 ||
    filters.dependencia.length > 0 ||
    (filters.comuna && filters.comuna.length > 0) ||
    filters.impacto.length > 0 ||
    filters.searchTerm ||
    (filters.obraIds && filters.obraIds.length > 0);

  // Total de alertas: usar el total real de la API cuando no hay filtros, o el total filtrado cuando hay filtros
  const totalAlertas = hasActiveFilters
    ? alertStats.total
    : (pagination?.total ?? alertStats.total);

  // Hay resultados visibles cuando existen filtros activos o se activan paneles de resultados
  const showResults =
    hasActiveFilters ||
    activeFilterType === 'late' ||
    activeFilterType === 'definition' ||
    showCambiosFechas ||
    showCambiosPresupuesto;

  // Controlar visibilidad del botón de volver arriba
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Mostrar el botón cuando se haya desplazado más de 200px hacia abajo
      setShowBackToTop(scrollTop > 200);
    };

    // Ejecutar inmediatamente para verificar el estado inicial
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Recalcular la posición del scroll cuando cambie el contenido
  useEffect(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowBackToTop(scrollTop > 200);
  }, [hasActiveFilters, activeFilterType, showCambiosFechas, showCambiosPresupuesto]);

  // Función para hacer scroll hacia abajo
  const scrollToResults = () => {
    // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const anchor = resultsAnchorRef.current;
        if (anchor) {
          const rect = anchor.getBoundingClientRect();
          const top = rect.top + window.pageYOffset - 120; // offset desde el top
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  };

  // Función para volver arriba
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers
  const handleToggleExpand = (dependencia: string) => {
    const newExpanded = new Set(expandedDependencies);
    if (newExpanded.has(dependencia)) {
      newExpanded.delete(dependencia);
    } else {
      newExpanded.add(dependencia);
    }
    setExpandedDependencies(newExpanded);
  };

  const openDetail = (alerta: MappedAlerta) => {
    setSelectedAlerta(alerta);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedAlerta(null);
  };

  const handleCardFilter = (gravedad: string) => {
    const currentGravedades = filters.gravedad;
    const newGravedades = currentGravedades.includes(gravedad)
      ? currentGravedades.filter(g => g !== gravedad)
      : [...currentGravedades, gravedad];
    setFilters({ gravedad: newGravedades });

    // Hacer scroll hacia abajo después de que se renderice el contenido
    setTimeout(() => {
      scrollToResults();
    }, 200);
  };

  const handleClearAllFilters = () => {
    setFilters({
      gravedad: [],
      dependencia: [],
      comuna: [],
      impacto: [],
      searchTerm: '',
      obraIds: [],
      priorityProject: '',
    });
  };

  const handleMetricFilter = (type: string) => {
    setActiveFilterType(type);
    setCurrentPage(1);

    switch (type) {
      case 'late':
        setFilters({
          gravedad: [],
          dependencia: [],
          comuna: [],
          impacto: [],
          searchTerm: '',
          obraIds: [],
          priorityProject: '',
        });
        break;
      case 'definition':
        setFilters({
          gravedad: [],
          dependencia: [],
          comuna: [],
          impacto: [],
          searchTerm: '',
          obraIds: [],
          priorityProject: '',
        });
        break;
      case 'budget':
        setShowCambiosPresupuesto(true);
        break;
      case 'delayed2months':
        setShowCambiosFechas(true);
        break;
      case 'defunded':
        setFilters({
          gravedad: [],
          dependencia: [],
          comuna: [],
          impacto: [],
          searchTerm: '',
          obraIds: [],
          priorityProject: '',
        });
        break;
      default:
        break;
    }

    // Hacer scroll hacia abajo después de que se renderice el contenido
    setTimeout(() => {
      scrollToResults();
    }, 200);
  };

  // Loading state
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh]'>
        <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
          <div
            className='bg-cyan-500 h-2 rounded-full animate-pulse'
            style={{ width: '100%' }}
          ></div>
        </div>
        <p className='text-gray-600'>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen px-4 sm:px-6 lg:px-8'>
      <motion.div
        variants={ANIMATION_VARIANTS.container}
        initial='hidden'
        animate='visible'
        className='space-y-6'
      >
        {/* Panel unificado de métricas */}
        <motion.div variants={ANIMATION_VARIANTS.item}>
          <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 relative'>
              {/* Línea divisoria vertical */}
              <div className='hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2'></div>

              {/* Columna Izquierda - Alertas reportadas */}
              <div className='pr-4'>
                <div className='mb-5'>
                  <h2 className='text-lg font-bold text-gray-800'>Alertas Generadas</h2>
                  <p className='text-sm text-gray-600 mt-1'>
                    Análisis financiero y temporal de obras
                  </p>
                </div>
                <div className='space-y-3'>
                  {/* Cambios Presupuesto */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0 }}
                  >
                    <div
                      onClick={() => handleMetricFilter('budget')}
                      className={`relative bg-white rounded-lg border-2 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 ${
                        activeFilterType === 'budget'
                          ? 'ring-2 ring-blue-700 border-blue-700'
                          : 'border-blue-700 hover:border-blue-900'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white flex-shrink-0'>
                            <TrendingUpIcon className='w-6 h-6' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-bold text-gray-800 leading-tight'>
                              Cambios &gt; 500M
                            </h3>
                            <p className='text-sm text-gray-700 mt-0.5 leading-tight'>
                              Proyectos con incrementos presupuestales
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-end flex-shrink-0'>
                          <span className='absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-medium rounded-full'>
                            -12%
                          </span>
                          <span className='text-2xl font-bold text-blue-900'>
                            {cambiosPresupuesto || 152}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Proyectos Tardíos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div
                      onClick={() => handleMetricFilter('late')}
                      className={`relative bg-white rounded-lg border-2 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 ${
                        activeFilterType === 'late'
                          ? 'ring-2 ring-blue-700 border-blue-700'
                          : 'border-blue-700 hover:border-blue-900'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white flex-shrink-0'>
                            <ScheduleIcon className='w-6 h-6' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-bold text-gray-800 leading-tight'>
                              Proyectos Tardíos
                            </h3>
                            <p className='text-sm text-gray-700 mt-0.5 leading-tight'>
                              Obras que terminan después del 01/07/2027
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-end flex-shrink-0'>
                          <span className='absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-medium rounded-full'>
                            +8%
                          </span>
                          <span className='text-2xl font-bold text-blue-900'>
                            {projectMetrics?.lateProjects.count || 326}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Retrasos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div
                      onClick={() => handleMetricFilter('delayed2months')}
                      className={`relative bg-white rounded-lg border-2 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 ${
                        activeFilterType === 'delayed2months'
                          ? 'ring-2 ring-blue-700 border-blue-700'
                          : 'border-blue-700 hover:border-blue-900'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white flex-shrink-0'>
                            <TimelineIcon className='w-6 h-6' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-bold text-gray-800 leading-tight'>
                              Cambios mayores a 2 meses
                            </h3>
                            <p className='text-sm text-gray-700 mt-0.5 leading-tight'>
                              Proyectos con cambios de fechas estimdas de entrega
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-end flex-shrink-0'>
                          <span className='absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-medium rounded-full'>
                            -15%
                          </span>
                          <span className='text-2xl font-bold text-blue-900'>
                            {cambiosFechas || 134}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Sin Financiación */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div
                      onClick={() => handleMetricFilter('defunded')}
                      className={`relative bg-white rounded-lg border-2 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 ${
                        activeFilterType === 'defunded'
                          ? 'ring-2 ring-blue-700 border-blue-700'
                          : 'border-blue-700 hover:border-blue-900'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white flex-shrink-0'>
                            <MoneyOffIcon className='w-6 h-6' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-bold text-gray-800 leading-tight'>
                              Sin Financiación
                            </h3>
                            <p className='text-sm text-gray-700 mt-0.5 leading-tight'>
                              Proyectos desfinanciados
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-end flex-shrink-0'>
                          <span className='absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-medium rounded-full'>
                            0%
                          </span>
                          <span className='text-2xl font-bold text-blue-900'>0</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pendientes */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div
                      onClick={() => handleMetricFilter('definition')}
                      className={`relative bg-white rounded-lg border-2 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 ${
                        activeFilterType === 'definition'
                          ? 'ring-2 ring-blue-700 border-blue-700'
                          : 'border-blue-700 hover:border-blue-900'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                          <div className='w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white flex-shrink-0'>
                            <AssignmentIcon className='w-6 h-6' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-bold text-gray-800 leading-tight'>
                              Pendientes
                            </h3>
                            <p className='text-sm text-gray-700 mt-0.5 leading-tight'>
                              Proyectos en espera de definición
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-end flex-shrink-0'>
                          <span className='absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-medium rounded-full'>
                            +3%
                          </span>
                          <span className='text-2xl font-bold text-blue-900'>
                            {projectMetrics?.pendingDefinitionProjects.count || 20}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
                    value={totalAlertas}
                    icon={<DashboardIcon />}
                    color='#06b6d4'
                    delay={0}
                    onClick={handleClearAllFilters}
                    isSelected={!hasActiveFilters}
                  />
                  <StatsCard
                    label='Críticas'
                    value={alertStats.alta}
                    icon={<DangerousIcon />}
                    color='#ef4444'
                    delay={0.1}
                    onClick={() => handleCardFilter('crítica')}
                    isSelected={filters.gravedad.includes('crítica')}
                  />
                  <StatsCard
                    label='Moderadas'
                    value={alertStats.media}
                    icon={<ReportProblemIcon />}
                    color='#f59e0b'
                    delay={0.2}
                    onClick={() => handleCardFilter('media')}
                    isSelected={filters.gravedad.includes('media')}
                  />
                  <StatsCard
                    label='Leves'
                    value={alertStats.leve}
                    icon={<SecurityIcon />}
                    color='#3b82f6'
                    delay={0.3}
                    onClick={() => handleCardFilter('leve')}
                    isSelected={filters.gravedad.includes('leve')}
                  />
                  <StatsCard
                    label='Sin riesgo'
                    value={alertStats.sinRiesgo}
                    icon={<CheckCircleIcon />}
                    color='#10b981'
                    delay={0.4}
                    onClick={() => handleCardFilter('sin_riesgo')}
                    isSelected={filters.gravedad.includes('sin_riesgo')}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ancla fija para scroll a resultados */}
        <div ref={resultsAnchorRef} />

        {/* Mensaje cuando no hay filtros activos */}
        {!hasActiveFilters && (
          <motion.div variants={ANIMATION_VARIANTS.item}>
            <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 md:p-8 text-center'>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Aplicar Filtros para Ver Alertas
              </h3>
              <p className='text-gray-600 mb-4'>
                Usa los filtros del panel superior para ver las alertas específicas por dependencia,
                gravedad, comuna o proyecto estratégico.
              </p>
              <p className='text-sm text-gray-500'>
                Total de alertas disponibles:{' '}
                <strong className='text-gray-800'>{alertas.length}</strong>
              </p>
            </div>
          </motion.div>
        )}

        {/* Lista de Obras que terminan después de 01/07/2027 - Solo se muestra cuando se filtra por late */}
        {activeFilterType === 'late' &&
          projectMetrics?.lateProjects.projects &&
          projectMetrics.lateProjects.projects.length > 0 && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 mb-4 md:mb-6'>
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <h3 className='text-lg font-bold text-gray-800 mb-2'>
                      Proyectos que terminan después de 01/07/2027
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Información detallada de las obras con fecha de entrega estimada después del
                      01/07/2027 ({projectMetrics.lateProjects.projects.length} obras)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveFilterType(null);
                      setCurrentPage(1);
                    }}
                    className='px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
                  >
                    Cerrar
                  </button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
                  {projectMetrics.lateProjects.projects
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((proyecto, index) => (
                      <div
                        key={index}
                        className='p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-yellow-400'
                      >
                        <h4 className='text-lg font-bold text-cyan-600 mb-3 line-clamp-2'>
                          {proyecto.name}
                        </h4>

                        <div className='mb-4 flex flex-wrap gap-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              proyecto.etapa === 'CONTRACTUAL'
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {proyecto.etapa}
                          </span>
                          <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                            {proyecto.porcentajeEjecucion}% Progreso
                          </span>
                          <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium'>
                            {proyecto.estadoEntrega}
                          </span>
                        </div>

                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-gray-600 font-medium min-w-[90px]'>
                              Fecha:
                            </span>
                            <span className='text-sm font-bold text-gray-800'>
                              {proyecto.fechaEstimada}
                            </span>
                          </div>

                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-gray-600 font-medium min-w-[90px]'>
                              Dependencia:
                            </span>
                            <span className='text-sm text-gray-800 flex-1'>
                              {proyecto.dependencia}
                            </span>
                          </div>

                          <div className='flex items-start gap-2'>
                            <span className='text-sm text-gray-600 font-medium min-w-[90px]'>
                              Proyecto:
                            </span>
                            <span className='text-sm text-gray-800 flex-1 line-clamp-2'>
                              {proyecto.proyectoEstrategico}
                            </span>
                          </div>

                          <div className='mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-300'>
                            <p className='text-sm font-bold text-yellow-800'>⚠️ {proyecto.razon}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {projectMetrics.lateProjects.projects.length > itemsPerPage && (
                  <div className='flex justify-center items-center mt-6 gap-4'>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Anterior
                    </button>
                    <span className='text-sm text-gray-600'>
                      Página {currentPage} de{' '}
                      {Math.ceil(projectMetrics.lateProjects.projects.length / itemsPerPage)}
                    </span>
                    <button
                      disabled={
                        currentPage >=
                        Math.ceil(projectMetrics.lateProjects.projects.length / itemsPerPage)
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        {/* Lista de Obras Pendientes de Definición - Solo se muestra cuando se filtra por definition */}
        {activeFilterType === 'definition' &&
          projectMetrics?.pendingDefinitionProjects.projects &&
          projectMetrics.pendingDefinitionProjects.projects.length > 0 && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 mb-4 md:mb-6'>
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <h3 className='text-lg font-bold text-gray-800 mb-2'>
                      Proyectos Pendientes de Definición
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Información detallada de las obras que requieren atención (
                      {projectMetrics.pendingDefinitionProjects.projects.length} obras)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveFilterType(null);
                      setCurrentPage(1);
                    }}
                    className='px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
                  >
                    Cerrar
                  </button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
                  {projectMetrics.pendingDefinitionProjects.projects
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((proyecto, index) => (
                      <div
                        key={index}
                        className='p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-400'
                      >
                        <h4 className='text-lg font-bold text-cyan-600 mb-3 line-clamp-2'>
                          {proyecto.name}
                        </h4>

                        <div className='mb-4 flex flex-wrap gap-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              proyecto.etapa === 'CONTRACTUAL'
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {proyecto.etapa}
                          </span>
                          <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                            {proyecto.porcentajeEjecucion}% Progreso
                          </span>
                        </div>

                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-gray-600 font-medium min-w-[90px]'>
                              Dependencia:
                            </span>
                            <span className='text-sm text-gray-800 flex-1'>
                              {proyecto.dependencia}
                            </span>
                          </div>

                          <div className='flex items-start gap-2'>
                            <span className='text-sm text-gray-600 font-medium min-w-[90px]'>
                              Proyecto:
                            </span>
                            <span className='text-sm text-gray-800 flex-1 line-clamp-2'>
                              {proyecto.proyectoEstrategico}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {projectMetrics.pendingDefinitionProjects.projects.length > itemsPerPage && (
                  <div className='flex justify-center items-center mt-6 gap-4'>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Anterior
                    </button>
                    <span className='text-sm text-gray-600'>
                      Página {currentPage} de{' '}
                      {Math.ceil(
                        projectMetrics.pendingDefinitionProjects.projects.length / itemsPerPage
                      )}
                    </span>
                    <button
                      disabled={
                        currentPage >=
                        Math.ceil(
                          projectMetrics.pendingDefinitionProjects.projects.length / itemsPerPage
                        )
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        {/* Lista de Cambios de Fechas - Solo se muestra cuando se filtra por delayed2months */}
        {showCambiosFechas && cambiosFechasLista && cambiosFechasLista.length > 0 && (
          <motion.div variants={ANIMATION_VARIANTS.item}>
            <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 mb-4 md:mb-6'>
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <h3 className='text-lg font-bold text-gray-800 mb-2'>
                    Cambios de fechas estimadas de entrega
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Proyectos con cambios de fecha mayores a 2 meses ({cambiosFechasLista.length}{' '}
                    cambios)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCambiosFechas(false);
                    setActiveFilterType(null);
                  }}
                  className='px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
                >
                  Cerrar
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {cambiosFechasLista
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((cambio, index) => (
                    <div
                      key={index}
                      className='p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-lg'
                    >
                      <h4 className='text-lg font-bold text-gray-800 mb-2 line-clamp-2'>
                        {cambio.nombre_obra}
                      </h4>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>Dependencia:</span>
                          <span className='text-sm font-medium text-gray-800'>
                            {cambio.dependencia}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>Fecha Anterior:</span>
                          <span className='text-sm font-medium text-gray-800'>
                            {cambio.fecha_anterior}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>Fecha Nueva:</span>
                          <span className='text-sm font-medium text-gray-800'>
                            {cambio.fecha_nueva}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>Días de Diferencia:</span>
                          <span className='text-sm font-bold text-red-600'>N/A</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {cambiosFechasLista.length > itemsPerPage && (
                <div className='flex justify-center items-center mt-6 gap-4'>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Anterior
                  </button>
                  <span className='text-sm text-gray-600'>
                    Página {currentPage} de {Math.ceil(cambiosFechasLista.length / itemsPerPage)}
                  </span>
                  <button
                    disabled={currentPage >= Math.ceil(cambiosFechasLista.length / itemsPerPage)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Lista de Cambios de Presupuesto - Solo se muestra cuando se filtra por budget */}
        {showCambiosPresupuesto &&
          cambiosPresupuestoLista &&
          cambiosPresupuestoLista.length > 0 && (
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 mb-4 md:mb-6'>
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <h3 className='text-lg font-bold text-gray-800 mb-2'>Cambios de Presupuesto</h3>
                    <p className='text-sm text-gray-600'>
                      Proyectos con incrementos presupuestales mayores a 500M (
                      {cambiosPresupuestoLista.length} cambios)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCambiosPresupuesto(false);
                      setActiveFilterType(null);
                    }}
                    className='px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
                  >
                    Cerrar
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {cambiosPresupuestoLista
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((cambio, index) => (
                      <div
                        key={index}
                        className='p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-lg'
                      >
                        <h4 className='text-lg font-bold text-gray-800 mb-2 line-clamp-2'>
                          {cambio.nombre_obra}
                        </h4>
                        <div className='space-y-2'>
                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Dependencia:</span>
                            <span className='text-sm font-medium text-gray-800'>
                              {cambio.dependencia}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Presupuesto Anterior:</span>
                            <span className='text-sm font-medium text-gray-800'>N/A</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Presupuesto Nuevo:</span>
                            <span className='text-sm font-medium text-gray-800'>N/A</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm text-gray-600'>Diferencia:</span>
                            <span className='text-sm font-bold text-red-600'>N/A</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {cambiosPresupuestoLista.length > itemsPerPage && (
                  <div className='flex justify-center items-center mt-6 gap-4'>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Anterior
                    </button>
                    <span className='text-sm text-gray-600'>
                      Página {currentPage} de{' '}
                      {Math.ceil(cambiosPresupuestoLista.length / itemsPerPage)}
                    </span>
                    <button
                      disabled={
                        currentPage >= Math.ceil(cambiosPresupuestoLista.length / itemsPerPage)
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        {/* Lista de alertas por dependencia - Solo se muestra cuando hay filtros activos */}
        {hasActiveFilters && (
          <>
            {alertasPorDependencia.length === 0 ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800'>No se encontraron alertas</h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    Total alertas: {alertas.length} | Filtradas: {filteredAlertas.length} | Grupos:{' '}
                    {alertasPorDependencia.length}
                  </p>
                  <p className='text-sm text-gray-600 mt-1'>
                    Búsqueda: "{filters.searchTerm}" | Dep: "
                    {filters.dependencia?.join(', ') || 'Todas'}" | Sev: "
                    {filters.gravedad?.join(', ') || 'Todas'}"
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className='space-y-4 md:space-y-6'>
                {alertasPorDependencia.map(grupo => (
                  <motion.div
                    key={grupo.dependencia}
                    variants={ANIMATION_VARIANTS.item}
                    initial='hidden'
                    animate='visible'
                    className='bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl'
                  >
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white'>
                            <BusinessIcon className='w-5 h-5' />
                          </div>
                          <div>
                            <h3 className='text-lg font-bold text-gray-800'>{grupo.dependencia}</h3>
                            <p className='text-sm text-gray-600'>
                              {grupo.total} alertas • Última actualización:{' '}
                              {formatDate(new Date(), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full'>
                            {grupo.altas} Críticas
                          </span>
                          <span className='px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full'>
                            {grupo.medias} Moderadas
                          </span>
                          <span className='px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full'>
                            {grupo.leves} Leves
                          </span>
                          <span className='px-2 py-1 bg-green-100 text-green-700 border border-green-300 text-xs font-medium rounded-full'>
                            {grupo.sinRiesgo || 0} Sin riesgo
                          </span>
                        </div>
                      </div>

                      <div className='border-t border-gray-200 my-4'></div>

                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {(expandedDependencies.has(grupo.dependencia)
                          ? grupo.alertas
                          : grupo.alertas.slice(0, 6)
                        ).map(alerta => {
                          const isPriority = isPriorityAlert(alerta, PRIORITY_PROJECTS);

                          return (
                            <AlertCard
                              key={alerta.id}
                              alerta={alerta}
                              onViewDetails={openDetail}
                              isPriority={isPriority}
                            />
                          );
                        })}
                      </div>

                      {grupo.alertas.length > 6 && (
                        <div className='mt-4 text-center'>
                          <button
                            onClick={() => handleToggleExpand(grupo.dependencia)}
                            className='inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors'
                            aria-expanded={expandedDependencies.has(grupo.dependencia)}
                            aria-controls={`grupo-${grupo.dependencia.replace(/\s+/g, '-')}`}
                          >
                            {expandedDependencies.has(grupo.dependencia) ? (
                              <>
                                <ExpandLessIcon className='w-4 h-4 mr-1' />
                                Ver menos
                              </>
                            ) : (
                              <>
                                <ExpandMoreIcon className='w-4 h-4 mr-1' />
                                Ver {grupo.alertas.length - 6} más
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Botón flotante para volver arriba (solo cuando hay resultados) */}
      {showResults &&
        showBackToTop &&
        createPortal(
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className='fixed bottom-6 right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 z-[9999] bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-300'
            aria-label='Volver arriba'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 10l7-7m0 0l7 7m-7-7v18'
              />
            </svg>
          </motion.button>,
          document.body
        )}

      <DetailDrawer open={detailOpen} onClose={closeDetail} alerta={selectedAlerta} />
    </div>
  );
};

export default Dashboard;
