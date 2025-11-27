import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useCompany } from '@/hooks/use-company';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AiDesignAssistant } from '@/components/ai-design-assistant';
import { WelcomeBanner } from '@/components/welcome-banner';
import {
  Image,
  FileImage,
  Coins,
  Download,
  TrendingUp,
  Plus,
  Upload,
  Palette,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { company } = useCompany(user?.id || '');

  // Get real dashboard stats from API
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/companies', company?.id, 'stats'],
    queryFn: async () => {
      if (!company?.id) return null;
      const response = await fetch(`/api/companies/${company.id}/stats`);
      return response.ok ? response.json() : null;
    },
    enabled: !!company?.id,
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates?limit=4');
      return response.ok ? response.json() : [];
    },
  });

  // Use real stats or show loading
  const dashboardStats = stats || {
    totalArts: 0,
    templatesUsed: 0,
    creditsRemaining: 0,
    downloads: 0,
    currentMonthArts: 0
  };

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Bem-vindo de volta! Vamos criar algo incrível hoje."
    >
      {/* Welcome Banner */}
      <WelcomeBanner />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Artes Criadas</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  {statsLoading ? '...' : dashboardStats.totalArts}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Image className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">{statsLoading ? '...' : dashboardStats.currentMonthArts}</span>
              <span className="text-slate-600 ml-1">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Templates Usados</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  {statsLoading ? '...' : dashboardStats.templatesUsed}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <FileImage className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-slate-600 ml-1">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Créditos Restantes</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  {statsLoading ? '...' : dashboardStats.creditsRemaining.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Coins className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {statsLoading ? (
                <span className="text-slate-600">Carregando...</span>
              ) : dashboardStats.creditsRemaining < 100 ? (
                <>
                  <span className="text-red-500">⚠️ Poucos créditos</span>
                  <span className="text-slate-600 ml-1">restantes</span>
                </>
              ) : (
                <>
                  <span className="text-green-500">✓ Créditos</span>
                  <span className="text-slate-600 ml-1">disponíveis</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Downloads</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  {statsLoading ? '...' : dashboardStats.downloads}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Download className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+15%</span>
              <span className="text-slate-600 ml-1">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>Assistente de IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Crie conteúdo personalizado com nosso assistente de IA</p>
                <Link href="/ai-assistant">
                  <Button style={{ backgroundColor: '#2094f3' }} className="hover:bg-blue-600 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Abrir Assistente de IA
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Selecione uma empresa para usar o assistente de IA</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
