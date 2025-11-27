import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type Empresas } from '@shared/schema';

export function useCompany(userId: string) {
  const queryClient = useQueryClient();

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['/api/companies/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  // Get the first company (primary company) for now
  const company = companies?.[0];

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Empresas>) => {
      if (!company?.id) throw new Error('Company not found');
      return apiRequest('PUT', `/api/companies/${company.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/user', userId] });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Empresas>) => {
      return apiRequest('POST', '/api/companies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/user', userId] });
    },
  });

  return {
    company,
    companies,
    isLoading,
    error,
    updateCompany: updateCompanyMutation.mutate,
    createCompany: createCompanyMutation.mutate,
    isUpdating: updateCompanyMutation.isPending,
    isCreating: createCompanyMutation.isPending,
  };
}
