import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  Image as ImageIcon,
  Video,
  Lock,
  Unlock,
  MoreVertical,
} from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExclusiveContentManagerProps {
  profileId: string;
}

interface ContentItem {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  is_preview: boolean;
  required_tier_id: string | null;
  view_count: number;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  tier_name?: string;
  tier_price?: number;
}

interface SubscriptionTier {
  id: string;
  tier_name: string;
  monthly_price: number;
}

export const ExclusiveContentManager = ({ profileId }: ExclusiveContentManagerProps) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [deletingContent, setDeletingContent] = useState<ContentItem | null>(null);
  const [editForm, setEditForm] = useState({
    caption: "",
    is_preview: false,
    required_tier_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
    fetchTiers();
  }, [profileId]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data: contentData, error } = await supabase
        .from("exclusive_content")
        .select(`
          *,
          subscription_tiers:required_tier_id (
            tier_name,
            monthly_price
          )
        `)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reaction counts
      const contentIds = contentData?.map((c) => c.id) || [];
      const { data: reactions } = await supabase
        .from("content_reactions")
        .select("content_id")
        .in("content_id", contentIds);

      const { data: comments } = await supabase
        .from("content_comments")
        .select("content_id")
        .in("content_id", contentIds);

      const reactionCounts = reactions?.reduce((acc, r) => {
        acc[r.content_id] = (acc[r.content_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const commentCounts = comments?.reduce((acc, c) => {
        acc[c.content_id] = (acc[c.content_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Generate signed URLs for media
      const enrichedContent = await Promise.all(
        (contentData || []).map(async (c) => {
          let signedUrl = c.media_url;
          
          // Extract file path from the stored URL
          const urlParts = c.media_url.split("/exclusive-content/");
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            
            // Generate signed URL (valid for 1 hour)
            const { data: signedData } = await supabase.storage
              .from("exclusive-content")
              .createSignedUrl(filePath, 3600);
            
            if (signedData?.signedUrl) {
              signedUrl = signedData.signedUrl;
            }
          }

          return {
            ...c,
            media_url: signedUrl,
            reactions_count: reactionCounts[c.id] || 0,
            comments_count: commentCounts[c.id] || 0,
            tier_name: c.subscription_tiers?.tier_name,
            tier_price: c.subscription_tiers?.monthly_price,
          };
        })
      );

      setContent(enrichedContent);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os conteúdos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTiers = async () => {
    const { data } = await supabase
      .from("subscription_tiers")
      .select("id, tier_name, monthly_price")
      .eq("profile_id", profileId)
      .eq("is_active", true)
      .order("sort_order");

    setTiers(data || []);
  };

  const handleEditClick = (item: ContentItem) => {
    setEditingContent(item);
    setEditForm({
      caption: item.caption || "",
      is_preview: item.is_preview,
      required_tier_id: item.required_tier_id || "",
    });
  };

  const handleEditSave = async () => {
    if (!editingContent) return;

    try {
      const { error } = await supabase
        .from("exclusive_content")
        .update({
          caption: editForm.caption,
          is_preview: editForm.is_preview,
          required_tier_id: editForm.is_preview ? null : (editForm.required_tier_id || null),
        })
        .eq("id", editingContent.id);

      if (error) throw error;

      toast({ title: "Conteúdo atualizado com sucesso!" });
      setEditingContent(null);
      fetchContent();
    } catch (error) {
      console.error("Error updating content:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o conteúdo",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingContent) return;

    try {
      // Extract file path from URL
      const urlParts = deletingContent.media_url.split("/exclusive-content/");
      const filePath = urlParts[1];

      // Delete from storage
      if (filePath) {
        await supabase.storage.from("exclusive-content").remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from("exclusive_content")
        .delete()
        .eq("id", deletingContent.id);

      if (error) throw error;

      toast({ title: "Conteúdo excluído com sucesso!" });
      setDeletingContent(null);
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o conteúdo",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">Nenhum conteúdo publicado ainda</p>
          <p className="text-sm text-muted-foreground">
            Publique seu primeiro conteúdo exclusivo para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Thumbnail */}
              <div className="relative aspect-square bg-muted">
                {item.media_type === "image" ? (
                  <OptimizedImage
                    src={item.media_url}
                    alt={item.caption || "Conteúdo exclusivo"}
                    className="w-full h-full object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                    />
                    <Video className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-80" />
                  </div>
                )}

                {/* Badge */}
                <div className="absolute top-2 left-2">
                  {item.is_preview ? (
                    <Badge variant="secondary" className="gap-1">
                      <Unlock className="w-3 h-3" />
                      Preview
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-1">
                      <Lock className="w-3 h-3" />
                      Exclusivo
                    </Badge>
                  )}
                </div>

                {/* Actions Menu */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(item)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingContent(item)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                {item.caption && (
                  <p className="text-sm line-clamp-2">{item.caption}</p>
                )}

                {!item.is_preview && item.tier_name && (
                  <Badge variant="outline" className="text-xs">
                    {item.tier_name} - R$ {item.tier_price?.toFixed(2)}
                  </Badge>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{item.reactions_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{item.comments_count}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conteúdo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-caption">Legenda</Label>
              <Textarea
                id="edit-caption"
                value={editForm.caption}
                onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                placeholder="Escreva uma legenda..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-preview"
                checked={editForm.is_preview}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_preview: checked })}
              />
              <Label htmlFor="edit-is-preview" className="flex items-center gap-2">
                {editForm.is_preview ? (
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

            {!editForm.is_preview && tiers.length > 0 && (
              <div>
                <Label htmlFor="edit-tier">Plano Mínimo Necessário</Label>
                <Select
                  value={editForm.required_tier_id}
                  onValueChange={(value) => setEditForm({ ...editForm, required_tier_id: value })}
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
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContent(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingContent} onOpenChange={() => setDeletingContent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita e o
              arquivo será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
