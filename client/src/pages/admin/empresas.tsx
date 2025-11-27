import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Building } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';

export default function EmpresasAdmin() {
  const { user } = useAuth();

  // Verificar se o usuário é admin master
  const isAdminMaster = user?.email === 'admin@admin.com';

  if (!isAdminMaster) {
    return (
      <MainLayout title="Acesso Negado">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 text-lg">Acesso negado. Apenas administradores master podem acessar esta página.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { data: empresas, isLoading: empresasLoading } = useQuery({
    queryKey: ['/api/admin/companies']
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-metrics'],
    enabled: isAdminMaster
  });







  return (
    <MainLayout title="Empresas">
      <div className="space-y-6">
        {/* Dashboard Metrics */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label={metrics.totalCompanies.label}
              value={metrics.totalCompanies.value}
              subLabel={metrics.totalCompanies.subLabel}
              change={metrics.totalCompanies.change}
              isPositive={metrics.totalCompanies.isPositive}
            />
            <MetricCard
              label={metrics.newCompanies.label}
              value={metrics.newCompanies.value}
              subLabel={metrics.newCompanies.subLabel}
              change={metrics.newCompanies.change}
              isPositive={metrics.newCompanies.isPositive}
            />
            <MetricCard
              label={metrics.activeCompanies.label}
              value={metrics.activeCompanies.value}
              subLabel={metrics.activeCompanies.subLabel}
              change={metrics.activeCompanies.change}
              isPositive={metrics.activeCompanies.isPositive}
            />
            <MetricCard
              label={metrics.churnRate.label}
              value={metrics.churnRate.value}
              subLabel={metrics.churnRate.subLabel}
              change={metrics.churnRate.change}
              isPositive={metrics.churnRate.isPositive}
            />
          </div>
        ) : null}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total de {empresas?.length || 0} empresas</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Artes Restantes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresasLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando empresas...
                    </TableCell>
                  </TableRow>
                ) : empresas?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  empresas?.map((empresa: any) => (
                    <TableRow key={empresa.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                            {empresa.logo ? (
                              <img 
                                src={empresa.logo} 
                                alt={empresa.nome}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{empresa.nome}</div>
                            <div className="text-sm text-gray-500">{empresa.categoria_nome}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{empresa.plano_nome || 'Sem plano'}</TableCell>
                      <TableCell>{empresa.artes_restantes_mes}</TableCell>
                      <TableCell>
                        <Badge variant={empresa.ativo ? "default" : "secondary"}>
                          {empresa.ativo ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}