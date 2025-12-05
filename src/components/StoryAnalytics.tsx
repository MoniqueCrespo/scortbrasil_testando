import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  unique_viewers: number;
}

interface StoryAnalyticsProps {
  profileId: string;
}

export const StoryAnalytics = ({ profileId }: StoryAnalyticsProps) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoryAnalytics();
  }, [profileId]);

  const fetchStoryAnalytics = async () => {
    try {
      const { data: storiesData, error: storiesError } = await supabase
        .from("profile_stories")
        .select("*")
        .eq("profile_id", profileId)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      // Fetch unique viewer count for each story
      const storiesWithViewers = await Promise.all(
        (storiesData || []).map(async (story) => {
          const { count } = await supabase
            .from("story_views")
            .select("*", { count: "exact", head: true })
            .eq("story_id", story.id);

          return {
            ...story,
            unique_viewers: count || 0,
          };
        })
      );

      setStories(storiesWithViewers);
    } catch (error) {
      console.error("Error fetching story analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando analytics...</div>;
  }

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nenhum story ativo no momento</p>
        </CardContent>
      </Card>
    );
  }

  const totalViews = stories.reduce((sum, s) => sum + s.view_count, 0);
  const totalUniqueViewers = stories.reduce((sum, s) => sum + s.unique_viewers, 0);
  const avgViewsPerStory = stories.length > 0 ? Math.round(totalViews / stories.length) : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Total de Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stories.length} {stories.length === 1 ? "story ativo" : "stories ativos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Espectadores Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniqueViewers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pessoas diferentes que visualizaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Média por Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgViewsPerStory}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visualizações em média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Story Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stories Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stories.map((story) => {
              const timeLeft = formatDistanceToNow(new Date(story.expires_at), {
                locale: ptBR,
                addSuffix: true,
              });

              return (
                <div
                  key={story.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {story.media_type === "image" ? (
                    <img
                      src={story.media_url}
                      alt="Story"
                      className="w-12 h-20 object-cover rounded"
                    />
                  ) : (
                    <video
                      src={story.media_url}
                      className="w-12 h-20 object-cover rounded"
                      muted
                      playsInline
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {story.view_count}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {story.unique_viewers}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Expira {timeLeft}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
