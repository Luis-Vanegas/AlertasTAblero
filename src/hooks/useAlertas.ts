import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { alertasApiService } from '../services/alertasApi';
import { ApiFilters } from '../types/api';
import { useNotifications } from '../components/notifications/useNotifications';

export const useAlertas = (filters: ApiFilters = {}) => {
  const { showError } = useNotifications();
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['alertas', filters],
    queryFn: () => alertasApiService.getAlertas(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar alertas:', error);
      showError('Error al cargar las alertas. Por favor, intente nuevamente.');
    }
  }, [error, showError]);

  const alertas = response && 'data' in response ? alertasApiService.mapAlertas(response.data) : [];
  const pagination = response?.pagination;
  const metadata = response?.metadata;

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['alertas'] });
  }, [queryClient]);

  return {
    alertas,
    pagination,
    metadata,
    isLoading,
    error,
    refetch,
    invalidateQueries,
  };
};

export const useAlertaById = (id: number) => {
  const { showError } = useNotifications();

  const {
    data: alerta,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['alerta', id],
    queryFn: () => alertasApiService.getAlertaById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar alerta:', error);
      showError('Error al cargar la alerta. Por favor, intente nuevamente.');
    }
  }, [error, showError]);

  const mappedAlerta =
    alerta && typeof alerta === 'object' ? alertasApiService.mapAlerta(alerta) : null;

  return {
    alerta: mappedAlerta,
    isLoading,
    error,
  };
};

export const useAlertasByObra = (obraId: number) => {
  const { showError } = useNotifications();

  const {
    data: alertas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['alertas-obra', obraId],
    queryFn: () => alertasApiService.getAlertasByObra(obraId),
    enabled: !!obraId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar alertas por obra:', error);
      showError('Error al cargar las alertas de la obra. Por favor, intente nuevamente.');
    }
  }, [error, showError]);

  const mappedAlertas =
    alertas && Array.isArray(alertas) ? alertasApiService.mapAlertas(alertas) : [];

  return {
    alertas: mappedAlertas,
    isLoading,
    error,
  };
};

export const useAlertasStats = (filters: ApiFilters = {}) => {
  const { showError } = useNotifications();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['alertas-stats', filters],
    queryFn: async () => {
      const response = await alertasApiService.getAlertas(filters);
      const alertas = alertasApiService.mapAlertas(response.data);
      return alertasApiService.calculateStats(alertas);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar estadísticas:', error);
      showError('Error al cargar las estadísticas. Por favor, intente nuevamente.');
    }
  }, [error, showError]);

  return {
    stats: response,
    isLoading,
    error,
  };
};

export const useFilterOptions = () => {
  const { showError } = useNotifications();

  const {
    data: options,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['filter-options'],
    queryFn: () => alertasApiService.getFilterOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar opciones de filtros:', error);
      showError('Error al cargar las opciones de filtros. Por favor, intente nuevamente.');
    }
  }, [error, showError]);

  return {
    options,
    isLoading,
    error,
  };
};

export const useSearchAlertas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Omit<ApiFilters, 'search'>>({});
  const { showError } = useNotifications();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['search-alertas', searchTerm, filters],
    queryFn: () => alertasApiService.searchAlertas(searchTerm, filters),
    enabled: searchTerm.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al buscar alertas:', error);
      showError('Error al buscar alertas. Por favor, intente nuevamente.');
    }
  }, [error, showError]);

  const alertas = response && 'data' in response ? alertasApiService.mapAlertas(response.data) : [];

  const search = useCallback((term: string, searchFilters: Omit<ApiFilters, 'search'> = {}) => {
    setSearchTerm(term);
    setFilters(searchFilters);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilters({});
  }, []);

  return {
    alertas,
    searchTerm,
    filters,
    isLoading,
    error,
    search,
    clearSearch,
  };
};
