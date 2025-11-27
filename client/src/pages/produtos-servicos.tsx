import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Package, Wrench, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCompany } from "@/hooks/use-company";

// Schema para validação do formulário
const produtoServicoSchema = z.object({
  tipo: z.enum(["produto", "servico"]),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type ProdutoServicoFormData = z.infer<typeof produtoServicoSchema>;

interface ProdutoServico {
  id: number;
  empresa_id?: number;
  segmento_id: number;
  tipo: "produto" | "servico";
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}



export default function ProdutosServicos() {
  const { user } = useAuth();
  const { company } = useCompany(user?.id || '');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProdutoServico | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: produtos = [], isLoading: produtosLoading } = useQuery<ProdutoServico[]>({
    queryKey: [`/api/produtos-servicos/company/${company?.id}`],
    enabled: !!company?.id,
  });



  const form = useForm<ProdutoServicoFormData>({
    resolver: zodResolver(produtoServicoSchema),
    defaultValues: {
      tipo: "produto",
      nome: "",
      descricao: "",
      ativo: true,
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ProdutoServicoFormData & { empresa_id: number; segmento_id: number }) => 
      apiRequest("POST", "/api/produtos-servicos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/produtos-servicos/company/${company?.id}`] });
      toast({ title: "Produto/serviço criado com sucesso!" });
      handleCloseForm(false);
    },
    onError: () => {
      toast({ 
        title: "Erro ao criar produto/serviço", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<ProdutoServicoFormData>) => 
      apiRequest("PUT", `/api/produtos-servicos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/produtos-servicos/company/${company?.id}`] });
      toast({ title: "Produto/serviço atualizado com sucesso!" });
      handleCloseForm(false);
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar produto/serviço", 
        variant: "destructive" 
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) => 
      apiRequest("PUT", `/api/produtos-servicos/${id}`, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/produtos-servicos/company/${company?.id}`] });
      toast({ title: "Status do produto/serviço atualizado com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar status do produto/serviço", 
        variant: "destructive" 
      });
    },
  });

  // Handlers
  const handleSubmit = (data: ProdutoServicoFormData) => {
    if (!company?.id || !company?.empresa_segmento) {
      toast({ 
        title: "Erro", 
        description: "Empresa ou segmento não encontrado",
        variant: "destructive" 
      });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate({ 
        ...data, 
        empresa_id: company.id,
        segmento_id: company.empresa_segmento 
      });
    }
  };

  const handleEdit = (item: ProdutoServico) => {
    setEditingItem(item);
    form.reset({
      tipo: item.tipo,
      nome: item.nome,
      descricao: item.descricao || "",
      ativo: item.ativo,
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    toggleStatusMutation.mutate({ id, ativo: newStatus });
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingItem(null);
      form.reset();
    }
  };

  const handleCancelClick = () => {
    handleCloseForm(false);
  };

  // Filtros
  // Remove duplicates first, then filter
  const uniqueProdutos = produtos.reduce((acc, current) => {
    const existingIndex = acc.findIndex(item => item.id === current.id);
    if (existingIndex >= 0) {
      // Keep the most recently updated one
      if (new Date(current.updated_at || current.created_at) > new Date(acc[existingIndex].updated_at || acc[existingIndex].created_at)) {
        acc[existingIndex] = current;
      }
    } else {
      acc.push(current);
    }
    return acc;
  }, [] as typeof produtos);

  const filteredProdutos = uniqueProdutos.filter((item) => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.descricao || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "all" || item.tipo === filterTipo;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "ativo" && item.ativo === true) ||
                         (filterStatus === "inativo" && item.ativo === false);
    
    return matchesSearch && matchesTipo && matchesStatus;
  });



  if (produtosLoading || !company) {
    return (
      <MainLayout 
        title="Produtos e Serviços" 
        subtitle="Gerencie os produtos e serviços da sua empresa"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Produtos e Serviços" 
      subtitle="Gerencie os produtos e serviços da sua empresa"
    >
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProdutos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProdutos.filter(p => p.tipo === 'produto').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProdutos.filter(p => p.tipo === 'servico').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProdutos.filter(p => p.ativo).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Botão de Adicionar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos/serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            


            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Produtos & Serviços</SelectItem>
                <SelectItem value="produto">Produtos</SelectItem>
                <SelectItem value="servico">Serviços</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Editar" : "Adicionar"} Produto/Serviço
                </DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para {editingItem ? "editar" : "adicionar"} um produto ou serviço.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="produto">Produto</SelectItem>
                              <SelectItem value="servico">Serviço</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome do produto/serviço" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o produto/serviço..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Item disponível para seleção
                          </div>
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

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelClick}
                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Produtos/Serviços */}
        <div className="space-y-4">
          {filteredProdutos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum produto/serviço encontrado
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchTerm || filterTipo || filterStatus
                    ? "Nenhum item corresponde aos filtros aplicados."
                    : "Adicione produtos e serviços para começar a organizar seu negócio."
                  }
                </p>

              </CardContent>
            </Card>
          ) : (
            filteredProdutos.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {item.tipo === 'produto' ? (
                          <Package className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Wrench className="h-5 w-5 text-purple-600" />
                        )}
                        <h3 className="text-lg font-semibold">{item.nome}</h3>
                        <Badge 
                          variant={item.tipo === 'produto' ? 'default' : 'secondary'}
                          className={item.tipo === 'produto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                        >
                          {item.tipo === 'produto' ? 'Produto' : 'Serviço'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={item.ativo 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                          }
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>

                      {item.descricao && (
                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {user?.user_metadata?.role === 'admin_master' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`ativo-${item.id}`}
                          checked={item.ativo}
                          onCheckedChange={(checked) => handleToggleStatus(item.id, item.ativo)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <label 
                          htmlFor={`ativo-${item.id}`}
                          className={`text-sm font-medium cursor-pointer ${
                            item.ativo ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}