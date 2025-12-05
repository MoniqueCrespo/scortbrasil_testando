import { Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileCard from "@/components/ProfileCard";

interface ProfilePreviewProps {
  formData: {
    name: string;
    age: string;
    category: string;
    state: string;
    city: string;
    description: string;
    hourly_price: string;
  };
  photos: File[];
  existingPhotoUrls?: string[];
}

export const ProfilePreview = ({ formData, photos, existingPhotoUrls = [] }: ProfilePreviewProps) => {
  const getPhotoUrl = () => {
    // Se há fotos novas (File objects)
    if (photos.length > 0 && photos[0] instanceof File) {
      return URL.createObjectURL(photos[0]);
    }
    // Se há fotos existentes (URLs do Supabase)
    if (existingPhotoUrls.length > 0) {
      return existingPhotoUrls[0];
    }
    return "/placeholder.svg";
  };

  const photoUrl = getPhotoUrl();

  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5" />
          Preview do Anúncio
        </CardTitle>
        <CardDescription className="text-xs">
          Veja como seu anúncio aparecerá
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="scale-90 origin-top">
          <ProfileCard
            id="preview"
            name={formData.name || "Seu Nome"}
            age={parseInt(formData.age) || 18}
            price={parseInt(formData.hourly_price) || 0}
            location={`${formData.city || "Cidade"}, ${formData.state || "Estado"}`}
            image={photoUrl}
            rating={5.0}
            description={formData.description || "Sua descrição aqui..."}
            tags={["Tag 1", "Tag 2"]}
            verified={false}
            featured={false}
            isNew={true}
            isOnline={true}
            isPremium={false}
            category={formData.category || "mulheres"}
            state={formData.state || "SP"}
            city={formData.city || "sao-paulo"}
          />
        </div>
      </CardContent>
    </Card>
  );
};
