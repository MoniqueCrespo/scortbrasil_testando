import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileCheck, Shield, Flag } from "lucide-react";
import { Link } from "react-router-dom";

interface ModerationStats {
  pendingAds: number;
  pendingVerifications: number;
  recentReports: number;
  suspiciousProfiles: number;
}

export function LiveModerationDashboard() {
  const [stats, setStats] = useState<ModerationStats>({
    pendingAds: 0,
    pendingVerifications: 0,
    recentReports: 0,
    suspiciousProfiles: 0,
  });

  useEffect(() => {
    fetchModerationStats();

    // Subscrever para atualizações em tempo real
    const channel = supabase
      .channel("admin-moderation")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "model_profiles",
        },
        () => {
          fetchModerationStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verification_requests",
        },
        () => {
          fetchModerationStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        () => {
          fetchModerationStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchModerationStats = async () => {
    try {
      // Anúncios pendentes
      const { count: pendingAds } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "pending");

      // Verificações pendentes
      const { count: pendingVerifications } = await supabase
        .from("verification_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Denúncias recentes (últimas 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: recentReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("created_at", yesterday.toISOString());

      // Perfis suspeitos (sem foto ou descrição muito curta)
      const { count: suspiciousProfiles } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .or("photo_url.is.null,description.is.null");

      setStats({
        pendingAds: pendingAds || 0,
        pendingVerifications: pendingVerifications || 0,
        recentReports: recentReports || 0,
        suspiciousProfiles: suspiciousProfiles || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas de moderação:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderação em Tempo Real</CardTitle>
        <CardDescription>Ações pendentes e alertas automáticos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link
            to="/admin/moderacao"
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Anúncios Pendentes</p>
                <p className="text-sm text-muted-foreground">Aguardando moderação</p>
              </div>
            </div>
            <Badge variant={stats.pendingAds > 0 ? "destructive" : "secondary"}>
              {stats.pendingAds}
            </Badge>
          </Link>

          <Link
            to="/admin/verificacoes"
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Verificações Pendentes</p>
                <p className="text-sm text-muted-foreground">Documentos para revisar</p>
              </div>
            </div>
            <Badge variant={stats.pendingVerifications > 0 ? "destructive" : "secondary"}>
              {stats.pendingVerifications}
            </Badge>
          </Link>

          <Link
            to="/admin/denuncias"
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Denúncias Recentes</p>
                <p className="text-sm text-muted-foreground">Últimas 24 horas</p>
              </div>
            </div>
            <Badge variant={stats.recentReports > 0 ? "destructive" : "secondary"}>
              {stats.recentReports}
            </Badge>
          </Link>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">Perfis Suspeitos</p>
                <p className="text-sm text-muted-foreground">Detectados automaticamente</p>
              </div>
            </div>
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              {stats.suspiciousProfiles}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
