import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

const CuponsBoost = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cupons de Boost</h2>
        <p className="text-muted-foreground">
          Cupons específicos para pacotes de boost
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Sistema de cupons específicos para boost em construção
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Esta funcionalidade estará disponível em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CuponsBoost;
