import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Shield, UserCheck } from "lucide-react";
import { Loader2 } from "lucide-react";

interface AdvancedMetricsData {
  approvalRate: number;
  avgModerationTime: number;
  verifiedProfiles: number;
  userRetention: number;
}

export function AdvancedMetrics() {
  const [metrics, setMetrics] = useState<AdvancedMetricsData>({
    approvalRate: 0,
    avgModerationTime: 0,
    verifiedProfiles: 0,
    userRetention: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvancedMetrics();
  }, []);

  const fetchAdvancedMetrics = async () => {
    try {
      // Taxa de aprovação
      const { count: totalAds } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true });

      const { count: approvedAds } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "approved");

      const approvalRate = totalAds && approvedAds 
        ? (approvedAds / totalAds) * 100 
        : 0;

      // Tempo médio de moderação (em horas)
      const { data: moderatedProfiles } = await supabase
        .from("model_profiles")
        .select("created_at, moderated_at")
        .not("moderated_at", "is", null)
        .limit(100);

      let avgModerationTime = 0;
      if (moderatedProfiles && moderatedProfiles.length > 0) {
        const totalTime = moderatedProfiles.reduce((sum, profile) => {
          const created = new Date(profile.created_at).getTime();
          const moderated = new Date(profile.moderated_at!).getTime();
          return sum + (moderated - created);
        }, 0);
        avgModerationTime = totalTime / moderatedProfiles.length / (1000 * 60 * 60); // converter para horas
      }

      // Perfis verificados
      const { count: verifiedCount } = await supabase
        .from("verification_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      // Retenção de usuários (usuários ativos nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: activeUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("updated_at", thirtyDaysAgo.toISOString());

      const userRetention = totalUsers && activeUsers
        ? (activeUsers / totalUsers) * 100
        : 0;

      setMetrics({
        approvalRate,
        avgModerationTime,
        verifiedProfiles: verifiedCount || 0,
        userRetention,
      });
    } catch (error) {
      console.error("Erro ao buscar métricas avançadas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas Avançadas</CardTitle>
          <CardDescription>Performance operacional da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas Avançadas</CardTitle>
        <CardDescription>Performance operacional da plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
              <p className="text-2xl font-bold">{metrics.approvalRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tempo Médio Moderação</p>
              <p className="text-2xl font-bold">{metrics.avgModerationTime.toFixed(1)}h</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Perfis Verificados</p>
              <p className="text-2xl font-bold">{metrics.verifiedProfiles}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Retenção (30 dias)</p>
              <p className="text-2xl font-bold">{metrics.userRetention.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
