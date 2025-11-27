import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, FileText, Image, Layers, Tag, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema de validação para template
const templateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  image: z.string().url('URL da imagem deve ser válida').optional().or(z.literal('')),
  width: z.number().min(1, 'Largura deve ser maior que 0'),
  height: z.number().min(1, 'Altura deve ser maior que 0'),
  empresa_segmento: z.number().min(1, 'Categoria é obrigatória'),
  logo_formato: z.enum(['quadrada', 'retangular', 'vertical']).optional(),
  context: z.string().optional(),
  texto_apoio: z.string().optional()
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplatesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingTemplates, setIsAddingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const { data: templates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      console.log('Making request to /api/templates');
      try {
        const response = await fetch('/api/templates', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Templates API response:', result);
        return result;
      } catch (error) {
        console.error('Templates API error:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/segmentos'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/segmentos');
      return response.json();
    }
  });

  console.log('Templates data:', templates);
  console.log('Categories data:', categories);
  console.log('Templates loading:', templatesLoading);
  console.log('Templates error:', templatesError);

  // Form para criar template
  const createForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      image: '',
      width: 500,
      height: 500,
      empresa_segmento: 0,
      context: '{}',
      texto_apoio: ''
    }
  });

  // Form para editar template
  const editForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema)
  });

  // Mutation para criar template
  const createTemplateMutation = useMutation({
    mutationFn: (data: TemplateFormData) => apiRequest('POST', '/api/templates', data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Template criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar template",
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar template
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TemplateFormData> }) => 
      apiRequest('PUT', `/api/templates/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar template",
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/templates/${id}`),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir template",
        variant: "destructive",
      });
    }
  });

  const handleAddTemplates = async () => {
    setIsAddingTemplates(true);
    try {
      const webhookUrl = 'https://hook.novoenvio.com.br/webhook/99130106-79d3-4a6b-a4ab-7526f7c3ad89';
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Templates adicionados",
          description: "Webhook executado com sucesso. Novos templates foram adicionados.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao chamar webhook:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar o webhook. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAddingTemplates(false);
    }
  };

  const handleCreateTemplate = (data: TemplateFormData) => {
    createTemplateMutation.mutate(data);
  };

  const handleEditTemplate = (data: TemplateFormData) => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate({ 
        id: selectedTemplate.id, 
        data 
      });
    }
  };

  const handleDeleteTemplate = (id: number) => {
    deleteTemplateMutation.mutate(id);
  };

  const openEditDialog = (template: any) => {
    setSelectedTemplate(template);
    editForm.reset({
      name: template.name || '',
      image: template.image || '',
      width: template.width || 500,
      height: template.height || 500,
      empresa_segmento: template.empresa_segmento || 0,
      logo_formato: template.logo_formato || '',
      context: template.context ? JSON.stringify(template.context, null, 2) : '{}',
      texto_apoio: template.texto_apoio || ''
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (template: any) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Templates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total de {Array.isArray(templates) ? templates.length : 0} templates</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Template
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button onClick={handleAddTemplates} disabled={isAddingTemplates} variant="outline">
              {isAddingTemplates ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isAddingTemplates ? 'Adicionando...' : 'Adicionar Templates (Webhook)'}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(templates) ? templates.length : 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Imagem</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(templates) ? templates.filter((t: any) => t.image).length : 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(categories) ? categories.length : 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com erro</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Array.isArray(templates) ? new Set(templates.map((t: any) => `${t.width}x${t.height}`)).size : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templatesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando templates...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(templates) || templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum template encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(templates) && templates.map((template: any) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {template.image ? (
                            <img 
                              src={template.image} 
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Sem imagem</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.empresa_segmento}</TableCell>
                      <TableCell>{template.width}x{template.height}</TableCell>
                      <TableCell>
                        {new Date(template.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openViewDialog(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o template "{template.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Excluir
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
        </div>

        {/* Create Template Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
            </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateTemplate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do template" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="empresa_segmento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(categories) && categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="logo_formato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formato da Logo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o formato da logo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quadrada">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-500 rounded"></div>
                            <span>Quadrada</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="retangular">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-4 bg-green-500 rounded"></div>
                            <span>Retangular (horizontal)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="vertical">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-8 bg-purple-500 rounded"></div>
                            <span>Vertical</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context (JSON)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"fields": [{"name": "nome", "label": "Nome", "type": "text"}]}'
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="texto_apoio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de Apoio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Texto de apoio opcional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Template'
                  )}
                </Button>
              </div>
            </form>
          </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditTemplate)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do template" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Largura</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="empresa_segmento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(categories) && categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="logo_formato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato da Logo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato da logo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quadrada">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-500 rounded"></div>
                              <span>Quadrada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="retangular">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-4 bg-green-500 rounded"></div>
                              <span>Retangular (horizontal)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="vertical">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-8 bg-purple-500 rounded"></div>
                              <span>Vertical</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{"fields": [{"name": "nome", "label": "Nome", "type": "text"}]}'
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="texto_apoio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de Apoio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Texto de apoio opcional"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateTemplateMutation.isPending}>
                    {updateTemplateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Template Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Visualizar Template</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome:</label>
                    <p className="text-gray-700">{selectedTemplate.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoria:</label>
                    <p className="text-gray-700">{selectedTemplate.empresa_segmento || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dimensões:</label>
                    <p className="text-gray-700">{selectedTemplate.width}x{selectedTemplate.height}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Criado em:</label>
                    <p className="text-gray-700">
                      {new Date(selectedTemplate.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                {selectedTemplate.image && (
                  <div>
                    <label className="text-sm font-medium">Imagem:</label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img 
                        src={selectedTemplate.image} 
                        alt={selectedTemplate.name}
                        className="w-full max-h-64 object-contain bg-gray-50"
                      />
                    </div>
                  </div>
                )}
                
                {selectedTemplate.context && (
                  <div>
                    <label className="text-sm font-medium">Context:</label>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-h-40">
                      {JSON.stringify(selectedTemplate.context, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedTemplate.texto_apoio && (
                  <div>
                    <label className="text-sm font-medium">Texto de Apoio:</label>
                    <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      {selectedTemplate.texto_apoio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}