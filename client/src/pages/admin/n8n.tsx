import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Plus, Edit, Trash2, ExternalLink, Play, Pause, Activity } from 'lucide-react';
import { format } from 'date-fns';

const workflowSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  n8n_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'error', 'desenvolvendo']).default('inactive'),
  webhook_url: z.string().url().optional().or(z.literal('')),
  execution_url: z.string().url().optional().or(z.literal('')),
  active: z.boolean().default(true),
});

export default function N8nAdmin() {
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

  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['/api/admin/n8n-workflows']
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/n8n-workflows', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/n8n-workflows'] });
      setOpenDialog(false);
      setEditingItem(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Workflow criado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar workflow",
        variant: "destructive"
      });
    }
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/admin/n8n-workflows/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/n8n-workflows'] });
      setOpenDialog(false);
      setEditingItem(null);
      toast({
        title: "Sucesso",
        description: "Workflow atualizado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar workflow",
        variant: "destructive"
      });
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/n8n-workflows/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/n8n-workflows'] });
      toast({
        title: "Sucesso",
        description: "Workflow deletado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao deletar workflow",
        variant: "destructive"
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      description: '',
      n8n_id: '',
      status: 'inactive' as const,
      webhook_url: '',
      execution_url: '',
      active: true
    }
  });

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateWorkflowMutation.mutate({ id: editingItem.id, data });
    } else {
      createWorkflowMutation.mutate(data);
    }
  };

  const handleEdit = (workflow: any) => {
    setEditingItem(workflow);
    form.reset({
      name: workflow.name,
      description: workflow.description || '',
      n8n_id: workflow.n8n_id || '',
      status: workflow.status,
      webhook_url: workflow.webhook_url || '',
      execution_url: workflow.execution_url || '',
      active: workflow.active
    });
    setOpenDialog(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    form.reset({
      name: '',
      description: '',
      n8n_id: '',
      status: 'inactive' as const,
      webhook_url: '',
      execution_url: '',
      active: true
    });
    setOpenDialog(true);
  };

  const handleDelete = (id: number) => {
    deleteWorkflowMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'desenvolvendo':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Desenvolvendo</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <MainLayout title="Workflows N8N">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total de {workflows?.length || 0} workflows</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Workflow' : 'Novo Workflow'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Edite as informações do workflow' : 'Crie um novo workflow N8N'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome do workflow" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="n8n_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>N8N ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ID do workflow no N8N" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descrição do workflow" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status no N8N</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                              <SelectItem value="error">Erro</SelectItem>
                              <SelectItem value="desenvolvendo">Desenvolvendo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativo</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Workflow está ativo no sistema
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="webhook_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Webhook</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="execution_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de Execução</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors duration-200"
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createWorkflowMutation.isPending || updateWorkflowMutation.isPending}>
                      {editingItem ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflows?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {workflows?.filter((w: any) => w.status === 'active').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Inativos</CardTitle>
              <Pause className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {workflows?.filter((w: any) => w.status === 'inactive').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desenvolvendo</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {workflows?.filter((w: any) => w.status === 'desenvolvendo').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {workflows?.filter((w: any) => w.status === 'error').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Execuções</TableHead>
                    <TableHead>Link de Execução</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Carregando workflows...
                      </TableCell>
                    </TableRow>
                  ) : workflows?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Nenhum workflow encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    workflows?.map((workflow: any) => (
                      <TableRow key={workflow.id}>
                        <TableCell>{workflow.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            {workflow.description && (
                              <div className="text-sm text-gray-500">{workflow.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                        <TableCell>
                          {workflow.created_at ? format(new Date(workflow.created_at), 'dd/MM/yyyy HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          {workflow.last_execution ? format(new Date(workflow.last_execution), 'dd/MM/yyyy HH:mm') : '-'}
                        </TableCell>
                        <TableCell>{workflow.execution_count || 0}</TableCell>
                        <TableCell>
                          {workflow.execution_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(workflow.execution_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(workflow)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o workflow "{workflow.name}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(workflow.id)}>
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}