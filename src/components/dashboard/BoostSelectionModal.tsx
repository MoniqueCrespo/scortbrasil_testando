import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Loader2, TrendingUp, Eye, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import AutoRenewalToggle from "./AutoRenewalToggle";
import { useAuth } from "@/hooks/useAuth";

type BoostPackage = Tables<"boost_packages">;
type ModelProfile = Tables<"model_profiles">;

interface BoostSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ModelProfile;
  onSuccess?: () => void;
}

const BoostSelectionModal = ({ isOpen, onClose, profile, onSuccess }: BoostSelectionModalProps) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<BoostPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [autoRenewEnabled, setAutoRenewEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      fetchUserCredits();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('boost_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      setPackages(data);
    }
  };

  const fetchUserCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    setUserCredits(data?.balance || 0);
  };

  const handleActivateBoost = async (packageId: string, paymentMethod: 'credits' | 'money') => {
    setLoading(true);
    setSelectedPackage(packageId);

    try {
      const { data, error } = await supabase.functions.invoke('activate-boost', {
        body: {
          profile_id: profile.id,
          package_id: packageId,
          payment_method: paymentMethod,
        },
      });

      if (error) throw error;

      if (paymentMethod === 'credits') {
        toast.success(data.message);
        onSuccess?.();
        onClose();
      } else {
        // Redirecionar para Mercado Pago
        if (data?.init_point) {
          window.location.href = data.init_point;
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao ativar boost");
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const currentViews = 150; // Valor padrão de visualizações estimadas

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Impulsionar: {profile.name}</DialogTitle>
          <DialogDescription>
            Escolha um pacote de boost para aumentar a visibilidade do seu anúncio
          </DialogDescription>
        </DialogHeader>

        {/* Comparação visual */}
        <div className="grid md:grid-cols-2 gap-4 my-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <h4 className="text-sm font-medium mb-2">Sem Boost</h4>
              <p className="text-4xl font-bold mb-1">{currentViews}</p>
              <p className="text-xs text-muted-foreground">visualizações/dia</p>
            </CardContent>
          </Card>
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6 text-center">
              <h4 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                Com Boost Premium
              </h4>
              <p className="text-4xl font-bold text-primary mb-1">{currentViews * 3}</p>
              <p className="text-xs text-muted-foreground">visualizações/dia</p>
              <Badge variant="secondary" className="mt-2">+200% de visibilidade</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Seu saldo:</span>
          </div>
          <span className="text-lg font-bold text-primary">{userCredits} créditos</span>
        </div>

        {/* Pacotes de boost */}
        <div className="grid md:grid-cols-2 gap-4">
          {packages.map((pkg) => {
            const features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features as string || '[]');
            const canAfford = userCredits >= (pkg.credit_cost || 0);
            const projectedViews = Math.round(currentViews * Number(pkg.visibility_multiplier));
            
            return (
              <Card 
                key={pkg.id}
                className={`relative transition-all ${pkg.name.includes('Premium') ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="absolute -top-3 left-4">
                    <Badge 
                      style={{ backgroundColor: pkg.badge_color || '#f59e0b' }}
                      className="text-white"
                    >
                      {pkg.badge_text}
                    </Badge>
                  </div>

                  <Zap className="h-10 w-10 mb-3 text-primary" />
                  <h3 className="font-bold text-xl mb-1">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {pkg.duration_hours}h de destaque
                  </p>

                  <div className="bg-muted/50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Previsão:</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{projectedViews}</p>
                    <p className="text-xs text-muted-foreground">visualizações estimadas</p>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {features.map((feature: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Tabs defaultValue="credits" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="credits">Créditos</TabsTrigger>
                      <TabsTrigger value="money">Dinheiro</TabsTrigger>
                    </TabsList>
                    <TabsContent value="credits" className="mt-3">
                      <Button
                        className="w-full"
                        onClick={() => handleActivateBoost(pkg.id, 'credits')}
                        disabled={loading || !canAfford}
                      >
                        {loading && selectedPackage === pkg.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            {pkg.credit_cost} créditos
                            {!canAfford && <span className="ml-2 text-xs">(Saldo insuficiente)</span>}
                          </>
                        )}
                      </Button>
                    </TabsContent>
                    <TabsContent value="money" className="mt-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleActivateBoost(pkg.id, 'money')}
                        disabled={loading}
                      >
                        {loading && selectedPackage === pkg.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          `R$ ${Number(pkg.price).toFixed(2)}`
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {/* Auto-renovação */}
                  {user && (
                    <div className="mt-4">
                      <AutoRenewalToggle
                        userId={user.id}
                        profileId={profile.id}
                        renewalType="boost"
                        packageId={pkg.id}
                        isEnabled={autoRenewEnabled[pkg.id] || false}
                        onToggle={(enabled) => {
                          setAutoRenewEnabled(prev => ({ ...prev, [pkg.id]: enabled }));
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostSelectionModal;