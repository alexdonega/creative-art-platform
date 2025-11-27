import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { type Templates } from '@shared/schema';
import { Wand2, AlertTriangle, Palette, Eye, Type, Layout, Settings, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface TemplateModalProps {
  template: Templates | null;
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyData?: any;
}

export function TemplateModal({ template, isOpen, onClose, companyId, companyData }: TemplateModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [textoApoio, setTextoApoio] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [isTextoApoioOpen, setIsTextoApoioOpen] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Controlar scroll da página quando modal de zoom está aberto
  useEffect(() => {
    if (showZoomModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup quando componente for desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showZoomModal]);

  // Fechar modal de zoom com ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showZoomModal) {
        event.stopPropagation();
        event.preventDefault();
        setShowZoomModal(false);
      }
    };
    
    if (showZoomModal) {
      document.addEventListener('keydown', handleEsc, true); // Use capture phase
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc, true);
    };
  }, [showZoomModal]);
  
  // Parse template context to get fields and default values
  const parseTemplateContext = (context: any) => {
    if (!context) return {};
    
    try {
      const parsed = typeof context === 'string' ? JSON.parse(context) : context;
      return parsed;
    } catch (error) {
      console.error('Erro ao parsear contexto do template:', error);
      return {};
    }
  };

  // Função para mapear campos do template com dados da empresa
  const mapCompanyDataToField = (fieldName: string): string => {
    if (!companyData) return '';
    
    console.log('Mapping field:', fieldName, 'with company data:', companyData);
    
    // Para campo logo, garantir que seja uma URL válida e não base64
    if (fieldName.toLowerCase() === 'logo') {
      const logoValue = companyData.logo || '';
      // Se é base64, não usar - o servidor deve ter convertido, mas se não, usar URL padrão
      if (logoValue.startsWith('data:image/')) {
        console.warn('Logo ainda em formato base64, usando URL padrão');
        return 'https://novoenvio.com.br/wp-content/uploads/2025/01/logo_novoenvio_padrao.svg';
      }
      // Se já é uma URL válida, usar diretamente
      return logoValue;
    }
    
    // Para campos de cor, buscar nas cores da empresa
    if (fieldName.toLowerCase().startsWith('cor-')) {
      const companyColors = getCompanyColors();
      const colorKey = fieldName.toLowerCase() as keyof typeof companyColors;
      const colorValue = companyColors[colorKey];
      console.log(`Color field ${fieldName}: ${colorValue}`);
      return colorValue || '';
    }
    
    const fieldMappings: Record<string, string> = {
      'nome': companyData.nome || '',
      'name': companyData.nome || '',
      'empresa': companyData.nome || '',
      'telefone': companyData.telefone || '',
      'email': companyData.email || '',
      'endereco': companyData.endereco || '',
      'endereço': companyData.endereco || '',
      'whatsapp': companyData.whatsapp || '',
      'instagram': companyData.instagram || '',
      'facebook': companyData.facebook || '',
      'cidade': companyData.cidade || '',
      'estado': companyData.estado || '',
      'rodape': companyData.rodape || '',
      'rodapé': companyData.rodape || '',
      'hashtag': companyData.hashtag || '',
      'hashtags': companyData.hashtag || '',
      'website': companyData.website || '',
      'logo': companyData.logo || '',
    };
    
    const result = fieldMappings[fieldName.toLowerCase()] || '';
    console.log(`Field mapping result for ${fieldName}: ${result}`);
    return result;
  };

  // Função para obter cores da empresa
  const getCompanyColors = () => {
    if (!companyData?.cores) {
      return {
        'cor-1': '#1A73E8',
        'cor-2': '#34A853',
        'cor-3': '#FBBC05',
        'cor-4': '#EA4335',
      };
    }
    
    try {
      const coresData = typeof companyData.cores === 'string' 
        ? JSON.parse(companyData.cores) 
        : companyData.cores;
      
      return {
        'cor-1': coresData['cor-1'] || '#1A73E8',
        'cor-2': coresData['cor-2'] || '#34A853',
        'cor-3': coresData['cor-3'] || '#FBBC05',
        'cor-4': coresData['cor-4'] || '#EA4335',
      };
    } catch (error) {
      console.error('Erro ao carregar cores da empresa:', error);
      return {
        'cor-1': '#1A73E8',
        'cor-2': '#34A853', 
        'cor-3': '#FBBC05',
        'cor-4': '#EA4335',
      };
    }
  };

  // Inicializar cores da empresa - usar a função centralizada
  const initializeCompanyColors = () => {
    return getCompanyColors();
  };

  useEffect(() => {
    if (template && template.context) {
      console.log('Template context:', template.context);
      console.log('Company data:', companyData);
      
      const contextData = parseTemplateContext(template.context);
      console.log('Parsed context data:', contextData);
      
      // Create initial form data with company data or default values
      const initialData: Record<string, string> = {};
      
      if (contextData.fields && Array.isArray(contextData.fields)) {
        // Formato novo com array de fields
        console.log('Processing new format fields:', contextData.fields);
        contextData.fields.forEach((field: any) => {
          const companyValue = mapCompanyDataToField(field.name);
          initialData[field.name] = companyValue || field.defaultValue || '';
          console.log(`Field ${field.name}: ${initialData[field.name]}`);
        });
      } else {
        // Formato antigo - usar chaves diretas
        console.log('Processing old format fields:', Object.keys(contextData));
        Object.keys(contextData).forEach(key => {
          const companyValue = mapCompanyDataToField(key);
          initialData[key] = companyValue || contextData[key] || '';
          console.log(`Field ${key}: ${initialData[key]}`);
        });
      }
      
      console.log('Final initial data:', initialData);
      setFormData(initialData);
      
      // Inicializar cores da empresa
      setSelectedColors(initializeCompanyColors());
      
      // Montar texto de apoio: template + rodapé + hashtags
      const partes = [];
      
      // Adicionar texto de apoio do template
      if (template.texto_apoio) {
        partes.push(template.texto_apoio);
      }
      
      // Adicionar dados da empresa se existirem
      if (companyData) {
        if (companyData.rodape) {
          partes.push(companyData.rodape);
        }
        
        if (companyData.hashtag) {
          partes.push(companyData.hashtag);
        }
      }
      
      // Juntar todas as partes com quebra de linha
      const textoApoioCompleto = partes.join('\n');
      setTextoApoio(textoApoioCompleto);
    }
  }, [template, companyData]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateArtMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/arts/generate', {
        templateId: template?.id,
        context: data,
        companyId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Arte gerada com sucesso!",
        description: "Sua arte foi criada e está disponível na seção Artes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/arts'] });
      onClose();
      
      // Reset form to initial values
      setFormData({});
      setTextoApoio('');
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar arte",
        description: "Não foi possível gerar sua arte. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Incluir cores selecionadas no contexto
    const dataWithColors = {
      ...formData,
      cores: selectedColors,
      texto_apoio: textoApoio
    };
    
    generateArtMutation.mutate(dataWithColors);
  };

  const reportErrorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/reportes-erros', data);
    },
    onSuccess: () => {
      toast({
        title: "Erro reportado com sucesso!",
        description: "Obrigado pelo feedback. Nossa equipe irá analisar o problema.",
      });
      setShowReportModal(false);
      setReportDescription('');
    },
    onError: (error) => {
      toast({
        title: "Erro ao reportar problema",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error('Error reporting error:', error);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorKey: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [colorKey]: color
    }));
  };

  const handleReportError = () => {
    if (!reportDescription.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, descreva o problema encontrado.",
        variant: "destructive",
      });
      return;
    }

    reportErrorMutation.mutate({
      empresa_id: companyId,
      template_id: template?.id,
      tipo_erro: 'template',
      descricao: reportDescription,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header compacto */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#ffffff]">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Palette className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Personalizar Template
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Customize os campos abaixo para gerar sua arte personalizada
              </DialogDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowReportModal(true)}
              className="p-1.5 hover:bg-yellow-100 rounded-md transition-colors group"
              title="Reportar Problema"
            >
              <AlertTriangle className="w-4 h-4 text-gray-400 group-hover:text-yellow-600" />
            </button>
          </div>
        </div>
        
        {/* Conteúdo principal em duas colunas */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Section - 65% */}
          <div className="flex-1 p-6 bg-gray-50">
            
            
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full aspect-square group cursor-pointer"
                   onClick={() => template?.image && setShowZoomModal(true)}>
                {template?.image ? (
                  <>
                    <img
                      src={template.image}
                      alt={template.name || 'Template'}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    {/* Overlay de hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-center">
                        <div className="bg-white bg-opacity-90 rounded-full p-3 mb-2 mx-auto w-fit">
                          <Eye className="h-6 w-6 text-slate-700" />
                        </div>
                        <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                          Clique para ampliar
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Palette className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-500">Preview não disponível</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customization Panel - 35% */}
          <div className="w-2/5 border-l border-gray-200 flex flex-col">
            {/* Seções colapsáveis com scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                {(() => {
                  if (!template || !template.context) return null;
                  
                  const contextData = parseTemplateContext(template.context);
                  
                  // Verificar se é o formato novo com fields ou o formato antigo direto
                  let fieldsToRender: any[] = [];
                  
                  if (contextData.fields && Array.isArray(contextData.fields)) {
                    // Formato novo com array de fields
                    fieldsToRender = contextData.fields;
                  } else {
                    // Formato antigo - converter chaves diretas para fields
                    fieldsToRender = Object.keys(contextData).map(key => ({
                      name: key,
                      label: key.charAt(0).toUpperCase() + key.slice(1),
                      type: 'text',
                      placeholder: `Digite ${key}...`,
                      required: false
                    }));
                  }
                  
                  if (fieldsToRender.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-slate-500">Nenhum campo personalizável disponível para este template.</p>
                      </div>
                    );
                  }
                  
                  // Organizar campos por categorias
                  const categorizeFields = (fields: any[]) => {
                    const categories = {
                      content: [] as any[],
                      design: [] as any[],
                      other: [] as any[]
                    };
                    
                    fields.forEach(field => {
                      const fieldName = field.name.toLowerCase();
                      if (fieldName.includes('title') || fieldName.includes('subtitle') || fieldName.includes('text') || fieldName.includes('titulo') || fieldName.includes('main') || fieldName.includes('location') || fieldName.includes('date')) {
                        categories.content.push(field);
                      } else if (fieldName.includes('color') || fieldName.includes('cor') || fieldName.includes('background') || fieldName.includes('image') || fieldName.includes('logo') || fieldName.includes('svg')) {
                        categories.design.push(field);
                      } else {
                        categories.other.push(field);
                      }
                    });
                    
                    return categories;
                  };
                  
                  const categories = categorizeFields(fieldsToRender);
                  
                  return (
                    <div className="space-y-6">
                      {/* Categoria: Conteúdo */}
                      {(categories.content.length > 0 || true) && (
                        <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen} className="w-full">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                            <div className="flex items-center space-x-2">
                              <Type className="h-4 w-4 text-green-600" />
                              <h4 className="font-medium text-slate-800">Conteúdo</h4>
                              <span className="text-xs text-slate-500">
                                ({categories.content.length} {categories.content.length === 1 ? 'campo' : 'campos'})
                              </span>
                            </div>
                            {isContentOpen ? (
                              <ChevronDown className="h-4 w-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-600" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 pl-6 pt-4">
                            {/* Campos de texto da arte */}
                            {categories.content.map((field: any, index: number) => {
                              const fieldValue = formData[field.name] || '';
                              return (
                                <div key={index} className="space-y-2">
                                  <Label htmlFor={field.name} className="text-sm font-medium">{field.label || field.name}</Label>
                                  {field.type === 'textarea' ? (
                                    <Textarea
                                      id={field.name}
                                      placeholder={field.placeholder || `Digite ${field.name}...`}
                                      value={fieldValue}
                                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                                      rows={field.rows || 3}
                                      required={field.required}
                                      className="text-sm"
                                    />
                                  ) : (
                                    <Input
                                      id={field.name}
                                      type={field.type || 'text'}
                                      placeholder={field.placeholder || `Digite ${field.name}...`}
                                      value={fieldValue}
                                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                                      required={field.required}
                                      className="text-sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                            

                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      
                      {/* Texto de Apoio - Seção abaixo do Conteúdo */}
                      <Collapsible open={isTextoApoioOpen} onOpenChange={setIsTextoApoioOpen} className="w-full">
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          <div className="flex items-center space-x-2">
                            <Type className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-slate-800">Texto de Apoio</h4>
                            <span className="text-xs text-slate-500">
                              (1 campo)
                            </span>
                          </div>
                          {isTextoApoioOpen ? (
                            <ChevronDown className="h-4 w-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 pl-6 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="texto-apoio-separado" className="text-sm font-medium">Texto de Apoio</Label>
                            <Textarea
                              id="texto-apoio-separado"
                              placeholder="Adicione instruções ou dicas para este template..."
                              value={textoApoio}
                              onChange={(e) => setTextoApoio(e.target.value)}
                              rows={5}
                              className="text-sm resize-none overflow-hidden min-h-[120px]"
                              style={{
                                minHeight: '120px',
                                height: `${Math.max(120, (textoApoio.split('\n').length + 1) * 24)}px`
                              }}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                      
                      {/* Categoria: Design */}
                      {categories.design.length > 0 && (
                        <Collapsible open={isDesignOpen} onOpenChange={setIsDesignOpen} className="w-full">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                            <div className="flex items-center space-x-2">
                              <Palette className="h-4 w-4 text-purple-600" />
                              <h4 className="font-medium text-slate-800">Design</h4>
                              <span className="text-xs text-slate-500">
                                ({categories.design.length} {categories.design.length === 1 ? 'campo' : 'campos'})
                              </span>
                            </div>
                            {isDesignOpen ? (
                              <ChevronDown className="h-4 w-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-600" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 pl-6 pt-4">
                            {categories.design.map((field: any, index: number) => {
                              const fieldValue = formData[field.name] || '';
                              const isColorField = field.name.toLowerCase().includes('color') || field.name.toLowerCase().includes('cor');
                              
                              return (
                                <div key={index} className="space-y-2">
                                  <Label htmlFor={field.name} className="text-sm font-medium">{field.label || field.name}</Label>
                                  {isColorField ? (
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        id={field.name}
                                        type="color"
                                        value={fieldValue}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        className="w-12 h-8 p-1 border rounded"
                                      />
                                      <Input
                                        type="text"
                                        value={fieldValue}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1 text-sm"
                                      />
                                    </div>
                                  ) : (
                                    <Input
                                      id={field.name}
                                      type={field.type || 'text'}
                                      placeholder={field.placeholder || `Digite ${field.name}...`}
                                      value={fieldValue}
                                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                                      required={field.required}
                                      className="text-sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      
                      {/* Outros campos */}
                      {categories.other.length > 0 && (
                        <Collapsible open={isOtherOpen} onOpenChange={setIsOtherOpen} className="w-full">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="flex items-center space-x-2">
                              <Settings className="h-4 w-4 text-gray-600" />
                              <h4 className="font-medium text-slate-800">Outros</h4>
                              <span className="text-xs text-slate-500">
                                ({categories.other.length} {categories.other.length === 1 ? 'campo' : 'campos'})
                              </span>
                            </div>
                            {isOtherOpen ? (
                              <ChevronDown className="h-4 w-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-600" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 pl-6 pt-4">
                            {categories.other.map((field: any, index: number) => {
                              const fieldValue = formData[field.name] || '';
                              return (
                                <div key={index} className="space-y-2">
                                  <Label htmlFor={field.name} className="text-sm font-medium">{field.label || field.name}</Label>
                                  {field.type === 'textarea' ? (
                                    <Textarea
                                      id={field.name}
                                      placeholder={field.placeholder || `Digite ${field.name}...`}
                                      value={fieldValue}
                                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                                      rows={field.rows || 3}
                                      required={field.required}
                                      className="text-sm"
                                    />
                                  ) : (
                                    <Input
                                      id={field.name}
                                      type={field.type || 'text'}
                                      placeholder={field.placeholder || `Digite ${field.name}...`}
                                      value={fieldValue}
                                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                                      required={field.required}
                                      className="text-sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  );
                })()}
                </form>
              </div>
            </div>
            
            {/* Footer fixo */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={generateArtMutation.isPending}
                  onClick={handleSubmit}
                >
                  {generateArtMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar Arte
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      {/* Modal de Zoom em Tela Cheia */}
      {showZoomModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-90"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowZoomModal(false);
          }}
        >
          {/* Container principal do modal */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            
            {/* Botão de fechar fixo */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowZoomModal(false);
              }}
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
              <div className="text-xs opacity-75 mt-1">{template?.name}</div>
            </div>

            {/* Imagem ampliada */}
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-full max-h-full aspect-square">
              {template?.image ? (
                <img
                  src={template.image}
                  alt={template.name || 'Template'}
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
      {/* Modal de reportar erro */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar Problema</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-description">Descreva o problema encontrado</Label>
              <Textarea
                id="report-description"
                placeholder="Descreva detalhadamente o problema que você encontrou neste template..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="cancel"
                className="flex-1"
                onClick={() => setShowReportModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleReportError}
                disabled={reportErrorMutation.isPending}
              >
                {reportErrorMutation.isPending ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reportar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
