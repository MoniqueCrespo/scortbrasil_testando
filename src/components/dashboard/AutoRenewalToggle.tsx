import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AutoRenewalToggleProps {
  userId: string;
  profileId: string;
  renewalType: 'boost' | 'premium_service' | 'geographic_boost';
  packageId: string;
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

const AutoRenewalToggle = ({
  userId,
  profileId,
  renewalType,
  packageId,
  isEnabled = false,
  onToggle
}: AutoRenewalToggleProps) => {
  const [enabled, setEnabled] = useState(isEnabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);

    try {
      if (checked) {
        // Criar ou atualizar configuração de auto-renovação
        const { error } = await supabase
          .from('auto_renewal_settings')
          .upsert({
            user_id: userId,
            profile_id: profileId,
            renewal_type: renewalType,
            package_id: packageId,
            is_enabled: true,
            payment_method: 'credits'
          }, {
            onConflict: 'user_id,profile_id,renewal_type,package_id'
          });

        if (error) throw error;

        toast.success('Auto-renovação ativada', {
          description: 'Seu boost será renovado automaticamente antes de expirar.',
          icon: <RefreshCw className="h-4 w-4" />
        });
      } else {
        // Desabilitar auto-renovação
        const { error } = await supabase
          .from('auto_renewal_settings')
          .update({ is_enabled: false })
          .eq('user_id', userId)
          .eq('profile_id', profileId)
          .eq('renewal_type', renewalType)
          .eq('package_id', packageId);

        if (error) throw error;

        toast.info('Auto-renovação desativada');
      }

      setEnabled(checked);
      onToggle?.(checked);
    } catch (error: any) {
      console.error('Erro ao configurar auto-renovação:', error);
      toast.error('Erro ao configurar auto-renovação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
      <RefreshCw className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <Label htmlFor={`auto-renew-${packageId}`} className="text-sm font-medium cursor-pointer">
          Renovação Automática
        </Label>
        <p className="text-xs text-muted-foreground">
          Renovar automaticamente antes de expirar
        </p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Switch
                id={`auto-renew-${packageId}`}
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={loading}
              />
              {enabled && (
                <Badge variant="secondary" className="text-xs">
                  Ativo
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-xs">Como funciona:</p>
                <ul className="text-xs space-y-1">
                  <li>• Renovação 24h antes do vencimento</li>
                  <li>• Débito automático de créditos</li>
                  <li>• Notificação por email</li>
                  <li>• Pode cancelar a qualquer momento</li>
                </ul>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AutoRenewalToggle;