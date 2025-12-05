import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type PremiumSubscription = Tables<"premium_subscriptions">;

interface SubscriptionWithDetails extends PremiumSubscription {
  plan?: {
    name: string;
    description: string;
    price: number;
  };
  profile?: {
    name: string;
    city: string;
    state: string;
  };
}

const MySubscriptions = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (userRole !== 'model') {
      navigate('/dashboard');
      toast.error("Apenas anunciantes podem visualizar assinaturas");
      return;
    }
    fetchSubscriptions();
  }, [user, userRole, navigate]);

  const fetchSubscriptions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('premium_subscriptions')
        .select(`
          *,
          plan:premium_plans(name, description, price),
          profile:model_profiles(name, city, state)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data as any || []);
    } catch (error: any) {
      toast.error("Erro ao carregar assinaturas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Ativa</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "expired":
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Inativa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const inactiveSubscriptions = subscriptions.filter(s => s.status !== 'active');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
              Minhas Assinaturas
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas assinaturas e planos ativos
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Carregando assinaturas...</div>
          ) : subscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Você ainda não possui nenhuma assinatura
                </p>
                <Button 
                  onClick={() => navigate('/planos')}
                  className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
                >
                  Ver Planos Disponíveis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Assinaturas Ativas */}
              {activeSubscriptions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Assinaturas Ativas</h2>
                  <div className="space-y-4">
                    {activeSubscriptions.map((subscription) => (
                      <Card key={subscription.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{subscription.plan?.name}</CardTitle>
                              <CardDescription>
                                {subscription.profile?.name} - {subscription.profile?.city}, {subscription.profile?.state}
                              </CardDescription>
                            </div>
                            {getStatusBadge(subscription.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Início</p>
                                <p className="font-medium">
                                  {subscription.start_date 
                                    ? new Date(subscription.start_date).toLocaleDateString('pt-BR')
                                    : '-'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Vencimento</p>
                                <p className="font-medium">
                                  {subscription.end_date 
                                    ? new Date(subscription.end_date).toLocaleDateString('pt-BR')
                                    : '-'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Valor</p>
                                <p className="font-medium">
                                  R$ {subscription.plan?.price ? Number(subscription.plan.price).toFixed(2) : '-'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Renovação</p>
                                <p className="font-medium">
                                  {subscription.auto_renew ? 'Automática' : 'Manual'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico */}
              {inactiveSubscriptions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Histórico</h2>
                  <div className="space-y-4">
                    {inactiveSubscriptions.map((subscription) => (
                      <Card key={subscription.id} className="opacity-75">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{subscription.plan?.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {subscription.profile?.name} - {subscription.profile?.city}, {subscription.profile?.state}
                              </CardDescription>
                            </div>
                            {getStatusBadge(subscription.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Criado:</span>{' '}
                              {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                            </div>
                            {subscription.end_date && (
                              <div>
                                <span className="font-medium">Encerrado:</span>{' '}
                                {new Date(subscription.end_date).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <Card className="bg-gradient-to-r from-primary/10 to-[hsl(320,75%,58%)]/10 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Quer mais visibilidade?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Confira nossos planos premium e destaque seus anúncios
                  </p>
                  <Button 
                    onClick={() => navigate('/planos')}
                    className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
                  >
                    Ver Planos
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MySubscriptions;
