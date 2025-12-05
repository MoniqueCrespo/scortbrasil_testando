import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Copy, DollarSign, Users, TrendingUp, Target, Award, Link as LinkIcon, BarChart3, Calendar } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AffiliateData {
  id: string;
  affiliate_code: string;
  affiliate_link: string;
  tier_level: string;
  total_earned: number;
  pending_payout: number;
  total_paid_out: number;
  pix_key: string;
  commission_rate: number;
}

interface Referral {
  id: string;
  referred_at: string;
  total_transactions: number;
  total_revenue_generated: number;
  total_commission_earned: number;
  status: string;
}

interface Commission {
  id: string;
  transaction_type: string;
  transaction_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

const COLORS = ['#ff0054', '#ff3131', '#ff6b6b', '#ff9999'];

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/afiliados/auth");
      return;
    }
    fetchAffiliateData();
  }, [user]);

  const fetchAffiliateData = async () => {
    try {
      const { data: affiliateData, error: affiliateError } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (affiliateError) {
        if (affiliateError.code === "PGRST116") {
          navigate("/afiliados");
          return;
        }
        throw affiliateError;
      }

      setAffiliate(affiliateData);

      const { data: referralsData } = await supabase
        .from("affiliate_referrals")
        .select("*")
        .eq("affiliate_id", affiliateData.id)
        .order("referred_at", { ascending: false });

      setReferrals(referralsData || []);

      const { data: commissionsData } = await supabase
        .from("affiliate_commissions")
        .select("*")
        .eq("affiliate_id", affiliateData.id)
        .order("created_at", { ascending: false })
        .limit(100);

      setCommissions(commissionsData || []);
    } catch (error: any) {
      console.error("Error fetching affiliate data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const handleRequestPayout = async () => {
    if (!affiliate) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 50) {
      toast.error("Valor mínimo: R$ 50,00");
      return;
    }

    if (amount > affiliate.pending_payout) {
      toast.error("Saldo insuficiente");
      return;
    }

    try {
      const { error } = await supabase.from("affiliate_payouts").insert({
        affiliate_id: affiliate.id,
        amount,
        payout_method: "pix",
        pix_key: affiliate.pix_key,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Saque solicitado! Processamento em até 48h.");
      setPayoutAmount("");
      fetchAffiliateData();
    } catch (error: any) {
      console.error("Error requesting payout:", error);
      toast.error("Erro ao solicitar saque");
    }
  };

  // Dados para gráfico de evolução mensal
  const getMonthlyData = () => {
    const monthlyData: Record<string, number> = {};
    
    commissions.forEach(c => {
      const month = new Date(c.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + c.commission_amount;
    });

    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2))
    })).reverse().slice(0, 6);
  };

  // Dados para gráfico de tipos de comissão
  const getCommissionByType = () => {
    const typeData: Record<string, number> = {};
    
    commissions.forEach(c => {
      const type = c.transaction_type.replace('_', ' ');
      typeData[type] = (typeData[type] || 0) + c.commission_amount;
    });

    return Object.entries(typeData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(value.toFixed(2))
    }));
  };

  // Calcular taxa de conversão
  const conversionRate = referrals.length > 0 
    ? ((referrals.filter(r => r.total_transactions > 0).length / referrals.length) * 100).toFixed(1)
    : "0.0";

  // Próximo nível
  const tierGoals = {
    bronze: { min: 0, max: 5, next: 'silver' },
    silver: { min: 5, max: 20, next: 'gold' },
    gold: { min: 20, max: 50, next: 'diamond' },
    diamond: { min: 50, max: 999, next: 'max' }
  };

  const currentTier = affiliate?.tier_level || 'bronze';
  const tierGoal = tierGoals[currentTier as keyof typeof tierGoals];
  const activeReferrals = referrals.filter(r => r.status === 'active').length;
  const progressToNextTier = tierGoal ? ((activeReferrals - tierGoal.min) / (tierGoal.max - tierGoal.min)) * 100 : 0;

  const getTierEmoji = (tier: string) => {
    const emojis: Record<string, string> = {
      bronze: "🥉", silver: "🥈", gold: "🥇", diamond: "💎"
    };
    return emojis[tier] || "🥉";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) return null;

  const monthlyData = getMonthlyData();
  const commissionByType = getCommissionByType();

  return (
    <>
      <SEOHead 
        title="Dashboard Afiliado - SCORT BRASIL" 
        description="Painel profissional de afiliados com métricas em tempo real"
      />

      <div className="min-h-screen bg-background py-6 px-4">
        <div className="container max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Painel do Afiliado</h1>
              <p className="text-muted-foreground">
                Acompanhe performance e maximize seus ganhos
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {getTierEmoji(currentTier)} {currentTier.toUpperCase()}
            </Badge>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Saldo Disponível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  R$ {affiliate.pending_payout.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponível para saque
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total Ganho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {affiliate.total_earned.toFixed(2)}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{(affiliate.commission_rate * 100).toFixed(0)}% em transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Indicações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {activeReferrals}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {referrals.filter(r => r.total_transactions === 0).length} pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa de conversão
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progresso para Próximo Nível */}
          {tierGoal.next !== 'max' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Progresso para {tierGoal.next.toUpperCase()}
                </CardTitle>
                <CardDescription>
                  {activeReferrals} de {tierGoal.max} indicações ativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={Math.min(progressToNextTier, 100)} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Faltam {Math.max(0, tierGoal.max - activeReferrals)} indicações para o próximo nível
                </p>
              </CardContent>
            </Card>
          )}

          {/* Gráficos */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Evolução de Ganhos (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value}`} />
                    <Line type="monotone" dataKey="total" stroke="#ff0054" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comissões por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={commissionByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Link e Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Seu Link de Indicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={affiliate.affiliate_link} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(affiliate.affiliate_link)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>Código: {affiliate.affiliate_code}</Badge>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(affiliate.affiliate_code)}>
                  <Copy className="w-3 h-3 mr-1" /> Copiar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="commissions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="commissions">Comissões</TabsTrigger>
              <TabsTrigger value="referrals">Indicações</TabsTrigger>
              <TabsTrigger value="payout">Saques</TabsTrigger>
            </TabsList>

            <TabsContent value="commissions">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Comissões</CardTitle>
                  <CardDescription>
                    {commissions.length} transações registradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {commissions.slice(0, 20).map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold capitalize">
                            {c.transaction_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(c.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">
                            +R$ {c.commission_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            De R$ {c.transaction_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {commissions.length === 0 && (
                      <div className="text-center py-12">
                        <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">Nenhuma comissão ainda</p>
                        <p className="text-sm text-muted-foreground mt-1">Compartilhe seu link para começar a ganhar!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals">
              <Card>
                <CardHeader>
                  <CardTitle>Suas Indicações</CardTitle>
                  <CardDescription>
                    {referrals.length} indicações totais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referrals.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">Indicação #{r.id.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Desde {new Date(r.referred_at).toLocaleDateString("pt-BR")}
                          </p>
                          <Badge variant={r.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                            {r.status === 'active' ? 'Ativo' : 'Pendente'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{r.total_transactions} transações</p>
                          <p className="text-sm text-primary font-semibold">
                            R$ {r.total_commission_earned.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {referrals.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">Nenhuma indicação ainda</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payout">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Saque</CardTitle>
                  <CardDescription>
                    Mínimo: R$ 50,00 | Disponível: R$ {affiliate.pending_payout.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor do Saque (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="50"
                      placeholder="50.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <Input value={affiliate.pix_key} readOnly className="bg-muted" />
                  </div>
                  <Button onClick={handleRequestPayout} className="w-full" size="lg">
                    Solicitar Saque via PIX
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Processamento em até 48h úteis
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
