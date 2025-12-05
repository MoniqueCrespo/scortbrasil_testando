import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Lock, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionTier {
  id: string;
  tier_name: string;
  monthly_price: number;
  description: string;
  benefits: any;
  sort_order: number;
}

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
  profile?: {
    photo_url?: string;
  };
}

export const SubscribeModal = ({ isOpen, onClose, profileId, profileName, profile }: SubscribeModalProps) => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && profileId) {
      fetchTiers();
    }
  }, [isOpen, profileId]);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTiers((data || []).map(tier => ({
        ...tier,
        benefits: Array.isArray(tier.benefits) ? tier.benefits : []
      })));
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      const profilePhotoUrl = profile?.photo_url ? encodeURIComponent(profile.photo_url) : "";
      toast({
        title: "Login necessário",
        description: "Faça login para assinar",
        variant: "destructive",
      });
      navigate(`/cliente/auth?profile=${encodeURIComponent(profileName)}&photo=${profilePhotoUrl}&returnUrl=${returnUrl}`);
      return;
    }

    setProcessing(true);
    setSelectedTier(tierId);

    try {
      const { data, error } = await supabase.functions.invoke('create-content-subscription', {
        body: {
          tier_id: tierId,
          profile_id: profileId,
        },
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Link de pagamento não gerado');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a assinatura",
        variant: "destructive",
      });
      setProcessing(false);
      setSelectedTier(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Assine Conteúdo Exclusivo</DialogTitle>
          <DialogDescription>
            Escolha um plano para acessar conteúdo exclusivo de {profileName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        ) : tiers.length === 0 ? (
          <div className="py-12 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum plano de assinatura disponível no momento
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.id} className="relative overflow-hidden hover:border-primary transition-colors">
                {tier.sort_order === 0 && (
                  <Badge className="absolute top-4 right-4 bg-primary">Popular</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{tier.tier_name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">R$ {tier.monthly_price.toFixed(2)}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {tier.benefits && tier.benefits.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {tier.benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing && selectedTier === tier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Informações da Assinatura</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Pagamento seguro via Mercado Pago (PIX ou Cartão)</li>
            <li>• Renovação automática mensal</li>
            <li>• Cancele a qualquer momento</li>
            <li>• Acesso imediato ao conteúdo exclusivo após pagamento</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
