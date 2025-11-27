import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Empresas from "@/pages/empresas";
import Templates from "@/pages/templates";
import Artes from "@/pages/artes";
import MinhaEmpresa from "@/pages/minha-empresa";
import MeuUsuario from "@/pages/meu-usuario";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AiAssistant from "@/pages/ai-assistant";
import AdminMaster from "@/pages/admin-master";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPlanos from "@/pages/admin/planos";
import AdminCategorias from "@/pages/admin/categorias";
import AdminTemplates from "@/pages/admin/templates";
import AdminEmpresas from "@/pages/admin/empresas";
import AdminUsuarios from "@/pages/admin/usuarios";
import AdminArtes from "@/pages/admin/artes";
import AdminN8n from "@/pages/admin/n8n";
import AdminUploads from "@/pages/admin/uploads";
import AtivosDigitais from "@/pages/ativos-digitais";
import ProdutosServicos from "@/pages/produtos-servicos";
import AdminProdutosServicos from "@/pages/admin/produtos-servicos";

// Component to handle root path redirection based on user type
function HomeRedirect() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (user) {
      // Check if user is admin master and redirect accordingly
      if (user.email === 'admin@admin.com') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
    }
  }, [user, setLocation]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isConnected } = useWebSocket();
  const { showOnboarding, isChecking, completeOnboarding, skipOnboarding } = useOnboarding();

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
          </>
        ) : (
          <>
            <Route path="/" component={HomeRedirect} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/empresas" component={Empresas} />
            <Route path="/templates" component={Templates} />
            <Route path="/artes" component={Artes} />
            <Route path="/minha-empresa" component={MinhaEmpresa} />
            <Route path="/meu-usuario" component={MeuUsuario} />
            <Route path="/ai-assistant" component={AiAssistant} />
            <Route path="/ativos-digitais" component={AtivosDigitais} />
            <Route path="/produtos-servicos" component={ProdutosServicos} />
            <Route path="/admin-master" component={AdminMaster} />
            <Route path="/admin" component={AdminMaster} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/planos" component={AdminPlanos} />
            <Route path="/admin/segmentos" component={AdminCategorias} />
            <Route path="/admin/produtos-servicos" component={AdminProdutosServicos} />
            <Route path="/admin/templates" component={AdminTemplates} />
            <Route path="/admin/empresas" component={AdminEmpresas} />
            <Route path="/admin/usuarios" component={AdminUsuarios} />
            <Route path="/admin/artes" component={AdminArtes} />
            <Route path="/admin/uploads" component={AdminUploads} />
            <Route path="/admin/n8n" component={AdminN8n} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {/* Onboarding Flow */}
      {showOnboarding && isAuthenticated && (
        <OnboardingFlow
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
