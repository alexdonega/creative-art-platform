import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useCompany } from '@/hooks/use-company';
import { Plus, Edit, Trash2, ExternalLink, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface AtivoDigital {
  id: number;
  empresa_id: number;
  nome: string;
  url: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
}



function AtivoDigitalForm({ 
  ativo, 
  onClose, 
  empresaId 
}: { 
  ativo?: AtivoDigital; 
  onClose: () => void; 
  empresaId: number;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome: ativo?.nome || '',
    url: ativo?.url || '',
    descricao: ativo?.descricao || '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        'POST',
        '/api/ativos-digitais',
        { ...data, empresa_id: empresaId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ativos-digitais/empresa', empresaId], exact: false });
      toast({
        title: "Ativo criado com sucesso!",
        description: "O ativo digital foi adicionado à sua empresa.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar ativo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        'PUT',
        `/api/ativos-digitais/${ativo?.id}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ativos-digitais/empresa', empresaId], exact: false });
      toast({
        title: "Ativo atualizado com sucesso!",
        description: "As informações do ativo foram atualizadas.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar ativo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.url.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e URL são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (ativo) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">


      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Ex: Instagram Oficial"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="Ex: https://instagram.com/minhaempresa"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descreva o propósito deste ativo digital"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4 justify-end">
        <Button type="button" variant="outline" onClick={onClose} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : ativo ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}

export default function AtivosDigitais() {
  const { user } = useAuth();
  const { company } = useCompany(user?.id || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAtivo, setSelectedAtivo] = useState<AtivoDigital | undefined>();

  const { data: ativos, isLoading } = useQuery({
    queryKey: ['/api/ativos-digitais/empresa', company?.id],
    enabled: !!company?.id && !isNaN(Number(company?.id)),
    queryFn: () => {
      if (!company?.id || isNaN(Number(company.id))) {
        throw new Error('Invalid company ID');
      }
      return fetch(`/api/ativos-digitais/empresa/${company.id}`).then(res => res.json());
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/ativos-digitais/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ativos-digitais/empresa', company?.id], exact: false });
      toast({
        title: "Ativo removido com sucesso!",
        description: "O ativo digital foi removido da sua empresa.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover ativo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (ativo: AtivoDigital) => {
    setSelectedAtivo(ativo);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja remover este ativo digital?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewAtivo = () => {
    setSelectedAtivo(undefined);
    setIsFormOpen(true);
  };



  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (!company) {
    return (
      <MainLayout 
        title="Ativos Digitais" 
        subtitle="Gerencie redes sociais, WhatsApp, automação e outros ativos digitais da sua empresa"
      >
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Selecione uma empresa para gerenciar os ativos digitais.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Ativos Digitais" 
      subtitle="Gerencie redes sociais, WhatsApp, automação e outros ativos digitais da sua empresa"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Ativos Digitais</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total de {ativos?.length || 0} ativo{ativos?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewAtivo} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Ativo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedAtivo ? 'Editar Ativo Digital' : 'Novo Ativo Digital'}
                </DialogTitle>
              </DialogHeader>
              <AtivoDigitalForm
                ativo={selectedAtivo}
                onClose={() => setIsFormOpen(false)}
                empresaId={company.id}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-700">Abrir</TableHead>
                    <TableHead className="font-semibold text-gray-700">Descrição</TableHead>
                    <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ativos?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-gray-500">
                          <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg mb-2">Nenhum ativo digital encontrado</p>
                          <p className="text-sm">Adicione seus primeiros ativos digitais para começar.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    ativos?.map((ativo: AtivoDigital) => {
                      return (
                        <TableRow key={ativo.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ExternalLink className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{ativo.nome}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUrl(ativo.url)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Abrir
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-600 max-w-xs truncate">
                              {ativo.descricao || 'Sem descrição'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(ativo)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(ativo.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}