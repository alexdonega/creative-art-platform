import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Package, Wrench, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MainLayout } from "@/components/layout/main-layout";



// Schema para validação do formulário
const produtoServicoSchema = z.object({
  segmento_id: z.number().min(1, "Selecione um segmento"),
  tipo: z.enum(["produto", "servico"]),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type ProdutoServicoFormData = z.infer<typeof produtoServicoSchema>;

interface ProdutoServico {
  id: number;
  segmento_id: number;
  tipo: "produto" | "servico";
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Segmento {
  id: number;
  name: string;
}

export default function AdminProdutosServicos() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProdutoServico | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSegmento, setFilterSegmento] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");

  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: produtos = [], isLoading: produtosLoading } = useQuery<ProdutoServico[]>({
    queryKey: ['/api/produtos-servicos'],
  });

  const { data: segmentos = [], isLoading: segmentosLoading } = useQuery<Segmento[]>({
    queryKey: ['/api/segmentos'],
  });

  const form = useForm<ProdutoServicoFormData>({
    resolver: zodResolver(produtoServicoSchema),
    defaultValues: {
      segmento_id: 0,
      tipo: "produto",
      nome: "",
      descricao: "",
      ativo: true,
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ProdutoServicoFormData) => apiRequest("POST", "/api/produtos-servicos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/produtos-servicos"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/produtos-servicos"] });
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/produtos-servicos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/produtos-servicos"] });
      toast({ title: "Produto/serviço removido com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao remover produto/serviço", 
        variant: "destructive" 
      });
    },
  });

  // Handlers
  const handleSubmit = (data: ProdutoServicoFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: ProdutoServico) => {
    setEditingItem(item);
    form.reset({
      segmento_id: item.segmento_id,
      tipo: item.tipo,
      nome: item.nome,
      descricao: item.descricao || "",
      ativo: item.ativo,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      deleteMutation.mutate(id);
    }
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
  const filteredProdutos = produtos.filter((item) => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.descricao || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegmento = !filterSegmento || filterSegmento === "all" || item.segmento_id.toString() === filterSegmento;
    const matchesTipo = !filterTipo || filterTipo === "all" || item.tipo === filterTipo;
    
    return matchesSearch && matchesSegmento && matchesTipo;
  });

  const getSegmentoNome = (segmentoId: number) => {
    const segmento = segmentos.find(s => s.id === segmentoId);
    return segmento?.name || "Segmento não encontrado";
  };

  if (produtosLoading || segmentosLoading) {
    return (
      <MainLayout 
        title="Produtos e Serviços" 
        subtitle="Gerencie todos os produtos e serviços disponíveis no sistema"
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
      subtitle="Gerencie todos os produtos e serviços disponíveis no sistema"
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
              <div className="text-2xl font-bold">{produtos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{produtos.filter(p => p.tipo === 'produto').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{produtos.filter(p => p.tipo === 'servico').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{produtos.filter(p => p.ativo).length}</div>
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
            
            <Select value={filterSegmento} onValueChange={setFilterSegmento}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                {segmentos.map((segmento) => (
                  <SelectItem key={segmento.id} value={segmento.id.toString()}>
                    {segmento.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="produto">Produtos</SelectItem>
                <SelectItem value="servico">Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto/Serviço
              </Button>
            </DialogTrigger>
            
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
                      name="segmento_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Segmento *</FormLabel>
                          <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um segmento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {segmentos.map((segmento) => (
                                <SelectItem key={segmento.id} value={segmento.id.toString()}>
                                  {segmento.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                            className="min-h-[80px]" 
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Ativo</FormLabel>
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

                  <div className="flex justify-end gap-3 pt-6">
                    <Button type="button" variant="outline" onClick={handleCancelClick}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Produtos/Serviços */}
        <div className="grid gap-6">
          {filteredProdutos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum produto/serviço encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterSegmento || filterTipo 
                    ? "Tente ajustar os filtros ou adicione novos itens." 
                    : "Comece adicionando o primeiro produto ou serviço."
                  }
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredProdutos.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {item.tipo === "produto" ? (
                            <Package className="h-5 w-5 text-primary" />
                          ) : (
                            <Wrench className="h-5 w-5 text-primary" />
                          )}
                          <CardTitle className="text-lg">{item.nome}</CardTitle>
                          <Badge variant={item.tipo === "produto" ? "default" : "secondary"}>
                            {item.tipo === "produto" ? "Produto" : "Serviço"}
                          </Badge>
                          {!item.ativo && (
                            <Badge variant="destructive">Inativo</Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span>{getSegmentoNome(item.segmento_id)}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {item.descricao && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.descricao}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}