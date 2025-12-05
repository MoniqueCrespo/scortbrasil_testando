import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Image, Video, Lock, Unlock } from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";

interface ExclusiveContentUploaderProps {
  profileId: string;
}

interface SubscriptionTier {
  id: string;
  tier_name: string;
  monthly_price: number;
}

export const ExclusiveContentUploader = ({ profileId }: ExclusiveContentUploaderProps) => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    caption: "",
    is_preview: false,
    required_tier_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTiers();
  }, [profileId]);

  const fetchTiers = async () => {
    const { data } = await supabase
      .from('subscription_tiers')
      .select('id, tier_name, monthly_price')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('sort_order');
    
    setTiers(data || []);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem ou vídeo",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 100MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      let fileToUpload = selectedFile;
      const isImage = selectedFile.type.startsWith('image/');

      // Compress image if needed
      if (isImage && selectedFile.size > 2 * 1024 * 1024) {
        fileToUpload = await imageCompression(selectedFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('exclusive-content')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('exclusive-content')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('exclusive_content')
        .insert({
          profile_id: profileId,
          media_type: isImage ? 'image' : 'video',
          media_url: publicUrl,
          caption: formData.caption,
          is_preview: formData.is_preview,
          required_tier_id: formData.is_preview ? null : (formData.required_tier_id || null),
        });

      if (insertError) throw insertError;

      toast({ title: "Conteúdo publicado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading content:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload do conteúdo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setFormData({
      caption: "",
      is_preview: false,
      required_tier_id: "",
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Novo Conteúdo Exclusivo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicar Conteúdo Exclusivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p>Solte o arquivo aqui...</p>
              ) : (
                <>
                  <p className="mb-2">Arraste uma foto ou vídeo aqui</p>
                  <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                  <p className="mt-2 text-xs text-muted-foreground">Máximo 100MB</p>
                </>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="relative rounded-lg overflow-hidden bg-muted max-h-[400px] flex items-center justify-center">
                  {selectedFile.type.startsWith('image/') ? (
                    <img src={preview!} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
                  ) : (
                    <video src={preview!} controls className="w-full h-auto max-h-[400px] object-contain" />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="mt-2"
                >
                  Trocar arquivo
                </Button>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="caption">Legenda</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Escreva uma legenda para este conteúdo..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_preview"
              checked={formData.is_preview}
              onCheckedChange={(checked) => setFormData({ ...formData, is_preview: checked })}
            />
            <Label htmlFor="is_preview" className="flex items-center gap-2">
              {formData.is_preview ? (
                <>
                  <Unlock className="w-4 h-4" />
                  Conteúdo Gratuito (Preview)
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Conteúdo Exclusivo (Pago)
                </>
              )}
            </Label>
          </div>

          {!formData.is_preview && tiers.length > 0 && (
            <div>
              <Label htmlFor="tier">Plano Mínimo Necessário (opcional)</Label>
              <Select
                value={formData.required_tier_id}
                onValueChange={(value) => setFormData({ ...formData, required_tier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os assinantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os assinantes</SelectItem>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.tier_name} - R$ {tier.monthly_price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Se não selecionar, todos os assinantes poderão ver este conteúdo
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? 'Publicando...' : 'Publicar Conteúdo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
