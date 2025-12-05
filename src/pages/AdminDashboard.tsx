import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";
import StatsCard from "@/components/StatsCard";
import { Users, FileText, AlertCircle, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ModelsManagement } from "@/components/admin/ModelsManagement";
import { ReportsModeration } from "@/components/admin/ReportsModeration";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Shield, FileCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

interface DashboardStats {
  totalModels: number;
  activeProfiles: number;
  pendingVerifications: number;
  pendingReports: number;
  totalRevenue: number;
  newModelsThisMonth: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    activeProfiles: 0,
    pendingVerifications: 0,
    pendingReports: 0,
    totalRevenue: 0,
    newModelsThisMonth: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user, session]);

  const checkAdminAccess = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      navigate("/auth");
      return;
    }

    // Verificar se usuário é admin
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !roles) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta área.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchDashboardStats();
  };

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    
    try {
      // Total de modelos
      const { count: totalModels } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "model");

      // Perfis ativos
      const { count: activeProfiles } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Verificações pendentes
      const { count: pendingVerifications } = await supabase
        .from("verification_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Denúncias pendentes
      const { count: pendingReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Assinaturas ativas para calcular receita
      const { data: subscriptions } = await supabase
        .from("premium_subscriptions")
        .select("plan_id, premium_plans(price)")
        .eq("status", "active");

      const totalRevenue = subscriptions?.reduce((sum, sub: any) => {
        return sum + (sub.premium_plans?.price || 0);
      }, 0) || 0;

      // Novos modelos este mês
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: newModelsThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "model")
        .gte("created_at", firstDayOfMonth.toISOString());

      setStats({
        totalModels: totalModels || 0,
        activeProfiles: activeProfiles || 0,
        pendingVerifications: pendingVerifications || 0,
        pendingReports: pendingReports || 0,
        totalRevenue,
        newModelsThisMonth: newModelsThisMonth || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 sticky top-0 bg-background z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-xl font-bold">Dashboard Administrativo</h2>
            </div>
            <AdminNotifications />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8">
              {/* Breadcrumbs */}
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Início</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Painel Admin</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground">
                  Bem-vindo ao painel de administração
                </p>
              </div>

              {/* Atalhos Rápidos */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/moderacao")}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Moderação</h3>
                      <p className="text-xs text-muted-foreground">Anúncios pendentes</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/verificacoes")}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <FileCheck className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Verificações</h3>
                      <p className="text-xs text-muted-foreground">{stats.pendingVerifications} pendentes</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/denuncias")}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 rounded-lg bg-yellow-500/10">
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Denúncias</h3>
                      <p className="text-xs text-muted-foreground">{stats.pendingReports} pendentes</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/analytics")}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Analytics</h3>
                      <p className="text-xs text-muted-foreground">Métricas gerais</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas Principais */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatsCard
                  icon={Users}
                  title="Total de Anunciantes"
                  value={stats.totalModels}
                  change={`+${stats.newModelsThisMonth} este mês`}
                  trend="up"
                />
                <StatsCard
                  icon={FileText}
                  title="Anúncios Ativos"
                  value={stats.activeProfiles}
                  trend="neutral"
                />
                <StatsCard
                  icon={DollarSign}
                  title="Receita Mensal"
                  value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  trend="up"
                />
                <StatsCard
                  icon={Users}
                  title="Novos Modelos (Mês)"
                  value={stats.newModelsThisMonth}
                  trend="up"
                />
              </div>

              {/* Alertas de Pendências */}
              {(stats.pendingVerifications > 0 || stats.pendingReports > 0) && (
                <div className="grid gap-4 md:grid-cols-2 mb-8">
                  {stats.pendingVerifications > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Verificações Pendentes</AlertTitle>
                      <AlertDescription>
                        Existem {stats.pendingVerifications} solicitações de verificação aguardando revisão.
                      </AlertDescription>
                    </Alert>
                  )}
                  {stats.pendingReports > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Denúncias Pendentes</AlertTitle>
                      <AlertDescription>
                        Existem {stats.pendingReports} denúncias aguardando análise.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Tabs de Navegação */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="models">Anunciantes</TabsTrigger>
                  <TabsTrigger value="moderation">Moderação</TabsTrigger>
                  <TabsTrigger value="verifications">Verificações</TabsTrigger>
                  <TabsTrigger value="reports">Denúncias</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <AnalyticsCharts />
                </TabsContent>

                <TabsContent value="models" className="space-y-4">
                  <ModelsManagement />
                </TabsContent>

                <TabsContent value="moderation" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fila de Moderação</CardTitle>
                      <CardDescription>
                        Anúncios aguardando aprovação
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Aprove ou rejeite anúncios enviados pelos anunciantes.
                      </p>
                      <Button onClick={() => navigate("/admin/moderacao")}>
                        Ir para Moderação
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verificações Pendentes</CardTitle>
                      <CardDescription>
                        Documentos para análise
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {stats.pendingVerifications} verificações pendentes
                      </p>
                      <Button onClick={() => navigate("/admin/verificacoes")}>
                        Ir para Verificações
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                  <ReportsModeration />
                </TabsContent>
              </Tabs>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
