import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Bookmark, Heart, MessageCircle, Eye, Trash2, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SavedContent {
  id: string;
  content_id: string;
  saved_at: string;
  content: {
    id: string;
    media_url: string;
    media_type: string;
    caption: string | null;
    thumbnail_url: string | null;
    profile_id: string;
    profile: {
      name: string;
      photo_url: string | null;
    };
  };
}

interface LikedContent {
  id: string;
  content_id: string;
  reaction_type: string;
  created_at: string;
  content: {
    id: string;
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    profile_id: string;
    profile: {
      name: string;
      photo_url: string | null;
    };
  };
}

interface Comment {
  id: string;
  content_id: string;
  comment_text: string;
  created_at: string;
  content: {
    id: string;
    media_url: string;
    thumbnail_url: string | null;
    profile_id: string;
    profile: {
      name: string;
      photo_url: string | null;
    };
  };
}

interface ViewHistory {
  id: string;
  content_id: string;
  viewed_at: string;
  content: {
    id: string;
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    profile_id: string;
    profile: {
      name: string;
      photo_url: string | null;
    };
  };
}

const reactionEmojis: { [key: string]: string } = {
  like: "❤️",
  love: "😍",
  fire: "🔥",
  clap: "👏",
};

export default function ClientActivity() {
  const { user } = useAuth();
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [likedContent, setLikedContent] = useState<LikedContent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [viewHistory, setViewHistory] = useState<ViewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ saved: 0, liked: 0, comments: 0 });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSavedContent(),
        fetchLikedContent(),
        fetchComments(),
        fetchViewHistory(),
      ]);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      toast.error("Erro ao carregar atividades");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedContent = async () => {
    const { data, error } = await supabase
      .from("saved_content")
      .select(`
        id,
        content_id,
        saved_at,
        content:exclusive_content!inner(
          id,
          media_url,
          media_type,
          caption,
          thumbnail_url,
          profile_id,
          profile:model_profiles!inner(name, photo_url)
        )
      `)
      .eq("user_id", user?.id)
      .order("saved_at", { ascending: false });

    if (!error && data) {
      setSavedContent(data as any);
      setStats(prev => ({ ...prev, saved: data.length }));
    }
  };

  const fetchLikedContent = async () => {
    const { data, error } = await supabase
      .from("content_reactions")
      .select(`
        id,
        content_id,
        reaction_type,
        created_at,
        content:exclusive_content!inner(
          id,
          media_url,
          thumbnail_url,
          caption,
          profile_id,
          profile:model_profiles!inner(name, photo_url)
        )
      `)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLikedContent(data as any);
      setStats(prev => ({ ...prev, liked: data.length }));
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("content_comments")
      .select(`
        id,
        content_id,
        comment_text,
        created_at,
        content:exclusive_content!inner(
          id,
          media_url,
          thumbnail_url,
          profile_id,
          profile:model_profiles!inner(name, photo_url)
        )
      `)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as any);
      setStats(prev => ({ ...prev, comments: data.length }));
    }
  };

  const fetchViewHistory = async () => {
    const { data, error } = await supabase
      .from("content_views")
      .select(`
        id,
        content_id,
        viewed_at,
        content:exclusive_content!inner(
          id,
          media_url,
          thumbnail_url,
          caption,
          profile_id,
          profile:model_profiles!inner(name, photo_url)
        )
      `)
      .eq("viewer_id", user?.id)
      .order("viewed_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setViewHistory(data as any);
    }
  };

  const handleRemoveSaved = async (savedId: string, contentId: string) => {
    const { error } = await supabase
      .from("saved_content")
      .delete()
      .eq("id", savedId);

    if (!error) {
      setSavedContent(prev => prev.filter(item => item.id !== savedId));
      setStats(prev => ({ ...prev, saved: prev.saved - 1 }));
      toast.success("Removido dos salvos");
    } else {
      toast.error("Erro ao remover");
    }
  };

  const handleRemoveReaction = async (reactionId: string) => {
    const { error } = await supabase
      .from("content_reactions")
      .delete()
      .eq("id", reactionId);

    if (!error) {
      setLikedContent(prev => prev.filter(item => item.id !== reactionId));
      setStats(prev => ({ ...prev, liked: prev.liked - 1 }));
      toast.success("Reação removida");
    } else {
      toast.error("Erro ao remover reação");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("content_comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      setComments(prev => prev.filter(item => item.id !== commentId));
      setStats(prev => ({ ...prev, comments: prev.comments - 1 }));
      toast.success("Comentário deletado");
    } else {
      toast.error("Erro ao deletar comentário");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">Carregando atividades...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Bookmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.saved}</p>
                <p className="text-sm text-muted-foreground">Conteúdos Salvos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-secondary/10">
                <Heart className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.liked}</p>
                <p className="text-sm text-muted-foreground">Curtidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-accent/10">
                <MessageCircle className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.comments}</p>
                <p className="text-sm text-muted-foreground">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Minha Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="saved" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="saved">📁 Salvos</TabsTrigger>
              <TabsTrigger value="liked">❤️ Curtidos</TabsTrigger>
              <TabsTrigger value="comments">💬 Comentários</TabsTrigger>
              <TabsTrigger value="history">👁️ Histórico</TabsTrigger>
            </TabsList>

            {/* Saved Content Tab */}
            <TabsContent value="saved" className="mt-6">
              {savedContent.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum conteúdo salvo ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {savedContent.map((item) => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.content.thumbnail_url || item.content.media_url}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        {item.content.media_type === "video" ? <Play className="w-3 h-3" /> : "📷"}
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={item.content.profile.photo_url || ""} />
                              <AvatarFallback>{item.content.profile.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-white text-sm font-medium">{item.content.profile.name}</span>
                          </div>
                          <p className="text-xs text-white/70">
                            Salvo {formatDistanceToNow(new Date(item.saved_at), { addSuffix: true, locale: ptBR })}
                          </p>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full mt-2"
                            onClick={() => handleRemoveSaved(item.id, item.content_id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Liked Content Tab */}
            <TabsContent value="liked" className="mt-6">
              {likedContent.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Você ainda não curtiu nenhum conteúdo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {likedContent.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <img
                        src={item.content.thumbnail_url || item.content.media_url}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={item.content.profile.photo_url || ""} />
                            <AvatarFallback>{item.content.profile.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.content.profile.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-lg">{reactionEmojis[item.reaction_type] || "❤️"}</span>
                          <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveReaction(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="mt-6">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Você ainda não comentou em nenhum conteúdo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <img
                        src={item.content.thumbnail_url || item.content.media_url}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={item.content.profile.photo_url || ""} />
                            <AvatarFallback>{item.content.profile.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.content.profile.name}</span>
                        </div>
                        <p className="text-sm mb-2">{item.comment_text}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComment(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* View History Tab */}
            <TabsContent value="history" className="mt-6">
              {viewHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma visualização recente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewHistory.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <img
                        src={item.content.thumbnail_url || item.content.media_url}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={item.content.profile.photo_url || ""} />
                            <AvatarFallback>{item.content.profile.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.content.profile.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Visualizado {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true, locale: ptBR })}
                        </p>
                        {item.content.caption && (
                          <p className="text-sm mt-1 truncate">{item.content.caption}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Continuar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
