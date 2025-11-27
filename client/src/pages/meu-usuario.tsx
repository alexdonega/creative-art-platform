import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Save, Key, Loader2, Settings } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { authService } from '@/lib/auth';
import { Usuarios, User } from '@shared/schema';
import { formatPhone, unformatPhone } from '@/lib/phone-formatter';

interface UserProfileResponse {
  user: User;
  company?: any;
  userData?: Usuarios;
}

export default function MeuUsuario() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { resetOnboarding } = useOnboarding();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });



  // Fetch user profile data from database
  const { data: userProfile, isLoading: isLoadingUser } = useQuery<UserProfileResponse>({
    queryKey: ['/api/auth/user-profile'],
    enabled: !!user?.id,
  });

  // Update profile data when user data is loaded
  useEffect(() => {
    if (userProfile?.user) {
      setProfileData({
        name: userProfile.user.nome || '',
        email: user?.email || '',
        phone: formatPhone(userProfile.userData?.telefone || ''),
      });
    }
  }, [userProfile, user?.email]);

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { nome: string; telefone: string }) => {
      if (!user?.id) throw new Error('User ID not found');
      
      // Update user name in users table
      await apiRequest('PUT', `/api/auth/users/${user.id}`, {
        nome: data.nome,
      });
      
      // Update or create phone and name in usuarios table
      if (userProfile?.userData) {
        // Update existing usuarios record with both name and phone
        await apiRequest('PUT', `/api/users/${userProfile.userData.id}`, {
          nome: data.nome,
          telefone: data.telefone,
        });
      } else {
        // Create new usuarios record if doesn't exist - need empresa_id
        const company = userProfile?.company;
        if (company) {
          await apiRequest('POST', '/api/users', {
            user_id: user.id,
            empresa_id: company.id,
            nome: data.nome,
            telefone: data.telefone,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user-profile'] });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return authService.updatePassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      console.error('Error changing password:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar a senha. Verifique sua senha atual.",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    updateProfileMutation.mutate({
      nome: profileData.name,
      telefone: unformatPhone(profileData.phone), // Clean phone number for storage
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout
      title="Meu Usuário"
      subtitle="Gerencie suas informações pessoais e configurações da conta"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUser ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando dados do usuário...</span>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    required
                    disabled
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <PhoneInput
                    id="phone"
                    value={profileData.phone}
                    onChange={(value) => handleProfileChange('phone', value)}
                    showType={true}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Digite sua senha atual"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua nova senha"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                variant="outline" 
                className="w-full"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>

            {/* Onboarding Reset */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Configuração da Conta</h3>
              <p className="text-sm text-gray-600 mb-4">
                Refaça o processo de configuração inicial da sua conta e empresa.
              </p>
              <Button 
                onClick={resetOnboarding}
                variant="outline" 
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Refazer Configuração Inicial
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
