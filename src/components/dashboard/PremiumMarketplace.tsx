import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Trophy, Zap, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutoRenewalToggle from "./AutoRenewalToggle";

interface PremiumService {
  id: string;
  name: string;
  description: string;
  credit_cost: number;
  duration_days: number;
  service_type: string;
  icon: string;
  config: any;
}

const iconMap: Record<string, any> = {
  Award,
  Star,
  Trophy,
  Zap,
};

const PremiumMarketplace = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<PremiumService[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [userCredits, setUserCredits] = useState(0);
  const [activating, setActivating] = useState<string | null>(null);
  const [autoRenewEnabled, setAutoRenewEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchUserProfiles();
      fetchUserCredits();
    }
  }, [user]);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('premium_services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (data) {
      setServices(data);
    }
  };

  const fetchUserProfiles = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('model_profiles')
      .select('id, name, city, state')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (data) {
      setProfiles(data);
      if (data.length > 0 && !selectedProfile) {
        setSelectedProfile(data[0].id);
      }
    }
  };

  const fetchUserCredits = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    setUserCredits(data?.balance || 0);
  };

  const handleActivateService = async (serviceId: string) => {
    if (!selectedProfile) {
      toast.error("Selecione um perfil primeiro");
      return;
    }

    setActivating(serviceId);

    try {
      const { data, error } = await supabase.functions.invoke('activate-premium-service', {
        body: {
          profile_id: selectedProfile,
          service_id: serviceId,
        },
      });

      if (error) throw error;

      toast.success(data.message);
      fetchUserCredits();
    } catch (error: any) {
      toast.error(error.message || "Erro ao ativar serviço");
    } finally {
      setActivating(null);
    }
  };

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">
            Você precisa ter um perfil ativo para acessar o marketplace
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Marketplace Premium
          </h2>
          <p className="text-muted-foreground">Serviços avulsos para destacar seu anúncio</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Seu saldo</p>
            <p className="text-2xl font-bold text-primary flex items-center gap-1">
              <Sparkles className="h-5 w-5" />
              {userCredits}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">Aplicar ao perfil:</span>
        <Select value={selectedProfile} onValueChange={setSelectedProfile}>
          <SelectTrigger className="w-[300px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name} - {profile.city}, {profile.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = iconMap[service.icon] || Star;
          const config = typeof service.config === 'string' ? JSON.parse(service.config) : service.config;
          const benefits = config?.benefits || [];
          const canAfford = userCredits >= service.credit_cost;

          return (
            <Card 
              key={service.id}
              className="relative transition-all hover:shadow-lg"
            >
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 bg-primary/10 rounded-full mb-3">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {service.description}
                  </p>
                  {service.duration_days && (
                    <Badge variant="secondary" className="mb-3">
                      {service.duration_days} {service.duration_days === 1 ? 'dia' : 'dias'}
                    </Badge>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="text-xs flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {service.credit_cost}
                  </div>
                  <div className="text-xs text-muted-foreground">créditos</div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleActivateService(service.id)}
                  disabled={activating === service.id || !canAfford}
                >
                  {activating === service.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ativando...
                    </>
                  ) : (
                    <>
                      {canAfford ? 'Ativar Agora' : 'Créditos Insuficientes'}
                    </>
                  )}
                </Button>

                {/* Auto-renovação */}
                {user && selectedProfile && (
                  <div className="mt-4">
                    <AutoRenewalToggle
                      userId={user.id}
                      profileId={selectedProfile}
                      renewalType="premium_service"
                      packageId={service.id}
                      isEnabled={autoRenewEnabled[service.id] || false}
                      onToggle={(enabled) => {
                        setAutoRenewEnabled(prev => ({ ...prev, [service.id]: enabled }));
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PremiumMarketplace;