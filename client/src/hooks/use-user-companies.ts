import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Empresas, UsuarioEmpresas } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// Extended interface for user data with joined user information
interface ExtendedUsuarioEmpresa extends UsuarioEmpresas {
  user_nome?: string;
  user_email?: string;
  user_avatar_url?: string;
}

export function useUserCompanies(userId: string) {
  const [selectedCompany, setSelectedCompany] = useState<Empresas | null>(null);
  const queryClient = useQueryClient();
  
  const { data: companies, isLoading, error } = useQuery<Empresas[]>({
    queryKey: ['/api/companies/user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/companies/user/${userId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Empresas>) => {
      return apiRequest('POST', '/api/companies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/user', userId] });
    },
  });

  // Set selected company from localStorage or default to first company
  useEffect(() => {
    if (companies && companies.length > 0) {
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        const saved = companies.find(c => c.id.toString() === savedCompanyId);
        if (saved) {
          setSelectedCompany(saved);
          return;
        }
      }
      // Default to first company if no saved selection
      setSelectedCompany(companies[0]);
      localStorage.setItem('selectedCompanyId', companies[0].id.toString());
    }
  }, [companies]);

  const selectCompany = (company: Empresas) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompanyId', company.id.toString());
  };

  return {
    companies: companies || [],
    selectedCompany,
    selectCompany,
    isLoading,
    error,
    hasCompanies: companies && companies.length > 0,
    createCompany: createCompanyMutation.mutate,
    isCreating: createCompanyMutation.isPending,
  };
}

export function useCompanyUsers(empresaId: number) {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery<ExtendedUsuarioEmpresa[]>({
    queryKey: ['/api/companies', empresaId, 'users'],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${empresaId}/users`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch company users');
      }
      return response.json();
    },
    enabled: !!empresaId,
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: { user_id: string; role: string }) => {
      return apiRequest('POST', `/api/companies/${empresaId}/users`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', empresaId, 'users'] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest('PUT', `/api/companies/${empresaId}/users/${userId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', empresaId, 'users'] });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/companies/${empresaId}/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', empresaId, 'users'] });
    },
  });

  return {
    users: users || [],
    isLoading,
    error,
    addUser: addUserMutation.mutate,
    updateUserRole: updateUserRoleMutation.mutate,
    removeUser: removeUserMutation.mutate,
    isAddingUser: addUserMutation.isPending,
    isUpdatingUserRole: updateUserRoleMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,
  };
}