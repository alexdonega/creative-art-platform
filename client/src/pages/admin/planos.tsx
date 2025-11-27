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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

// Helper functions for currency formatting
const formatCurrency = (value: number): string => {
  if (!value || value === 0) return '';
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove all non-digit characters except comma and dot
  let cleanValue = value.replace(/[^\d,.]/g, '');
  
  // Handle Brazilian format: 1.234,56 -> 1234.56
  if (cleanValue.includes('.') && cleanValue.includes(',')) {
    // Remove dots (thousand separators) and replace comma with dot
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } else if (cleanValue.includes(',')) {
    // Only comma present, treat as decimal separator
    cleanValue = cleanValue.replace(',', '.');
  }
  
  return parseFloat(cleanValue) || 0;
};

// Format currency as user types
const formatCurrencyInput = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // Convert to number and back to get proper formatting
  const num = parseFloat(digits) / 100;
  return num.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

const planoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco_mensal: z.number().min(0, 'Preço deve ser positivo').max(999999, 'Preço não pode exceder R$ 999.999,99'),
  limite_usuarios: z.number().min(1, 'Limite de usuários deve ser pelo menos 1'),
  limite_artes_mes: z.number().min(1, 'Limite de artes deve ser pelo menos 1'),
  recursos: z.array(z.string()).optional(),
  ativo: z.boolean().default(true)
});

export default function PlanosAdmin() {
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

  const { data: planos, isLoading: planosLoading } = useQuery({
    queryKey: ['/api/plans'],
    queryFn: () => apiRequest('GET', '/api/plans').then(res => res.json())
  });

  const createPlanoMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('Creating plan with data:', data);
      return apiRequest('POST', '/api/plans', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      setOpenDialog(false);
      setEditingItem(null);
      toast({
        title: "Sucesso",
        description: "Plano criado com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar plano",
        variant: "destructive"
      });
    }
  });

  const updatePlanoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      setOpenDialog(false);
      setEditingItem(null);
      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano",
        variant: "destructive"
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      nome: '',
      preco_mensal: 0,
      limite_usuarios: 1,
      limite_artes_mes: 1,
      recursos: [],
      ativo: true
    }
  });

  // Add logging to see form errors
  React.useEffect(() => {
    if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
      console.log('Form validation errors:', form.formState.errors);
    }
  }, [form.formState.errors]);

  const handleSubmit = (data: any) => {
    console.log('Form data before processing:', data);
    
    // Convert price to integer (cents) for database storage
    const processedData = {
      ...data,
      preco_mensal: Math.round(data.preco_mensal * 100), // Convert to cents
      limite_usuarios: parseInt(data.limite_usuarios) || 1,
      limite_artes_mes: parseInt(data.limite_artes_mes) || 1
    };
    
    console.log('Processed data:', processedData);
    
    if (editingItem) {
      updatePlanoMutation.mutate({ id: editingItem.id, data: processedData });
    } else {
      createPlanoMutation.mutate(processedData);
    }
  };

  const handleEdit = (plano: any) => {
    setEditingItem(plano);
    form.reset({
      ...plano,
      preco_mensal: plano.preco_mensal / 100 // Convert cents back to reais
    });
    setOpenDialog(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    form.reset({
      nome: '',
      preco_mensal: 0,
      limite_usuarios: 1,
      limite_artes_mes: 1,
      recursos: [],
      ativo: true
    });
    setOpenDialog(true);
  };

  return (
    <MainLayout title="Planos de Assinatura">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total de {planos?.length || 0} planos</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Edite as informações do plano' : 'Crie um novo plano de assinatura'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
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
                  <FormField
                    control={form.control}
                    name="preco_mensal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Mensal</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">R$</span>
                            </div>
                            <Input 
                              type="text"
                              placeholder="0,00"
                              className="pl-8"
                              value={field.value ? formatCurrency(field.value) : ''}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                
                                // Allow only digits, dots, and commas
                                if (!/^[\d.,]*$/.test(inputValue)) return;
                                
                                // Extract numeric value
                                const numericValue = parseCurrency(inputValue);
                                
                                // Update field value
                                field.onChange(numericValue);
                              }}
                              onKeyDown={(e) => {
                                // Allow: backspace, delete, tab, escape, enter
                                if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    (e.keyCode === 65 && e.ctrlKey === true) ||
                                    (e.keyCode === 67 && e.ctrlKey === true) ||
                                    (e.keyCode === 86 && e.ctrlKey === true) ||
                                    (e.keyCode === 88 && e.ctrlKey === true) ||
                                    // Allow: home, end, left, right
                                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                                  return;
                                }
                                // Allow: numbers, comma, dot
                                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                                    (e.keyCode < 96 || e.keyCode > 105) && 
                                    e.keyCode !== 188 && e.keyCode !== 190) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="limite_usuarios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Usuários</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="limite_artes_mes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Artes por Mês</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors duration-200" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createPlanoMutation.isPending || updatePlanoMutation.isPending}>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço Mensal</TableHead>
                  <TableHead>Limite Usuários</TableHead>
                  <TableHead>Limite Artes/Mês</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planosLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando planos...
                    </TableCell>
                  </TableRow>
                ) : planos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum plano encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  planos?.map((plano: any) => (
                    <TableRow key={plano.id}>
                      <TableCell className="font-medium">{plano.nome}</TableCell>
                      <TableCell>R$ {(plano.preco_mensal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{plano.limite_usuarios}</TableCell>
                      <TableCell>{plano.limite_artes_mes}</TableCell>
                      <TableCell>
                        <Badge variant={plano.ativo ? "default" : "secondary"}>
                          {plano.ativo ? (
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
                        {new Date(plano.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plano)}
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