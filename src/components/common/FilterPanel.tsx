/**
 * Panel de filtros reutilizable con acordeones y colores distintivos
 */

import React, { useState } from 'react';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Timeline as ImpactIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

import { GRAVEDAD_OPTIONS } from '../../constants';

export interface FilterPanelProps {
  searchTerm: string;
  dependencias: string[];
  comunas: string[];
  impactoOptions: string[];
  priorityProjects?: Array<{ key: string; label: string }>;
  selectedDependencies: string[];
  selectedGravedades: string[];
  selectedImpactos: string[];
  selectedComunas: string[];
  selectedPriorityProject?: string;
  onSearchChange: (value: string) => void;
  onDependencyChange: (dependencies: string[]) => void;
  onGravedadChange: (gravedades: string[]) => void;
  onImpactoChange: (impactos: string[]) => void;
  onComunaChange: (comunas: string[]) => void;
  onPriorityProjectChange?: (projectKey: string) => void;
  onClearFilters: () => void;
}

// Configuración de colores por sección
const SECTION_CONFIG = {
  search: {
    color: 'blue',
    icon: SearchIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    headerColor: 'bg-blue-100',
    textColor: 'text-blue-900',
  },
  dependencia: {
    color: 'indigo',
    icon: BusinessIcon,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    headerColor: 'bg-indigo-100',
    textColor: 'text-indigo-900',
  },
  proyecto: {
    color: 'purple',
    icon: AssignmentIcon,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    headerColor: 'bg-purple-100',
    textColor: 'text-purple-900',
  },
  gravedad: {
    color: 'red',
    icon: WarningIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    headerColor: 'bg-red-100',
    textColor: 'text-red-900',
  },
  impacto: {
    color: 'orange',
    icon: ImpactIcon,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    headerColor: 'bg-orange-100',
    textColor: 'text-orange-900',
  },
  comuna: {
    color: 'green',
    icon: LocationIcon,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    headerColor: 'bg-green-100',
    textColor: 'text-green-900',
  },
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  dependencias,
  comunas,
  impactoOptions,
  priorityProjects,
  selectedDependencies,
  selectedGravedades,
  selectedImpactos,
  selectedComunas,
  selectedPriorityProject,
  onSearchChange,
  onDependencyChange,
  onGravedadChange,
  onImpactoChange,
  onComunaChange,
  onPriorityProjectChange,
  onClearFilters,
}) => {
  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['search']) // Por defecto, solo el buscador está abierto
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  // Función para renderizar una sección colapsable
  const renderCollapsibleSection = (
    sectionKey: string,
    title: string,
    icon: React.ElementType,
    content: React.ReactNode,
    badgeCount?: number
  ) => {
    const config = SECTION_CONFIG[sectionKey as keyof typeof SECTION_CONFIG];
    const Icon = icon;
    const expanded = isExpanded(sectionKey);

    return (
      <div
        className={`border-2 ${config.borderColor} rounded-lg overflow-hidden ${config.bgColor} transition-all duration-200`}
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-4 py-3 ${config.headerColor} flex items-center justify-between hover:opacity-90 transition-all duration-200`}
        >
          <div className='flex items-center gap-3'>
            <Icon className={`${config.textColor} w-5 h-5`} />
            <h3 className={`font-semibold ${config.textColor}`}>{title}</h3>
            {badgeCount !== undefined && badgeCount > 0 && (
              <span
                className={`px-2 py-0.5 ${config.textColor} ${config.bgColor} rounded-full text-xs font-bold`}
              >
                {badgeCount}
              </span>
            )}
          </div>
          {expanded ? (
            <ExpandLessIcon className={`${config.textColor} w-5 h-5`} />
          ) : (
            <ExpandMoreIcon className={`${config.textColor} w-5 h-5`} />
          )}
        </button>
        {expanded && <div className='p-4 border-t border-gray-200'>{content}</div>}
      </div>
    );
  };

  return (
    <div className='space-y-3'>
      {/* Búsqueda - Siempre visible */}
      <div
        className={`border-2 ${SECTION_CONFIG.search.borderColor} rounded-lg ${SECTION_CONFIG.search.bgColor} p-4`}
      >
        <div className='flex items-center gap-2 mb-2'>
          <SearchIcon className={`${SECTION_CONFIG.search.textColor} w-5 h-5`} />
          <h3 className={`font-semibold ${SECTION_CONFIG.search.textColor}`}>Búsqueda</h3>
        </div>
        <div className='relative'>
          <input
            type='text'
            placeholder='Buscar por obra, dependencia o descripción...'
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
          />
          <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
        </div>
      </div>

      {/* Dependencia */}
      {renderCollapsibleSection(
        'dependencia',
        'Dependencia',
        BusinessIcon,
        <div className='max-h-60 overflow-y-auto'>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => onDependencyChange([])}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedDependencies.length === 0
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-300'
              }`}
            >
              Todas
            </button>
            {dependencias.map(dep => {
              const active = selectedDependencies.includes(dep);
              return (
                <button
                  key={dep}
                  onClick={() => {
                    const set = new Set(selectedDependencies);
                    if (set.has(dep)) set.delete(dep);
                    else set.add(dep);
                    onDependencyChange(Array.from(set));
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors truncate max-w-[200px] ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-300'
                  }`}
                  title={dep}
                >
                  {dep}
                </button>
              );
            })}
          </div>
        </div>,
        selectedDependencies.length || undefined
      )}

      {/* Proyecto estratégico */}
      {priorityProjects &&
        priorityProjects.length > 0 &&
        renderCollapsibleSection(
          'proyecto',
          'Proyecto Estratégico',
          AssignmentIcon,
          <select
            value={selectedPriorityProject || ''}
            onChange={e => onPriorityProjectChange?.(e.target.value)}
            className='w-full p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white'
          >
            <option value=''>Todos los proyectos</option>
            {priorityProjects.map(project => (
              <option key={project.key} value={project.key}>
                {project.label}
              </option>
            ))}
          </select>,
          selectedPriorityProject ? 1 : undefined
        )}

      {/* Gravedad */}
      {renderCollapsibleSection(
        'gravedad',
        'Gravedad',
        WarningIcon,
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => onGravedadChange([])}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedGravedades.length === 0
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-700 hover:bg-red-100 border border-red-300'
            }`}
          >
            Todas
          </button>
          {GRAVEDAD_OPTIONS.map(g => {
            const active = selectedGravedades.includes(g.key);
            const colorMap = {
              success: 'bg-green-600 text-white',
              error: 'bg-red-600 text-white',
              warning: 'bg-yellow-600 text-white',
              info: 'bg-blue-600 text-white',
            };
            const colorClass: string =
              colorMap[g.color as keyof typeof colorMap] || 'bg-gray-600 text-white';

            return (
              <button
                key={g.key}
                onClick={() => {
                  const set = new Set(selectedGravedades);
                  if (set.has(g.key)) set.delete(g.key);
                  else set.add(g.key);
                  onGravedadChange(Array.from(set));
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? colorClass
                    : 'bg-white text-red-700 hover:bg-red-100 border border-red-300'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>,
        selectedGravedades.length || undefined
      )}

      {/* Impacto */}
      {renderCollapsibleSection(
        'impacto',
        'Impacto',
        ImpactIcon,
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => onImpactoChange([])}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedImpactos.length === 0
                ? 'bg-orange-600 text-white'
                : 'bg-white text-orange-700 hover:bg-orange-100 border border-orange-300'
            }`}
          >
            Todos
          </button>
          {impactoOptions.map(impacto => {
            const active = selectedImpactos.includes(impacto);
            return (
              <button
                key={impacto}
                onClick={() => {
                  const set = new Set(selectedImpactos);
                  if (set.has(impacto)) set.delete(impacto);
                  else set.add(impacto);
                  onImpactoChange(Array.from(set));
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                  active
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-orange-700 hover:bg-orange-100 border border-orange-300'
                }`}
              >
                {impacto}
              </button>
            );
          })}
        </div>,
        selectedImpactos.length || undefined
      )}

      {/* Comuna */}
      {renderCollapsibleSection(
        'comuna',
        'Comuna',
        LocationIcon,
        <div className='max-h-60 overflow-y-auto'>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => onComunaChange([])}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                (selectedComunas?.length || 0) === 0
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 hover:bg-green-100 border border-green-300'
              }`}
            >
              Todas
            </button>
            {comunas.map(c => {
              const active = (selectedComunas || []).includes(c);
              return (
                <button
                  key={c}
                  onClick={() => {
                    const set = new Set(selectedComunas || []);
                    if (set.has(c)) set.delete(c);
                    else set.add(c);
                    onComunaChange(Array.from(set));
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-green-700 hover:bg-green-100 border border-green-300'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>,
        selectedComunas?.length || undefined
      )}

      {/* Botón limpiar filtros */}
      <div className='flex justify-center pt-2'>
        <button
          onClick={onClearFilters}
          className='inline-flex items-center px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-colors font-medium'
        >
          <ClearIcon className='h-4 w-4 mr-2' />
          Limpiar Todos los Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
