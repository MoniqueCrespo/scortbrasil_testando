import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type ModelProfile = Tables<"model_profiles">;

interface ProfileOptimizationCardProps {
  profile: ModelProfile;
  onOptimize: () => void;
}

interface OptimizationCheck {
  label: string;
  completed: boolean;
  tip: string;
  priority: "high" | "medium";
}

export const analyzeProfileCompleteness = (profile: ModelProfile) => {
  const checks: OptimizationCheck[] = [
    {
      label: "Fotos suficientes",
      completed: (profile.photos?.length || 0) >= 4,
      tip: "Adicione pelo menos 4 fotos para aumentar credibilidade",
      priority: "high",
    },
    {
      label: "Descrição completa",
      completed: !!profile.description && profile.description.length > 100,
      tip: "Descrições detalhadas (100+ caracteres) aumentam engajamento em 40%",
      priority: "high",
    },
    {
      label: "Serviços especificados",
      completed: (profile.services?.length || 0) >= 3,
      tip: "Liste pelo menos 3 serviços oferecidos",
      priority: "medium",
    },
    {
      label: "Disponibilidade definida",
      completed: (profile.availability?.length || 0) > 0,
      tip: "Especifique seus horários disponíveis",
      priority: "medium",
    },
    {
      label: "Informações de contato",
      completed: !!profile.whatsapp || !!profile.telegram,
      tip: "Adicione WhatsApp ou Telegram para facilitar contato",
      priority: "high",
    },
    {
      label: "Verificação obtida",
      completed: !!profile.verified,
      tip: "Perfis verificados recebem 2x mais cliques",
      priority: "medium",
    },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const completionRate = (completedCount / checks.length) * 100;

  return { checks, completionRate };
};

export const ProfileOptimizationCard = ({ profile, onOptimize }: ProfileOptimizationCardProps) => {
  const { checks, completionRate } = analyzeProfileCompleteness(profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Otimização do Perfil</span>
          <Badge variant={completionRate === 100 ? "default" : "secondary"}>
            {completionRate.toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={completionRate} className="mb-4" />

        <div className="space-y-2">
          {checks
            .filter((check) => !check.completed && check.priority === "high")
            .slice(0, 3)
            .map((check, idx) => (
              <Alert key={idx} variant="default" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>{check.label}:</strong> {check.tip}
                </AlertDescription>
              </Alert>
            ))}
        </div>

        {completionRate === 100 && (
          <Alert className="mt-3 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-600 dark:text-green-400">
              ✅ Perfil 100% otimizado! Pronto para máxima visibilidade.
            </AlertDescription>
          </Alert>
        )}

        <Button variant="outline" size="sm" className="w-full mt-3" onClick={onOptimize}>
          Otimizar Agora
        </Button>
      </CardContent>
    </Card>
  );
};
