import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useCompany } from '@/hooks/use-company';
import { useUserCompanies } from '@/hooks/use-user-companies';
import {
  LayoutDashboard,
  FileImage,
  Image,
  Building,
  User,
  Palette,
  X,
  Menu,
  Plus,
  Coins,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
  Users,
  CreditCard,
  FileText,
  Package,
  Workflow,
  Globe,
  Upload,
  ShoppingBag,
} from 'lucide-react';

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { company } = useCompany(user?.id || '');
  const { companies, selectedCompany, selectCompany, isLoading: companiesLoading } = useUserCompanies(user?.id || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  });

  // Salva o estado colapsado no localStorage
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
  };

  // Salva a empresa selecionada no localStorage
  const handleCompanyChange = (companyId: string) => {
    const company = companies?.find((c: any) => c.id.toString() === companyId);
    if (company) {
      selectCompany(company);
    }
  };

  // Define se é admin master
  const isAdminMaster = user?.email === 'admin@admin.com';

  // Menu para admin master
  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/planos', label: 'Planos', icon: CreditCard },
    { href: '/admin/segmentos', label: 'Segmentos', icon: Package },
    { href: '/admin/produtos-servicos', label: 'Produtos/Serviços', icon: ShoppingBag },
    { href: '/admin/empresas', label: 'Empresas', icon: Building },
    { href: '/admin/usuarios', label: 'Usuários', icon: Users },
    { href: '/admin/templates', label: 'Templates', icon: FileText },
    { href: '/admin/uploads', label: 'Uploads', icon: Upload },
    { href: '/admin/n8n', label: 'N8N', icon: Workflow },
  ];

  // Menu para usuário padrão
  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/templates', label: 'Templates', icon: FileImage },
    { href: '/artes', label: 'Artes', icon: Image },
    { href: '/ai-assistant', label: 'Assistente de IA', icon: Palette },
    { href: '/produtos-servicos', label: 'Produtos e Serviços', icon: ShoppingBag },
    { href: '/ativos-digitais', label: 'Ativos Digitais', icon: Globe },
    { href: '/empresas', label: 'Empresas', icon: Building },
    { href: '/meu-usuario', label: 'Meu Perfil', icon: User },
  ];

  const navItems = isAdminMaster ? adminNavItems : userNavItems;

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out z-50",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Palette className="h-4 w-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-semibold text-slate-800">
                  ArtGen
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Collapse button only visible for admin master users */}
              {isAdminMaster && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex"
                  onClick={toggleCollapse}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center" : "space-x-3",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Credits */}
          <div className="p-4 border-t border-slate-200">
            {!isCollapsed && (
              <>
                {/* Seletor de Empresa - Apenas para usuários não admin */}
                {!isAdminMaster && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                      Empresa Ativa
                    </label>
                    <Select 
                      value={selectedCompany?.id.toString() || ''} 
                      onValueChange={handleCompanyChange}
                    >
                      <SelectTrigger className="w-full hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600 transition-colors duration-200 cursor-pointer">
                        <SelectValue placeholder="Selecione uma empresa">
                          {selectedCompany && (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                {selectedCompany.logo ? (
                                  <img 
                                    src={selectedCompany.logo} 
                                    alt={selectedCompany.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Building className="h-3 w-3 text-slate-500" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-slate-700 truncate">
                                {selectedCompany.nome}
                              </span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {companiesLoading ? (
                          <SelectItem value="loading" disabled>
                            Carregando...
                          </SelectItem>
                        ) : (
                          companies?.map((company: any) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                  {company.logo ? (
                                    <img 
                                      src={company.logo} 
                                      alt={company.nome}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Building className="h-3 w-3 text-slate-500" />
                                  )}
                                </div>
                                <span className="text-sm font-medium">{company.nome}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors duration-200"
                  onClick={handleSignOut}
                >
                  Sair
                </Button>
              </>
            )}
            
            {isCollapsed && (
              <div className="flex flex-col space-y-2">
                {/* Empresa Ativa - Versão Colapsada - Apenas para usuários não admin */}
                {!isAdminMaster && selectedCompany && (
                  <div className="flex justify-center mb-2">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-slate-200"
                      title={selectedCompany.nome}
                    >
                      {selectedCompany.logo ? (
                        <img 
                          src={selectedCompany.logo} 
                          alt={selectedCompany.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors duration-200"
                  onClick={handleSignOut}
                  title="Sair"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
