import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadedImage {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function useImageUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<UploadedImage | null> => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Apenas arquivos de imagem são permitidos",
        variant: "destructive"
      });
      return null;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive"
      });
      return null;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    setUploadProgress(prev => [...prev, {
      filename: file.name,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      // Simular progresso (em uma implementação real, você poderia usar XMLHttpRequest para progresso real)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(p => 
            p.filename === file.name && p.status === 'uploading'
              ? { ...p, progress: Math.min(p.progress + 10, 90) }
              : p
          )
        );
      }, 100);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result: UploadedImage = await response.json();

      setUploadProgress(prev => 
        prev.map(p => 
          p.filename === file.name
            ? { ...p, progress: 100, status: 'completed' }
            : p
        )
      );

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
        variant: "default"
      });

      // Limpar progresso após 2 segundos
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(p => p.filename !== file.name));
      }, 2000);

      return result;

    } catch (error) {
      console.error('Erro no upload:', error);
      
      setUploadProgress(prev => 
        prev.map(p => 
          p.filename === file.name
            ? { ...p, status: 'error' }
            : p
        )
      );

      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar imagem",
        variant: "destructive"
      });

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultipleImages = async (files: FileList): Promise<UploadedImage[]> => {
    const results: UploadedImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadImage(files[i]);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  };

  const deleteImage = async (filename: string): Promise<boolean> => {
    try {
      const response = await apiRequest('DELETE', `/api/upload/image/${filename}`);
      
      if (response && typeof response === 'object' && 'success' in response) {
        toast({
          title: "Sucesso",
          description: "Imagem deletada com sucesso!",
          variant: "default"
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar imagem",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploadProgress,
    isUploading
  };
}