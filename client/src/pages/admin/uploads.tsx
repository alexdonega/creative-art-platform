import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Download, Upload as UploadIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/main-layout';

interface ImageFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export default function UploadsPage() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { deleteImage } = useImageUpload();
  const { toast } = useToast();

  // Buscar lista de imagens
  const { data: images = [], refetch, isLoading } = useQuery<ImageFile[]>({
    queryKey: ['/api/upload/images'],
    refetchOnWindowFocus: false
  });

  const handleImageUploaded = (imageUrl: string, filename: string) => {
    console.log('Nova imagem enviada:', imageUrl, filename);
    refetch(); // Atualizar lista de imagens
    toast({
      title: "Sucesso",
      description: `Imagem ${filename} enviada com sucesso!`,
      variant: "default"
    });
  };

  const handleImageDeleted = (filename: string) => {
    console.log('Imagem deletada:', filename);
    refetch(); // Atualizar lista de imagens
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return;

    const confirmDelete = confirm(`Tem certeza que deseja deletar ${selectedImages.length} imagem(ns)?`);
    if (!confirmDelete) return;

    try {
      for (const filename of selectedImages) {
        await deleteImage(filename);
      }
      
      setSelectedImages([]);
      refetch();
      
      toast({
        title: "Sucesso",
        description: `${selectedImages.length} imagem(ns) deletada(s) com sucesso!`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao deletar imagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar imagens selecionadas",
        variant: "destructive"
      });
    }
  };

  const toggleImageSelection = (filename: string) => {
    setSelectedImages(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <MainLayout 
      title="Gerenciar Uploads" 
      subtitle="Envie e gerencie imagens do sistema"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {selectedImages.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteSelected}
              className="ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Selecionadas ({selectedImages.length})
            </Button>
          )}
        </div>

      {/* Seção de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadIcon className="h-5 w-5 mr-2" />
            Enviar Novas Imagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            allowMultiple={true}
            maxFiles={10}
            onImageUploaded={handleImageUploaded}
            onImageDeleted={handleImageDeleted}
            showPreview={false}
          />
        </CardContent>
      </Card>

      {/* Lista de Imagens */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens Armazenadas ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando imagens...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma imagem encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card 
                  key={image.filename} 
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedImages.includes(image.filename) 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => toggleImageSelection(image.filename)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay com ações */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(image.url, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = image.url;
                            link.download = image.filename;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const success = await deleteImage(image.filename);
                            if (success) {
                              refetch();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Checkbox de seleção */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(image.filename)}
                          onChange={() => toggleImageSelection(image.filename)}
                          className="h-4 w-4 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      <p className="text-sm font-medium truncate" title={image.filename}>
                        {image.filename}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(image.size)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Criado: {formatDate(image.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}