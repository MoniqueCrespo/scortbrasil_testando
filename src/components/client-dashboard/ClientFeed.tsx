import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Share2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ContentCommentsReactions } from "@/components/ContentCommentsReactions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface FeedContent {
  id: string;
  media_url: string;
  media_type: string;
  caption: string;
  created_at: string;
  is_preview: boolean;
  profile_id: string;
  profiles: {
    name: string;
    photo_url: string;
    slug: string;
  };
  is_saved?: boolean;
  reactions_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
  comments_open?: boolean;
}

export default function ClientFeed() {
  const { user } = useAuth();
  const [content, setContent] = useState<FeedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const observerRef = useRef<IntersectionObserver>();
  const lastElementRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);

  useEffect(() => {
    fetchFeed(true);
  }, [user]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreContent();
      }
    });

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, page]);

  // Pull to refresh (mobile)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      pullStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      pullDistance.current = touchY - pullStartY.current;

      if (pullDistance.current > 0 && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance.current > 100 && window.scrollY === 0) {
        handleRefresh();
      }
      pullDistance.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const fetchFeed = async (reset: boolean = false) => {
    if (!user) return;

    const currentPage = reset ? 0 : page;
    const limit = 10;
    const offset = currentPage * limit;

    try {
      // Fetch subscriptions first
      const { data: subscriptions } = await supabase
        .from("content_subscriptions")
        .select("profile_id")
        .eq("subscriber_id", user.id)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString());

      const profileIds = subscriptions?.map(s => s.profile_id) || [];

      if (profileIds.length === 0) {
        setContent([]);
        setLoading(false);
        setHasMore(false);
        return;
      }

      // Fetch content from subscribed profiles
      const { data, error } = await supabase
        .from("exclusive_content")
        .select(`
          *,
          profiles:model_profiles!inner (
            name,
            photo_url,
            slug
          )
        `)
        .in("profile_id", profileIds)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      if (!data || data.length < limit) {
        setHasMore(false);
      }

      // Check saved status
      const contentIds = data?.map(c => c.id) || [];
      const { data: savedContent } = await supabase
        .from("saved_content")
        .select("content_id")
        .eq("user_id", user.id)
        .in("content_id", contentIds);

      const savedIds = new Set(savedContent?.map(s => s.content_id) || []);

      // Get reactions and comments count
      const contentWithMetadata = await Promise.all(
        (data || []).map(async (item) => {
          const [reactions, comments, userReaction] = await Promise.all([
            supabase
              .from("content_reactions")
              .select("id", { count: "exact", head: true })
              .eq("content_id", item.id),
            supabase
              .from("content_comments")
              .select("id", { count: "exact", head: true })
              .eq("content_id", item.id),
            supabase
              .from("content_reactions")
              .select("id")
              .eq("content_id", item.id)
              .eq("user_id", user.id)
              .eq("reaction_type", "like")
              .maybeSingle(),
          ]);

          return {
            ...item,
            is_saved: savedIds.has(item.id),
            reactions_count: reactions.count || 0,
            comments_count: comments.count || 0,
            user_has_liked: !!userReaction.data,
            comments_open: false,
          };
        })
      );

      if (reset) {
        setContent(contentWithMetadata);
        setPage(1);
      } else {
        setContent(prev => [...prev, ...contentWithMetadata]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
      toast.error("Erro ao carregar feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMoreContent = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchFeed(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    await fetchFeed(true);
  };

  const handleSave = async (contentId: string, isSaved: boolean) => {
    if (!user) return;

    try {
      if (isSaved) {
        await supabase
          .from("saved_content")
          .delete()
          .eq("user_id", user.id)
          .eq("content_id", contentId);
        toast.success("Removido dos salvos");
      } else {
        await supabase
          .from("saved_content")
          .insert({ user_id: user.id, content_id: contentId });
        toast.success("Salvo com sucesso");
      }

      setContent(prev =>
        prev.map(c =>
          c.id === contentId ? { ...c, is_saved: !isSaved } : c
        )
      );
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Erro ao salvar conteúdo");
    }
  };

  const handleLike = async (contentId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from("content_reactions")
          .delete()
          .eq("content_id", contentId)
          .eq("user_id", user.id)
          .eq("reaction_type", "like");
      } else {
        await supabase
          .from("content_reactions")
          .insert({
            content_id: contentId,
            user_id: user.id,
            reaction_type: "like",
          });
      }

      setContent(prev =>
        prev.map(c =>
          c.id === contentId
            ? {
                ...c,
                user_has_liked: !isLiked,
                reactions_count: (c.reactions_count || 0) + (isLiked ? -1 : 1),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Erro ao curtir");
    }
  };

  // Double tap to like
  const handleDoubleTap = (contentId: string, isLiked: boolean) => {
    if (!isLiked) {
      handleLike(contentId, false);
      
      // Animação de coração
      const element = document.getElementById(`content-${contentId}`);
      if (element) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 80px;
          animation: heartPop 0.6s ease-out;
          pointer-events: none;
          z-index: 10;
        `;
        element.appendChild(heart);
        setTimeout(() => heart.remove(), 600);
      }
    }
  };

  const toggleComments = (contentId: string) => {
    setContent(prev =>
      prev.map(c =>
        c.id === contentId ? { ...c, comments_open: !c.comments_open } : c
      )
    );
  };

  const handleShare = async (item: FeedContent) => {
    const shareUrl = `${window.location.origin}/acompanhantes/${item.profiles.slug}`;
    const shareText = `Confira o conteúdo de ${item.profiles.name} no SCORT BRASIL`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: item.caption || shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Share cancelled", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado!");
      } catch (error) {
        toast.error("Erro ao copiar link");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum conteúdo ainda</h3>
          <p className="text-muted-foreground mb-6">
            Assine criadoras para ver conteúdo exclusivo no seu feed
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Explorar Criadoras
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="flex justify-center py-4">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <style>
        {`
          @keyframes heartPop {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1) translateY(-50px);
              opacity: 0;
            }
          }
        `}
      </style>

      {content.map((item, index) => {
        let lastTapTime = 0;

        return (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Creator Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Avatar>
                  <AvatarImage src={item.profiles.photo_url} />
                  <AvatarFallback>{item.profiles.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">{item.profiles.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                {item.is_preview && (
                  <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Preview
                  </div>
                )}
              </div>

              {/* Media with double-tap */}
              <div 
                id={`content-${item.id}`}
                className="relative bg-black cursor-pointer select-none"
                onClick={(e) => {
                  const now = Date.now();
                  if (now - lastTapTime < 300) {
                    handleDoubleTap(item.id, item.user_has_liked || false);
                  }
                  lastTapTime = now;
                }}
              >
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    controls
                    className="w-full max-h-[600px] object-contain"
                  />
                ) : (
                  <img
                    src={item.media_url}
                    alt={item.caption || "Conteúdo"}
                    className="w-full max-h-[600px] object-contain"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 p-4 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${item.user_has_liked ? "text-primary" : ""}`}
                  onClick={() => handleLike(item.id, item.user_has_liked || false)}
                >
                  <Heart className={`w-5 h-5 ${item.user_has_liked ? "fill-current" : ""}`} />
                  <span>{item.reactions_count}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => toggleComments(item.id)}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{item.comments_count}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(item.id, item.is_saved || false)}
                  className={item.is_saved ? "text-primary" : ""}
                >
                  <Bookmark className={`w-5 h-5 ${item.is_saved ? "fill-current" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleShare(item)}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Caption */}
              {item.caption && (
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{item.profiles.name}</span>
                    {item.caption}
                  </p>
                </div>
              )}

              {/* Comments & Reactions */}
              <Collapsible open={item.comments_open}>
                <CollapsibleContent>
                  <div className="p-4">
                    <ContentCommentsReactions contentId={item.id} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        );
      })}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={lastElementRef} className="flex justify-center py-4">
          {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
      )}

      {/* End of feed */}
      {!hasMore && content.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Você chegou ao fim do feed</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Feed
          </Button>
        </div>
      )}
    </div>
  );
}
