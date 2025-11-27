import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';

const segmentoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório')
});

export default function CategoriasAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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

  const { data: segmentos, isLoading: segmentosLoading } = useQuery({
    queryKey: ['/api/segmentos']
  });

  const createSegmentoMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/segmentos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/segmentos'] });
      setOpenDialog(false);
      setEditingItem(null);
      form.reset({ name: '' }); // Reset the form after successful creation
      toast({
        title: "Sucesso",
        description: "Segmento criado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar segmento",
        variant: "destructive"
      });
    }
  });

  const updateSegmentoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/segmentos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/segmentos'] });
      setOpenDialog(false);
      setEditingItem(null);
      toast({
        title: "Sucesso",
        description: "Segmento atualizado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar segmento",
        variant: "destructive"
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(segmentoSchema),
    defaultValues: {
      name: ''
    }
  });

  const handleSubmit = (data: any) => {
    console.log('Enviando dados:', data); // Debug log
    if (editingItem) {
      updateSegmentoMutation.mutate({ id: editingItem.id, data });
    } else {
      createSegmentoMutation.mutate(data);
    }
  };

  const handleEdit = (segmento: any) => {
    setEditingItem(segmento);
    form.reset({
      name: segmento.name
    });
    setOpenDialog(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    form.reset({ name: '' });
    setOpenDialog(true);
  };

  return (
    <MainLayout title="Segmentos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total de {segmentos?.length || 0} segmentos</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Segmento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Segmento' : 'Novo Segmento'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Edite as informações do segmento' : 'Crie um novo segmento de empresa'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors duration-200" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createSegmentoMutation.isPending || updateSegmentoMutation.isPending}>
                      {editingItem ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segmentosLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Carregando segmentos...
                    </TableCell>
                  </TableRow>
                ) : segmentos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Nenhum segmento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  segmentos?.map((segmento: any) => (
                    <TableRow key={segmento.id}>
                      <TableCell className="font-medium">{segmento.id}</TableCell>
                      <TableCell>{segmento.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(segmento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
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