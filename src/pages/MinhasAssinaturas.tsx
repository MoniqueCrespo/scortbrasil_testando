import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CreditCard, Calendar, DollarSign, ShoppingBag, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscription {
  id: string;
  profile_id: string;
  tier_id: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  subscription_tiers: {
    tier_name: string;
    monthly_price: number;
  };
  model_profiles: {
    name: string;
    slug: string;
    photo_url: string;
  };
}

interface PPVPurchase {
  id: string;
  ppv_content_id: string;
  price_paid: number;
  purchased_at: string;
  ppv_content: {
    title: string;
    description: string;
    media_type: string;
    media_url: string;
    thumbnail_url: string;
    profile_id: string;
    model_profiles: {
      name: string;
      slug: string;
    };
  };
}

export default function MinhasAssinaturas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [ppvPurchases, setPpvPurchases] = useState<PPVPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const type = searchParams.get("type");

    if (payment === "success") {
      if (type === "ppv") {
        toast.success("Compra PPV confirmada! Aproveite o conteúdo exclusivo.");
      } else {
        toast.success("Assinatura confirmada! Aproveite o conteúdo exclusivo.");
      }
    } else if (payment === "failed") {
      toast.error("Pagamento não foi concluído. Tente novamente.");
    } else if (payment === "pending") {
      toast.info("Pagamento pendente. Aguarde a confirmação.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
      fetchPPVPurchases();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("content_subscriptions")
        .select(`
          *,
          subscription_tiers (tier_name, monthly_price),
          model_profiles (name, slug, photo_url)
        `)
        .eq("subscriber_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  };

  const fetchPPVPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("ppv_purchases")
        .select(`
          *,
          ppv_content (
            title,
            description,
            media_type,
            media_url,
            thumbnail_url,
            profile_id,
            model_profiles (name, slug)
          )
        `)
        .eq("user_id", user?.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setPpvPurchases(data || []);
    } catch (error) {
      console.error("Error fetching PPV purchases:", error);
      toast.error("Erro ao carregar compras PPV");
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase.functions.invoke("cancel-content-subscription", {
        body: { subscription_id: subscriptionId },
      });

      if (error) throw error;

      toast.success("Assinatura cancelada com sucesso");
      fetchSubscriptions();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Erro ao cancelar assinatura");
    }
  };

  const openChat = (profileId: string) => {
    navigate(`/dashboard?tab=messages&profile=${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Minhas Assinaturas</h1>
          <p className="text-muted-foreground mb-8">
            Gerencie suas assinaturas e conteúdo exclusivo
          </p>

          <Tabs defaultValue="assinaturas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assinaturas">
                <CreditCard className="w-4 h-4 mr-2" />
                Assinaturas
              </TabsTrigger>
              <TabsTrigger value="ppv">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Compras PPV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assinaturas" className="space-y-4">
              {subscriptions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Você ainda não possui assinaturas ativas
                    </p>
                    <Button onClick={() => navigate("/")} className="mt-4">
                      Explorar Perfis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                subscriptions.map((sub) => (
                  <Card key={sub.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={sub.model_profiles.photo_url || "/placeholder.svg"}
                            alt={sub.model_profiles.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <CardTitle>{sub.model_profiles.name}</CardTitle>
                            <CardDescription>
                              Plano: {sub.subscription_tiers.tier_name}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            sub.status === "active"
                              ? "default"
                              : sub.status === "expired"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {sub.status === "active"
                            ? "Ativa"
                            : sub.status === "expired"
                            ? "Expirada"
                            : "Cancelada"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Valor</p>
                            <p className="font-medium">
                              R$ {sub.subscription_tiers.monthly_price.toFixed(2)}/mês
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Início</p>
                            <p className="font-medium">
                              {format(new Date(sub.start_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Renovação</p>
                            <p className="font-medium">
                              {format(new Date(sub.end_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Renovação</p>
                            <p className="font-medium">
                              {sub.auto_renew ? "Automática" : "Manual"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            navigate(`/conteudo-exclusivo/${sub.model_profiles.slug}`)
                          }
                          variant="default"
                        >
                          Ver Conteúdo
                        </Button>
                        <Button
                          onClick={() => openChat(sub.profile_id)}
                          variant="outline"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        {sub.status === "active" && (
                          <Button
                            onClick={() => cancelSubscription(sub.id)}
                            variant="destructive"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="ppv" className="space-y-4">
              {ppvPurchases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Você ainda não comprou conteúdo PPV
                    </p>
                    <Button onClick={() => navigate("/")} className="mt-4">
                      Explorar Conteúdo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ppvPurchases.map((purchase) => (
                    <Card key={purchase.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        <img
                          src={purchase.ppv_content.thumbnail_url || "/placeholder.svg"}
                          alt={purchase.ppv_content.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2">
                          {purchase.ppv_content.media_type === "video" ? "Vídeo" : "Foto"}
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {purchase.ppv_content.title}
                        </CardTitle>
                        <CardDescription>
                          {purchase.ppv_content.model_profiles.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {purchase.ppv_content.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Comprado em:</span>
                            <span className="font-medium">
                              {format(new Date(purchase.purchased_at), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Valor pago:</span>
                            <span className="font-medium">
                              R$ {purchase.price_paid.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            navigate(
                              `/conteudo-exclusivo/${purchase.ppv_content.model_profiles.slug}`
                            )
                          }
                          className="w-full"
                        >
                          Acessar Conteúdo
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
