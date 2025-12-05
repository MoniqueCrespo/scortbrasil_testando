import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu } from "lucide-react";

const EditorMenus = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Editor de Menus</h2>
        <p className="text-muted-foreground">
          Configure os menus de navegação do site
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Editor de menus em construção
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Menu className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Esta funcionalidade estará disponível em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorMenus;
