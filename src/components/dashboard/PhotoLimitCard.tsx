import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Lock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfilePlan } from "@/hooks/useProfilePlan";

interface PhotoLimitCardProps {
  profileId: string;
  totalPhotos: number;
}

export const PhotoLimitCard = ({ profileId, totalPhotos }: PhotoLimitCardProps) => {
  const navigate = useNavigate();
  const { data: profilePlan, isLoading } = useProfilePlan(profileId);

  if (isLoading) {
    return null;
  }

  const maxVisiblePhotos = profilePlan?.maxPhotos || 4;
  const hiddenPhotosCount = Math.max(0, totalPhotos - maxVisiblePhotos);
  const visiblePhotos = Math.min(totalPhotos, maxVisiblePhotos);
  const isPremium = profilePlan?.isPremium || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5" />
          Fotos do Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{totalPhotos}</p>
            <p className="text-sm text-muted-foreground">fotos enviadas</p>
          </div>
          <Badge 
            variant={isPremium ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {profilePlan?.planName || 'Gratuito'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fotos visíveis:</span>
            <span className="font-semibold">{visiblePhotos}</span>
          </div>
          
          {hiddenPhotosCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Fotos ocultas:
              </span>
              <span className="font-semibold text-yellow-600">{hiddenPhotosCount}</span>
            </div>
          )}

          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all"
              style={{ width: `${(visiblePhotos / totalPhotos) * 100}%` }}
            />
          </div>
        </div>

        {!isPremium && totalPhotos > 4 && (
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p>
                Planos Premium mostram até 10 fotos, aumentando suas conversões em até 3x
              </p>
            </div>
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/planos')}
            >
              Ver Planos Premium
            </Button>
          </div>
        )}

        {isPremium && (
          <div className="pt-3 border-t">
            <div className="flex items-start gap-2 text-sm">
              <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Você está no plano <span className="font-semibold text-foreground">{profilePlan?.planName}</span> 
                {' '}com até {maxVisiblePhotos} fotos visíveis
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
