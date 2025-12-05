import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingUp, Clock, CheckCircle2, Coins, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface CreatorEarningsPanelProps {
  profileId: string;
}

interface Earnings {
  total_earned: number;
  platform_fee_total: number;
  pending_payout: number;
  paid_out: number;
  last_payout_date: string | null;
}

interface Payment {
  id: string;
  amount: number;
  creator_amount: number;
  created_at: string;
  status: string;
}

export const CreatorEarningsPanel = ({ profileId }: CreatorEarningsPanelProps) => {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEarnings();
    fetchRecentPayments();
  }, [profileId]);

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setEarnings(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_payments')
        .select(`
          id,
          amount,
          creator_amount,
          created_at,
          status,
          content_subscriptions!inner (
            profile_id
          )
        `)
        .eq('content_subscriptions.profile_id', profileId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleConvertToCredits = async () => {
    const amount = parseFloat(convertAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para conversão",
        variant: "destructive",
      });
      return;
    }

    if (!earnings || amount > earnings.pending_payout) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('convert-earnings-to-credits', {
        body: { profileId, amount },
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: data.message,
      });
      
      setConvertDialogOpen(false);
      setConvertAmount("");
      fetchEarnings();
    } catch (error) {
      console.error('Error converting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível converter os ganhos",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount < 100) {
      toast({
        title: "Valor inválido",
        description: "Valor mínimo para saque é R$ 100,00",
        variant: "destructive",
      });
      return;
    }

    if (!pixKey) {
      toast({
        title: "Chave PIX obrigatória",
        description: "Digite sua chave PIX",
        variant: "destructive",
      });
      return;
    }

    if (!earnings || amount > earnings.pending_payout) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-creator-payout', {
        body: { profileId, amount, pixKey },
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: data.message,
      });
      
      setPayoutDialogOpen(false);
      setPayoutAmount("");
      setPixKey("");
      fetchEarnings();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar o saque",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Ganhos</h3>
        <p className="text-sm text-muted-foreground">Acompanhe sua receita de assinaturas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(earnings?.total_earned || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">todo o período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(earnings?.pending_payout || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">aguardando saque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sacado</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(earnings?.paid_out || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">já recebido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Plataforma</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(earnings?.platform_fee_total || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">20% do total</p>
          </CardContent>
        </Card>
      </div>

      <Card className={earnings && earnings.pending_payout > 0 ? "border-primary" : ""}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Opções de Saque</h4>
              <p className="text-sm text-muted-foreground">
                Disponível: R$ {(earnings?.pending_payout || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setConvertDialogOpen(true)}
                className="gap-2"
                disabled={!earnings || earnings.pending_payout <= 0}
              >
                <Coins className="w-4 h-4" />
                Converter em Créditos
              </Button>
              <Button
                onClick={() => setPayoutDialogOpen(true)}
                className="gap-2"
                disabled={!earnings || earnings.pending_payout < 100}
              >
                <Wallet className="w-4 h-4" />
                Solicitar Saque PIX
              </Button>
            </div>
            {(!earnings || earnings.pending_payout === 0) && (
              <p className="text-xs text-muted-foreground">
                * Você precisa ter ganhos disponíveis para utilizar estas opções
              </p>
            )}
            {earnings && earnings.pending_payout > 0 && earnings.pending_payout < 100 && (
              <p className="text-xs text-muted-foreground">
                * Saque via PIX disponível a partir de R$ 100,00
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação ainda
            </p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      Assinatura - Pagamento Recebido
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-500">
                      + R$ {payment.creator_amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      De R$ {payment.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convert to Credits Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Converter Ganhos em Créditos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Saldo disponível: R$ {(earnings?.pending_payout || 0).toFixed(2)}
              </p>
              <p className="text-sm mb-4">
                Taxa de conversão: <strong>R$ 1,00 = 1 crédito</strong>
              </p>
            </div>
            <div>
              <Label htmlFor="convert-amount">Valor para converter (R$)</Label>
              <Input
                id="convert-amount"
                type="number"
                step="0.01"
                min="1"
                max={earnings?.pending_payout || 0}
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="Ex: 50.00"
              />
              {convertAmount && (
                <p className="text-sm text-muted-foreground mt-2">
                  Você receberá: <strong>{Math.floor(parseFloat(convertAmount) || 0)} créditos</strong>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConvertToCredits} disabled={processing}>
              {processing ? 'Convertendo...' : 'Converter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Request Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Saque via PIX</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Saldo disponível: R$ {(earnings?.pending_payout || 0).toFixed(2)}
              </p>
              <p className="text-sm text-amber-600 mb-4">
                * Valor mínimo para saque: R$ 100,00
              </p>
            </div>
            <div>
              <Label htmlFor="payout-amount">Valor do saque (R$)</Label>
              <Input
                id="payout-amount"
                type="number"
                step="0.01"
                min="100"
                max={earnings?.pending_payout || 0}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="Ex: 100.00"
              />
            </div>
            <div>
              <Label htmlFor="pix-key">Chave PIX</Label>
              <Input
                id="pix-key"
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O pagamento será processado em até 3 dias úteis
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestPayout} disabled={processing}>
              {processing ? 'Processando...' : 'Solicitar Saque'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
