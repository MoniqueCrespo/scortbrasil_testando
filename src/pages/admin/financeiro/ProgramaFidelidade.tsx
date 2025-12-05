import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trophy, TrendingUp, DollarSign, Percent } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoyaltyReward {
  id: string;
  user_id: string;
  tier: string;
  points: number;
  total_spent: number;
  total_cashback_earned: number;
  cashback_percentage: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

const TIERS = [
  { name: "bronze", label: "Bronze", minSpent: 0, cashback: 2, discount: 5, color: "bg-amber-600" },
  { name: "silver", label: "Prata", minSpent: 500, cashback: 5, discount: 10, color: "bg-slate-400" },
  { name: "gold", label: "Ouro", minSpent: 1500, cashback: 8, discount: 15, color: "bg-amber-500" },
  { name: "platinum", label: "Platina", minSpent: 3000, cashback: 12, discount: 20, color: "bg-slate-300" },
];

export default function ProgramaFidelidade() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCashback: 0,
    totalSpent: 0,
    tierDistribution: {} as Record<string, number>,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .order("total_spent", { ascending: false });

      if (error) throw error;

      setRewards(data || []);
      
      // Calculate stats
      const totalUsers = data?.length || 0;
      const totalCashback = data?.reduce((sum, r) => sum + (r.total_cashback_earned || 0), 0) || 0;
      const totalSpent = data?.reduce((sum, r) => sum + (r.total_spent || 0), 0) || 0;
      
      const tierDistribution = data?.reduce((acc, r) => {
        acc[r.tier || "bronze"] = (acc[r.tier || "bronze"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({ totalUsers, totalCashback, totalSpent, tierDistribution });
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const tierData = TIERS.find(t => t.name === tier);
    if (!tierData) return null;

    return (
      <Badge className={tierData.color}>
        {tierData.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Programa de Fidelidade">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Programa de Fidelidade">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cashback Total</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalCashback.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalUsers > 0 ? (stats.totalSpent / stats.totalUsers).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="tiers">Tiers e Benefícios</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Usuário {reward.user_id.substring(0, 8)}</CardTitle>
                      <CardDescription>ID: {reward.user_id}</CardDescription>
                    </div>
                    {getTierBadge(reward.tier || "bronze")}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pontos</p>
                      <p className="text-lg font-bold">{reward.points || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Gasto</p>
                      <p className="text-lg font-bold">R$ {(reward.total_spent || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cashback Ganho</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {(reward.total_cashback_earned || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Benefícios</p>
                      <p className="text-sm">
                        {reward.cashback_percentage}% cashback • {reward.discount_percentage}% desconto
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="tiers" className="space-y-4">
            {TIERS.map((tier) => (
              <Card key={tier.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={tier.color}>{tier.label}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Gasto mínimo: R$ {tier.minSpent.toFixed(2)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {stats.tierDistribution[tier.name] || 0} usuários
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cashback</p>
                      <p className="text-2xl font-bold text-primary">{tier.cashback}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Desconto</p>
                      <p className="text-2xl font-bold text-primary">{tier.discount}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
