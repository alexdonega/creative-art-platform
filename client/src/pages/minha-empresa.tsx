import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { useCompany } from '@/hooks/use-company';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Upload, Building, ShoppingBag, Package, Tag } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function MinhaEmpresa() {
  const { user } = useAuth();
  const { company, updateCompany, createCompany, isUpdating, isCreating } = useCompany(user?.id || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    telefone: '',
    email: '',
    endereco: '',
    instagram: '',
    facebook: '',
    empresa_segmento: '',
    logo: '',
    logo_formato: '',
  });

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  // File input ref for logo upload
  const logoRef = useRef<HTMLInputElement>(null);
  
  // Loading state for logo upload
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['/api/segmentos'],
    queryFn: async () => {
      const response = await fetch('/api/segmentos');
      return response.ok ? response.json() : [];
    },
  });

  // Fetch all available products/services
  const { data: allProducts = [] } = useQuery({
    queryKey: ['/api/produtos-servicos'],
    queryFn: async () => {
      const response = await fetch('/api/produtos-servicos');
      return response.ok ? response.json() : [];
    },
  });

  // Fetch company's selected products/services
  const { data: companyProducts = [] } = useQuery({
    queryKey: ['/api/empresa-produtos-servicos', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const response = await fetch(`/api/empresa-produtos-servicos/${company.id}`);
      return response.ok ? response.json() : [];
    },
    enabled: !!company?.id,
  });

  // Update company products/services
  const updateProductsMutation = useMutation({
    mutationFn: async (productIds: number[]) => {
      return apiRequest(
        `/api/empresa-produtos-servicos/${company?.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ produto_ids: productIds }),
          headers: { 'Content-Type': 'application/json' }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/empresa-produtos-servicos', company?.id] });
      toast({
        title: "Produtos/Serviços atualizados!",
        description: "A seleção foi salva com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a seleção.",
        variant: "destructive",
      });
    }
  });

  // Update form data when company data is loaded
  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome || '',
        whatsapp: company.whatsapp || '',
        telefone: company.telefone || '',
        email: company.email || '',
        endereco: company.endereco || '',
        instagram: company.instagram || '',
        facebook: company.facebook || '',
        empresa_segmento: company.empresa_segmento?.toString() || '',
        logo: company.logo || '',
        logo_formato: company.logo_formato || '',
      });
    }
  }, [company]);

  // Update selected products when company products are loaded
  useEffect(() => {
    if (companyProducts?.length > 0) {
      const productIds = companyProducts.map((cp: any) => cp.produto_id);
      setSelectedProducts(productIds);
    }
  }, [companyProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      empresa_segmento: formData.empresa_segmento ? parseInt(formData.empresa_segmento) : null,
      admin: user?.id,
    };

    if (company) {
      updateCompany(dataToSubmit);
    } else {
      createCompany(dataToSubmit);
    }

    toast({
      title: "Empresa atualizada com sucesso!",
      description: "As informações da sua empresa foram salvas.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveProducts = () => {
    if (!company?.id) {
      toast({
        title: "Erro",
        description: "Você precisa salvar os dados da empresa primeiro.",
        variant: "destructive",
      });
      return;
    }
    updateProductsMutation.mutate(selectedProducts);
  };

  // Logo upload handler
  const handleLogoUpload = async (file: File) => {
    if (!company?.id) {
      toast({
        title: "Erro",
        description: "Você precisa salvar os dados da empresa primeiro.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`/api/companies/${company.id}/upload-logo/principal`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const result = await response.json();
      
      // Update form data
      setFormData(prev => ({ ...prev, logo: result.logoUrl }));
      
      // Invalidate company query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['/api/companies', company.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/user', user?.id] });

      toast({
        title: "Logo enviada com sucesso!",
        description: "Logo da empresa foi atualizada.",
      });

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a logo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Apenas arquivos de imagem são permitidos.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "O arquivo deve ter no máximo 2MB.",
          variant: "destructive",
        });
        return;
      }

      handleLogoUpload(file);
    }
  };

  const companyColors = company?.cores as any || {
    "cor-1": "#1A73E8",
    "cor-2": "#34A853",
    "cor-3": "#FBBC05",
    "cor-4": "#EA4335"
  };

  return (
    <MainLayout
      title="Minha Empresa"
      subtitle="Gerencie as informações da sua empresa e personalize suas artes"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6">
        {/* Company Logo & Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Logo e Cores</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Logo Upload */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-slate-700 mb-4 block">
                Logo da Empresa
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    {formData.logo || company?.logo ? (
                      <img
                        src={formData.logo || company?.logo}
                        alt="Logo da empresa"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Building className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => logoRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingLogo ? 'Enviando...' : 'Enviar Logo'}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">PNG, JPG até 2MB</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Formato da Logo</Label>
                  <Select
                    value={formData.logo_formato}
                    onValueChange={(value) => handleInputChange('logo_formato', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
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
                  <p className="text-xs text-slate-500">
                    Informe o formato para otimizar a geração de artes
                  </p>
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Cores Principais
              </Label>
              <p className="text-xs text-slate-500 mb-3">
                Extraídas automaticamente da sua logo
              </p>
              <div className="flex space-x-3">
                {Object.entries(companyColors).map(([key, color]) => (
                  <div key={key} className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm border"
                      style={{ backgroundColor: color as string }}
                    />
                    <span className="text-xs text-slate-600 mt-1">
                      {color as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Segment Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Segmento da Empresa
              </Label>
              <Select
                value={formData.empresa_segmento}
                onValueChange={(value) => handleInputChange('empresa_segmento', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um segmento" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Minha Empresa Ltda"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 9 9999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 3333-4444"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, Número - Bairro - Cidade - UF"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="@empresa"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="/empresa"
                  value={formData.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isUpdating || isCreating}
              >
                {isUpdating || isCreating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Products and Services Selection */}
        <Card className="xl:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Produtos e Serviços
            </CardTitle>
            <p className="text-sm text-slate-600">
              Selecione os produtos e serviços que sua empresa oferece
            </p>
          </CardHeader>
          <CardContent>
            {!company?.id ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">
                  Salve os dados da empresa primeiro para gerenciar produtos e serviços
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">
                      Nenhum produto ou serviço disponível ainda
                    </p>
                    <p className="text-xs text-slate-400">
                      Entre em contato com o administrador para adicionar produtos/serviços
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allProducts.map((product: any) => (
                        <div
                          key={product.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedProducts.includes(product.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => handleProductToggle(product.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Checkbox
                                  checked={selectedProducts.includes(product.id)}
                                  onChange={() => {}} // Controlled by parent click
                                />
                                <Badge variant={product.tipo === 'produto' ? 'default' : 'secondary'}>
                                  {product.tipo === 'produto' ? 'Produto' : 'Serviço'}
                                </Badge>
                                <Badge variant="outline">
                                  {product.categoria}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-slate-900 mb-1">
                                {product.nome}
                              </h4>
                              <p className="text-sm text-slate-600 mb-2">
                                {product.descricao}
                              </p>
                              <div className="text-lg font-bold text-primary">
                                R$ {(product.preco / 100).toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                          </div>
                          {product.caracteristicas && product.caracteristicas.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <div className="flex flex-wrap gap-1">
                                {product.caracteristicas.slice(0, 3).map((caracteristica: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {caracteristica}
                                  </Badge>
                                ))}
                                {product.caracteristicas.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{product.caracteristicas.length - 3} mais
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-slate-600">
                        {selectedProducts.length} de {allProducts.length} selecionados
                      </div>
                      <Button 
                        onClick={handleSaveProducts}
                        disabled={updateProductsMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {updateProductsMutation.isPending ? 'Salvando...' : 'Salvar Seleção'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
