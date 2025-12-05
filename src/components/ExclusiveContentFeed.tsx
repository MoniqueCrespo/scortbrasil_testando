import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Eye, Lock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { ContentCommentsReactions } from "./ContentCommentsReactions";

interface ExclusiveContent {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  caption: string;
  is_preview: boolean;
  view_count: number;
  created_at: string;
  model_profiles: {
    id: string;
    name: string;
    slug: string;
    photo_url: string;
  };
}

interface ExclusiveContentFeedProps {
  profileSlug?: string;
}

export const ExclusiveContentFeed = ({ profileSlug }: ExclusiveContentFeedProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState<ExclusiveContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchContent();
      if (profileSlug) {
        checkAccess();
      }
    }
  }, [user, profileSlug]);

  const checkAccess = async () => {
    if (!profileSlug) return;

    try {
      const { data: profile } = await supabase
        .from('model_profiles')
        .select('id')
        .eq('slug', profileSlug)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from('content_subscriptions')
        .select('id')
        .eq('subscriber_id', user?.id)
        .eq('profile_id', profile.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .single();

      setHasAccess(!!data);
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

  const fetchContent = async () => {
    try {
      let query = supabase
        .from('exclusive_content')
        .select(`
          *,
          model_profiles!inner (
            id,
            name,
            slug,
            photo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (profileSlug) {
        const { data: profile } = await supabase
          .from('model_profiles')
          .select('id')
          .eq('slug', profileSlug)
          .single();

        if (profile) {
          query = query.eq('profile_id', profile.id);
        }
      } else {
        // Get content from subscribed profiles
        const { data: subscriptions } = await supabase
          .from('content_subscriptions')
          .select('profile_id')
          .eq('subscriber_id', user?.id)
          .eq('status', 'active')
          .gt('end_date', new Date().toISOString());

        if (subscriptions && subscriptions.length > 0) {
          const profileIds = subscriptions.map(s => s.profile_id);
          query = query.in('profile_id', profileIds);
        } else {
          setContent([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setContent((data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video'
      })));
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordView = async (contentId: string) => {
    try {
      await supabase
        .from('content_views')
        .insert({
          content_id: contentId,
          viewer_id: user?.id,
        });

      const { data: currentContent } = await supabase
        .from('exclusive_content')
        .select('view_count')
        .eq('id', contentId)
        .single();
      
      if (currentContent) {
        await supabase
          .from('exclusive_content')
          .update({ view_count: (currentContent.view_count || 0) + 1 })
          .eq('id', contentId);
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Faça login para ver o conteúdo exclusivo</p>
          <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
        </CardContent>
      </Card>
    );
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {profileSlug 
              ? "Nenhum conteúdo publicado ainda"
              : "Você não tem assinaturas ativas. Assine perfis para ver conteúdo exclusivo!"}
          </p>
          {!profileSlug && (
            <Button onClick={() => navigate('/')}>
              Explorar Perfis
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {content.map((item) => {
        const canView = item.is_preview || hasAccess;

        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b">
              {item.model_profiles.photo_url && (
                <img
                  src={item.model_profiles.photo_url}
                  alt={item.model_profiles.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{item.model_profiles.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              {item.is_preview && (
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  Preview Grátis
                </span>
              )}
            </div>

            <div className="relative">
              {canView ? (
                <>
                  {item.media_type === 'image' ? (
                    <img
                      src={item.media_url}
                      alt="Conteúdo exclusivo"
                      className="w-full h-auto"
                      onLoad={() => recordView(item.id)}
                    />
                  ) : (
                    <video
                      src={item.media_url}
                      controls
                      className="w-full h-auto"
                      onPlay={() => recordView(item.id)}
                    />
                  )}
                </>
              ) : (
                <div className="relative">
                  <img
                    src={item.media_url}
                    alt="Conteúdo bloqueado"
                    className="w-full h-auto blur-3xl"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                    <Lock className="w-16 h-16 mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">Conteúdo Exclusivo</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Assine para desbloquear
                    </p>
                    <Button onClick={() => navigate(`/acompanhantes/${item.model_profiles.slug}`)}>
                      Ver Planos
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {item.caption && (
              <div className="p-4">
                <p className="text-sm">{item.caption}</p>
              </div>
            )}

            {canView && (
              <div className="px-4 pb-4">
                <ContentCommentsReactions contentId={item.id} />
              </div>
            )}

            <div className="px-4 py-3 border-t flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {item.view_count}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
