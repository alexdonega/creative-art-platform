export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export class AuthService {
  async signUp(email: string, password: string) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar conta');
    }

    return response.json();
  }

  async signIn(email: string, password: string) {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer login');
    }

    return response.json();
  }

  async signOut() {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer logout');
    }

    // Não recarregar a página, deixar o roteamento gerenciar
    return response.json();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar senha');
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    // Implementação simples para verificar o estado de autenticação
    const checkAuth = async () => {
      const user = await this.getCurrentUser();
      callback(user);
    };

    checkAuth();
    
    // Retornar função de cleanup
    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }
}

export const authService = new AuthService();
