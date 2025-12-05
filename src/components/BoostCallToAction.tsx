import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap } from "lucide-react";

interface BoostCallToActionProps {
  averageViews: number;
  onViewPlans: () => void;
}

export const BoostCallToAction = ({ averageViews, onViewPlans }: BoostCallToActionProps) => {
  return (
    <Card className="mb-6 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Impulsione seus resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground mb-2">Visualizações Médias (Grátis)</p>
            <p className="text-3xl font-bold">{averageViews}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500 rounded">
            <p className="text-sm text-muted-foreground mb-2">Com Destaque</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {Math.round(averageViews * 3)}+
            </p>
            <Badge className="mt-2 bg-amber-500">3x mais visualizações</Badge>
          </div>
        </div>
        <Button
          className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
          onClick={onViewPlans}
        >
          <Zap className="h-4 w-4 mr-2" />
          Ver Boosts & Serviços
        </Button>
      </CardContent>
    </Card>
  );
};
