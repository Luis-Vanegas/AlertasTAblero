import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { historicoApiService } from '../services/historicoApi';
import { useNotifications } from '../components/NotificationProvider';

export const useHistorico = () => {
  const { showError } = useNotifications();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['historico'],
    queryFn: () => historicoApiService.getHistorico(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar histórico:', error);
      showError('Error al cargar el histórico. Por favor, intente nuevamente.');
    }
  }, [error, showError]);

  return {
    historico: response?.data || [],
    pagination: response?.pagination,
    metadata: response?.metadata,
    isLoading,
    error,
    refetch,
  };
};

export const useCambiosFechasEstimadas = () => {
  const { showError } = useNotifications();

  const {
    data: cambiosData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cambios-fechas-estimadas'],
    queryFn: () => historicoApiService.getCambiosFechasEstimadas(),
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 3,
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar cambios de fechas estimadas:', error);
      showError(
        'Error al cargar los cambios de fechas estimadas. Verificando datos del histórico...'
      );
    }
  }, [error, showError]);

  return {
    total_cambios: cambiosData?.total_cambios || 0,
    cambios: cambiosData?.cambios || [],
    por_dependencia: cambiosData?.por_dependencia || {},
    por_comuna: cambiosData?.por_comuna || {},
    por_proyecto: cambiosData?.por_proyecto || {},
    isLoading,
    error,
    refetch,
  };
};

export const useCambiosPresupuesto = () => {
  const { showError } = useNotifications();

  const {
    data: cambiosData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cambios-presupuesto'],
    queryFn: () => historicoApiService.getCambiosPresupuesto(),
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 3,
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error al cargar cambios de presupuesto:', error);
      showError('Error al cargar los cambios de presupuesto. Verificando datos del histórico...');
    }
  }, [error, showError]);

  return {
    total_cambios: cambiosData?.total_cambios || 0,
    cambios: cambiosData?.cambios || [],
    por_dependencia: cambiosData?.por_dependencia || {},
    por_comuna: cambiosData?.por_comuna || {},
    por_proyecto: cambiosData?.por_proyecto || {},
    isLoading,
    error,
    refetch,
  };
};
