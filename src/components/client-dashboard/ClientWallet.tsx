import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, CreditCard, TrendingUp, History, Calendar, ChevronRight, Loader2, Download, Filter, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import CreditShopModal from "@/components/dashboard/CreditShopModal";
import CreditHistoryModal from "@/components/dashboard/CreditHistoryModal";
import { Input } from "@/components/ui/input";

interface UserCredits {
  balance: number;
  total_earned: number;
  total_spent: number;
}

interface Subscription {
  id: string;
  profile_id: string;
  tier_id: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  model_profiles: {
    name: string;
    photo_url: string;
  };
  subscription_tiers: {
    tier_name: string;
    monthly_price: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface MonthlySpending {
  month: string;
  subscriptions: number;
  tips: number;
  ppv: number;
  total: number;
}

export default function ClientWallet() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState<string | null>(null);
  
  // Filtros
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("30");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    setLoading(true);

    // Buscar créditos
    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (creditsData) {
      setCredits(creditsData);
    }

    // Buscar assinaturas ativas
    const { data: subsData } = await supabase
      .from('content_subscriptions')
      .select(`
        *,
        model_profiles (name, photo_url),
        subscription_tiers (tier_name, monthly_price)
      `)
      .eq('subscriber_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (subsData) {
      setSubscriptions(subsData as any);
    }

    // Buscar transações recentes
    const { data: transData } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (transData) {
      setTransactions(transData);
      generateMonthlyData(transData);
    }

    setLoading(false);
  };

