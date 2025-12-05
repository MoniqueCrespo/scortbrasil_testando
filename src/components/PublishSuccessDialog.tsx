import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, LayoutDashboard, Info } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileCard from "@/components/ProfileCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PublishSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: {
    id: string;
    name: string;
    age: number;
    category: string;
    state: string;
    city: string;
    price: number;
    photo_url: string;
    description: string;
    slug?: string;
  };
}

export const PublishSuccessDialog = ({ open, onClose, profileData }: PublishSuccessDialogProps) => {
  // Construir URL pública do perfil - usar slug se disponível, senão id
  const profileIdentifier = profileData.slug || profileData.id;
  const profileUrl = profileData.category === 'mulheres'
    ? `/acompanhantes/${profileData.state}/${profileData.city}/${profileIdentifier}`
    : `/acompanhantes/${profileData.state}/${profileData.city}/${profileData.category}/${profileIdentifier}`;

  const fullProfileUrl = `${window.location.origin}${profileUrl}`;

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      mulheres: "Mulheres",
      homens: "Homens",
      trans: "Trans",
      casais: "Casais",
      massagistas: "Massagistas"
    };
    return categoryNames[category] || category;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            Anúncio Publicado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-base">
            Seu anúncio está ativo e visível para todos os visitantes. Confira como ele aparecerá:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informação sobre onde o anúncio foi publicado */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Seu anúncio foi publicado na categoria <strong>{getCategoryName(profileData.category)}</strong>.
              Ele aparecerá em:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• /acompanhantes/{profileData.state}</li>
                <li>• /acompanhantes/{profileData.state}/{profileData.city}</li>
                {profileData.category !== 'mulheres' && (
                  <li>• /acompanhantes/{profileData.state}/{profileData.city}/{profileData.category}</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Preview do Anúncio */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm font-medium mb-3 text-muted-foreground">Preview do Anúncio:</p>
            <div className="max-w-sm mx-auto">
              <ProfileCard
                id={profileData.id}
                name={profileData.name}
                age={profileData.age}
                price={profileData.price}
                location={`${profileData.city}, ${profileData.state}`}
                image={profileData.photo_url}
                rating={5.0}
                description={profileData.description}
                tags={["Novo"]}
                verified={false}
                featured={false}
                isNew={true}
                isOnline={true}
                isPremium={false}
                category={profileData.category}
                state={profileData.state}
                city={profileData.city}
              />
            </div>
          </div>

          {/* Link Público */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Link Público do Anúncio:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullProfileUrl}
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border border-border"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(fullProfileUrl);
                }}
              >
                Copiar
              </Button>
            </div>
          </div>

          {/* Estatísticas Iniciais */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">Visualizações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">Cliques</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">Favoritos</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link to={profileUrl} target="_blank" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Ver Anúncio Público
            </Link>
          </Button>
          <Button onClick={onClose} className="flex-1 gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Ir para Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
