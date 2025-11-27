import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useUserCompanies } from '@/hooks/use-user-companies';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  Sparkles,
  Building,
  FileImage,
  Users,
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react';

interface WelcomeBannerProps {
  onDismiss?: () => void;
}

export function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const { user } = useAuth();
  const { companies, isLoading } = useUserCompanies(user?.id || '');
  const { resetOnboarding } = useOnboarding();

  if (isLoading) return null;

  const hasCompanies = companies && companies.length > 0;
  const isNewUser = !localStorage.getItem(`welcome_dismissed_${user?.id}`);

  // Don't show banner if user has companies and has dismissed it
  if (hasCompanies && !isNewUser) return null;

  const handleDismiss = () => {
    if (user?.id) {
      localStorage.setItem(`welcome_dismissed_${user.id}`, 'true');
    }
    onDismiss?.();
  };

  const handleStartOnboarding = () => {
    resetOnboarding();
    handleDismiss();
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {hasCompanies ? 'Bem-vindo de volta!' : 'Bem-vindo ao ArteGenius!'}
              </h3>
              <p className="text-muted-foreground">
                {hasCompanies 
                  ? 'Continue criando artes incríveis para sua empresa'
                  : 'Vamos configurar sua conta e criar sua primeira arte'
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!hasCompanies && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background/50">
              <Building className="h-3 w-3 mr-1" />
              Configurar Empresa
            </Badge>
            <Badge variant="outline" className="bg-background/50">
              <FileImage className="h-3 w-3 mr-1" />
              Escolher Template
            </Badge>
            <Badge variant="outline" className="bg-background/50">
              <Sparkles className="h-3 w-3 mr-1" />
              Criar Arte
            </Badge>
          </div>
        )}

        <div className="mt-4 flex items-center space-x-3">
          {!hasCompanies ? (
            <Button
              onClick={handleStartOnboarding}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Começar Configuração
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-accent">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Conta configurada</span>
              </div>
              <Button
                onClick={handleStartOnboarding}
                variant="outline"
                size="sm"
              >
                Refazer Configuração
              </Button>
            </div>
          )}
        </div>

        {!hasCompanies && (
          <div className="mt-4 pt-4 border-t border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <span className="text-sm text-muted-foreground">Configure sua empresa</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <span className="text-sm text-muted-foreground">Escolha um template</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">3</span>
                </div>
                <span className="text-sm text-muted-foreground">Crie sua primeira arte</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}