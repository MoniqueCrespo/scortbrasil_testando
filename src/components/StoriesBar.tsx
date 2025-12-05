import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StoryViewer } from "@/components/StoryViewer";
import { Camera } from "lucide-react";
import type { CategoryType } from "@/types/location";

export interface Story {
  id: string;
  profile_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  view_count: number;
  profile: {
    name: string;
    photo_url: string;
    state: string;
    city: string;
    category: string;
    verified: boolean;
    is_active: boolean;
  };
}

interface StoriesBarProps {
  stateSlug?: string;
  citySlug?: string;
  category?: CategoryType;
}

export const StoriesBar = ({ stateSlug, citySlug, category }: StoriesBarProps) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [profileStories, setProfileStories] = useState<Story[]>([]);
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [stateSlug, citySlug, category]);

  const fetchStories = async () => {
    setLoading(true);
    setError(false);
    try {
      // Buscar TODAS as stories ativas (sem filtros problemáticos de relacionamento)
      const { data, error: queryError } = await supabase
        .from("profile_stories")
        .select(`
          id,
          profile_id,
          media_url,
          media_type,
          created_at,
          view_count,
          profile:model_profiles(name, photo_url, photos, state, city, category, verified, is_active)
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("Error fetching stories:", queryError);
        setError(true);
        setLoading(false);
        return;
      }

      // Filtrar no client-side (solução para o problema de nested filters)
      const filteredData = data?.filter(
        (story: any) => {
          // Verificar se o perfil está ativo (verificação removida para permitir stories de não verificados)
          if (!story.profile?.is_active) return false;
          
          // Filtrar por estado se fornecido
          if (stateSlug && story.profile.state !== stateSlug) return false;
          
          // Filtrar por cidade se fornecido
          if (citySlug && story.profile.city !== citySlug) return false;
          
          // Filtrar por categoria se fornecido
          if (category && story.profile.category !== category) return false;
          
          return true;
        }
      ) || [];

      // Agrupar stories por perfil para mostrar perfis únicos
      const uniqueProfiles = new Map();
      filteredData.forEach((story: any) => {
        if (!uniqueProfiles.has(story.profile_id)) {
          // Usar photo_url se disponível, senão usar a primeira foto do array photos
          const profilePhoto = story.profile.photo_url || (story.profile.photos && story.profile.photos[0]) || null;
          
            uniqueProfiles.set(story.profile_id, {
              ...story,
              profile: {
                name: story.profile.name,
                photo_url: profilePhoto,
                state: story.profile.state,
                city: story.profile.city,
                category: story.profile.category,
                verified: story.profile.verified,
                is_active: story.profile.is_active,
              },
            });
        }
      });

      setStories(Array.from(uniqueProfiles.values()));
    } catch (error) {
      console.error("Error fetching stories:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background border-y border-border py-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
            <Camera className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-base font-bold text-foreground">Stories</h2>
          </div>
          <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-min pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background border-y border-border py-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3 text-muted-foreground py-4">
          <Camera className="w-8 h-8" />
          <p className="text-sm">Erro ao carregar stories</p>
          <button 
            onClick={fetchStories}
            className="text-primary text-sm hover:underline font-medium"
          >
            Tentar novamente
          </button>
          </div>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-background border-y border-border py-5 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-base font-bold text-foreground">Stories</h2>
          </div>
          
          {/* Scroll horizontal com barra visível */}
          <div className="overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 min-w-min pb-2">
            {stories.map((story) => (
              <button
                key={story.id}
            onClick={() => {
              // Buscar todos os stories deste perfil
              const allProfileStories = stories.filter(s => s.profile_id === story.profile_id);
              const storyIndex = allProfileStories.findIndex(s => s.id === story.id);
              setProfileStories(allProfileStories);
              setInitialStoryIndex(storyIndex >= 0 ? storyIndex : 0);
              setSelectedStory(story);
            }}
                className="flex flex-col items-center gap-2 flex-shrink-0 focus:outline-none"
              >
                <div className="relative">
                  {/* Anel gradiente com variação sutil */}
                  <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-primary via-accent to-primary">
                    <div className="p-[2px] rounded-full bg-background">
                      <Avatar className="h-16 w-16 md:h-[77px] md:w-[77px]">
                        <img
                          src={story.profile.photo_url || "/placeholder.svg"}
                          alt={story.profile.name}
                          className="object-cover w-full h-full"
                        />
                      </Avatar>
                    </div>
                  </div>
                </div>
                
                <span className="text-xs font-normal text-foreground truncate w-16 md:w-[77px] text-center">
                  {story.profile.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
          </div>
        </div>
      </div>

      {selectedStory && (
        <StoryViewer
          stories={profileStories}
          initialIndex={initialStoryIndex}
          onClose={() => {
            setSelectedStory(null);
            setProfileStories([]);
            setInitialStoryIndex(0);
          }}
        />
      )}
    </>
  );
};
