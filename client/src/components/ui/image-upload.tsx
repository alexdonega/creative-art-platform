import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image, Trash2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string, filename: string) => void;
  onImageDeleted?: (filename: string) => void;
  maxFiles?: number;
  allowMultiple?: boolean;
  showPreview?: boolean;
  className?: string;
  accept?: string;
}

interface UploadedImageInfo {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export function ImageUpload({
  onImageUploaded,
  onImageDeleted,
  maxFiles = 1,
  allowMultiple = false,
  showPreview = true,
  className,
  accept = "image/*"
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageInfo[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const { uploadImage, uploadMultipleImages, deleteImage, uploadProgress, isUploading } = useImageUpload();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      if (allowMultiple) {
        const results = await uploadMultipleImages(files);
        const newImages = results.map(result => ({
          url: result.url,
          filename: result.filename,
          originalName: result.originalName,
          size: result.size,
          mimetype: result.mimetype
        }));
        
        setUploadedImages(prev => [...prev, ...newImages]);
        newImages.forEach(img => onImageUploaded?.(img.url, img.filename));
      } else {
        const result = await uploadImage(files[0]);
        if (result) {
          const newImage = {
            url: result.url,
            filename: result.filename,
            originalName: result.originalName,
            size: result.size,
            mimetype: result.mimetype
          };
          
          setUploadedImages([newImage]);
          onImageUploaded?.(newImage.url, newImage.filename);
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const handleDeleteImage = async (filename: string) => {
    const success = await deleteImage(filename);
    if (success) {
      setUploadedImages(prev => prev.filter(img => img.filename !== filename));
      onImageDeleted?.(filename);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Área de Upload */}
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        "hover:border-primary/50 hover:bg-primary/5"
      )}>
        <CardContent
          className="flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Clique para selecionar ou arraste {allowMultiple ? 'as imagens' : 'uma imagem'} aqui
          </p>
          <p className="text-xs text-muted-foreground">
            Suporte para JPG, PNG, GIF, WebP (máx. 10MB)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={allowMultiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          {!isUploading && (
            <Button variant="outline" className="mt-4" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Selecionar {allowMultiple ? 'Imagens' : 'Imagem'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Progresso de Upload */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress) => (
            <Card key={progress.filename}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate mr-2">
                    {progress.filename}
                  </span>
                  <Badge variant={
                    progress.status === 'completed' ? 'default' :
                    progress.status === 'error' ? 'destructive' : 'secondary'
                  }>
                    {progress.status === 'uploading' ? 'Enviando...' :
                     progress.status === 'completed' ? 'Concluído' : 'Erro'}
                  </Badge>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview das Imagens */}
      {showPreview && uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Imagens Enviadas</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.filename} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteImage(image.filename)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate" title={image.originalName}>
                      {image.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}