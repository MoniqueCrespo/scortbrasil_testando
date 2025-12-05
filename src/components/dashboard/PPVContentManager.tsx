import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, DollarSign, Image, Video } from "lucide-react";

export const PPVContentManager = () => {
  const [contents, setContents] = useState<any[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Conteúdo Pay-Per-View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Gerencie seus conteúdos pagos aqui.</p>
          <p className="text-sm mt-2">Em breve você poderá adicionar fotos e vídeos exclusivos.</p>
        </div>
      </CardContent>
    </Card>
  );
};
