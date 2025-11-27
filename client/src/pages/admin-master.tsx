import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, 
  Building, 
  CreditCard, 
  FileText, 
  Image, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Activity
} from 'lucide-react';

// Schemas para validação
const planoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco_mensal: z.number().min(0, 'Preço deve ser positivo'),
  limite_usuarios: z.number().min(1, 'Limite de usuários deve ser pelo menos 1'),
  limite_artes_mes: z.number().min(1, 'Limite de artes deve ser pelo menos 1'),
  recursos: z.array(z.string()).optional(),
  ativo: z.boolean().default(true)
});

const categoriaSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório')
});

const templateSchema = z.object({
  template_id: z.string().min(1, 'Template ID é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  width: z.number().min(1, 'Largura deve ser positiva'),
  height: z.number().min(1, 'Altura deve ser positiva'),
  empresa_categoria: z.number().min(1, 'Categoria é obrigatória'),
  image: z.string().url('URL da imagem inválida').optional(),
  texto_apoio: z.string().optional(),
  context: z.any().optional()
});

export default function AdminMaster() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar se o usuário é admin master
  const isAdminMaster = user?.email === 'admin@admin.com';

  // Gerenciar tabs baseadas na query string
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'dashboard') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    window.history.replaceState({}, '', url.toString());
  };

  if (!isAdminMaster) {
    return (
      <MainLayout title="Acesso Negado">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Queries para buscar dados
  const { data: planos, isLoading: planosLoading } = useQuery({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await fetch('/api/plans');
      return response.json();
    }
  });

  const { data: categorias, isLoading: categoriasLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      return response.json();
    }
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      return response.json();
    }
  });

  const { data: empresas, isLoading: empresasLoading } = useQuery({
    queryKey: ['/api/admin/companies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/companies');
      return response.json();
    }
  });

  const { data: usuarios, isLoading: usuariosLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      return response.json();
    }
  });

  const { data: artes, isLoading: artesLoading } = useQuery({
    queryKey: ['/api/admin/arts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/arts');
      return response.json();
    }
  });

  // Mutations para criar/editar/deletar
  const createPlanoMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/plans', data);
    },
    onSuccess: () => {
      toast({ title: 'Plano criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      setOpenDialog(null);
    }
  });

  const createCategoriaMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/categories', data);
    },
    onSuccess: () => {
      toast({ title: 'Categoria criada com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setOpenDialog(null);
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/templates', data);
    },
    onSuccess: () => {
      toast({ title: 'Template criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setOpenDialog(null);
    }
  });

  // Forms
  const planoForm = useForm({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      nome: '',
      preco_mensal: 0,
      limite_usuarios: 1,
      limite_artes_mes: 10,
      recursos: [],
      ativo: true
    }
  });

  const categoriaForm = useForm({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      name: ''
    }
  });

  const templateForm = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      template_id: '',
      name: '',
      width: 800,
      height: 600,
      empresa_categoria: 0,
      image: '',
      texto_apoio: '',
      context: {}
    }
  });

  const handleCreatePlano = (data: any) => {
    createPlanoMutation.mutate(data);
  };

  const handleCreateCategoria = (data: any) => {
    createCategoriaMutation.mutate(data);
  };

  const handleCreateTemplate = (data: any) => {
    createTemplateMutation.mutate(data);
  };

  const stats = [
    { label: 'Usuários', value: usuarios?.length || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Empresas', value: empresas?.length || 0, icon: Building, color: 'bg-green-500' },
    { label: 'Planos', value: planos?.length || 0, icon: CreditCard, color: 'bg-purple-500' },
    { label: 'Templates', value: templates?.length || 0, icon: FileText, color: 'bg-yellow-500' },
    { label: 'Artes', value: artes?.length || 0, icon: Image, color: 'bg-red-500' }
  ];

  return (
    <MainLayout title="Administração Master">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administração Master</h1>
            <p className="text-gray-600">Gerencie todos os aspectos do sistema</p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">Sistema Online</span>
          </div>
        </div>



        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="planos">Planos</TabsTrigger>
            <TabsTrigger value="categorias">Segmentos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="artes">Artes</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
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
          </TabsContent>

          {/* Planos Tab */}
          <TabsContent value="planos" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Planos de Assinatura</h2>
              <Dialog open={openDialog === 'plano'} onOpenChange={(open) => setOpenDialog(open ? 'plano' : null)}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Plano</DialogTitle>
                    <DialogDescription>
                      Adicione um novo plano de assinatura ao sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...planoForm}>
                    <form onSubmit={planoForm.handleSubmit(handleCreatePlano)} className="space-y-4">
                      <FormField
                        control={planoForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Plano</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Plano Básico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={planoForm.control}
                        name="preco_mensal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Mensal (R$)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={planoForm.control}
                        name="limite_usuarios"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Limite de Usuários</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={planoForm.control}
                        name="limite_artes_mes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Limite de Artes/Mês</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="cancel" onClick={() => setOpenDialog(null)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createPlanoMutation.isPending}>
                          {createPlanoMutation.isPending ? 'Criando...' : 'Criar Plano'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {planosLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="text-sm text-gray-600">
                      <span>Total de {planos?.length || 0} plano{planos?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Nome</TableHead>
                          <TableHead className="min-w-[120px]">Preço Mensal</TableHead>
                          <TableHead className="min-w-[120px]">Limite Usuários</TableHead>
                          <TableHead className="min-w-[120px]">Limite Artes/Mês</TableHead>
                          <TableHead className="min-w-[80px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Criado em</TableHead>
                          <TableHead className="min-w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {planos?.map((plano: any) => (
                          <TableRow key={plano.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{plano.nome}</TableCell>
                            <TableCell>R$ {(plano.preco_mensal / 100).toFixed(2).replace('.', ',')}</TableCell>
                            <TableCell>{plano.limite_usuarios}</TableCell>
                            <TableCell>{plano.limite_artes_mes}</TableCell>
                            <TableCell>
                              <Badge variant={plano.ativo ? 'default' : 'secondary'}>
                                {plano.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(plano.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categorias Tab */}
          <TabsContent value="categorias" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Segmentos</h2>
              <Dialog open={openDialog === 'categoria'} onOpenChange={(open) => setOpenDialog(open ? 'categoria' : null)}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Categoria</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova categoria de empresa ao sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...categoriaForm}>
                    <form onSubmit={categoriaForm.handleSubmit(handleCreateCategoria)} className="space-y-4">
                      <FormField
                        control={categoriaForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Categoria</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Restaurante" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="cancel" onClick={() => setOpenDialog(null)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createCategoriaMutation.isPending}>
                          {createCategoriaMutation.isPending ? 'Criando...' : 'Criar Categoria'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {categoriasLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="text-sm text-gray-600">
                      <span>Total de {categorias?.length || 0} categoria{categorias?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">ID</TableHead>
                          <TableHead className="min-w-[200px]">Nome</TableHead>
                          <TableHead className="min-w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categorias?.map((categoria: any) => (
                          <TableRow key={categoria.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{categoria.id}</TableCell>
                            <TableCell>{categoria.name}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Templates</h2>
              <Dialog open={openDialog === 'template'} onOpenChange={(open) => setOpenDialog(open ? 'template' : null)}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Template</DialogTitle>
                    <DialogDescription>
                      Adicione um novo template ao sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...templateForm}>
                    <form onSubmit={templateForm.handleSubmit(handleCreateTemplate)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={templateForm.control}
                          name="template_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Template ID</FormLabel>
                              <FormControl>
                                <Input placeholder="template-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={templateForm.control}
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={templateForm.control}
                          name="width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Largura (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="800" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 800)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={templateForm.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Altura (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="600" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 600)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={templateForm.control}
                        name="empresa_categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categorias?.map((categoria: any) => (
                                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                    {categoria.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={templateForm.control}
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
                      <FormField
                        control={templateForm.control}
                        name="texto_apoio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto de Apoio</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Texto de apoio para o template" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="cancel" onClick={() => setOpenDialog(null)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createTemplateMutation.isPending}>
                          {createTemplateMutation.isPending ? 'Criando...' : 'Criar Template'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando templates...</p>
                </div>
              ) : (
                templates?.map((template: any) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>
                        {template.width}x{template.height}px
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {template.image && (
                        <img 
                          src={template.image} 
                          alt={template.name}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        ID: {template.template_id}
                      </p>
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Empresas Tab */}
          <TabsContent value="empresas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Empresas</h2>
            </div>

            {empresasLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="text-sm text-gray-600">
                      <span>Total de {empresas?.length || 0} empresa{empresas?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Nome</TableHead>
                          <TableHead className="min-w-[200px]">Email</TableHead>
                          <TableHead className="min-w-[120px]">Plano</TableHead>
                          <TableHead className="min-w-[120px]">Artes Restantes</TableHead>
                          <TableHead className="min-w-[80px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Criada em</TableHead>
                          <TableHead className="min-w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {empresas?.map((empresa: any) => (
                          <TableRow key={empresa.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{empresa.nome}</TableCell>
                            <TableCell>{empresa.email}</TableCell>
                            <TableCell>{empresa.plano?.nome || 'N/A'}</TableCell>
                            <TableCell>{empresa.credito_restante || 0}</TableCell>
                            <TableCell>
                              <Badge variant={empresa.ativo ? 'default' : 'secondary'}>
                                {empresa.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(empresa.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Usuários Tab */}
          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Usuários</h2>
            </div>

            {usuariosLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="text-sm text-gray-600">
                      <span>Total de {usuarios?.length || 0} usuário{usuarios?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Nome</TableHead>
                          <TableHead className="min-w-[200px]">Email</TableHead>
                          <TableHead className="min-w-[120px]">Telefone</TableHead>
                          <TableHead className="min-w-[80px]">Tipo</TableHead>
                          <TableHead className="min-w-[120px]">Criado em</TableHead>
                          <TableHead className="min-w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usuarios?.map((usuario: any) => (
                          <TableRow key={usuario.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{usuario.firstName} {usuario.lastName}</TableCell>
                            <TableCell>{usuario.email}</TableCell>
                            <TableCell>{usuario.telefone || 'N/A'}</TableCell>
                            <TableCell>
                              {usuario.email === 'admin@admin.com' ? (
                                <Badge variant="destructive">Admin</Badge>
                              ) : (
                                <Badge variant="default">Usuário</Badge>
                              )}
                            </TableCell>
                            <TableCell>{new Date(usuario.created_at || Date.now()).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Artes Tab */}
          <TabsContent value="artes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Artes Geradas</h2>
            </div>

            {artesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="text-sm text-gray-600">
                      <span>Total de {artes?.length || 0} arte{artes?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Imagem</TableHead>
                          <TableHead className="min-w-[150px]">Empresa</TableHead>
                          <TableHead className="min-w-[120px]">Dimensões</TableHead>
                          <TableHead className="min-w-[80px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Criada em</TableHead>
                          <TableHead className="min-w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {artes?.map((arte: any) => (
                          <TableRow key={arte.id} className="hover:bg-gray-50">
                            <TableCell>
                              {arte.link ? (
                                <img 
                                  src={arte.link} 
                                  alt="Arte gerada"
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                                  <Image className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{arte.empresa?.nome || 'N/A'}</TableCell>
                            <TableCell>{arte.width}x{arte.height}px</TableCell>
                            <TableCell>
                              <Badge variant={arte.arquivada ? 'secondary' : 'default'}>
                                {arte.arquivada ? 'Arquivada' : 'Ativa'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(arte.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}