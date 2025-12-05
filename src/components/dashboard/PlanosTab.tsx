import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, TrendingUp, Camera } from "lucide-react";
import { useProfilePlan } from "@/hooks/useProfilePlan";
import { useAuth } from "@/hooks/useAuth";

interface PlanosTabProps {
  profiles: Array<{ id: string; photos?: string[] }>;
}

export const PlanosTab = ({ profiles }: PlanosTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profilePlan, isLoading } = useProfilePlan(profiles[0]?.id);

  const freeBenefits = [
    "Até 4 fotos visíveis",
    "Anúncio básico",
    "Visibilidade padrão",
    "Suporte básico",
  ];

  const premiumBenefits = [
    "Até 10 fotos visíveis",
    "Destaque nas buscas",
    "Badge Premium",
    "3x mais visualizações",
    "Posição prioritária",
    "Análises avançadas",
    "Suporte prioritário",
  ];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        Carregando informações do plano...
      </div>
    );
  }

  const isPremium = profilePlan?.isPremium || false;

  return (
    <div className="space-y-6">
      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Plano Atual</CardTitle>
          <CardDescription>
            Você está no plano {profilePlan?.planName || "Gratuito"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge 
              variant={isPremium ? "default" : "secondary"}
              className="text-lg px-4 py-2"
            >
              {profilePlan?.planName || "Gratuito"}
            </Badge>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {isPremium 
                  ? "Seu anúncio está destacado e recebendo prioridade nas buscas!"
                  : "Upgrade para Premium e aumente suas visualizações em até 3x"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativo Gratuito vs Premium */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Plano Gratuito */}
        <Card className={!isPremium ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Gratuito
              {!isPremium && <Badge variant="secondary">Atual</Badge>}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">R$ 0</span>
              <span className="text-muted-foreground">/mês</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {freeBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Plano Premium */}
        <Card className={isPremium ? "border-primary bg-gradient-to-b from-primary/5 to-transparent" : "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Premium
              {isPremium && <Badge>Atual</Badge>}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-primary">A partir de R$ 49,90</span>
              <span className="text-muted-foreground">/período</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {premiumBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
            {!isPremium && (
              <Button 
                className="w-full bg-gradient-to-r from-primary to-secondary mt-4"
                onClick={() => navigate('/planos')}
              >
                <Star className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cards de Benefícios */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Camera className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Mais Fotos Visíveis</h3>
            <p className="text-sm text-muted-foreground">
              Mostre até 10 fotos no seu perfil e converta 3x mais clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Destaque Garantido</h3>
            <p className="text-sm text-muted-foreground">
              Apareça no topo das buscas e seja visto primeiro pelos clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Performance Superior</h3>
            <p className="text-sm text-muted-foreground">
              Perfis Premium recebem em média 3x mais visualizações e contatos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Final */}
      {!isPremium && (
        <Card className="border-primary bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  Pronto para aumentar suas conversões?
                </h3>
                <p className="text-muted-foreground">
                  Escolha o plano Premium ideal para você e comece a destacar seu anúncio hoje mesmo.
                </p>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary whitespace-nowrap"
                onClick={() => navigate('/planos')}
              >
                <Star className="h-5 w-5 mr-2" />
                Ver Todos os Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
