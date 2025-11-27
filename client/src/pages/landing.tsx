import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Palette, Zap, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ArteGenius</h1>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="outline">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Cadastrar
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Crie artes visuais <span className="text-blue-600">profissionais</span> em minutos
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transforme seus templates em artes personalizadas com a identidade da sua empresa. 
              Rápido, fácil e profissional.
            </p>
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Palette className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Templates Profissionais</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acesse centenas de templates criados por designers profissionais
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Zap className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Geração Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Crie suas artes em segundos com a identidade visual da sua empresa
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Multi-empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gerencie múltiplas empresas e usuários em uma única plataforma
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-600">
        <p>&copy; 2024 ArteGenius. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}