  const generateMonthlyData = (transactions: Transaction[]) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM/yy', { locale: ptBR }),
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    }).reverse();

    const monthlySpending: MonthlySpending[] = last6Months.map(({ month, start, end }) => {
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.created_at);
        return transDate >= start && transDate <= end && t.transaction_type === 'debit';
      });

      const subscriptions = monthTransactions
        .filter(t => t.description.toLowerCase().includes('assinatura'))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const tips = monthTransactions
        .filter(t => t.description.toLowerCase().includes('gorjeta'))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const ppv = monthTransactions
        .filter(t => t.description.toLowerCase().includes('ppv') || t.description.toLowerCase().includes('conteúdo'))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        month,
        subscriptions,
        tips,
        ppv,
        total: subscriptions + tips + ppv,
      };
    });

    setMonthlyData(monthlySpending);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setCancelingSubscription(subscriptionId);

    try {
      const { data, error } = await supabase.functions.invoke('cancel-content-subscription', {
        body: { subscription_id: subscriptionId },
      });

      if (error) throw error;

      toast.success(data?.message || "Renovação automática cancelada. Seu acesso permanece ativo até o fim do período pago.");
      fetchWalletData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setCancelingSubscription(null);
    }
  };

  const exportTransactions = () => {
    const filtered = getFilteredTransactions();
    const csv = [
      ['Data', 'Tipo', 'Descrição', 'Valor'],
      ...filtered.map(t => [
        format(new Date(t.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        t.transaction_type === 'credit' ? 'Entrada' : 'Saída',
        t.description,
        `R$ ${Math.abs(t.amount).toFixed(2)}`,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Histórico exportado!');
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filtrar por tipo
    if (filterType !== 'all') {
      if (filterType === 'subscription') {
        filtered = filtered.filter(t => t.description.toLowerCase().includes('assinatura'));
      } else if (filterType === 'tip') {
        filtered = filtered.filter(t => t.description.toLowerCase().includes('gorjeta'));
      } else if (filterType === 'ppv') {
        filtered = filtered.filter(t => t.description.toLowerCase().includes('ppv') || t.description.toLowerCase().includes('conteúdo'));
      } else if (filterType === 'credit') {
        filtered = filtered.filter(t => t.transaction_type === 'credit');
      }
    }

    // Filtrar por período
    const daysAgo = parseInt(filterPeriod);
    if (daysAgo > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filtered = filtered.filter(t => new Date(t.created_at) >= cutoffDate);
    }

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const maxSpending = Math.max(...monthlyData.map(m => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Saldo de Créditos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Saldo de Créditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {credits?.balance || 0}
                </div>
                <p className="text-sm text-muted-foreground">créditos disponíveis</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Total Ganho
                  </div>
                  <div className="text-2xl font-semibold">{credits?.total_earned || 0}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CreditCard className="h-4 w-4" />
                    Total Gasto
                  </div>
                  <div className="text-2xl font-semibold">{credits?.total_spent || 0}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowShopModal(true)} className="flex-1">
                  <Coins className="h-4 w-4 mr-2" />
                  Comprar Créditos
                </Button>
                <Button onClick={() => setShowHistoryModal(true)} variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">O que são créditos?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use créditos para acessar conteúdo exclusivo, enviar gorjetas e muito mais.
            </p>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>• 1 crédito = R$ 1,00</li>
              <li>• Compre pacotes com bônus</li>
              <li>• Válido por tempo ilimitado</li>
              <li>• Transferível entre funções</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Gastos (Últimos 6 meses) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Gastos nos Últimos 6 Meses
          </CardTitle>
          <CardDescription>Breakdown por categoria de gasto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{data.month}</span>
                  <span className="text-muted-foreground">R$ {data.total.toFixed(2)}</span>
                </div>
                <div className="flex gap-1 h-8">
                  {data.subscriptions > 0 && (
                    <div
                      className="bg-primary rounded flex items-center justify-center text-xs text-white"
                      style={{ width: `${(data.subscriptions / maxSpending) * 100}%` }}
                      title={`Assinaturas: R$ ${data.subscriptions.toFixed(2)}`}
                    >
                      {data.subscriptions > maxSpending * 0.1 && 'Assin.'}
                    </div>
                  )}
                  {data.tips > 0 && (
                    <div
                      className="bg-secondary rounded flex items-center justify-center text-xs text-secondary-foreground"
                      style={{ width: `${(data.tips / maxSpending) * 100}%` }}
                      title={`Gorjetas: R$ ${data.tips.toFixed(2)}`}
                    >
                      {data.tips > maxSpending * 0.1 && 'Tips'}
                    </div>
                  )}
                  {data.ppv > 0 && (
                    <div
                      className="bg-accent rounded flex items-center justify-center text-xs text-accent-foreground"
                      style={{ width: `${(data.ppv / maxSpending) * 100}%` }}
                      title={`Conteúdo PPV: R$ ${data.ppv.toFixed(2)}`}
                    >
                      {data.ppv > maxSpending * 0.1 && 'PPV'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6 pt-4 border-t text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Assinaturas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded"></div>
              <span>Gorjetas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded"></div>
              <span>PPV</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico com Filtros Avançados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico de Transações
              </CardTitle>
              <CardDescription>Filtro e busca avançados</CardDescription>
            </div>
            <Button onClick={exportTransactions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar por descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="subscription">Assinaturas</SelectItem>
                <SelectItem value="tip">Gorjetas</SelectItem>
                <SelectItem value="ppv">Conteúdo PPV</SelectItem>
                <SelectItem value="credit">Compras</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="0">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {getFilteredTransactions().length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredTransactions().slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className={`font-semibold ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}R$ {Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assinaturas Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Minhas Assinaturas
          </CardTitle>
          <CardDescription>
            Gerencie suas assinaturas de conteúdo exclusivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Você ainda não possui assinaturas ativas</p>
              <p className="text-sm mt-2">Explore perfis e assine para acessar conteúdo exclusivo</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criadora</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Renovação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.model_profiles.photo_url}
                          alt={sub.model_profiles.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{sub.model_profiles.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{sub.subscription_tiers.tier_name}</TableCell>
                    <TableCell>R$ {sub.subscription_tiers.monthly_price.toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(sub.end_date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {sub.auto_renew ? (
                        <Badge variant="default">Auto-renovação ativa</Badge>
                      ) : (
                        <Badge variant="secondary">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelSubscription(sub.id)}
                        disabled={cancelingSubscription === sub.id}
                      >
                        {cancelingSubscription === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Cancelar
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <CreditShopModal isOpen={showShopModal} onClose={() => setShowShopModal(false)} />
      <CreditHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </div>
  );
}
