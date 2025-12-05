import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Star, Rocket } from "lucide-react";

const PacotesBoost = () => {
  const packages = [
    {
      id: "1",
      name: "Boost Básico",
      icon: Zap,
      duration: "24 horas",
      price: 29.90,
      features: [
        "Destaque por 24h",
        "+50% de visibilidade",
        "Posição prioritária",
      ],
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "2",
      name: "Boost Plus",
      icon: TrendingUp,
      duration: "7 dias",
      price: 79.90,
      features: [
        "Destaque por 7 dias",
        "+100% de visibilidade",
        "Selo 'Em Alta'",
        "Posição top 10",
      ],
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      popular: true,
    },
    {
      id: "3",
      name: "Boost Premium",
      icon: Star,
      duration: "15 dias",
      price: 149.90,
      features: [
        "Destaque por 15 dias",
        "+200% de visibilidade",
        "Selo Premium",
        "Posição top 5",
        "Destaque na homepage",
      ],
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "4",
      name: "Boost Ultra",
      icon: Rocket,
      duration: "30 dias",
      price: 249.90,
      features: [
        "Destaque por 30 dias",
        "+300% de visibilidade",
        "Selo VIP",
        "Posição top 3",
        "Destaque homepage + feed",
        "Analytics avançado",
      ],
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pacotes de Boost</h2>
        <p className="text-muted-foreground">
          Configure os pacotes de impulsionamento de anúncios
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <Card key={pkg.id} className={pkg.popular ? "border-primary" : ""}>
              <CardHeader>
                {pkg.popular && (
                  <Badge className="w-fit mb-2">Mais Popular</Badge>
                )}
                <div className={`w-12 h-12 rounded-lg ${pkg.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${pkg.color}`} />
                </div>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.duration}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  R$ {pkg.price.toFixed(2)}
                </div>
                <ul className="space-y-2 text-sm">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  Editar Pacote
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Boost</CardTitle>
          <CardDescription>
            Gerencie as regras e benefícios dos pacotes de boost
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Algoritmo de Visibilidade</h3>
              <p className="text-sm text-muted-foreground">
                Anúncios com boost aparecem X vezes mais nas buscas e no feed
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Posicionamento</h3>
              <p className="text-sm text-muted-foreground">
                Controle a ordem de exibição dos anúncios boosteados
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Selos e Badges</h3>
              <p className="text-sm text-muted-foreground">
                Defina os selos visuais que aparecem nos anúncios
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Limite de Boosts</h3>
              <p className="text-sm text-muted-foreground">
                Configure quantos boosts simultâneos um anunciante pode ter
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PacotesBoost;
