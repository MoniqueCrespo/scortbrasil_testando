import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

interface StoryUploaderProps {
  profileId: string;
  onUploadSuccess: () => void;
}

export const StoryUploader = ({ profileId, onUploadSuccess }: StoryUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Validate file type
    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie uma imagem ou vídeo",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate aspect ratio for images (9:16)
    if (isImage) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const targetRatio = 9 / 16;
          const tolerance = 0.1;

          if (Math.abs(aspectRatio - targetRatio) > tolerance) {
            toast({
              title: "Proporção inválida",
              description: "A imagem deve ter proporção 9:16 (vertical)",
              variant: "destructive",
            });
            return;
          }

          setFile(selectedFile);
          setPreview(e.target?.result as string);
        };
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "video/*": [".mp4", ".mov"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      let processedFile = file;

      // Compress image if needed
      if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
        processedFile = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1080,
          useWebWorker: true,
        });
      }

      // Upload to storage
      const fileExt = processedFile.name.split(".").pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("story-media")
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("story-media")
        .getPublicUrl(fileName);

      // Create story record
      const { error: insertError } = await supabase
        .from("profile_stories")
        .insert({
          profile_id: profileId,
          media_url: publicUrl,
          media_type: file.type.startsWith("image/") ? "image" : "video",
        });

      if (insertError) throw insertError;

      toast({
        title: "Story publicado!",
        description: "Seu story foi publicado com sucesso",
      });

      setFile(null);
      setPreview(null);
      onUploadSuccess();
    } catch (error) {
      console.error("Error uploading story:", error);
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar o story. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setFile(null);
    setPreview(null);
  };

  if (preview) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative aspect-[9/16] max-h-[500px] mx-auto bg-muted rounded-lg overflow-hidden">
            {file?.type.startsWith("image/") ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <video src={preview} className="w-full h-full object-cover" controls />
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={clearPreview}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={clearPreview} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading} className="flex-1">
              {uploading ? "Publicando..." : "Publicar Story"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">
              {isDragActive ? "Solte o arquivo aqui" : "Adicionar Story"}
            </p>
            <p className="text-sm text-muted-foreground">
              Arraste ou clique para fazer upload
            </p>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>Imagem 9:16</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>Vídeo 9:16</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Máximo 5MB • Expira em 24h</p>
        </div>
      </div>
    </Card>
  );
};
