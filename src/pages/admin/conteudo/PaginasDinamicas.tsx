import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode } from "lucide-react";

const PaginasDinamicas = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Páginas Dinâmicas</h2>
        <p className="text-muted-foreground">
          Crie e gerencie páginas personalizadas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Editor de páginas dinâmicas em construção
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Esta funcionalidade estará disponível em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaginasDinamicas;
