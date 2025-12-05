import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

const Anuncios = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Anúncios Promocionais</h2>
        <p className="text-muted-foreground">
          Gerencie campanhas e anúncios promocionais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Sistema de anúncios promocionais em construção
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Esta funcionalidade estará disponível em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Anuncios;
