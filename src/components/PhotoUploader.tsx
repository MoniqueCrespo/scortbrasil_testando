import { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, Star, Crop, CheckCircle, Info, AlertCircle, Loader2, Eye, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { PhotoCropper } from '@/components/PhotoCropper';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import { PhotoEditor } from '@/components/PhotoEditor';
import imageCompression from 'browser-image-compression';

const IMAGE_REQUIREMENTS = {
  minWidth: 400,
  minHeight: 300,
  maxWidth: 4000,
  maxHeight: 4000,
  maxFileSize: 5242880, // 5MB
  acceptedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
  aspectRatios: {
    min: 2/3, // 0.67 - aceita fotos verticais de celular
    max: 16/9
  }
};

const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  initialQuality: 0.85,
};

interface ValidationResult {
  valid: boolean;
  errors: string[];
  width?: number;
  height?: number;
}

interface PhotoUploaderProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  minPhotos?: number;
}

const compressImage = async (file: File): Promise<File> => {
  try {
    // Só comprimir se arquivo > 2MB
    if (file.size <= 2 * 1024 * 1024) {
      return file;
    }
    
    const compressedBlob = await imageCompression(file, COMPRESSION_OPTIONS);
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Compression error:', error);
    return file;
  }
};

const validateImageDimensions = (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const errors: string[] = [];
      const { width, height } = img;
      const aspectRatio = width / height;
      
      if (width < IMAGE_REQUIREMENTS.minWidth) {
        errors.push(`Largura muito pequena (${width}px). Mínimo: ${IMAGE_REQUIREMENTS.minWidth}px`);
      }
      if (height < IMAGE_REQUIREMENTS.minHeight) {
        errors.push(`Altura muito pequena (${height}px). Mínimo: ${IMAGE_REQUIREMENTS.minHeight}px`);
      }
      if (width > IMAGE_REQUIREMENTS.maxWidth) {
        errors.push(`Largura muito grande (${width}px). Máximo: ${IMAGE_REQUIREMENTS.maxWidth}px`);
      }
      if (height > IMAGE_REQUIREMENTS.maxHeight) {
        errors.push(`Altura muito grande (${height}px). Máximo: ${IMAGE_REQUIREMENTS.maxHeight}px`);
      }
      if (aspectRatio < IMAGE_REQUIREMENTS.aspectRatios.min) {
        errors.push(`Imagem muito estreita (proporção ${aspectRatio.toFixed(2)}). Use entre 2:3 e 16:9`);
      }
      if (aspectRatio > IMAGE_REQUIREMENTS.aspectRatios.max) {
        errors.push(`Imagem muito larga (proporção ${aspectRatio.toFixed(2)}). Use entre 2:3 e 16:9`);
      }
      
      resolve({
        valid: errors.length === 0,
        errors,
        width,
        height
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        errors: ['Não foi possível carregar a imagem. Arquivo pode estar corrompido.']
      });
    };
    
    img.src = url;
  });
};

const ImageRequirements = () => (
  <Card className="bg-muted/30">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        Requisitos das Fotos
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Dimensões: {IMAGE_REQUIREMENTS.minWidth}×{IMAGE_REQUIREMENTS.minHeight}px a {IMAGE_REQUIREMENTS.maxWidth}×{IMAGE_REQUIREMENTS.maxHeight}px</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Tamanho máximo: 5MB por foto</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Formatos aceitos: JPG, PNG, WEBP</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Proporção: entre 2:3 (retrato) e 16:9 (paisagem)</span>
      </div>
    </CardContent>
  </Card>
);

