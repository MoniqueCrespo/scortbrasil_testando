import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { AdvancedMetrics } from "@/components/admin/AdvancedMetrics";
import { LiveModerationDashboard } from "@/components/admin/LiveModerationDashboard";
import { ExportReports } from "@/components/admin/ExportReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, DollarSign, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

interface DashboardKPIs {
  totalUsers: number;
  activeProfiles: number;
  totalRevenue: number;
  conversionRate: number;
}

const Analytics = () => {
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalUsers: 0,
    activeProfiles: 0,
    totalRevenue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      // Total de usuários
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Perfis ativos
      const { count: activeCount } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Receita total (soma de transações de créditos)
      const { data: transactions } = await supabase
        .from("credit_transactions")
        .select("amount, transaction_type")
        .eq("transaction_type", "purchase");

      const totalRevenue = transactions?.reduce((sum, tx) => {
        return sum + Math.abs(tx.amount || 0);
      }, 0) || 0;

      // Taxa de conversão (perfis aprovados / total de perfis)
      const { count: totalProfiles } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true });

      const { count: approvedProfiles } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "approved");

      const conversionRate = totalProfiles && approvedProfiles 
        ? (approvedProfiles / totalProfiles) * 100 
        : 0;

      setKpis({
        totalUsers: usersCount || 0,
        activeProfiles: activeCount || 0,
        totalRevenue,
        conversionRate,
      });
    } catch (error) {
      console.error("Erro ao buscar KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Analytics">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics - Visão Geral</h1>
          <p className="text-muted-foreground mt-2">
            Métricas e análises de performance da plataforma
          </p>
        </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* KPIs Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Usuários
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpis.totalUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Usuários cadastrados
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Perfis Ativos
                      </CardTitle>
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpis.activeProfiles}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Anúncios publicados
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Receita Total
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {kpis.totalRevenue.toLocaleString("pt-BR")}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Planos ativos
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Taxa de Conversão
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {kpis.conversionRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aprovação de anúncios
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos de Analytics */}
                <AnalyticsCharts />

                {/* Métricas Avançadas */}
                <AdvancedMetrics />

                {/* Moderação em Tempo Real */}
                <LiveModerationDashboard />

              {/* Exportar Relatórios */}
              <ExportReports />
            </>
          )}
      </div>
    </AdminLayout>
  );
};

export default Analytics;
