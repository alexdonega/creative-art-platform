import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Sparkles, 
  Palette, 
  Layout, 
  Type, 
  Zap,
  ThumbsUp,
  ThumbsDown,
  Check,
  Loader2,
  Lightbulb,
  Target,
  TrendingUp,
  Eye
} from 'lucide-react';

interface AiSuggestion {
  id: number;
  suggestion_type: 'color' | 'layout' | 'content' | 'branding';
  suggestion_data: any;
  confidence_score: number;
  applied: boolean;
  user_feedback?: string;
  title: string;
  description: string;
  reasoning: string;
}

interface AiDesignAssistantProps {
  empresaId: number;
  templateId?: number;
}

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'color': return <Palette className="h-5 w-5" />;
    case 'layout': return <Layout className="h-5 w-5" />;
    case 'content': return <Type className="h-5 w-5" />;
    case 'branding': return <Sparkles className="h-5 w-5" />;
    default: return <Lightbulb className="h-5 w-5" />;
  }
};

const getSuggestionColor = (type: string) => {
  switch (type) {
    case 'color': return 'bg-purple-100 text-purple-800';
    case 'layout': return 'bg-blue-100 text-blue-800';
    case 'content': return 'bg-green-100 text-green-800';
    case 'branding': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'color': return 'Cores';
    case 'layout': return 'Layout';
    case 'content': return 'Conteúdo';
    case 'branding': return 'Marca';
    default: return 'Geral';
  }
};

export function AiDesignAssistant({ empresaId, templateId }: AiDesignAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing suggestions
  const { data: suggestions = [], isLoading } = useQuery<AiSuggestion[]>({
    queryKey: ['ai-suggestions', empresaId],
    queryFn: async () => {
      const response = await apiRequest(`/api/ai-suggestions/empresa/${empresaId}`);
      return response.json();
    },
    enabled: !!empresaId,
  });

  // Generate new suggestions
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/ai-suggestions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, templateId }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-suggestions', empresaId], data);
      toast({
        title: "Sugestões geradas!",
        description: `${data.length} novas sugestões de design foram criadas.`,
      });
    },
    onError: (error) => {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Erro ao gerar sugestões",
        description: "Não foi possível gerar novas sugestões. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Apply suggestion
  const applyMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      const response = await apiRequest(`/api/ai-suggestions/${suggestionId}/apply`, {
        method: 'PATCH',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', empresaId] });
      toast({
        title: "Sugestão aplicada!",
        description: "A sugestão foi marcada como aplicada.",
      });
    },
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ suggestionId, feedback }: { suggestionId: number; feedback: string }) => {
      const response = await apiRequest(`/api/ai-suggestions/${suggestionId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', empresaId] });
      toast({
        title: "Feedback enviado!",
        description: "Obrigado pelo seu feedback.",
      });
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (suggestionId: number) => {
    applyMutation.mutate(suggestionId);
  };

  const handleFeedback = (suggestionId: number, feedback: string) => {
    feedbackMutation.mutate({ suggestionId, feedback });
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.suggestion_type]) {
      acc[suggestion.suggestion_type] = [];
    }
    acc[suggestion.suggestion_type].push(suggestion);
    return acc;
  }, {} as Record<string, AiSuggestion[]>);

  const renderSuggestionContent = (suggestion: AiSuggestion) => {
    const data = suggestion.suggestion_data;

    switch (suggestion.suggestion_type) {
      case 'color':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center space-y-1">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: data.primary }}
                />
                <span className="text-xs text-gray-600">Principal</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: data.secondary }}
                />
                <span className="text-xs text-gray-600">Secundária</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: data.accent }}
                />
                <span className="text-xs text-gray-600">Destaque</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: data.background }}
                />
                <span className="text-xs text-gray-600">Fundo</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{data.reasoning}</p>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Títulos sugeridos:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {data.headlines?.slice(0, 3).map((headline: string, index: number) => (
                  <li key={index}>{headline}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Chamadas para ação:</h4>
              <div className="flex flex-wrap gap-2">
                {data.callToActions?.slice(0, 3).map((cta: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {cta}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Posicionamento do logo:</h4>
              <p className="text-sm text-gray-600">{data.logoPlacement}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Elementos da marca:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {data.brandElements?.slice(0, 3).map((element: string, index: number) => (
                  <li key={index}>{element}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Composição:</h4>
              <p className="text-sm text-gray-600">{data.composition}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Hierarquia visual:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                {data.hierarchy?.slice(0, 3).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-600">{data.reasoning || 'Sem detalhes disponíveis'}</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold">Assistente de Design IA</h3>
            <p className="text-sm text-gray-600">Sugestões inteligentes para seus designs</p>
          </div>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Gerar Sugestões
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{suggestions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Aplicadas</p>
                  <p className="text-2xl font-bold">{suggestions.filter(s => s.applied).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Confiança Média</p>
                  <p className="text-2xl font-bold">
                    {Math.round(suggestions.reduce((acc, s) => acc + s.confidence_score, 0) / suggestions.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Pendentes</p>
                  <p className="text-2xl font-bold">{suggestions.filter(s => !s.applied).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suggestions */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sugestão disponível</h3>
            <p className="text-gray-600 mb-4">Clique em "Gerar Sugestões" para obter recomendações personalizadas de design</p>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Gerar Sugestões
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="color">Cores</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="branding">Marca</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getSuggestionIcon(suggestion.suggestion_type)}
                        <div>
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <p className="text-sm text-gray-600">{suggestion.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSuggestionColor(suggestion.suggestion_type)}>
                          {getTypeLabel(suggestion.suggestion_type)}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600">{suggestion.confidence_score}%</span>
                          <Progress value={suggestion.confidence_score} className="w-16" />
                        </div>
                      </div>
                    </div>
                    
                    {renderSuggestionContent(suggestion)}
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                      <div className="flex items-center space-x-2">
                        {suggestion.applied ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Aplicada
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApply(suggestion.id)}
                              disabled={applyMutation.isPending}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Aplicar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeedback(suggestion.id, 'helpful')}
                              disabled={feedbackMutation.isPending}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeedback(suggestion.id, 'not_helpful')}
                              disabled={feedbackMutation.isPending}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {typeSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getSuggestionIcon(suggestion.suggestion_type)}
                          <div>
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <p className="text-sm text-gray-600">{suggestion.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600">{suggestion.confidence_score}%</span>
                          <Progress value={suggestion.confidence_score} className="w-16" />
                        </div>
                      </div>
                      
                      {renderSuggestionContent(suggestion)}
                      
                      <Separator className="my-3" />
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                        <div className="flex items-center space-x-2">
                          {suggestion.applied ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Aplicada
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApply(suggestion.id)}
                                disabled={applyMutation.isPending}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Aplicar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(suggestion.id, 'helpful')}
                                disabled={feedbackMutation.isPending}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(suggestion.id, 'not_helpful')}
                                disabled={feedbackMutation.isPending}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}