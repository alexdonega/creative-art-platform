import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function ArtesAdmin() {
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

  const { data: artes, isLoading: artesLoading } = useQuery({
    queryKey: ['/api/admin/arts'],
    queryFn: () => apiRequest('/api/admin/arts')
  });

  return (
    <MainLayout title="Artes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total de {artes?.length || 0} artes</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Arte
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando artes...
                    </TableCell>
                  </TableRow>
                ) : artes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhuma arte encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  artes?.map((arte: any) => (
                    <TableRow key={arte.id}>
                      <TableCell>
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {arte.image_url ? (
                            <img 
                              src={arte.image_url} 
                              alt="Arte"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Sem imagem</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{arte.empresa_nome}</div>
                      </TableCell>
                      <TableCell>{arte.width}x{arte.height}</TableCell>
                      <TableCell>
                        <Badge variant={!arte.arquivada ? "default" : "secondary"}>
                          {!arte.arquivada ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Arquivado
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(arte.created_at).toLocaleDateString('pt-BR')}
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