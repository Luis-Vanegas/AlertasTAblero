/**
 * Panel de filtros reutilizable
 */

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

import { GRAVEDAD_OPTIONS, IMPACTO_OPTIONS } from '../../constants';

export interface FilterPanelProps {
  searchTerm: string;
  dependencias: string[];
  comunas: string[];
  impactoOptions: string[];
  selectedDependencies: string[];
  selectedGravedades: string[];
  selectedImpactos: string[];
  selectedComunas: string[];
  onSearchChange: (value: string) => void;
  onDependencyChange: (dependencies: string[]) => void;
  onGravedadChange: (gravedades: string[]) => void;
  onImpactoChange: (impactos: string[]) => void;
  onComunaChange: (comunas: string[]) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  dependencias,
  comunas,
  impactoOptions,
  selectedDependencies,
  selectedGravedades,
  selectedImpactos,
  selectedComunas,
  onSearchChange,
  onDependencyChange,
  onGravedadChange,
  onImpactoChange,
  onComunaChange,
  onClearFilters,
}) => {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Filtros
        </Typography>
        <Button
          onClick={onClearFilters}
          startIcon={<ClearIcon />}
          size="small"
          variant="outlined"
        >
          Limpiar
        </Button>
      </Box>

      {/* Búsqueda */}
      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Dependencia */}
      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <FormControl fullWidth size="small">
          <InputLabel>Dependencia</InputLabel>
          <Select
            multiple
            value={selectedDependencies}
            label="Dependencia"
            onChange={e => {
              const value = e.target.value as string[];
              if (value.includes('__ALL__')) {
                onDependencyChange([]);
              } else {
                onDependencyChange(value);
              }
            }}
          >
            <MenuItem value="__ALL__">Todas</MenuItem>
            {dependencias.map(dep => (
              <MenuItem key={dep} value={dep}>
                {dep}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Gravedad */}
      <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {GRAVEDAD_OPTIONS.map(g => (
          <Chip
            key={g.key}
            label={g.label}
            onClick={() => {
              const set = new Set(selectedGravedades);
              if (set.has(g.key)) set.delete(g.key);
              else set.add(g.key);
              onGravedadChange(Array.from(set));
            }}
            color={selectedGravedades.includes(g.key) ? 'primary' : 'default'}
            variant={selectedGravedades.includes(g.key) ? 'filled' : 'outlined'}
            size="small"
            sx={{ cursor: 'pointer' }}
          />
        ))}
        <Chip
          label="Todas"
          onClick={() => onGravedadChange([])}
          color={selectedGravedades.length === 0 ? 'primary' : 'default'}
          variant={selectedGravedades.length === 0 ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      </Box>

      {/* Impacto */}
      <Box
        sx={{
          mb: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
        }}
      >
        <Chip
          label="Todos"
          onClick={() => onImpactoChange([])}
          color={selectedImpactos.length === 0 ? 'primary' : 'default'}
          variant={selectedImpactos.length === 0 ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        {impactoOptions.map(impacto => {
          const active = selectedImpactos.includes(impacto);
          return (
            <Chip
              key={impacto}
              label={impacto}
              onClick={() => {
                const set = new Set(selectedImpactos);
                if (set.has(impacto)) set.delete(impacto);
                else set.add(impacto);
                onImpactoChange(Array.from(set));
              }}
              variant={active ? 'filled' : 'outlined'}
              color={active ? 'primary' : 'default'}
              size="small"
              sx={{
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            />
          );
        })}
      </Box>

      {/* Comuna */}
      <Box
        sx={{
          mb: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
        }}
      >
        <Chip
          label="Todas"
          onClick={() => onComunaChange([])}
          color={(selectedComunas?.length || 0) === 0 ? 'primary' : 'default'}
          variant={(selectedComunas?.length || 0) === 0 ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        {comunas.map(c => {
          const active = (selectedComunas || []).includes(c);
          return (
            <Chip
              key={c}
              label={c}
              onClick={() => {
                const set = new Set(selectedComunas || []);
                if (set.has(c)) set.delete(c);
                else set.add(c);
                onComunaChange(Array.from(set));
              }}
              variant={active ? 'filled' : 'outlined'}
              color={active ? 'primary' : 'default'}
              size="small"
              sx={{ cursor: 'pointer', fontWeight: active ? 700 : 400 }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default FilterPanel;
