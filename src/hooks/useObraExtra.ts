import { useQuery } from '@tanstack/react-query';
import { obrasApiService, ObraExtra } from '../services/obrasApi';

export const useObraExtra = (obraId?: string | number) => {
  const query = useQuery<{ data: ObraExtra | null } | ObraExtra | null>({
    queryKey: ['obra-extra', obraId],
    queryFn: async () => {
      if (!obraId) {
        return null;
      }
      const data = await obrasApiService.getObraById(obraId);
      return data;
    },
    enabled: !!obraId,
    staleTime: 10 * 60 * 1000,
  });

  // Debug removido

  return {
    obraExtra: (query.data as ObraExtra | null) ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
