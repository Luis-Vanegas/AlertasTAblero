/**
 * Panel de filtros reutilizable
 */

import React from 'react';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

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
  return (
    <div className='space-y-4'>
      {/* Búsqueda */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <SearchIcon className='h-5 w-5 text-gray-400' />
        </div>
        <input
          type='text'
          placeholder='Buscar por obra, dependencia o descripción...'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white/90 backdrop-blur-sm'
        />
      </div>

      {/* Dependencia */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Dependencia</label>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => onDependencyChange([])}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedDependencies.length === 0
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  active ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dep}
              </button>
            );
          })}
        </div>
      </div>

      {/* Proyecto estratégico */}
      {priorityProjects && priorityProjects.length > 0 && (
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Proyecto Estratégico
          </label>
          <select
            value={selectedPriorityProject || ''}
            onChange={e => onPriorityProjectChange?.(e.target.value)}
            className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white/90 backdrop-blur-sm'
          >
            <option value=''>Todos los proyectos</option>
            {priorityProjects.map(project => (
              <option key={project.key} value={project.key}>
                {project.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Gravedad */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Gravedad</label>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => onGravedadChange([])}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedGravedades.length === 0
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {GRAVEDAD_OPTIONS.map(g => {
            const active = selectedGravedades.includes(g.key);
            const colorMap = {
              error: 'bg-red-500 text-white',
              warning: 'bg-yellow-500 text-white',
              info: 'bg-blue-500 text-white',
            };
            const colorClass: string =
              colorMap[g.color as keyof typeof colorMap] || 'bg-gray-500 text-white';

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
                  active ? colorClass : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Impacto */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Impacto</label>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => onImpactoChange([])}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedImpactos.length === 0
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {impacto}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comuna */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Comuna</label>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => onComunaChange([])}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              (selectedComunas?.length || 0) === 0
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    ? 'bg-green-500 text-white font-bold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón limpiar filtros */}
      <div className='flex justify-center pt-4'>
        <button
          onClick={onClearFilters}
          className='inline-flex items-center px-4 py-2 border border-cyan-500 text-cyan-600 rounded-lg hover:bg-cyan-50 hover:border-cyan-600 transition-colors'
        >
          <ClearIcon className='h-4 w-4 mr-2' />
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
