import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useUserCompanies } from '@/hooks/use-user-companies';
import { Download, Image as ImageIcon, Archive, ArchiveRestore, Copy, Check, Building2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Artes() {
  const { user } = useAuth();
  const { companies, selectedCompany, selectCompany } = useUserCompanies(user?.id || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedIds, setCopiedIds] = useState<Set<number>>(new Set());
  
  // Usar a empresa selecionada
  const activeCompany = selectedCompany;

  const { data: arts, isLoading } = useQuery({
    queryKey: ['/api/arts/by-company', activeCompany?.id],
    queryFn: async () => {
      if (!activeCompany?.id) return [];
      const response = await fetch(`/api/arts/by-company/${activeCompany.id}`);
      return response.ok ? await response.json() : [];
    },
    enabled: !!activeCompany?.id,
  });

  const { data: archivedArts, isLoading: isLoadingArchived } = useQuery({
    queryKey: ['/api/arts/archived', activeCompany?.id],
    queryFn: async () => {
      if (!activeCompany?.id) return [];
      const response = await fetch(`/api/arts/archived/${activeCompany.id}`);
      return response.ok ? await response.json() : [];
    },
    enabled: !!activeCompany?.id,
  });

  // Archive art mutation
  const archiveArtMutation = useMutation({
    mutationFn: async (artId: number) => {
      return apiRequest('PATCH', `/api/arts/${artId}/archive`, {});
    },
    onSuccess: () => {
      toast({
        title: "Arte arquivada!",
        description: "A arte foi arquivada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/arts/by-company', activeCompany?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/arts/archived', activeCompany?.id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao arquivar arte",
        description: "Não foi possível arquivar a arte. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Unarchive art mutation
  const unarchiveArtMutation = useMutation({
    mutationFn: async (artId: number) => {
      return apiRequest('PATCH', `/api/arts/${artId}/unarchive`, {});
    },
    onSuccess: () => {
      toast({
        title: "Arte restaurada!",
        description: "A arte foi restaurada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/arts/by-company', activeCompany?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/arts/archived', activeCompany?.id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao restaurar arte",
        description: "Não foi possível restaurar a arte. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDownload = async (art: any) => {
    if (art.link) {
      try {
        const response = await fetch(art.link);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arte-${art.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading art:', error);
      }
    }
  };

  const handleArchive = (artId: number) => {
    archiveArtMutation.mutate(artId);
  };

  const handleUnarchive = (artId: number) => {
    unarchiveArtMutation.mutate(artId);
  };

  const handleCopyText = async (text: string, artId: number) => {
    if (!text) {
      toast({
        title: "Texto não disponível",
        description: "Esta arte não possui texto de apoio.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIds(prev => new Set([...prev, artId]));
      
      toast({
        title: "Texto copiado!",
        description: "O texto de apoio foi copiado para a área de transferência.",
      });

      // Remove do estado após 2 segundos
      setTimeout(() => {
        setCopiedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(artId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const renderArtsGrid = (artsList: any[], isLoading: boolean, isArchived: boolean = false) => {
    if (isLoading) {
      return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse break-inside-avoid mb-6">
              <CardContent className="p-4">
                <div className="aspect-square bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (artsList?.length === 0) {
      return (
        <div className="text-center py-16">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {isArchived ? 'Nenhuma arte arquivada' : 'Nenhuma arte criada ainda'}
          </h3>
          <p className="text-slate-600 mb-4">
            {isArchived 
              ? 'As artes arquivadas aparecerão aqui.'
              : 'Comece criando sua primeira arte usando os templates disponíveis.'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {artsList?.map((art: any) => (
          <Card key={art.id} className="hover:shadow-lg transition-shadow break-inside-avoid mb-6">
            <CardContent className="p-4">
              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-4 relative group">
                {art.link ? (
                  <img
                    src={art.link}
                    alt={`Arte ${art.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(art)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                    {isArchived ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchive(art.id)}
                        disabled={unarchiveArtMutation.isPending}
                      >
                        <ArchiveRestore className="h-4 w-4 mr-1" />
                        Restaurar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(art.id)}
                        disabled={archiveArtMutation.isPending}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Arquivar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium text-slate-800 mb-1">
                  Arte #{art.id}
                </h3>
                <p className="text-sm text-slate-600">
                  Criada em {new Date(art.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Texto de apoio */}
              {art.texto_apoio && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Texto de apoio:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText(art.texto_apoio, art.id)}
                      className="h-6 px-2"
                    >
                      {copiedIds.has(art.id) ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {art.texto_apoio}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  {art.width}x{art.height}px
                </span>
                <span className="text-xs text-slate-500">
                  2.3 MB
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainLayout
      title="Minhas Artes"
      subtitle="Visualize e faça download das artes que você criou"
    >


      {!activeCompany ? (
        <div className="text-center py-16">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Selecione uma empresa
          </h3>
          <p className="text-slate-600">
            Você precisa selecionar uma empresa para ver suas artes.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Artes Ativas</TabsTrigger>
            <TabsTrigger value="archived">Artes Arquivadas</TabsTrigger>
          </TabsList>
        
          <TabsContent value="active" className="mt-6">
            {renderArtsGrid(arts, isLoading, false)}
          </TabsContent>
          
          <TabsContent value="archived" className="mt-6">
            {renderArtsGrid(archivedArts, isLoadingArchived, true)}
          </TabsContent>
        </Tabs>
      )}
    </MainLayout>
  );
}
