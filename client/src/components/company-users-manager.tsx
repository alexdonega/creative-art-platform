import { useState } from 'react';
import { useCompanyUsers } from '@/hooks/use-user-companies';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Shield, User, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CompanyUsersManagerProps {
  empresaId: number;
  empresaNome: string;
}

const roleLabels = {
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador'
};

const roleIcons = {
  admin: Shield,
  member: User,
  viewer: Eye
};

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  member: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  aceito: 'Ativo',
  pendente: 'Aguardando aceitar convite',
  rejeitado: 'Rejeitado'
};

const statusColors = {
  aceito: 'bg-green-100 text-green-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  rejeitado: 'bg-red-100 text-red-800'
};

export default function CompanyUsersManager({ empresaId, empresaNome }: CompanyUsersManagerProps) {
  const { users, isLoading, addUser, updateUserRole, removeUser, isAddingUser, isUpdatingUserRole, isRemovingUser } = useCompanyUsers(empresaId);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('member');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, try to find the user by email
      const userResponse = await fetch(`/api/users/by-email/${encodeURIComponent(newUserEmail)}`, {
        credentials: 'include'
      });
      
      let user;
      let isNewUser = false;
      
      if (userResponse.ok) {
        // User exists
        user = await userResponse.json();
      } else if (userResponse.status === 404) {
        // User doesn't exist, create new user
        isNewUser = true;
        const createUserResponse = await fetch('/api/users/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: newUserEmail,
            empresaId: empresaId,
            role: newUserRole
          })
        });
        
        if (!createUserResponse.ok) {
          const error = await createUserResponse.json();
          toast({
            title: "Erro",
            description: error.message || "Erro ao criar e convidar usuário",
            variant: "destructive",
          });
          return;
        }
        
        user = await createUserResponse.json();
      } else {
        throw new Error('Erro ao verificar usuário');
      }
      
      if (!isNewUser) {
        // Add existing user to company
        addUser({ user_id: user.id, role: newUserRole });
      } else {
        // For new users, invalidate and refetch the users list
        queryClient.invalidateQueries({ queryKey: ['/api/companies', empresaId, 'users'] });
      }
      
      setNewUserEmail('');
      setNewUserRole('member');
      setIsAddUserDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: isNewUser 
          ? "Usuário criado e convite enviado por email"
          : "Usuário adicionado à empresa",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar usuário",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = (userId: string, newRole: string) => {
    updateUserRole({ userId, role: newRole });
    toast({
      title: "Sucesso",
      description: "Função do usuário atualizada",
    });
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm('Tem certeza que deseja remover este usuário da empresa?')) {
      removeUser(userId);
      toast({
        title: "Sucesso",
        description: "Usuário removido da empresa",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usuários da Empresa: {empresaNome}</CardTitle>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email do Usuário</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="cancel" onClick={() => setIsAddUserDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUser} disabled={isAddingUser}>
                    {isAddingUser ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((userCompany) => {
              const RoleIcon = roleIcons[userCompany.role as keyof typeof roleIcons] || User;
              
              return (
                <div key={userCompany.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={userCompany.user_avatar_url || ''} alt={userCompany.user_nome || ''} />
                      <AvatarFallback>
                        {userCompany.user_nome ? userCompany.user_nome.split(' ').map(n => n[0]).join('').toUpperCase() : userCompany.user_email?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userCompany.user_nome || userCompany.user_email || userCompany.user_id}</p>
                      <p className="text-sm text-gray-500">{userCompany.user_email}</p>
                      <p className="text-xs text-gray-400">
                        Adicionado em {new Date(userCompany.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[userCompany.status as keyof typeof statusColors]}>
                      {statusLabels[userCompany.status as keyof typeof statusLabels]}
                    </Badge>
                    <Select
                      value={userCompany.role}
                      onValueChange={(newRole) => handleUpdateRole(userCompany.user_id, newRole)}
                      disabled={isUpdatingUserRole}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveUser(userCompany.user_id)}
                      disabled={isRemovingUser}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}