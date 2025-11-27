import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building, 
  CreditCard, 
  FileText, 
  Image, 
  Activity,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Verificar se o usuário é admin master
  const isAdminMaster = user?.email === 'admin@admin.com';

  if (!isAdminMaster) {
    return (
      <MainLayout title="Acesso Negado">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h2>
            <p className="text-red-500">Apenas administradores master podem acessar esta página.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { data: usuarios } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('/api/admin/users')
  });

  const { data: empresas } = useQuery({
    queryKey: ['/api/admin/companies'],
    queryFn: () => apiRequest('/api/admin/companies')
  });

  const { data: planos } = useQuery({
    queryKey: ['/api/plans'],
    queryFn: () => apiRequest('/api/plans')
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: () => apiRequest('/api/templates')
  });

  const { data: artes } = useQuery({
    queryKey: ['/api/admin/arts'],
    queryFn: () => apiRequest('/api/admin/arts')
  });

  const stats = [
    { label: 'Usuários', value: usuarios?.length || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Empresas', value: empresas?.length || 0, icon: Building, color: 'bg-green-500' },
    { label: 'Planos', value: planos?.length || 0, icon: CreditCard, color: 'bg-purple-500' },
    { label: 'Templates', value: templates?.length || 0, icon: FileText, color: 'bg-yellow-500' },
    { label: 'Artes', value: artes?.length || 0, icon: Image, color: 'bg-red-500' }
  ];

  return (
    <MainLayout title="Dashboard Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Visão geral do sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Sistema operacional</div>
                <div className="text-2xl font-bold text-green-600">100%</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Últimas 24h</div>
                <div className="text-2xl font-bold text-blue-600">{artes?.length || 0}</div>
                <div className="text-xs text-gray-500">Artes criadas</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Uso do sistema</div>
                <div className="text-2xl font-bold text-purple-600">85%</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}