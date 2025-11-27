import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useUserCompanies } from '@/hooks/use-user-companies';
import { useWebSocket } from '@/hooks/use-websocket';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Clock, CheckCircle, XCircle, Calendar, Copy, Heart, PlayCircle, Square, Grid3X3, Briefcase, Smile, PartyPopper, Lightbulb, BookOpen, Mic, MicOff, X, Play, Pause, RotateCcw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formSchema = z.object({
  tema: z.string().min(10, 'O tema deve ter pelo menos 10 caracteres'),
  tipo_postagem: z.enum(['feed', 'story', 'reels', 'carousel', 'calendar']),
  quantidade_artes: z.number().min(1).max(10).optional(),
  quantidade_dias: z.number().min(1).max(30).optional(),
  tom_voz: z.enum(['profissional', 'casual', 'divertido', 'inspirador', 'educativo'])
});

interface AiContentGeneration {
  id: number;
  tema: string;
  tipo_postagem: string;
  quantidade_artes?: number;
  quantidade_dias?: number;
  tom_voz: string;
  headline?: string;
  conteudo?: string;
  cta?: string;
  webhook_response?: any;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

const postTypes = [
  { value: 'feed', label: 'Feed', icon: Heart, description: 'Post normal para feed do Instagram' },
  { value: 'story', label: 'Story', icon: PlayCircle, description: 'Conteúdo para stories' },
  { value: 'reels', label: 'Reels', icon: PlayCircle, description: 'Vídeo curto para reels' },
  { value: 'carousel', label: 'Carrossel', icon: Grid3X3, description: 'Múltiplas imagens em sequência' },
  { value: 'calendar', label: 'Calendário', icon: Calendar, description: 'Planejamento de conteúdo' }
];

const toneOptions = [
  { value: 'profissional', label: 'Profissional', icon: Briefcase, description: 'Tom formal e corporativo' },
  { value: 'casual', label: 'Casual', icon: Smile, description: 'Tom descontraído e amigável' },
  { value: 'divertido', label: 'Divertido', icon: PartyPopper, description: 'Tom alegre e engraçado' },
  { value: 'inspirador', label: 'Inspirador', icon: Lightbulb, description: 'Tom motivacional' },
  { value: 'educativo', label: 'Educativo', icon: BookOpen, description: 'Tom didático e informativo' }
];

export default function AiAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedCompany } = useUserCompanies(user?.id || '');
  const { lastMessage } = useWebSocket();
  const [selectedPostType, setSelectedPostType] = useState<string>('');
  const [lastCompletedId, setLastCompletedId] = useState<number | null>(null);
  const [pollingContentId, setPollingContentId] = useState<number | null>(null);
  const [selectedHistoryContent, setSelectedHistoryContent] = useState<AiContentGeneration | null>(null);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tema: '',
      tipo_postagem: 'feed',
      quantidade_artes: 1,
      quantidade_dias: 7,
      tom_voz: 'profissional'
    }
  });

  const watchedPostType = form.watch('tipo_postagem');

  // Effect to detect AI content completion and show notification
  useEffect(() => {
    if (lastMessage?.type === 'ai_content_completed') {
      const completedContent = lastMessage.data;
      if (completedContent && completedContent.id !== lastCompletedId) {
        setLastCompletedId(completedContent.id);
        
        // Show success notification
        toast({
          title: '✨ Conteúdo pronto!',
          description: 'Seu conteúdo foi gerado com sucesso. Confira o resultado abaixo.',
          duration: 5000,
        });
        
        // Auto-scroll to results section
        setTimeout(() => {
          const resultsElement = document.getElementById('ai-results-section');
          if (resultsElement) {
            resultsElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          }
        }, 500);
      }
    }
  }, [lastMessage, lastCompletedId, toast]);

  // Fetch AI content generations for the selected company
  const { data: contentGenerations, isLoading } = useQuery<AiContentGeneration[]>({
    queryKey: ['/api/ai-content', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      const response = await fetch(`/api/ai-content/by-company/${selectedCompany.id}`);
      return response.ok ? response.json() : [];
    },
    enabled: !!selectedCompany?.id,
    refetchInterval: pollingContentId ? 2000 : false, // Poll every 2 seconds when waiting for webhook
  });

  // Auto-polling effect to check for webhook responses up to 20 seconds
  useEffect(() => {
    if (!pollingContentId) return;

    const pollStartTime = Date.now();
    const maxPollTime = 20000; // 20 seconds

    const checkCompletion = () => {
      const currentContent = contentGenerations?.find(c => c.id === pollingContentId);
      
      if (currentContent?.status === 'completed' && currentContent.webhook_response) {
        // Webhook response received!
        setPollingContentId(null);
        setLastCompletedId(currentContent.id);
        
        toast({
          title: '✨ Conteúdo pronto!',
          description: 'Seu conteúdo foi gerado com sucesso. Confira o resultado abaixo.',
          duration: 5000,
        });
        
        // Auto-scroll to results section
        setTimeout(() => {
          const resultsElement = document.getElementById('ai-results-section');
          if (resultsElement) {
            resultsElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          }
        }, 500);
        
        return;
      }
      
      // Check if we've exceeded max polling time
      if (Date.now() - pollStartTime > maxPollTime) {
        setPollingContentId(null);
        if (currentContent?.status === 'pending') {
          toast({
            title: 'Processando...',
            description: 'Seu conteúdo ainda está sendo gerado. Continue aguardando.',
            duration: 3000,
          });
        }
        return;
      }
    };

    // Check immediately and then every 2 seconds
    const interval = setInterval(checkCompletion, 2000);
    checkCompletion();

    return () => clearInterval(interval);
  }, [pollingContentId, contentGenerations, toast]);

  const createContentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest('POST', '/api/ai-content/generate', {
        ...data,
        empresa_id: selectedCompany?.id,
        user_id: user?.id
      });
    },
    onSuccess: (createdContent: any) => {
      toast({
        title: 'Conteúdo solicitado!',
        description: 'Aguardando processamento do servidor (até 20s)...'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-content', selectedCompany?.id] });
      form.reset();
      
      // Start polling for this content
      if (createdContent?.id) {
        setPollingContentId(createdContent.id);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar conteúdo',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!selectedCompany) {
      toast({
        title: 'Selecione uma empresa',
        description: 'Você precisa selecionar uma empresa para gerar conteúdo.',
        variant: 'destructive'
      });
      return;
    }
    createContentMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setShowRecordingModal(true);
      
      // Start countdown
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownInterval);
            // Start actual recording
            const recorder = new MediaRecorder(stream);
            const audioChunks: BlobPart[] = [];
            
            // Set up audio level monitoring
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const updateAudioLevel = () => {
              if (recorder.state === 'recording') {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 255); // Normalize to 0-1
                requestAnimationFrame(updateAudioLevel);
              }
            };
            updateAudioLevel();
            
            recorder.ondataavailable = (event) => {
              audioChunks.push(event.data);
            };
            
            recorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
              audioContext.close();
              setAudioLevel(0);
              setRecordedAudio(audioBlob);
              
              // Create audio element for playback
              const audio = new Audio(URL.createObjectURL(audioBlob));
              audio.onloadedmetadata = () => {
                setAudioDuration(audio.duration);
              };
              audio.ontimeupdate = () => {
                setPlaybackTime(audio.currentTime);
              };
              audio.onended = () => {
                setIsPlaying(false);
                setPlaybackTime(0);
              };
              setAudioElement(audio);
              
              stream.getTracks().forEach(track => track.stop());
            };
            
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            
            // Start recording timer
            const recordingInterval = setInterval(() => {
              setRecordingTime(prev => {
                const newTime = prev + 1;
                // Stop recording automatically after 3 minutes (180 seconds)
                if (newTime >= 180) {
                  clearInterval(recordingInterval);
                  if (recorder.state === 'recording') {
                    recorder.stop();
                  }
                  setIsRecording(false);
                  setMediaRecorder(null);
                }
                return newTime;
              });
            }, 1000);
            
            // Store interval in recorder for cleanup
            (recorder as any).timerInterval = recordingInterval;
            
            return null;
          }
          return prev! - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar o microfone. Verifique as permissões.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      clearInterval((mediaRecorder as any).timerInterval);
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval((mediaRecorder as any).timerInterval);
      }
      // Get the stream and stop all tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    }
    resetRecordingState();
  };

  const transcribeAudio = async (audioBlob?: Blob) => {
    setIsTranscribing(true);
    try {
      const blob = audioBlob || recordedAudio;
      if (!blob) return;
      
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha na transcrição');
      }

      const result = await response.json();
      
      if (result.success && result.text) {
        // Add transcribed text to the current textarea value
        const currentValue = form.getValues('tema') || '';
        const newValue = currentValue ? `${currentValue} ${result.text}` : result.text;
        form.setValue('tema', newValue);
        
        toast({
          title: 'Transcrição concluída!',
          description: 'O áudio foi convertido em texto com sucesso.'
        });
        
        resetRecordingState();
      } else {
        throw new Error(result.error || 'Falha na transcrição');
      }
    } catch (error) {
      console.error('Erro na transcrição:', error);
      toast({
        title: 'Erro na transcrição',
        description: 'Não foi possível converter o áudio em texto.',
        variant: 'destructive'
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const playAudio = () => {
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
    }
    resetRecordingState();
  };

  const reRecord = () => {
    deleteRecording();
    startRecording();
  };

  const resetRecordingState = () => {
    setShowRecordingModal(false);
    setRecordingTime(0);
    setCountdown(null);
    setRecordedAudio(null);
    setIsPlaying(false);
    setAudioElement(null);
    setPlaybackTime(0);
    setAudioDuration(0);
    setAudioLevel(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedCompany) {
    return (
      <MainLayout 
        title="Assistente de IA" 
        subtitle="Selecione uma empresa para usar o assistente de IA"
      >
        <div className="text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Selecione uma empresa</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Para usar o assistente de IA, você precisa selecionar uma empresa no menu lateral.
            </p>
          </div>
        </div>
        
        {/* History Content Detail Modal */}
        <Dialog open={!!selectedHistoryContent} onOpenChange={() => setSelectedHistoryContent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Resultado do Assistente de IA</DialogTitle>
            </DialogHeader>
            
            {selectedHistoryContent && (
              <div className="space-y-6">
                {/* Content Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedHistoryContent.status)}
                    <div>
                      <p className="font-medium">{selectedHistoryContent.tipo_postagem} • {selectedHistoryContent.tom_voz}</p>
                      <p className="text-sm text-gray-600">{selectedHistoryContent.tema}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(selectedHistoryContent.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Display full webhook response content */}
                {(() => {
                  const webhookData = selectedHistoryContent.webhook_response;
                  let calendarData = null;
                  let singleData = null;
                  let arteInstagramData = null;

                  // Handle new webhook format: [{ response: { body: { arteInstagram: {...} } } }]
                  if (Array.isArray(webhookData) && webhookData[0]?.response?.body?.arteInstagram) {
                    arteInstagramData = webhookData[0].response.body.arteInstagram;
                    singleData = {
                      headline: arteInstagramData.headline,
                      conteudo: arteInstagramData.conteudo,
                      cta: arteInstagramData.chamadaParaAcao
                    };
                  }
                  // Handle calendar format
                  else if (Array.isArray(webhookData) && webhookData[0]?.response?.body?.calendario_sazonal) {
                    calendarData = webhookData[0].response.body.calendario_sazonal;
                  } 
                  // Handle old calendar format
                  else if (webhookData?.output && Array.isArray(webhookData.output)) {
                    calendarData = webhookData.output;
                  } 
                  // Handle direct single content format
                  else if (webhookData?.headline || webhookData?.conteudo || webhookData?.cta) {
                    singleData = webhookData;
                  }

                  return calendarData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">CALENDÁRIO DE CONTEÚDO</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allContent = calendarData
                              .map((item: any, index: number) => 
                                `${item.headline}\n${item.conteudo}\n${item.cta}\n`
                              ).join('\n');
                            copyToClipboard(allContent);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Tudo
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        {calendarData.map((item: any, index: number) => (
                          <div key={index} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800">{item.headline.split(' - ')[0] || `Item ${index + 1}`}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(`${item.headline}\n${item.conteudo}\n${item.cta}`)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <p className="font-medium text-gray-900">{item.headline}</p>
                              <p className="text-sm text-gray-700">{item.conteudo}</p>
                              <p className="text-sm font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                {item.cta}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : singleData ? (
                    <div className="space-y-6">
                      {/* Single content display */}
                      {(singleData.headline || selectedHistoryContent.headline) && (
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800">TÍTULO</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(singleData.headline || selectedHistoryContent.headline!)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                          <p className="text-lg font-medium text-gray-900 leading-relaxed">{singleData.headline || selectedHistoryContent.headline}</p>
                        </div>
                      )}
                      
                      {(singleData.conteudo || selectedHistoryContent.conteudo) && (
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800">CONTEÚDO</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(singleData.conteudo || selectedHistoryContent.conteudo!)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{singleData.conteudo || selectedHistoryContent.conteudo}</p>
                        </div>
                      )}
                      
                      {(singleData.cta || selectedHistoryContent.cta) && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-purple-800">CALL TO ACTION</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(singleData.cta || selectedHistoryContent.cta!)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                          <p className="text-purple-900 font-medium">{singleData.cta || selectedHistoryContent.cta}</p>
                        </div>
                      )}
                      
                      {/* Design Suggestions for arteInstagram */}
                      {arteInstagramData?.designSugestao && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              SUGESTÕES DE DESIGN
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(JSON.stringify(arteInstagramData.designSugestao, null, 2))}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar JSON
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Cor de Fundo</p>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-6 h-6 rounded border shadow-sm"
                                    style={{ backgroundColor: arteInstagramData.designSugestao.corFundo }}
                                  ></div>
                                  <span className="text-sm text-gray-700 font-mono">{arteInstagramData.designSugestao.corFundo}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Imagem Sugerida</p>
                                <p className="text-sm text-gray-700">{arteInstagramData.designSugestao.imagem}</p>
                              </div>
                            </div>
                            
                            {arteInstagramData.designSugestao.tipografia && (
                              <div>
                                <p className="text-sm font-medium text-blue-700 mb-2">Tipografia</p>
                                <div className="grid gap-2">
                                  {Object.entries(arteInstagramData.designSugestao.tipografia).map(([key, style]: [string, any]) => (
                                    <div key={key} className="text-xs bg-white rounded p-2 border">
                                      <span className="font-semibold capitalize">{key}:</span> {style.fonte} • {style.tamanho} • 
                                      <span 
                                        className="inline-block w-3 h-3 rounded ml-1 align-middle"
                                        style={{ backgroundColor: style.cor }}
                                      ></span>
                                      <span className="font-mono text-xs ml-1">{style.cor}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {arteInstagramData.designSugestao.elementosVisuais && (
                              <div>
                                <p className="text-sm font-medium text-blue-700 mb-2">Elementos Visuais</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {arteInstagramData.designSugestao.elementosVisuais.map((elemento: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-blue-500 mt-1">•</span>
                                      {elemento}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Assistente de IA" 
      subtitle={`Crie conteúdo personalizado para ${selectedCompany.nome} com inteligência artificial`}
    >
      <div className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Conteúdo</CardTitle>
                <CardDescription>
                  Descreva o tema e selecione o tipo de conteúdo que deseja gerar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="tema"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema do Conteúdo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                placeholder="Descreva o tema do seu conteúdo. Ex: Dicas de marketing digital para pequenas empresas..."
                                className="min-h-[100px] pr-12"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                                onClick={startRecording}
                                disabled={isRecording || isTranscribing}
                              >
                                {isTranscribing ? (
                                  <Clock className="h-4 w-4 animate-spin text-blue-500" />
                                ) : (
                                  <Mic className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo_postagem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Postagem</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-left">
                                <SelectValue placeholder="Selecione o tipo de postagem" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {postTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <div>
                                        <span className="font-medium">{type.label}</span>
                                        <p className="text-xs text-gray-500">{type.description}</p>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedPostType === 'carousel' && (
                      <FormField
                        control={form.control}
                        name="quantidade_artes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade de Artes</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchedPostType === 'calendar' && (
                      <FormField
                        control={form.control}
                        name="quantidade_dias"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade de Dias</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(Number(value))} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a quantidade de dias" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="7">7 dias</SelectItem>
                                <SelectItem value="15">15 dias</SelectItem>
                                <SelectItem value="30">30 dias</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="tom_voz"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tom de Voz</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-left">
                                <SelectValue placeholder="Selecione o tom de voz">
                                  {field.value && (() => {
                                    const selectedTone = toneOptions.find(tone => tone.value === field.value);
                                    if (selectedTone) {
                                      const Icon = selectedTone.icon;
                                      return (
                                        <div className="flex items-center gap-2">
                                          <Icon className="h-4 w-4" />
                                          <div>
                                            <span className="font-medium">{selectedTone.label}</span>
                                            <p className="text-xs text-gray-500">{selectedTone.description}</p>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {toneOptions.map((tone) => {
                                const Icon = tone.icon;
                                return (
                                  <SelectItem key={tone.value} value={tone.value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <div>
                                        <span className="font-medium">{tone.label}</span>
                                        <p className="text-xs text-gray-500">{tone.description}</p>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      style={{ backgroundColor: '#2094f3' }}
                      disabled={createContentMutation.isPending}
                    >
                      {createContentMutation.isPending ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Gerar Conteúdo
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card id="ai-results-section">
              <CardHeader>
                <CardTitle>Resultado do Webhook</CardTitle>
                <CardDescription>
                  Conteúdo gerado pela IA em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Carregando conteúdos...</p>
                    </div>
                  ) : contentGenerations?.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Nenhum conteúdo gerado ainda</p>
                      <p className="text-sm text-gray-500">Crie seu primeiro conteúdo usando o formulário ao lado</p>
                    </div>
                  ) : (
                    // Show only the latest/most recent content result prominently
                    (() => {
                      const latestContent = contentGenerations?.[0]; // Assuming newest first
                      if (!latestContent) return null;
                      
                      return (
                        <div className="space-y-6">
                          {/* Status and Info */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(latestContent.status)}
                              <div>
                                <p className="font-medium">{latestContent.tipo_postagem} • {latestContent.tom_voz}</p>
                                <p className="text-sm text-gray-600">{latestContent.tema}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(latestContent.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Content Results */}
                          {latestContent.status === 'completed' && (
                            <div className="space-y-6">
                              {/* Check if this is a calendar post from the new webhook format */}
                              {(() => {
                                // Handle different webhook response formats
                                const webhookData = latestContent.webhook_response;
                                let calendarData = null;
                                let singleData = null;
                                let arteInstagramData = null;

                                // Handle new webhook format: [{ response: { body: { arteInstagram: {...} } } }]
                                if (Array.isArray(webhookData) && webhookData[0]?.response?.body?.arteInstagram) {
                                  arteInstagramData = webhookData[0].response.body.arteInstagram;
                                  singleData = {
                                    headline: arteInstagramData.headline,
                                    conteudo: arteInstagramData.conteudo,
                                    cta: arteInstagramData.chamadaParaAcao
                                  };
                                }
                                // Handle calendar format: [{ response: { body: { calendario_sazonal: [...] } } }]
                                else if (Array.isArray(webhookData) && webhookData[0]?.response?.body?.calendario_sazonal) {
                                  calendarData = webhookData[0].response.body.calendario_sazonal;
                                } 
                                // Handle old calendar format: { output: [...] }
                                else if (webhookData?.output && Array.isArray(webhookData.output)) {
                                  calendarData = webhookData.output;
                                } 
                                // Handle direct single content format
                                else if (webhookData?.headline || webhookData?.conteudo || webhookData?.cta) {
                                  singleData = webhookData;
                                }

                                return calendarData ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-semibold text-gray-800">CALENDÁRIO DE CONTEÚDO</h3>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const allContent = calendarData
                                            .map((item: any, index: number) => 
                                              `${item.headline}\n${item.conteudo}\n${item.cta}\n`
                                            ).join('\n');
                                          copyToClipboard(allContent);
                                        }}
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copiar Tudo
                                      </Button>
                                    </div>
                                    
                                    <div className="grid gap-4 max-h-96 overflow-y-auto">
                                      {calendarData.map((item: any, index: number) => (
                                        <div key={index} className="bg-white border rounded-lg p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-800">{item.headline.split(' - ')[0] || `Item ${index + 1}`}</h4>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => copyToClipboard(`${item.headline}\n${item.conteudo}\n${item.cta}`)}
                                            >
                                              <Copy className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          <div className="space-y-2">
                                            <p className="font-medium text-gray-900">{item.headline}</p>
                                            <p className="text-sm text-gray-700">{item.conteudo}</p>
                                            <p className="text-sm font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                              {item.cta}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : singleData ? (
                                  /* Single content format */
                                  <>
                                    {(singleData.headline || latestContent.headline) && (
                                      <div className="bg-white border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h3 className="font-semibold text-gray-800">TÍTULO</h3>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(singleData.headline || latestContent.headline!)}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar
                                          </Button>
                                        </div>
                                        <p className="text-lg font-medium text-gray-900 leading-relaxed">{singleData.headline || latestContent.headline}</p>
                                      </div>
                                    )}
                                    
                                    {(singleData.conteudo || latestContent.conteudo) && (
                                      <div className="bg-white border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h3 className="font-semibold text-gray-800">CONTEÚDO</h3>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(singleData.conteudo || latestContent.conteudo!)}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar
                                          </Button>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{singleData.conteudo || latestContent.conteudo}</p>
                                      </div>
                                    )}
                                    
                                    {(singleData.cta || latestContent.cta) && (
                                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h3 className="font-semibold text-purple-800">CALL TO ACTION</h3>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(singleData.cta || latestContent.cta!)}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar
                                          </Button>
                                        </div>
                                        <p className="text-purple-900 font-medium">{singleData.cta || latestContent.cta}</p>
                                      </div>
                                    )}
                                    
                                    {arteInstagramData?.designSugestao && (
                                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            SUGESTÕES DE DESIGN
                                          </h3>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(JSON.stringify(arteInstagramData.designSugestao, null, 2))}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar JSON
                                          </Button>
                                        </div>
                                        <div className="space-y-3">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-sm font-medium text-blue-700 mb-1">Cor de Fundo</p>
                                              <div className="flex items-center gap-2">
                                                <div 
                                                  className="w-6 h-6 rounded border shadow-sm"
                                                  style={{ backgroundColor: arteInstagramData.designSugestao.corFundo }}
                                                ></div>
                                                <span className="text-sm text-gray-700 font-mono">{arteInstagramData.designSugestao.corFundo}</span>
                                              </div>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-blue-700 mb-1">Imagem Sugerida</p>
                                              <p className="text-sm text-gray-700">{arteInstagramData.designSugestao.imagem}</p>
                                            </div>
                                          </div>
                                          
                                          {arteInstagramData.designSugestao.tipografia && (
                                            <div>
                                              <p className="text-sm font-medium text-blue-700 mb-2">Tipografia</p>
                                              <div className="grid gap-2">
                                                {Object.entries(arteInstagramData.designSugestao.tipografia).map(([key, style]: [string, any]) => (
                                                  <div key={key} className="text-xs bg-white rounded p-2 border">
                                                    <span className="font-semibold capitalize">{key}:</span> {style.fonte} • {style.tamanho} • 
                                                    <span 
                                                      className="inline-block w-3 h-3 rounded ml-1 align-middle"
                                                      style={{ backgroundColor: style.cor }}
                                                    ></span>
                                                    <span className="font-mono text-xs ml-1">{style.cor}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {arteInstagramData.designSugestao.elementosVisuais && (
                                            <div>
                                              <p className="text-sm font-medium text-blue-700 mb-2">Elementos Visuais</p>
                                              <ul className="text-sm text-gray-700 space-y-1">
                                                {arteInstagramData.designSugestao.elementosVisuais.map((elemento: string, idx: number) => (
                                                  <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    {elemento}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  /* Show database fields for completed content without webhook response */
                                  <>
                                    {latestContent.headline && (
                                      <div className="bg-white border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h3 className="font-semibold text-gray-800">TÍTULO</h3>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(latestContent.headline!)}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar
                                          </Button>
                                        </div>
                                        <p className="text-lg font-medium text-gray-900 leading-relaxed">{latestContent.headline}</p>
                                      </div>
                                    )}
                                    
                                    {latestContent.conteudo && (
                                      <div className="bg-white border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h3 className="font-semibold text-gray-800">CONTEÚDO</h3>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(latestContent.conteudo!)}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar
                                          </Button>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{latestContent.conteudo}</p>
                                      </div>
                                    )}
                                    
                                    {latestContent.cta && (
                                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h3 className="font-semibold text-purple-800">CALL TO ACTION</h3>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(latestContent.cta!)}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copiar
                                          </Button>
                                        </div>
                                        <p className="text-purple-900 font-medium">{latestContent.cta}</p>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          {latestContent.status === 'pending' && (
                            <div className="text-center py-8">
                              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-yellow-500" />
                              <p className="text-gray-600">
                                {pollingContentId === latestContent.id 
                                  ? 'Aguardando resposta do servidor...' 
                                  : 'Gerando conteúdo...'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {pollingContentId === latestContent.id
                                  ? 'Verificando automaticamente a cada 2 segundos (até 20s)'
                                  : 'Aguarde enquanto a IA cria seu conteúdo'}
                              </p>
                              {pollingContentId === latestContent.id && (
                                <div className="mt-4">
                                  <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto">
                                    <div className="h-2 bg-yellow-500 rounded-full animate-pulse" style={{ width: '30%' }}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {latestContent.status === 'failed' && (
                            <div className="text-center py-8">
                              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                              <p className="text-gray-600">Erro ao gerar conteúdo</p>
                              <p className="text-sm text-gray-500">Tente novamente mais tarde</p>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Historical Content Section - Below the main grid */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Conteúdos</CardTitle>
                <CardDescription>
                  Todos os conteúdos gerados anteriormente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentGenerations?.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Nenhum conteúdo no histórico ainda</p>
                    </div>
                  ) : (
                    contentGenerations?.map((content) => (
                      <div key={content.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{content.tipo_postagem}</Badge>
                              <Badge variant="outline">{content.tom_voz}</Badge>
                              {getStatusIcon(content.status)}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{content.tema}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {content.status === 'completed' && content.webhook_response && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedHistoryContent(content)}
                              >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Abrir Resultado
                              </Button>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(content.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {content.status === 'completed' && (
                          <div className="space-y-2">
                            {content.headline && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-medium text-gray-700">TÍTULO</label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(content.headline!)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm font-medium bg-gray-50 p-2 rounded">{content.headline}</p>
                              </div>
                            )}
                            
                            {content.conteudo && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-medium text-gray-700">CONTEÚDO</label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(content.conteudo!)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm bg-gray-50 p-2 rounded whitespace-pre-wrap">{content.conteudo}</p>
                              </div>
                            )}
                            
                            {content.cta && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-medium text-gray-700">CALL TO ACTION</label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(content.cta!)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm font-medium bg-purple-50 p-2 rounded">{content.cta}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recording Modal */}
        <Dialog open={showRecordingModal} onOpenChange={(open) => !open && cancelRecording()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="text-center relative">
              <DialogTitle>Gravação de Áudio</DialogTitle>
              {recordedAudio && !isTranscribing && (
                <Button
                  onClick={cancelRecording}
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 w-8 h-8 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              {countdown !== null ? (
                // Countdown phase
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-5xl font-bold text-red-600">{countdown}</span>
                  </div>
                  <p className="text-gray-600">Preparando para gravar...</p>
                </div>
              ) : isRecording ? (
                // Recording phase with audio visualization
                <div className="text-center">
                  <div className="relative flex items-center justify-center mb-6">
                    {/* Main microphone circle */}
                    <div 
                      className={cn(
                        "w-32 h-32 rounded-full bg-red-500 flex items-center justify-center relative",
                        audioLevel > 0.1 ? "animate-pulse" : ""
                      )}
                      style={{
                        transform: `scale(${1 + (audioLevel > 0.1 ? audioLevel * 0.3 : 0)})`,
                        transition: 'transform 0.1s ease-out'
                      }}
                    >
                      <Mic className="w-10 h-10 text-white" />
                    </div>
                    
                    {/* Audio rings animation - only show when speaking */}
                    {audioLevel > 0.1 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-32 h-32 rounded-full border-2 border-red-300 animate-ping"
                            style={{
                              animationDelay: `${i * 200}ms`,
                              animationDuration: '1.5s',
                              opacity: 0.6,
                              transform: `scale(${1.2 + i * 0.3 + audioLevel * 0.5})`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-lg font-semibold text-gray-900">Gravando áudio...</p>
                  <p className={cn(
                    "text-2xl font-mono mt-2",
                    recordingTime >= 150 ? "text-red-600" : "text-red-500"
                  )}>
                    {formatTime(recordingTime)} / 03:00
                  </p>
                  
                  {/* Audio level indicator */}
                  <div className="flex items-center justify-center space-x-1 mt-3">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 rounded-full transition-all duration-75",
                          audioLevel > 0.1 && audioLevel * 10 > i ? "bg-red-500" : "bg-gray-300"
                        )}
                        style={{
                          height: `${Math.max(4, (audioLevel > 0.1 && audioLevel * 10 > i ? 20 + (audioLevel * 20) : 4))}px`
                        }}
                      />
                    ))}
                  </div>
                  
                  {recordingTime >= 150 && (
                    <p className="text-sm text-red-600 mt-2">
                      Gravação será encerrada automaticamente em {180 - recordingTime}s
                    </p>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mt-4">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-1000",
                        recordingTime >= 150 ? "bg-red-600" : "bg-red-500"
                      )}
                      style={{ width: `${(recordingTime / 180) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : isTranscribing ? (
                // Transcribing phase
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                    <Clock className="w-10 h-10 text-blue-500 animate-spin" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Transcrevendo áudio...</p>
                  <p className="text-gray-600">Convertendo sua fala em texto</p>
                </div>
              ) : recordedAudio ? (
                // Playback controls phase
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mb-4 mx-auto">
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </div>
                  
                  <p className="text-lg font-semibold text-gray-900 mb-2">Gravação concluída</p>
                  
                  {/* Time display */}
                  <p className="text-xl font-mono text-gray-600 mb-4">
                    {formatTime(Math.floor(playbackTime))} / {formatTime(Math.floor(audioDuration))}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-100"
                      style={{ width: `${audioDuration > 0 ? (playbackTime / audioDuration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  {/* Control buttons */}
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Button
                      onClick={isPlaying ? pauseAudio : playAudio}
                      variant="ghost"
                      size="sm"
                      className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                    
                    <Button
                      onClick={reRecord}
                      variant="ghost"
                      size="sm"
                      className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      onClick={deleteRecording}
                      variant="ghost"
                      size="sm"
                      className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-4 justify-center">
                {isRecording ? (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Parar Gravação
                  </Button>
                ) : countdown !== null ? (
                  <Button
                    onClick={cancelRecording}
                    variant="outline"
                    className="px-8 py-3 text-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    Cancelar
                  </Button>
                ) : recordedAudio && !isTranscribing ? (
                  <Button
                    onClick={() => transcribeAudio()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Transcrever Áudio para Texto
                  </Button>
                ) : null}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
    );
}