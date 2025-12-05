import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const BlocosConteudo = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Blocos de Conteúdo (CMS)</h2>
        <p className="text-muted-foreground">
          Gerencie blocos reutilizáveis de conteúdo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Editor de blocos de conteúdo em construção
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Esta funcionalidade estará disponível em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlocosConteudo;
