import { useEffect, useState, useCallback } from "react";
import { X, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { StoryReactions } from "@/components/StoryReactions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { brazilStates } from "@/data/locations";
import type { Story } from "@/components/StoriesBar";

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const navigate = useNavigate();

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (currentStory) {
      trackView(currentStory.id);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!currentStory || isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // 5 segundos = 100 / 50 ticks
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStory, isPaused, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const trackView = async (storyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("story_views").insert({
        story_id: storyId,
        viewer_id: user?.id || null,
      });

      await supabase.rpc("increment_story_views", { story_uuid: storyId });
    } catch (error) {
      console.debug("Story view tracking skipped:", error);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  const handleCenterTap = () => {
    setIsPaused(prev => !prev);
  };

  const handleLeftTap = () => {
    handlePrevious();
  };

  const handleRightTap = () => {
    handleNext();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -150) { // Swipe down > 150px
      onClose();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleViewProfile = () => {
    if (!currentStory || !currentStory.profile) return;

    const { state: stateCode, city, category } = currentStory.profile;
    const stateData = brazilStates.find(s => s.code === stateCode);
    const stateSlug = stateData?.code.toLowerCase() || stateCode.toLowerCase();
    
    const url = category === "mulheres"
      ? `/acompanhantes/${stateSlug}/${city}/${currentStory.profile_id}`
      : `/acompanhantes/${stateSlug}/${city}/${category}/${currentStory.profile_id}`;
    
    navigate(url);
    onClose();
  };

  if (!currentStory) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header com Blur */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
        {/* Barras de Progresso Múltiplas */}
        <div className="px-2 pt-2 flex gap-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: `${index === currentIndex ? progress : index < currentIndex ? 100 : 0}%` 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Info */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Avatar com Anel Gradiente */}
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-primary to-[hsl(320,75%,58%)]">
              <img
                src={currentStory?.profile?.photo_url || "/placeholder.svg"}
                alt={currentStory?.profile?.name || "Story"}
                className="h-10 w-10 rounded-full object-cover border-2 border-black"
              />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{currentStory?.profile?.name || "Anônimo"}</p>
              <p className="text-white/70 text-xs">
                {currentStory?.created_at ? formatDistanceToNow(new Date(currentStory.created_at), { locale: ptBR, addSuffix: true }) : ""}
              </p>
            </div>
          </div>
          
          {/* Botão Close Maior */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Áreas de Navegação */}
      <div className="absolute inset-0 flex">
        {/* Área Esquerda - Anterior */}
        <div 
          className="flex-1 flex items-center justify-start cursor-pointer"
          onClick={handleLeftTap}
        >
          {currentIndex > 0 && (
            <div className="pl-4 opacity-0 hover:opacity-100 transition-opacity">
              <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Área Central - Pausar */}
        <div 
          className="flex-1 flex items-center justify-center cursor-pointer"
          onClick={handleCenterTap}
        />

        {/* Área Direita - Próximo */}
        <div 
          className="flex-1 flex items-center justify-end cursor-pointer"
          onClick={handleRightTap}
        >
          {currentIndex < stories.length - 1 && (
            <div className="pr-4 opacity-0 hover:opacity-100 transition-opacity">
              <ChevronRight className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {currentStory.media_type === "image" ? (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <video
            src={currentStory.media_url}
            className="max-h-full max-w-full object-contain"
            autoPlay
            muted
            playsInline
            loop
          />
        )}
        
        {/* Indicador de Pause */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
            <div className="bg-white/90 rounded-full p-4 animate-scale-in">
              <Pause className="h-8 w-8 text-black" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Moderno com Blur Forte */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-md">
        <div className="px-4 py-6 space-y-4">
          {/* Botão Ver Perfil Destacado */}
          <Button
            onClick={handleViewProfile}
            className="w-full bg-gradient-to-r from-primary to-primary hover:opacity-90 text-primary-foreground font-semibold py-6 text-base shadow-lg"
          >
            Ver Perfil Completo
          </Button>

          {/* Reactions */}
          <StoryReactions 
            storyId={currentStory.id}
            onReactionSent={() => console.log("Reaction sent")}
          />
        </div>
      </div>
    </div>
  );
};
