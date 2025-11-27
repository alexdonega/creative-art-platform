
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useUserCompanies } from '@/hooks/use-user-companies';
import { usePlans } from '@/hooks/use-plans';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Building, Users, Crown, Calendar, Settings, Edit3, Upload, Palette, Globe, Phone, MapPin, User, Star, Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// @ts-ignore
import ColorThief from 'color-thief-browser';
import CompanyUsersManager from '@/components/company-users-manager';
import { PhoneInput } from '@/components/ui/phone-input';
import { z } from 'zod';

// Estados brasileiros
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Schema completo para criação de empresa (baseado na tabela real)
const empresaFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  plano_id: z.number().min(1, 'Plano é obrigatório'),
  empresa_segmento: z.number().optional(),
  segmento_id: z.number().optional(),
  ativo: z.boolean().optional(),
  cep: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  logo_formato: z.enum(['quadrada', 'retangular', 'vertical']).optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  rodape: z.string().optional(),
  hashtag: z.string().optional(),
});

export default function Empresas() {
  const { user } = useAuth();
  const { companies, isLoading, createCompany, isCreating } = useUserCompanies(user?.id || '');
  const { plans, isLoading: plansLoading, error: plansError } = usePlans();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompanyForUsers, setSelectedCompanyForUsers] = useState<any>(null);
  const [selectedCompanyForEdit, setSelectedCompanyForEdit] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPalettes, setColorPalettes] = useState<string[][]>([]);
  const [selectedPalette, setSelectedPalette] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Declarar editForm antes do useEffect
  const editForm = useForm<z.infer<typeof empresaFormSchema>>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nome: '',
      plano_id: 1,
      empresa_segmento: undefined,
      email: '',
      telefone: '',
      endereco: '',
      whatsapp: '',
      instagram: '',
      facebook: '',
      website: '',
      logo: '',
      logo_formato: undefined,
      estado: '',
      cidade: '',
      rodape: '',
      hashtag: '',
    },
  });

  // Atualizar formulário quando empresa selecionada mudar
  useEffect(() => {
    if (selectedCompanyForEdit) {
      console.log("Atualizando formulário com dados da empresa:", selectedCompanyForEdit);
      console.log("Logo formato atual:", selectedCompanyForEdit.logo_formato);
      
      editForm.reset({
        nome: selectedCompanyForEdit.nome || '',
        plano_id: selectedCompanyForEdit.plano_id || 1,
        empresa_segmento: selectedCompanyForEdit.empresa_segmento || undefined,
        segmento_id: selectedCompanyForEdit.empresa_segmento || undefined,
        email: selectedCompanyForEdit.email || '',
        telefone: selectedCompanyForEdit.telefone || '',
        endereco: selectedCompanyForEdit.endereco || '',
        whatsapp: selectedCompanyForEdit.whatsapp || '',
        instagram: selectedCompanyForEdit.instagram || '',
        facebook: selectedCompanyForEdit.facebook || '',
        website: selectedCompanyForEdit.website || '',
        logo: selectedCompanyForEdit.logo || '',
        logo_formato: selectedCompanyForEdit.logo_formato || undefined,
        estado: selectedCompanyForEdit.estado || '',
        cidade: selectedCompanyForEdit.cidade || '',
        rodape: selectedCompanyForEdit.rodape || '',
        hashtag: selectedCompanyForEdit.hashtag || '',
        ativo: selectedCompanyForEdit.ativo ?? true,
        cep: selectedCompanyForEdit.cep || '',
      });
      
      // Carregar cores salvas da empresa se existirem
      if (selectedCompanyForEdit.cores && typeof selectedCompanyForEdit.cores === 'object') {
        const savedColors = [
          selectedCompanyForEdit.cores['cor-1'],
          selectedCompanyForEdit.cores['cor-2'],
          selectedCompanyForEdit.cores['cor-3'],
          selectedCompanyForEdit.cores['cor-4']
        ].filter(Boolean);
        
        if (savedColors.length > 0) {
          setExtractedColors(savedColors);
        }
      }
    }
  }, [selectedCompanyForEdit, editForm]);



  // Buscar segmentos de empresa
  const { data: segmentos = [] } = useQuery({
    queryKey: ['/api/segmentos'],
  });

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  // Usar segmentos como segments para compatibilidade
  const segments = segmentos;

  // Função para buscar endereço por CEP
  const buscarEnderecoPorCep = async (cep: string, formInstance: any) => {
    // Remover caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Verificar se CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        console.log('CEP não encontrado');
        return;
      }
      
      // Preencher campos automaticamente
      if (data.uf) {
        formInstance.setValue('estado', data.uf);
      }
      if (data.localidade) {
        formInstance.setValue('cidade', data.localidade);
      }
      if (data.logradouro || data.bairro) {
        const endereco = [data.logradouro, data.bairro].filter(Boolean).join(', ');
        formInstance.setValue('endereco', endereco);
      }
      
      console.log('Endereço preenchido automaticamente:', data);
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const form = useForm<z.infer<typeof empresaFormSchema>>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nome: '',
      plano_id: 1,
      empresa_segmento: undefined,
      email: '',
      telefone: '',
      endereco: '',
      whatsapp: '',
      instagram: '',
      facebook: '',
      website: '',
      logo: '',
      logo_formato: undefined,
      estado: '',
      cidade: '',
      rodape: '',
      hashtag: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof empresaFormSchema>) => {
    try {
      setErrors(null);
      await createCompany(data);
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      setErrors('Erro ao criar empresa. Tente novamente.');
    }
  };

  const openEditModal = (company: any) => {
    setSelectedCompanyForEdit(company);
    setLogoFile(null);
    setLogoPreview(null);
    setExtractedColors([]);
    editForm.reset({
      nome: company.nome || '',
      plano_id: company.plano_id || 1,
      empresa_segmento: company.empresa_segmento || undefined,
      email: company.email || '',
      telefone: company.telefone || '',
      endereco: company.endereco || '',
      whatsapp: company.whatsapp || '',
      instagram: company.instagram || '',
      facebook: company.facebook || '',
      website: company.website || '',
      logo: company.logo || '',
      logo_formato: company.logo_formato || undefined,
      estado: company.estado || '',
      cidade: company.cidade || '',
      rodape: company.rodape || '',
      hashtag: company.hashtag || '',
    });
  };

  const closeEditModal = () => {
    setSelectedCompanyForEdit(null);
    setLogoFile(null);
    setLogoPreview(null);
    setExtractedColors([]);
    setShowColorPicker(false);
    setColorPalettes([]);
    setSelectedPalette(0);
    setErrors(null);
    setIsUpdating(false);
    editForm.reset();
  };

  const handleColorPickerCancel = () => {
    setShowColorPicker(false);
    setLogoFile(null);
    setLogoPreview(null);
    setExtractedColors([]);
    setColorPalettes([]);
    setSelectedPalette(0);
  };

  const handleColorPickerUpdate = async () => {
    if (!selectedCompanyForEdit || !logoFile) return;
    
    try {
      // Aqui você implementaria o upload da logo e atualização da empresa
      // Por enquanto, vamos apenas simular a atualização
      console.log('Atualizando empresa com:', {
        logo: logoPreview,
        cores: colorPalettes[selectedPalette]
      });
      
      // Atualizar o formulário com as novas cores
      const selectedColors = colorPalettes[selectedPalette];
      const coresObj = {
        'cor-1': selectedColors[0],
        'cor-2': selectedColors[1],
        'cor-3': selectedColors[2],
        'cor-4': selectedColors[3]
      };
      
      // Atualizar a empresa localmente (temporário)
      selectedCompanyForEdit.cores = coresObj;
      selectedCompanyForEdit.logo = logoPreview;
      
      setShowColorPicker(false);
      setExtractedColors(selectedColors);
      
      // TODO: Implementar API call para atualizar empresa
      console.log('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
    }
  };

  const onEditSubmit = async (data: z.infer<typeof empresaFormSchema>) => {
    if (!selectedCompanyForEdit) return;
    
    try {
      setIsUpdating(true);
      setErrors(null);
      
      console.log('Editando empresa:', selectedCompanyForEdit.id, data);
      console.log('Logo formato no data:', data.logo_formato);
      
      // Incluir dados de cores extraídas se existirem
      const updateData = {
        ...data,
        ...(extractedColors && extractedColors.length > 0 && {
          cores: {
            'cor-1': extractedColors[0],
            'cor-2': extractedColors[1],
            'cor-3': extractedColors[2],
            'cor-4': extractedColors[3]
          }
        })
      };
      
      console.log('UpdateData sendo enviado:', updateData);
      
      const response = await fetch(`/api/companies/${selectedCompanyForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar empresa');
      }
      
      const updatedCompany = await response.json();
      console.log('Empresa atualizada:', updatedCompany);
      
      // Recarregar lista de empresas
      queryClient.invalidateQueries({ queryKey: ['/api/companies/user', user?.id], exact: false });
      
      // Fechar modal e resetar form
      setSelectedCompanyForEdit(null);
      editForm.reset();
      setLogoPreview(null);
      setLogoFile(null);
      setExtractedColors([]);
      
      console.log('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      setErrors('Erro ao atualizar empresa. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    setLogoFile(file);
    
    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setLogoPreview(imageSrc);
      editForm.setValue('logo', imageSrc);
      
      // Extrair cores da imagem automaticamente
      extractColorsFromImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  const extractColorsFromImage = (imageSrc: string) => {
    console.log('Iniciando extração de cores:', imageSrc);
    
    // Criar canvas para extrair cores manualmente
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Não foi possível criar contexto do canvas');
      useDefaultColors();
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        console.log('Imagem carregada, configurando canvas...');
        
        // Redimensionar para análise mais rápida
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        
        // Desenhar imagem no canvas
        ctx.drawImage(img, 0, 0, size, size);
        
        // Obter dados dos pixels
        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;
        
        console.log('Analisando pixels...');
        
        // Contar cores
        const colorCount: { [key: string]: number } = {};
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // Ignorar pixels transparentes ou muito claros/escuros
          if (a < 100) continue;
          if (r > 250 && g > 250 && b > 250) continue; // Muito branco
          if (r < 5 && g < 5 && b < 5) continue; // Muito preto
          
          // Agrupar cores similares (reduzir precisão)
          const rGroup = Math.floor(r / 10) * 10;
          const gGroup = Math.floor(g / 10) * 10;
          const bGroup = Math.floor(b / 10) * 10;
          
          const colorKey = `${rGroup},${gGroup},${bGroup}`;
          colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
        }
        
        console.log('Cores encontradas:', Object.keys(colorCount).length);
        
        // Ordenar cores por frequência
        const sortedColors = Object.entries(colorCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 6); // Pegar as 6 cores mais dominantes
        
        if (sortedColors.length >= 3) {
          // Converter para HEX
          const hexColors = sortedColors.map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
          });
          
          console.log('Cores extraídas da imagem:', hexColors);
          
          // Garantir pelo menos 4 cores
          while (hexColors.length < 4) {
            hexColors.push(hexColors[0] || '#1A73E8');
          }
          
          const mainColors = hexColors.slice(0, 4);
          
          // Criar 3 paletas diferentes com as cores reais extraídas
          const palettes = [
            [...mainColors], // Paleta Original: cores por dominância
            [mainColors[1], mainColors[0], mainColors[3], mainColors[2]], // Paleta Alternativa 1
            [mainColors[2], mainColors[3], mainColors[0], mainColors[1]]  // Paleta Alternativa 2
          ];
          
          console.log('3 Paletas criadas com cores reais:', palettes);
          
          setColorPalettes(palettes);
          setExtractedColors(palettes[0]);
          setShowColorPicker(true);
        } else {
          console.warn('Poucas cores encontradas na imagem');
          useDefaultColors();
        }
      } catch (error) {
        console.error('Erro durante extração manual:', error);
        useDefaultColors();
      }
    };
    
    img.onerror = (error) => {
      console.error('Erro ao carregar imagem:', error);
      useDefaultColors();
    };
    
    img.src = imageSrc;
  };

  const useDefaultColors = () => {
    console.log('Falha na extração - usando cores padrão apenas como fallback');
    const defaultPalette = ['#666666', '#999999', '#CCCCCC', '#333333'];
    const palettes = [
      [...defaultPalette], // Paleta Padrão Original
      [defaultPalette[2], defaultPalette[0], defaultPalette[3], defaultPalette[1]], // Paleta Padrão Alternativa 1
      [defaultPalette[1], defaultPalette[3], defaultPalette[0], defaultPalette[2]]  // Paleta Padrão Alternativa 2
    ];
    setColorPalettes(palettes);
    setExtractedColors(palettes[0]);
    setShowColorPicker(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.nome || 'Plano não encontrado';
  };

  // Function to extract colors from logo and update both light and dark modes
  const extractColorsFromLogo = async (imgElement: HTMLImageElement) => {
    if (!imgElement) return;

    try {
      console.log('Iniciando extração de cores:', imgElement.src);

      // Aguardar imagem carregar completamente
      if (!imgElement.complete) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
          imgElement.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          imgElement.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Erro ao carregar imagem'));
          };
        });
      }

      console.log('Imagem carregada, iniciando extração...');

      // Verificar se ColorThief está disponível
      if (typeof ColorThief === 'undefined') {
        throw new Error('ColorThief não está disponível');
      }

      const colorThief = new ColorThief();
      
      // Tentar extrair paleta de cores
      const palette = colorThief.getPalette(imgElement, 4, 10);
      
      if (!palette || palette.length === 0) {
        throw new Error('Nenhuma cor extraída');
      }
      
      // Converter RGB para hex
      const colors = palette.map((rgb: number[]) => {
        const r = Math.round(rgb[0]).toString(16).padStart(2, '0');
        const g = Math.round(rgb[1]).toString(16).padStart(2, '0');
        const b = Math.round(rgb[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`.toUpperCase();
      });
      
      console.log('Cores extraídas com sucesso:', colors);
      setExtractedColors(colors);
      
    } catch (error) {
      console.error('Erro ao extrair cores:', error);
      
      // Extrair cores usando análise manual de canvas como fallback
      try {
        console.log('Tentando extração manual...');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = 100;
          canvas.height = 100;
          ctx.drawImage(imgElement, 0, 0, 100, 100);
          
          const imageData = ctx.getImageData(0, 0, 100, 100);
          const pixels = imageData.data;
          const colorMap = new Map();
          
          // Analisar pixels
          for (let i = 0; i < pixels.length; i += 16) { // Saltar pixels para performance
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];
            
            if (a > 100) { // Ignorar transparente
              const color = `${Math.floor(r/20)*20},${Math.floor(g/20)*20},${Math.floor(b/20)*20}`;
              colorMap.set(color, (colorMap.get(color) || 0) + 1);
            }
          }
          
          // Pegar as 4 cores mais frequentes
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([color]) => {
              const [r, g, b] = color.split(',').map(Number);
              return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            });
          
          if (sortedColors.length > 0) {
            console.log('Extração manual bem-sucedida:', sortedColors);
            setExtractedColors(sortedColors);
            return;
          }
        }
      } catch (manualError) {
        console.error('Extração manual também falhou:', manualError);
      }
      
      // Fallback final: usar cores padrão
      const fallbackColors = ['#3B82F6', '#1E40AF', '#64748B', '#475569'];
      console.log('Usando cores padrão:', fallbackColors);
      setExtractedColors(fallbackColors);
    }
  };

  // Function to update individual colors
  const updateCompanyColor = async (mode: 'arte_clara' | 'arte_escura', colorType: string, value: string) => {
    if (!selectedCompanyForEdit) return;

    const updatedCompany = {
      ...selectedCompanyForEdit,
      cores: {
        ...selectedCompanyForEdit.cores,
        [mode]: {
          ...selectedCompanyForEdit.cores[mode],
          [colorType]: value
        }
      }
    };

    try {
      const response = await fetch(`/api/companies/${selectedCompanyForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cores: updatedCompany.cores })
      });

      if (response.ok) {
        setSelectedCompanyForEdit(updatedCompany);
      }
    } catch (error) {
      console.error('Erro ao atualizar cor:', error);
    }
  };



  if (isLoading) {
    return (
      <MainLayout title="Empresas" subtitle="Gerencie suas empresas">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Empresas" subtitle="Gerencie suas empresas">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Suas Empresas</h2>
            <p className="text-gray-600">Visualize e gerencie suas empresas</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Criar Nova Empresa</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="basico" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="basico">Informações</TabsTrigger>
                      <TabsTrigger value="contato">Contato</TabsTrigger>
                      <TabsTrigger value="localizacao">Localização</TabsTrigger>
                      <TabsTrigger value="visual">Visual</TabsTrigger>
                      <TabsTrigger value="marketing">Assinatura da Postagem</TabsTrigger>
                    </TabsList>

                    {/* Aba Básico */}
                    <TabsContent value="basico" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Nome da Empresa *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Digite o nome da empresa"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="plano_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Plano *
                              </FormLabel>
                              <Select
                                value={field.value?.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11 text-left">
                                    <SelectValue placeholder="Selecione um plano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {plansLoading ? (
                                    <SelectItem value="loading" disabled>
                                      Carregando planos...
                                    </SelectItem>
                                  ) : plans.length > 0 ? (
                                    plans.map((plan) => (
                                      <SelectItem key={plan.id} value={plan.id.toString()}>
                                        {plan.nome} - R$ {(Number(plan.preco_mensal) / 100).toFixed(2).replace('.', ',')}/mês
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="empty" disabled>
                                      Nenhum plano disponível
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="empresa_segmento"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Segmento da Empresa
                              </FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11 text-left">
                                    <SelectValue placeholder="Selecione um segmento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {segmentos?.map((segmento: any) => (
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
                      </div>
                    </TabsContent>

                    {/* Aba Contato */}
                    <TabsContent value="contato" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                E-mail
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="contato@empresa.com"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Telefone
                              </FormLabel>
                              <FormControl>
                                <PhoneInput
                                  {...field}
                                  className="h-11"
                                  showType={true}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                WhatsApp
                              </FormLabel>
                              <FormControl>
                                <PhoneInput
                                  {...field}
                                  className="h-11"
                                  showType={true}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Website
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="www.empresa.com.br"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Instagram</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="@empresa"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="facebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Facebook</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="facebook.com/empresa"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Aba Localização */}
                    <TabsContent value="localizacao" className="space-y-6">
                      <div className="space-y-6">
                        {/* Campo CEP */}
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                CEP
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    placeholder="00000-000"
                                    className="h-11 pr-20"
                                    maxLength={9}
                                    onChange={(e) => {
                                      // Formatação do CEP
                                      let value = e.target.value.replace(/\D/g, '');
                                      if (value.length > 5) {
                                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                                      }
                                      field.onChange(value);
                                      
                                      // Buscar endereço quando CEP completo
                                      if (value.replace(/\D/g, '').length === 8) {
                                        buscarEnderecoPorCep(value, form);
                                      }
                                    }}
                                  />
                                  {isLoadingCep && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500">
                                Digite o CEP para preenchimento automático do endereço
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Estado
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 text-left">
                                    <SelectValue placeholder="Selecione o estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {estadosBrasileiros.map((estado) => (
                                    <SelectItem key={estado} value={estado}>
                                      {estado}
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
                          name="cidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Cidade
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Digite a cidade"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endereco"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-sm font-medium">Endereço Completo</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Digite o endereço completo"
                                  rows={3}
                                  className="resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba Visual */}
                    <TabsContent value="visual" className="space-y-6">
                      <div className="space-y-6">
                        {/* Upload da Logo da Empresa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium flex items-center gap-2">
                                  <Upload className="h-4 w-4" />
                                  Logo da Empresa
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-4">
                                    <div 
                                      className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = async (e) => {
                                          const file = (e.target as HTMLInputElement).files?.[0];
                                          if (file) {
                                            try {
                                              const formData = new FormData();
                                              formData.append('logo', file);
                                              
                                              const response = await fetch('/api/upload-logo-temp', {
                                                method: 'POST',
                                                body: formData
                                              });
                                              
                                              if (response.ok) {
                                                const result = await response.json();
                                                field.onChange(result.logoUrl);
                                              }
                                            } catch (error) {
                                              console.error('Error uploading logo:', error);
                                            }
                                          }
                                        };
                                        input.click();
                                      }}
                                    >
                                      {field.value ? (
                                        <div className="relative w-full h-full group">
                                          <img
                                            src={field.value}
                                            alt="Logo Preview"
                                            className="w-full h-full object-contain"
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                              <Upload className="h-6 w-6 mx-auto mb-1" />
                                              <span className="text-xs">Alterar Logo</span>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center text-gray-400">
                                          <Upload className="h-8 w-8 mx-auto mb-2" />
                                          <span className="text-sm font-medium">Clique para enviar logo</span>
                                          <p className="text-xs mt-1">PNG, JPG até 2MB</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="logo_formato"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Formato da Logo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 text-left">
                                      <SelectValue placeholder="Selecione o formato da sua logo" />
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
                                <p className="text-xs text-gray-500 mt-1">
                                  Informe o formato para otimizar a geração de artes
                                </p>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          As cores serão extraídas automaticamente da nova logo.
                        </p>
                      </div>
                    </TabsContent>

                    {/* Aba Marketing */}
                    <TabsContent value="marketing" className="space-y-6">
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="rodape"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Rodapé/Assinatura</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={4}
                                  placeholder="Texto que aparecerá no rodapé das suas artes"
                                  className="resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hashtag"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Hashtags</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={3}
                                  placeholder="#minhaempresa #marketing #negocio"
                                  className="resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Criando...' : 'Criar Empresa'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabela de Empresas */}
        <div className="bg-white rounded-lg border shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Logo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies?.map((company: any) => (
                <TableRow key={company.id} className="hover:bg-gray-50">
                  <TableCell>
                    {company.logo ? (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={company.logo}
                          alt={`Logo ${company.nome}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.nome}</div>
                      {company.cidade && company.estado && (
                        <div className="text-sm text-gray-500">{company.cidade}, {company.estado}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{company.segmento_nome || 'Não definido'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{company.plano_nome}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {company.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-[150px]">{company.email}</span>
                        </div>
                      )}
                      {company.whatsapp && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{company.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.ativo ? "default" : "secondary"}>
                      {company.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCompanyForEdit(company);
                        }}
                        className="h-8 px-2"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCompanyForUsers(company)}
                        className="h-8 px-2"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Usuários
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {companies?.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-500 mb-4">Comece criando sua primeira empresa.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Empresa
            </Button>
          </div>
        )}
      </div>

      {/* Dialog de Edição de Empresa */}
      {selectedCompanyForEdit && (
        <Dialog open={!!selectedCompanyForEdit} onOpenChange={() => setSelectedCompanyForEdit(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Editar Empresa - {selectedCompanyForEdit.nome}</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <Tabs defaultValue="basico" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basico">Informações</TabsTrigger>
                    <TabsTrigger value="contato">Contato</TabsTrigger>
                    <TabsTrigger value="localizacao">Localização</TabsTrigger>
                    <TabsTrigger value="visual">Visual</TabsTrigger>
                    <TabsTrigger value="marketing">Assinatura da Postagem</TabsTrigger>
                  </TabsList>

                  {/* Aba Básico */}
                  <TabsContent value="basico" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={editForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Nome da Empresa *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Digite o nome da empresa"
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="plano_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Plano *
                            </FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="h-11 text-left">
                                  <SelectValue placeholder="Selecione um plano" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {plans?.map((plan: any) => (
                                  <SelectItem key={plan.id} value={plan.id.toString()}>
                                    <div className="flex items-center gap-3">
                                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                                      <span>{plan.nome}</span>
                                      <span className="text-xs text-gray-500">
                                        {formatCurrency(plan.preco_mensal)}/mês
                                      </span>
                                    </div>
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
                        name="segmento_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Segmento da Empresa *
                            </FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="h-11 text-left">
                                  <SelectValue placeholder="Selecione um segmento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {segments?.map((segment: any) => (
                                  <SelectItem key={segment.id} value={segment.id.toString()}>
                                    {segment.name}
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
                        name="ativo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Empresa Ativa</FormLabel>
                              <FormDescription>
                                Empresa ativa pode gerar artes e acessar funcionalidades
                              </FormDescription>
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
                  </TabsContent>

                  {/* Aba Contato */}
                  <TabsContent value="contato" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={editForm.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              WhatsApp
                            </FormLabel>
                            <FormControl>
                              <PhoneInput
                                {...field}
                                className="h-11"
                                showType={true}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Website
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="www.empresa.com.br"
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="contato@empresa.com.br"
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telefone
                            </FormLabel>
                            <FormControl>
                              <PhoneInput
                                {...field}
                                className="h-11"
                                showType={false}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Aba Localização */}
                  <TabsContent value="localizacao" className="space-y-6">
                    <div className="space-y-6">
                      {/* Campo CEP */}
                      <FormField
                        control={editForm.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              CEP
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  placeholder="00000-000"
                                  className="h-11 pr-20"
                                  maxLength={9}
                                  onChange={(e) => {
                                    // Formatação do CEP
                                    let value = e.target.value.replace(/\D/g, '');
                                    if (value.length > 5) {
                                      value = value.replace(/(\d{5})(\d)/, '$1-$2');
                                    }
                                    field.onChange(value);
                                    
                                    // Buscar endereço quando CEP completo
                                    if (value.replace(/\D/g, '').length === 8) {
                                      buscarEnderecoPorCep(value, editForm);
                                    }
                                  }}
                                />
                                {isLoadingCep && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              Digite o CEP para preenchimento automático do endereço
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <FormField
                        control={editForm.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Estado
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 text-left">
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {estadosBrasileiros.map((estado) => (
                                  <SelectItem key={estado} value={estado}>
                                    {estado}
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
                        name="cidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Cidade
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Digite a cidade"
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm font-medium">Endereço Completo</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Digite o endereço completo"
                                rows={3}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba Visual */}
                  <TabsContent value="visual" className="space-y-6">
                    <div className="space-y-6">
                      {/* Upload da Logo da Empresa */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={editForm.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Logo da Empresa
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-4">
                                  <div 
                                    className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                          try {
                                            const formData = new FormData();
                                            formData.append('logo', file);
                                            
                                            const response = await fetch(`/api/companies/${selectedCompanyForEdit.id}/upload-logo/principal`, {
                                              method: 'POST',
                                              body: formData
                                            });
                                            
                                            if (response.ok) {
                                              const result = await response.json();
                                              field.onChange(result.logoUrl);
                                              
                                              // Auto-extrair cores da logo
                                              const img = new Image();
                                              img.crossOrigin = 'anonymous';
                                              img.onload = () => extractColorsFromLogo(img);
                                              img.src = result.logoUrl;
                                              
                                              // Atualizar dados da empresa local
                                              setSelectedCompanyForEdit({
                                                ...selectedCompanyForEdit,
                                                logo: result.logoUrl
                                              });
                                              
                                              // Refresh da query para atualizar dados
                                              queryClient.invalidateQueries({ queryKey: ['/api/companies/user'] });
                                            }
                                          } catch (error) {
                                            console.error('Error uploading logo:', error);
                                          }
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    {field.value || selectedCompanyForEdit?.logo ? (
                                      <div className="relative w-full h-full group">
                                        <img
                                          src={field.value || selectedCompanyForEdit?.logo}
                                          alt="Logo Preview"
                                          className="w-full h-full object-contain"
                                          onLoad={(e) => {
                                            // Extract colors when logo loads
                                            if (selectedCompanyForEdit) {
                                              extractColorsFromLogo(e.currentTarget);
                                            }
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                            <Upload className="h-6 w-6 mx-auto mb-1" />
                                            <span className="text-xs">Alterar Logo</span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center text-gray-400">
                                        <Upload className="h-8 w-8 mx-auto mb-2" />
                                        <span className="text-sm font-medium">Clique para enviar logo</span>
                                        <p className="text-xs mt-1">PNG, JPG até 2MB</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={editForm.control}
                          name="logo_formato"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Formato da Logo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-11 text-left">
                                    <SelectValue placeholder="Selecione o formato da sua logo" />
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
                              <p className="text-xs text-gray-500 mt-1">
                                Informe o formato para otimizar a geração de artes
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Seção de Cores da Empresa */}
                      <div className="col-span-2 space-y-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Cores da Empresa
                          </h3>
                          
                          {extractedColors.length > 0 ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {extractedColors.map((color, index) => (
                                  <div key={index} className="space-y-2">
                                    <div 
                                      className="w-full h-16 rounded-lg border-2 border-gray-200 cursor-pointer relative group"
                                      style={{ backgroundColor: color }}
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'color';
                                        input.value = color;
                                        input.onchange = async (e) => {
                                          const newColor = (e.target as HTMLInputElement).value;
                                          const newColors = [...extractedColors];
                                          newColors[index] = newColor;
                                          setExtractedColors(newColors);
                                          
                                          // Salvar automaticamente no banco
                                          if (selectedCompanyForEdit) {
                                            try {
                                              const coresData = {
                                                'cor-1': newColors[0],
                                                'cor-2': newColors[1],
                                                'cor-3': newColors[2],
                                                'cor-4': newColors[3]
                                              };
                                              
                                              await fetch(`/api/companies/${selectedCompanyForEdit.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ cores: coresData })
                                              });
                                              
                                              console.log('Cor atualizada automaticamente');
                                            } catch (error) {
                                              console.error('Erro ao salvar cor:', error);
                                            }
                                          }
                                        };
                                        input.click();
                                      }}
                                    >
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                                          Alterar
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs font-mono text-gray-600">{color}</p>
                                      <Select 
                                        value={`cor-${index + 1}`}
                                        onValueChange={async (newPosition) => {
                                          const targetIndex = parseInt(newPosition.split('-')[1]) - 1;
                                          const newColors = [...extractedColors];
                                          const currentColor = newColors[index];
                                          const targetColor = newColors[targetIndex];
                                          
                                          // Trocar as cores de posição
                                          newColors[index] = targetColor;
                                          newColors[targetIndex] = currentColor;
                                          setExtractedColors(newColors);
                                          
                                          // Salvar automaticamente no banco
                                          if (selectedCompanyForEdit) {
                                            try {
                                              const coresData = {
                                                'cor-1': newColors[0],
                                                'cor-2': newColors[1],
                                                'cor-3': newColors[2],
                                                'cor-4': newColors[3]
                                              };
                                              
                                              await fetch(`/api/companies/${selectedCompanyForEdit.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ cores: coresData })
                                              });
                                              
                                              console.log('Ordem das cores atualizada automaticamente');
                                            } catch (error) {
                                              console.error('Erro ao salvar ordem das cores:', error);
                                            }
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="cor-1">Cor 1</SelectItem>
                                          <SelectItem value="cor-2">Cor 2</SelectItem>
                                          <SelectItem value="cor-3">Cor 3</SelectItem>
                                          <SelectItem value="cor-4">Cor 4</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between pt-2 border-t">
                                <p className="text-sm text-gray-600">
                                  Clique nas cores para alterar ou use o dropdown para reordenar
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    // Randomizar ordem das cores
                                    const shuffled = [...extractedColors].sort(() => Math.random() - 0.5);
                                    setExtractedColors(shuffled);
                                    
                                    // Salvar automaticamente no banco
                                    if (selectedCompanyForEdit) {
                                      try {
                                        const coresData = {
                                          'cor-1': shuffled[0],
                                          'cor-2': shuffled[1],
                                          'cor-3': shuffled[2],
                                          'cor-4': shuffled[3]
                                        };
                                        
                                        await fetch(`/api/companies/${selectedCompanyForEdit.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ cores: coresData })
                                        });
                                        
                                        console.log('Cores embaralhadas e salvas automaticamente');
                                      } catch (error) {
                                        console.error('Erro ao salvar cores embaralhadas:', error);
                                      }
                                    }
                                  }}
                                >
                                  Embaralhar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 mb-2">Nenhuma cor extraída ainda</p>
                              <p className="text-sm text-gray-400">
                                Faça upload de uma logo para extrair cores automaticamente
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium mb-1">
                            💡 Como usar as cores
                          </p>
                          <p className="text-xs text-blue-700">
                            • As cores são extraídas automaticamente da logo<br/>
                            • Clique em qualquer cor para alterá-la manualmente<br/>
                            • Use o dropdown para reordenar as cores por prioridade<br/>
                            • Cor 1 e 2 são as principais, Cor 3 e 4 são secundárias
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba Marketing */}
                  <TabsContent value="marketing" className="space-y-6">
                    <div className="space-y-6">
                      <FormField
                        control={editForm.control}
                        name="rodape"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Rodapé/Assinatura</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={4}
                                placeholder="Texto que aparecerá no rodapé das suas artes"
                                className="resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="hashtag"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Hashtags</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder="#minhaempresa #marketing #negocio"
                                className="resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setSelectedCompanyForEdit(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Gerenciamento de Usuários */}
      <Dialog open={!!selectedCompanyForUsers} onOpenChange={() => setSelectedCompanyForUsers(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuários - {selectedCompanyForUsers?.nome}</DialogTitle>
            <DialogDescription>
              Adicione ou remova usuários desta empresa.
            </DialogDescription>
          </DialogHeader>
          {selectedCompanyForUsers && (
            <CompanyUsersManager 
              empresaId={selectedCompanyForUsers.id}
              empresaNome={selectedCompanyForUsers.nome}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