const SortablePhoto = ({ 
  file, 
  index, 
  onRemove, 
  onCrop,
  onView,
  onEdit
}: { 
  file: File; 
  index: number; 
  onRemove: () => void;
  onCrop: () => void;
  onView: () => void;
  onEdit: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.name,
  });
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }, [file]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "relative group aspect-square rounded-lg overflow-hidden border-2",
        isDragging ? "opacity-50 border-primary" : "border-muted",
        index === 0 && "border-yellow-500 ring-2 ring-yellow-500/50"
      )}
    >
      <img
        {...listeners}
        src={URL.createObjectURL(file)}
        alt={`Upload ${index + 1}`}
        className="w-full h-full object-cover cursor-move"
      />
      
      {index === 0 && (
        <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
          <Star className="h-3 w-3 mr-1" />
          Principal
        </Badge>
      )}

      {dimensions && (
        <Badge className="absolute bottom-2 left-2 bg-black/70 text-white text-xs border-0">
          {dimensions.width}×{dimensions.height}px
        </Badge>
      )}
      
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          title="Visualizar"
        >
          <Eye className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Editar filtros"
        >
          <Sliders className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onCrop();
          }}
          title="Recortar"
        >
          <Crop className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remover"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const PhotoUploader = ({ photos, onPhotosChange, maxPhotos = 10, minPhotos = 4 }: PhotoUploaderProps) => {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState<string>('');
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(-1);
  const [rejectedFiles, setRejectedFiles] = useState<Array<{ file: File; errors: string[] }>>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(-1);

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setIsValidating(true);
    setIsCompressing(true);
    const newRejected: Array<{ file: File; errors: string[] }> = [];
    
    // Processar rejeições do react-dropzone (tamanho, tipo)
    fileRejections.forEach(rejection => {
      newRejected.push({
        file: rejection.file,
        errors: rejection.errors.map(e => e.message)
      });
    });
    
    // Comprimir arquivos aceitos ANTES da validação
    const compressedFiles: File[] = [];
    for (const file of acceptedFiles) {
      const compressed = await compressImage(file);
      compressedFiles.push(compressed);
    }
    setIsCompressing(false);
    
    // Validar dimensões das imagens comprimidas
    const validatedFiles: File[] = [];
    
    for (const file of compressedFiles) {
      const validation = await validateImageDimensions(file);
      
      if (validation.valid) {
        validatedFiles.push(file);
      } else {
        newRejected.push({
          file,
          errors: validation.errors
        });
      }
    }
    
    // Adicionar apenas fotos válidas
    const newPhotos = [...photos, ...validatedFiles].slice(0, maxPhotos);
    onPhotosChange(newPhotos);
    
    // Atualizar lista de rejeitados
    setRejectedFiles(prev => [...prev, ...newRejected]);
    setIsValidating(false);
    
    // Mostrar toast se houver rejeitados
    if (newRejected.length > 0) {
      toast({
        variant: "destructive",
        title: `${newRejected.length} foto(s) rejeitada(s)`,
        description: "Verifique os requisitos de dimensões e tamanho abaixo."
      });
    } else if (validatedFiles.length > 0) {
      toast({
        title: `${validatedFiles.length} foto(s) adicionada(s)`,
      });
    }
  }, [photos, maxPhotos, onPhotosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': IMAGE_REQUIREMENTS.acceptedFormats },
    maxSize: IMAGE_REQUIREMENTS.maxFileSize,
    maxFiles: maxPhotos - photos.length,
    disabled: photos.length >= maxPhotos || isValidating || isCompressing,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex(p => p.name === active.id);
      const newIndex = photos.findIndex(p => p.name === over.id);
      onPhotosChange(arrayMove(photos, oldIndex, newIndex));
    }
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const openCropper = (index: number) => {
    const imageUrl = URL.createObjectURL(photos[index]);
    setCurrentCropImage(imageUrl);
    setCurrentCropIndex(index);
    setCropperOpen(true);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (currentCropIndex !== -1) {
      const croppedFile = new File([croppedBlob], photos[currentCropIndex].name, {
        type: 'image/jpeg',
      });
      const newPhotos = [...photos];
      newPhotos[currentCropIndex] = croppedFile;
      onPhotosChange(newPhotos);
      toast({
        title: "Foto recortada com sucesso!",
      });
    }
    setCropperOpen(false);
    setCurrentCropImage('');
    setCurrentCropIndex(-1);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setCurrentCropImage('');
    setCurrentCropIndex(-1);
  };

  const openEditor = (index: number) => {
    setCurrentEditIndex(index);
    setEditorOpen(true);
  };

  const handleEditComplete = (editedBlob: Blob) => {
    if (currentEditIndex !== -1) {
      const editedFile = new File([editedBlob], photos[currentEditIndex].name, {
        type: 'image/jpeg',
      });
      const newPhotos = [...photos];
      newPhotos[currentEditIndex] = editedFile;
      onPhotosChange(newPhotos);
      toast({
        title: "Foto editada com sucesso!",
      });
    }
    setEditorOpen(false);
    setCurrentEditIndex(-1);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Image Requirements Card */}
        <ImageRequirements />

        {/* Photo Counter & Plan Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {photos.length}/{maxPhotos} fotos enviadas
              {photos.length < minPhotos && (
                <span className="text-destructive ml-2">
                  (mínimo {minPhotos})
                </span>
              )}
            </p>
            {photos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Arraste para reordenar • Clique no ícone para ajustar
              </p>
            )}
          </div>
          
          {/* Freemium Photo Limit Notice */}
          {photos.length > 4 && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-yellow-700 dark:text-yellow-500">
                    📸 Limite de fotos visíveis
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Plano Gratuito:</span> Apenas 4 fotos serão exibidas no seu perfil público. 
                    {photos.length > 4 && (
                      <span className="text-yellow-600 dark:text-yellow-500 font-medium">
                        {' '}({photos.length - 4} fotos ficarão ocultas 🔒)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💡 <span className="font-medium">Dica:</span> Atualize para Plano Premium para mostrar até 10 fotos e aumentar suas conversões!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Validation Progress */}
        {isCompressing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Comprimindo imagens...
          </div>
        )}

        {isValidating && !isCompressing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validando imagens...
          </div>
        )}

        {/* Rejected Files Alert */}
        {rejectedFiles.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fotos Rejeitadas ({rejectedFiles.length})</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {rejectedFiles.map((rejected, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{rejected.file.name}</p>
                    <ul className="list-disc list-inside pl-2 text-xs">
                      {rejected.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setRejectedFiles([])}
              >
                Limpar Lista
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photos.map(p => p.name)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <SortablePhoto
                    key={photo.name}
                    file={photo}
                    index={index}
                    onRemove={() => removePhoto(index)}
                    onCrop={() => openCropper(index)}
                    onView={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    onEdit={() => openEditor(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Dropzone */}
        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary hover:bg-muted/30",
              (isValidating || isCompressing) && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive
                ? "Solte as fotos aqui..."
                : "Arraste fotos ou clique para selecionar"}
            </p>
            <p className="text-sm text-muted-foreground">
              Adicione até {maxPhotos - photos.length} fotos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo {IMAGE_REQUIREMENTS.minWidth}×{IMAGE_REQUIREMENTS.minHeight}px • Máximo 5MB
            </p>
          </div>
        )}
      </div>

      <PhotoCropper
        image={currentCropImage}
        open={cropperOpen}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />

      <PhotoLightbox
        photos={photos}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      <PhotoEditor
        image={currentEditIndex !== -1 ? URL.createObjectURL(photos[currentEditIndex]) : ''}
        open={editorOpen}
        onComplete={handleEditComplete}
        onCancel={() => {
          setEditorOpen(false);
          setCurrentEditIndex(-1);
        }}
      />
    </>
  );
};
