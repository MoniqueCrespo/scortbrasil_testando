import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import CheckoutDialog from "@/components/CheckoutDialog";

type PremiumPlan = Tables<"premium_plans">;

const PremiumPlans = () => {
  const { user, userRole } = useAuth();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('premium_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar planos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: PremiumPlan) => {
    if (!user) {
      toast.error("Faça login para assinar um plano");
      return;
    }
    if (userRole !== 'model') {
      toast.error("Apenas anunciantes podem assinar planos premium");
      return;
    }
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('destaque')) return Star;
    if (planName.toLowerCase().includes('premium')) return Zap;
    return TrendingUp;
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('destaque')) return 'from-amber-500 to-orange-600';
    if (planName.toLowerCase().includes('premium')) return 'from-purple-500 to-pink-600';
    return 'from-primary to-[hsl(320,75%,58%)]';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-4">
              Planos Premium
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Aumente sua visibilidade e alcance mais clientes com nossos planos de destaque
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Carregando planos...</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Plano Gratuito */}
              <Card className="relative">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Básico</CardTitle>
                  <CardDescription>Para começar</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Grátis</span>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    Até 4 fotos
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">1 anúncio ativo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Listagem padrão</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Suporte básico</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" disabled>
                    Plano Atual
                  </Button>
                </CardContent>
              </Card>

              {/* Planos Pagos */}
              {plans.map((plan) => {
                const Icon = getPlanIcon(plan.name);
                const colorClass = getPlanColor(plan.name);
                const isPopular = plan.name.toLowerCase().includes('premium');
                const features = Array.isArray(plan.features) ? plan.features : [];

                return (
                  <Card key={plan.id} className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)]">
                        Mais Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">R$ {Number(plan.price).toFixed(0)}</span>
                        <span className="text-muted-foreground">/{plan.duration_days} dias</span>
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        Até {plan.max_photos || 10} fotos
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {features.map((feature: any, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full bg-gradient-to-r ${colorClass} hover:opacity-90`}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        Assinar Plano
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Benefícios Gerais */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Destaque nas Buscas</h3>
                <p className="text-sm text-muted-foreground">
                  Seus anúncios aparecem no topo dos resultados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Maior Visibilidade</h3>
                <p className="text-sm text-muted-foreground">
                  Alcance até 10x mais visualizações
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Mais Clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Aumente suas conversões e ganhos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {selectedPlan && (
        <CheckoutDialog
          plan={selectedPlan}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
};

export default PremiumPlans;
