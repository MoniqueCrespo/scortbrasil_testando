import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

const GestaoRenovacoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestão de Renovações</h2>
        <p className="text-muted-foreground">
          Configure renovações automáticas de assinaturas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Sistema de renovações automáticas em construção
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <RefreshCw className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Esta funcionalidade estará disponível em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoRenovacoes;
