import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { CreditCard, Loader2 } from "lucide-react";

type PremiumPlan = Tables<"premium_plans">;
type ModelProfile = Tables<"model_profiles">;

interface CheckoutDialogProps {
  plan: PremiumPlan;
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutDialog = ({ plan, isOpen, onClose }: CheckoutDialogProps) => {
  const { user } = useAuth();
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Carregar perfis do usuário quando o dialog abrir
  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfiles();
    }
  }, [isOpen, user]);

  const fetchUserProfiles = async () => {
    if (!user) return;
    
    setIsLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('model_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedProfileId) {
      toast.error("Selecione um perfil para aplicar o plano");
      return;
    }

    setIsLoading(true);
    try {
      // Chamar edge function para criar pagamento no Mercado Pago
      const { data, error } = await supabase.functions.invoke('mercadopago-create-payment', {
        body: {
          plan_id: plan.id,
          profile_id: selectedProfileId,
        }
      });

      if (error) throw error;

      if (data?.init_point) {
        // Redirecionar para página de pagamento do Mercado Pago
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de pagamento não retornada');
      }
    } catch (error: any) {
      toast.error("Erro ao processar pagamento. Tente novamente.");
      console.error('Erro no checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Assinatura</DialogTitle>
          <DialogDescription>
            Você está assinando o plano <strong>{plan.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resumo do Plano */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plano:</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duração:</span>
              <span className="font-semibold">{plan.duration_days} dias</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">R$ {Number(plan.price).toFixed(2)}</span>
            </div>
          </div>

          {/* Seleção de Perfil */}
          <div className="space-y-2">
            <Label htmlFor="profile">Aplicar ao perfil:</Label>
            {isLoadingProfiles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Você precisa ter um perfil ativo para assinar este plano.
              </p>
            ) : (
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger id="profile">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} - {profile.city}, {profile.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Informação sobre pagamento */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Pagamento seguro via Mercado Pago</p>
              <p className="text-xs text-blue-700">
                Você será redirecionado para completar o pagamento de forma segura.
                Aceitamos cartão de crédito, débito, PIX e boleto.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCheckout} 
            disabled={isLoading || !selectedProfileId || profiles.length === 0}
            className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar R$ {Number(plan.price).toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
