import { useQuery } from '@tanstack/react-query';
import { type Planos } from '@shared/schema';

export function usePlans() {
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await fetch('/api/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      return response.json() as Promise<Planos[]>;
    },
  });

  return {
    plans: plans || [],
    isLoading,
    error,
  };
}