import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscribersDashboardProps {
  profileId: string;
}

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  tier_id: string;
  subscription_tiers: {
    tier_name: string;
    monthly_price: number;
  };
}

export const SubscribersDashboard = ({ profileId }: SubscribersDashboardProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, [profileId]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('content_subscriptions')
        .select(`
          *,
          subscription_tiers (
            tier_name,
            monthly_price
          )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const subs = data || [];
      setSubscriptions(subs);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const active = subs.filter(s => s.status === 'active' && new Date(s.end_date) > now);
      const newThisMonth = subs.filter(s => new Date(s.start_date) >= monthStart);
      const monthlyRevenue = active.reduce((sum, s) => sum + (s.subscription_tiers?.monthly_price || 0), 0);

      setStats({
        total: subs.length,
        active: active.length,
        newThisMonth: newThisMonth.length,
        monthlyRevenue: monthlyRevenue * 0.8, // 80% for creator
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Assinantes</h3>
        <p className="text-sm text-muted-foreground">Acompanhe seus assinantes e receita</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Assinantes</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">ativos agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Este Mês</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">novos assinantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">sua parte (80%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Histórico</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">assinaturas totais</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Você ainda não tem assinantes
            </p>
          ) : (
            <div className="space-y-4">
              {subscriptions.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {sub.subscription_tiers?.tier_name}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        sub.status === 'active' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {sub.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Desde {format(new Date(sub.start_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      R$ {((sub.subscription_tiers?.monthly_price || 0) * 0.8).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Válido até {format(new Date(sub.end_date), "dd/MM/yy")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
