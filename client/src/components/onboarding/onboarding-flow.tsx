import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Building,
  Palette,
  FileImage,
  Sparkles,
  Upload,
  Eye,
  Target,
  Zap,
  Users,
  TrendingUp,
  X
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  categoria: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  credito: number;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    segmento: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    credito: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/segmentos'],
    queryFn: async () => {
      const response = await apiRequest('/api/segmentos');
      return response.json();
    }
  });

  // Fetch templates for preview
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await apiRequest('/api/templates?limit=6');
      return response.json();
    }
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const response = await apiRequest('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (company) => {
      toast({
        title: "Empresa criada com sucesso!",
        description: `${company.name} foi configurada e está pronta para uso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      onComplete();
      setLocation('/');
    },
    onError: (error) => {
      console.error('Error creating company:', error);
      toast({
        title: "Erro ao criar empresa",
        description: "Não foi possível criar a empresa. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao ArteGenius!',
      description: 'Vamos configurar sua conta em poucos passos simples',
      icon: <Sparkles className="h-6 w-6" />,
      completed: currentStep > 0
    },
    {
      id: 'company-info',
      title: 'Informações da Empresa',
      description: 'Configure os dados básicos da sua empresa',
      icon: <Building className="h-6 w-6" />,
      completed: currentStep > 1
    },
    {
      id: 'branding',
      title: 'Identidade Visual',
      description: 'Defina as cores e visual da sua marca',
      icon: <Palette className="h-6 w-6" />,
      completed: currentStep > 2
    },
    {
      id: 'templates',
      title: 'Explore Templates',
      description: 'Conheça nossos templates disponíveis',
      icon: <FileImage className="h-6 w-6" />,
      completed: currentStep > 3
    },
    {
      id: 'complete',
      title: 'Tudo Pronto!',
      description: 'Sua conta está configurada e pronta para uso',
      icon: <CheckCircle className="h-6 w-6" />,
      completed: currentStep > 4
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompanySubmit = async () => {
    if (!companyData.name || !companyData.email || !companyData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, email e categoria da empresa.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCompanyMutation.mutateAsync(companyData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bem-vindo ao ArteGenius!
              </h2>
              <p className="text-gray-600 text-lg">
                A plataforma de criação de artes visuais mais inteligente do mercado
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Templates Personalizados</h3>
                <p className="text-sm text-gray-600">Centenas de templates para cada tipo de negócio</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">IA Inteligente</h3>
                <p className="text-sm text-gray-600">Sugestões automáticas baseadas na sua marca</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Resultados Profissionais</h3>
                <p className="text-sm text-gray-600">Artes de alta qualidade em poucos cliques</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Informações da Empresa
              </h2>
              <p className="text-gray-600">
                Configure os dados básicos da sua empresa
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Nome da Empresa *</Label>
                <Input
                  id="company-name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  placeholder="Ex: Minha Empresa Ltda"
                />
              </div>
              <div>
                <Label htmlFor="company-email">Email *</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                  placeholder="contato@minhaempresa.com"
                />
              </div>
              <div>
                <Label htmlFor="company-phone">Telefone</Label>
                <Input
                  id="company-phone"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="company-website">Website</Label>
                <Input
                  id="company-website"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                  placeholder="https://minhaempresa.com"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="company-segmento">Segmento *</Label>
                <Select
                  value={companyData.segmento}
                  onValueChange={(value) => setCompanyData({...companyData, segmento: value})}
                >
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Selecione o segmento da empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="company-description">Descrição</Label>
                <Textarea
                  id="company-description"
                  value={companyData.description}
                  onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                  placeholder="Descreva sua empresa e seus serviços..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Palette className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Identidade Visual
              </h2>
              <p className="text-gray-600">
                Defina as cores principais da sua marca
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="primary-color">Cor Primária</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={companyData.primary_color}
                    onChange={(e) => setCompanyData({...companyData, primary_color: e.target.value})}
                    className="w-20 h-10"
                  />
                  <Input
                    value={companyData.primary_color}
                    onChange={(e) => setCompanyData({...companyData, primary_color: e.target.value})}
                    placeholder="#3B82F6"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Cor principal da sua marca, usada em destaque
                </p>
              </div>
              <div>
                <Label htmlFor="secondary-color">Cor Secundária</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={companyData.secondary_color}
                    onChange={(e) => setCompanyData({...companyData, secondary_color: e.target.value})}
                    className="w-20 h-10"
                  />
                  <Input
                    value={companyData.secondary_color}
                    onChange={(e) => setCompanyData({...companyData, secondary_color: e.target.value})}
                    placeholder="#10B981"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Cor complementar, usada para apoiar a primária
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Label>Prévia das Cores</Label>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div
                      className="w-full h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: companyData.primary_color }}
                    >
                      Cor Primária
                    </div>
                    <p className="text-sm text-gray-600">{companyData.primary_color}</p>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-full h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: companyData.secondary_color }}
                    >
                      Cor Secundária
                    </div>
                    <p className="text-sm text-gray-600">{companyData.secondary_color}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileImage className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Explore Nossos Templates
              </h2>
              <p className="text-gray-600">
                Conheça alguns dos templates disponíveis na plataforma
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.slice(0, 6).map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {template.width} x {template.height}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {template.segmento_nome || 'Geral'}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                Mais de 100 templates disponíveis!
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Após finalizar o onboarding, você terá acesso a todos os templates organizados por categoria
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tudo Pronto!
              </h2>
              <p className="text-gray-600 text-lg">
                Sua conta está configurada e pronta para uso
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Próximos Passos:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Explore os templates disponíveis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Crie sua primeira arte
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Use o assistente de IA para sugestões de design
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Gerencie sua equipe (se necessário)
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleCompanySubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar Configuração'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configuração da Conta
              </h1>
              <p className="text-gray-600">
                Passo {currentStep + 1} de {steps.length}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors duration-200"
            >
              <X className="h-4 w-4 mr-1" />
              Pular
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step Navigation */}
          <div className="mt-4 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:text-slate-700 disabled:hover:border-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex space-x-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 && (!companyData.name || !companyData.email || !companyData.categoria)}
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCompanySubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Finalizando...' : 'Finalizar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}