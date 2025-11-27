import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateModal } from '@/components/art-generation/template-modal';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useCompany } from '@/hooks/use-company';
import { Eye, Palette, Edit, Filter, X, Tag, Package, Crop, Star, Clock, ChevronDown, ChevronUp, Briefcase, RectangleHorizontal, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { type Templates } from '@shared/schema';
import { cn } from '@/lib/utils';

export default function Templates() {
  const { user } = useAuth();
  const { company } = useCompany(user?.id || '');
  const [selectedTemplate, setSelectedTemplate] = useState<Templates | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Templates | null>(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    tipoConteudo: true,
    servicoProduto: false,
    proporcao: false,
    diaComemoracacao: false,
    mes: false
  });
  
  // Filter values
  const [filters, setFilters] = useState({
    tipoConteudo: [] as string[],
    servicoProduto: [] as string[],
    proporcao: [] as string[],
    diaComemoracacao: '',
    mes: [] as string[],
    acessoRapido: '' as 'populares' | 'recentes' | ''
  });

  // Filter options data
  const tipoConteudoOptions = [
    { id: 'data-comemorativa', label: 'Data Comemorativa', count: 25 },
    { id: 'dica', label: 'Dica', count: 8 },
    { id: 'impulsionamento', label: 'Impulsionamento', count: 6 },
    { id: 'institucional', label: 'Institucional', count: 12 },
    { id: 'produto-servico', label: 'Produto/Serviço', count: 15 }
  ];

  const proporcaoOptions = [
    { id: 'capa-facebook', label: 'Capa Facebook', count: 8 },
    { id: 'post-quadrado', label: 'Post Quadrado', count: 28 },
    { id: 'post-retangular', label: 'Post Retangular', count: 15 },
    { id: 'story', label: 'Story', count: 22 }
  ];

  const mesOptions = [
    { id: 'abril', label: 'Abril', count: 3 },
    { id: 'agosto', label: 'Agosto', count: 6 },
    { id: 'dezembro', label: 'Dezembro', count: 9 },
    { id: 'fevereiro', label: 'Fevereiro', count: 4 },
    { id: 'janeiro', label: 'Janeiro', count: 5 },
    { id: 'julho', label: 'Julho', count: 4 },
    { id: 'junho', label: 'Junho', count: 5 },
    { id: 'maio', label: 'Maio', count: 7 },
    { id: 'marco', label: 'Março', count: 6 },
    { id: 'novembro', label: 'Novembro', count: 7 },
    { id: 'outubro', label: 'Outubro', count: 8 },
    { id: 'setembro', label: 'Setembro', count: 5 }
  ];

  // Check if data comemorativa is selected for conditional filters
  const isDataComemorativaSelected = filters.tipoConteudo.includes('data-comemorativa');

  // Count active filters
  const activeFiltersCount = Object.values(filters).reduce((count, filterArray) => {
    if (Array.isArray(filterArray)) {
      return count + filterArray.length;
    } else if (filterArray) {
      return count + 1;
    }
    return count;
  }, 0);

  // Filter functions
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (category: keyof typeof filters, value: string, checked: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (category === 'diaComemoracacao') {
        newFilters[category] = checked ? value : '';
      } else if (Array.isArray(newFilters[category])) {
        const currentArray = newFilters[category] as string[];
        if (checked) {
          newFilters[category] = [...currentArray, value] as any;
        } else {
          newFilters[category] = currentArray.filter(item => item !== value) as any;
        }
      } else {
        newFilters[category] = checked ? value : '' as any;
      }

      // Clear conditional filters when data comemorativa is unchecked
      if (category === 'tipoConteudo' && value === 'data-comemorativa' && !checked) {
        newFilters.diaComemoracacao = '';
        newFilters.mes = [];
      }

      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      tipoConteudo: [],
      servicoProduto: [],
      proporcao: [],
      diaComemoracacao: '',
      mes: [],
      acessoRapido: ''
    });
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    // Here you would apply the actual filtering logic to the templates
  };

  // Controlar ESC key para fechar zoom modal e filter sidebar
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showZoomModal) {
          setShowZoomModal(false);
        } else if (isFilterOpen) {
          setIsFilterOpen(false);
        }
      }
    };
    
    if (showZoomModal || isFilterOpen) {
      document.addEventListener('keydown', handleEsc);
      if (showZoomModal) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showZoomModal, isFilterOpen]);

  // Pega a empresa selecionada no sidebar
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');
  
  // Busca informações da empresa selecionada
  const { data: selectedCompany } = useQuery({
    queryKey: ['/api/companies', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return null;
      const response = await fetch(`/api/companies/${selectedCompanyId}`);
      return response.ok ? response.json() : null;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/segmentos'],
    queryFn: async () => {
      const response = await fetch('/api/segmentos');
      return response.ok ? response.json() : [];
    },
  });

  // Filtra templates apenas pela categoria da empresa ativa
  const { data: templates } = useQuery({
    queryKey: ['/api/templates', selectedCompany?.empresa_segmento],
    queryFn: async () => {
      if (!selectedCompany?.empresa_segmento) return [];
      const response = await fetch(`/api/templates?segmento=${selectedCompany.empresa_segmento}`);
      return response.ok ? response.json() : [];
    },
    enabled: !!selectedCompany?.empresa_segmento,
  });

  // Buscar produtos e serviços ativos da empresa
  const { data: produtosServicos = [] } = useQuery({
    queryKey: ['/api/produtos-servicos/company', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      const response = await fetch(`/api/produtos-servicos/company/${selectedCompany.id}`);
      return response.ok ? response.json() : [];
    },
    enabled: !!selectedCompany?.id,
  });

  // Criar opções de produtos/serviços baseado nos dados reais da empresa
  const servicoProdutoOptions = produtosServicos
    .map((item: any) => ({
      id: item.id.toString(),
      label: item.nome,
      count: 1, // Pode ser ajustado se houver contagem de templates por produto
      tipo: item.tipo,
      ativo: item.ativo // Incluir status ativo do banco de dados
    }));

  // Filtrar templates por busca e formato da logo
  const filteredTemplates = templates?.filter((template: Templates) => {
    // Filtro por busca
    const matchesSearch = template.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por formato da logo da empresa
    let matchesLogoFormat = true;
    if (selectedCompany?.logo_formato) {
      // Se a empresa tem formato definido, filtrar apenas templates compatíveis
      // Templates sem formato definido são considerados universais
      matchesLogoFormat = !template.logo_formato || template.logo_formato === selectedCompany.logo_formato;
    }
    
    return matchesSearch && matchesLogoFormat;
  }) || [];

  const handleSelectTemplate = (template: Templates) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handlePreviewTemplate = (template: Templates) => {
    setPreviewTemplate(template);
    setShowZoomModal(true);
  };

  // Encontra o nome do segmento da empresa ativa
  const activeSegment = categories?.find((cat: any) => cat.id === selectedCompany?.empresa_segmento);

  return (
    <MainLayout
      title="Templates"
      subtitle={activeSegment ? `Templates para ${activeSegment.name}` : "Selecione uma empresa para ver os templates"}
    >
      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Pesquisar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 relative"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {selectedCompany && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {activeSegment && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{activeSegment.name}</span>
                  </>
                )}
                {selectedCompany.logo_formato && (
                  <>
                    <span className="text-gray-400">•</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <RectangleHorizontal className="h-3 w-3" />
                      Logo {selectedCompany.logo_formato}
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Active filters tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {[...filters.tipoConteudo, ...filters.servicoProduto, ...filters.proporcao, 
                ...(filters.diaComemoracacao ? [filters.diaComemoracacao] : []),
                ...filters.mes,
                ...(filters.acessoRapido ? [filters.acessoRapido] : [])]
                .map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      // Remove individual filter logic here
                    }}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Templates Grid */}
      {!selectedCompany ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Palette className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Selecione uma empresa</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Para ver os templates, você precisa selecionar uma empresa no menu lateral. 
                Os templates serão filtrados pela categoria da empresa ativa.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Palette className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhum template encontrado</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Não há templates disponíveis para o segmento {activeSegment?.name}.
                Tente alterar o segmento da empresa ou aguarde novos templates.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredTemplates.map((template: Templates) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group break-inside-avoid mb-6">
            <CardContent className="p-4">
              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-4 relative">
                {template.image ? (
                  <img
                    src={template.image}
                    alt={template.name || 'Template'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewTemplate(template);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Criar
                  </Button>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium text-slate-800 mb-1">
                  {template.name || 'Template'}
                </h3>
                <p className="text-sm text-slate-600">
                  {(() => {
                    // Determine format based on dimensions
                    const width = template.width || 1;
                    const height = template.height || 1;
                    
                    if (width === height) {
                      return "Post Quadrado";
                    } else if (width < height && width / height < 0.7) {
                      return "Story";
                    } else if (width < height) {
                      return "Post Retangular";
                    } else if (width > height && width / height > 2) {
                      return "Capa Facebook";
                    } else {
                      return "Formato Personalizado";
                    }
                  })()}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  Popular
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
      {/* Modal de Zoom em Tela Cheia */}
      {showZoomModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-90"
          onClick={() => setShowZoomModal(false)}
        >
          {/* Container principal do modal */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            
            {/* Botão de fechar fixo */}
            <button
              type="button"
              onClick={() => setShowZoomModal(false)}
              className="fixed top-8 right-8 z-[10001] bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-4 transition-all duration-200 shadow-xl border border-white border-opacity-20"
              title="Fechar (ESC)"
              style={{ position: 'fixed' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Container da imagem */}
            <div 
              className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >

            {/* Informações da imagem */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white text-sm px-3 py-2 rounded-lg">
              <div>1080x1080px • Zoom Completo</div>
              <div className="text-xs opacity-75 mt-1">{previewTemplate?.name}</div>
            </div>

            {/* Imagem ampliada */}
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-full max-h-full aspect-square">
              {previewTemplate?.image ? (
                <img
                  src={previewTemplate.image}
                  alt={previewTemplate.name || 'Template'}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                />
              ) : (
                <div className="w-96 h-96 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Palette className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                    <span className="text-gray-500 text-lg">Preview não disponível</span>
                  </div>
                </div>
              )}
            </div>

            </div>
          </div>
        </div>
      )}
      {/* Filter Sidebar */}
      {isFilterOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFilterOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>



            {/* Scrollable Filters Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tipo de Conteúdo */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('tipoConteudo')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Tipos de Conteúdo</span>
                  </div>
                  {expandedSections.tipoConteudo ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
                
                {expandedSections.tipoConteudo && (
                  <div className="space-y-2 ml-6">
                    {tipoConteudoOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={option.id}
                            checked={filters.tipoConteudo.includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleFilterChange('tipoConteudo', option.id, checked as boolean)
                            }
                          />
                          <label htmlFor={option.id} className="text-sm cursor-pointer">
                            {option.label}
                          </label>
                        </div>
                        <span className="text-xs text-gray-500">{option.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Serviço/Produto */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('servicoProduto')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Produtos e Serviços</span>
                  </div>
                  {expandedSections.servicoProduto ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
                
                {expandedSections.servicoProduto && (
                  <div className="space-y-2 ml-6">
                    {servicoProdutoOptions.length > 0 ? (
                      servicoProdutoOptions
                        .filter((option) => option.ativo === true) // Apenas produtos/serviços ativos
                        .map((option) => (
                          <div key={`produto-servico-${option.id}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`servico-${option.id}`}
                                checked={filters.servicoProduto.includes(option.id)}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('servicoProduto', option.id, checked as boolean)
                                }
                              />
                              <label htmlFor={`servico-${option.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                                {option.tipo === 'produto' ? (
                                  <Package className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <Wrench className="h-3 w-3 text-purple-600" />
                                )}
                                {option.label}
                              </label>
                            </div>
                            <span className="text-xs text-gray-500 capitalize">{option.tipo}</span>
                          </div>
                        ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        Nenhum produto ou serviço ativo encontrado
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Proporção */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('proporcao')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <RectangleHorizontal className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Formatos</span>
                  </div>
                  {expandedSections.proporcao ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
                
                {expandedSections.proporcao && (
                  <div className="space-y-2 ml-6">
                    {proporcaoOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`proporcao-${option.id}`}
                            checked={filters.proporcao.includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleFilterChange('proporcao', option.id, checked as boolean)
                            }
                          />
                          <label htmlFor={`proporcao-${option.id}`} className="text-sm cursor-pointer">
                            {option.label}
                          </label>
                        </div>
                        <span className="text-xs text-gray-500">{option.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conditional Filters - Only show when Data Comemorativa is selected */}
              {isDataComemorativaSelected && (
                <>
                  {/* Dia da Comemoração */}
                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <button
                      onClick={() => toggleSection('diaComemoracacao')}
                      className="flex items-center justify-between w-full text-left hover:bg-blue-100 p-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Dia da Comemoração</span>
                      </div>
                      {expandedSections.diaComemoracacao ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                    
                    {expandedSections.diaComemoracacao && (
                      <div className="ml-6">
                        <input
                          type="date"
                          value={filters.diaComemoracacao}
                          onChange={(e) => handleFilterChange('diaComemoracacao', e.target.value, !!e.target.value)}
                          className="w-full p-2 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Mês */}
                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <button
                      onClick={() => toggleSection('mes')}
                      className="flex items-center justify-between w-full text-left hover:bg-blue-100 p-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Mês</span>
                      </div>
                      {expandedSections.mes ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                    
                    {expandedSections.mes && (
                      <div className="space-y-2 ml-6">
                        {mesOptions.map((option) => (
                          <div key={option.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`mes-${option.id}`}
                                checked={filters.mes.includes(option.id)}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('mes', option.id, checked as boolean)
                                }
                              />
                              <label htmlFor={`mes-${option.id}`} className="text-sm cursor-pointer">
                                {option.label}
                              </label>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                Limpar tudo
              </Button>
              <Button
                onClick={applyFilters}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Aplicar Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-white text-blue-600 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      <TemplateModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyId={selectedCompany?.id || 0}
        companyData={selectedCompany}
      />
    </MainLayout>
  );
}
