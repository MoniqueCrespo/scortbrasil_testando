import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

type ReportType = "cadastros" | "financeiro" | "moderacao" | "performance";
type Period = "7days" | "30days" | "90days" | "all";

export function ExportReports() {
  const [reportType, setReportType] = useState<ReportType>("cadastros");
  const [period, setPeriod] = useState<Period>("30days");
  const [exporting, setExporting] = useState(false);

  const getPeriodDate = () => {
    const now = new Date();
    switch (period) {
      case "7days":
        now.setDate(now.getDate() - 7);
        break;
      case "30days":
        now.setDate(now.getDate() - 30);
        break;
      case "90days":
        now.setDate(now.getDate() - 90);
        break;
      default:
        return null;
    }
    return now.toISOString();
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || "")).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const periodDate = getPeriodDate();
      let data: any[] = [];

      switch (reportType) {
        case "cadastros":
          const profilesQuery = supabase
            .from("model_profiles")
            .select("id, name, category, state, city, created_at, moderation_status");
          
          if (periodDate) {
            profilesQuery.gte("created_at", periodDate);
          }

          const { data: profiles } = await profilesQuery;
          data = profiles || [];
          break;

        case "financeiro":
          const subscriptionsQuery = supabase
            .from("premium_subscriptions")
            .select("id, user_id, plan_id, created_at, status, premium_plans(name, price)");
          
          if (periodDate) {
            subscriptionsQuery.gte("created_at", periodDate);
          }

          const { data: subscriptions } = await subscriptionsQuery;
          data = subscriptions?.map((sub: any) => ({
            id: sub.id,
            user_id: sub.user_id,
            plan_name: sub.premium_plans?.name,
            price: sub.premium_plans?.price,
            created_at: sub.created_at,
            status: sub.status,
          })) || [];
          break;

        case "moderacao":
          const moderationQuery = supabase
            .from("model_profiles")
            .select("id, name, moderation_status, created_at, moderated_at, moderated_by, rejection_reason");
          
          if (periodDate) {
            moderationQuery.gte("created_at", periodDate);
          }

          const { data: moderation } = await moderationQuery;
          data = moderation || [];
          break;

        case "performance":
          const statsQuery = supabase
            .from("profile_stats")
            .select("profile_id, views, clicks, favorites, messages, model_profiles(name, category)")
            .order("views", { ascending: false })
            .limit(50);

          const { data: stats } = await statsQuery;
          data = stats?.map((stat: any) => ({
            profile_name: stat.model_profiles?.name,
            category: stat.model_profiles?.category,
            views: stat.views,
            clicks: stat.clicks,
            favorites: stat.favorites,
            messages: stat.messages,
            ctr: stat.views > 0 ? ((stat.clicks / stat.views) * 100).toFixed(2) + "%" : "0%",
          })) || [];
          break;
      }

      exportToCSV(data, `relatorio_${reportType}`);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Exportar Relatórios
        </CardTitle>
        <CardDescription>Exporte dados em formato CSV para análise externa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Relatório</label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cadastros">Relatório de Cadastros</SelectItem>
                <SelectItem value="financeiro">Relatório Financeiro</SelectItem>
                <SelectItem value="moderacao">Relatório de Moderação</SelectItem>
                <SelectItem value="performance">Relatório de Performance (Top 50)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleExport} disabled={exporting} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exportando..." : "Exportar CSV"}
        </Button>
      </CardContent>
    </Card>
  );
}
