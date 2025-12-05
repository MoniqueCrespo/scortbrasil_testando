import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, Eye, MousePointer, Heart, Star } from "lucide-react";
import { Loader2 } from "lucide-react";

interface TierMetrics {
  tier: string;
  avgViews: number;
  avgClicks: number;
  avgFavorites: number;
  ctr: number;
  profileCount: number;
}

const AnaliseComparativa = () => {
  const [metrics, setMetrics] = useState<TierMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparativeMetrics();
  }, []);

  const fetchComparativeMetrics = async () => {
    try {
      // Fetch all profiles with their stats and featured status
      const { data: profiles } = await supabase
        .from("model_profiles")
        .select(`
          id,
          featured,
          profile_stats(views, clicks, favorites)
        `)
        .eq("is_active", true)
        .eq("moderation_status", "approved");

      if (!profiles) return;

      // Check for premium subscriptions
      const { data: subscriptions } = await supabase
        .from("premium_subscriptions")
        .select("profile_id")
        .eq("status", "active");

      const premiumProfileIds = new Set(
        subscriptions?.map((s) => s.profile_id) || []
      );

      // Categorize profiles
      const freeProfiles: any[] = [];
      const premiumProfiles: any[] = [];
      const featuredProfiles: any[] = [];

      profiles.forEach((profile: any) => {
        const stats = profile.profile_stats?.[0] || {
          views: 0,
          clicks: 0,
          favorites: 0,
        };

        const profileData = {
          views: stats.views,
          clicks: stats.clicks,
          favorites: stats.favorites,
        };

        if (profile.featured) {
          featuredProfiles.push(profileData);
        } else if (premiumProfileIds.has(profile.id)) {
          premiumProfiles.push(profileData);
        } else {
          freeProfiles.push(profileData);
        }
      });

      // Calculate averages
      const calculateAvg = (arr: any[], key: string) => {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, item) => sum + item[key], 0) / arr.length;
      };

      const calculateCTR = (arr: any[]) => {
        const totalViews = arr.reduce((sum, item) => sum + item.views, 0);
        const totalClicks = arr.reduce((sum, item) => sum + item.clicks, 0);
        return totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      };

      const comparisonData: TierMetrics[] = [
        {
          tier: "Gratuito",
          avgViews: Math.round(calculateAvg(freeProfiles, "views")),
          avgClicks: Math.round(calculateAvg(freeProfiles, "clicks")),
          avgFavorites: Math.round(calculateAvg(freeProfiles, "favorites")),
          ctr: calculateCTR(freeProfiles),
          profileCount: freeProfiles.length,
        },
        {
          tier: "Premium",
          avgViews: Math.round(calculateAvg(premiumProfiles, "views")),
          avgClicks: Math.round(calculateAvg(premiumProfiles, "clicks")),
          avgFavorites: Math.round(calculateAvg(premiumProfiles, "favorites")),
          ctr: calculateCTR(premiumProfiles),
          profileCount: premiumProfiles.length,
        },
        {
          tier: "Destaque",
          avgViews: Math.round(calculateAvg(featuredProfiles, "views")),
          avgClicks: Math.round(calculateAvg(featuredProfiles, "clicks")),
          avgFavorites: Math.round(calculateAvg(featuredProfiles, "favorites")),
          ctr: calculateCTR(featuredProfiles),
          profileCount: featuredProfiles.length,
        },
      ];

      setMetrics(comparisonData);
    } catch (error) {
      console.error("Erro ao buscar métricas comparativas:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = metrics.map((m) => ({
    tier: m.tier,
    "Visualizações Médias": m.avgViews,
    "Cliques Médios": m.avgClicks,
    "Favoritos Médios": m.avgFavorites,
  }));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/dashboard">Início</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/analytics">Analytics</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Análise Comparativa</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <AdminNotifications />
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Análise Comparativa: Free vs Premium</h1>
              <p className="text-muted-foreground mt-2">
                Comparativo de performance entre perfis gratuitos, premium e destaque
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  {metrics.map((tier) => (
                    <Card key={tier.tier}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {tier.tier === "Destaque" && <Star className="h-5 w-5 text-yellow-500" />}
                          {tier.tier === "Premium" && <TrendingUp className="h-5 w-5 text-primary" />}
                          {tier.tier === "Gratuito" && <Eye className="h-5 w-5 text-muted-foreground" />}
                          {tier.tier}
                        </CardTitle>
                        <CardDescription>{tier.profileCount} perfis</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Views médias:</span>
                          <span className="font-bold">{tier.avgViews.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cliques médios:</span>
                          <span className="font-bold">{tier.avgClicks.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Favoritos médios:</span>
                          <span className="font-bold">{tier.avgFavorites.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-2 border-t">
                          <span className="text-muted-foreground">CTR:</span>
                          <span className="font-bold text-primary">{tier.ctr.toFixed(2)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comparativo de Performance</CardTitle>
                    <CardDescription>
                      Métricas médias por tipo de plano
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        "Visualizações Médias": {
                          label: "Views",
                          color: "hsl(var(--chart-1))",
                        },
                        "Cliques Médios": {
                          label: "Cliques",
                          color: "hsl(var(--chart-2))",
                        },
                        "Favoritos Médios": {
                          label: "Favoritos",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="tier" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="Visualizações Médias" fill="hsl(var(--chart-1))" />
                          <Bar dataKey="Cliques Médios" fill="hsl(var(--chart-2))" />
                          <Bar dataKey="Favoritos Médios" fill="hsl(var(--chart-3))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* ROI Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de ROI</CardTitle>
                    <CardDescription>
                      Retorno sobre investimento para planos premium e destaque
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics.slice(1).map((tier) => {
                        const freeMetrics = metrics[0];
                        const viewsMultiplier = freeMetrics.avgViews > 0
                          ? (tier.avgViews / freeMetrics.avgViews).toFixed(1)
                          : "0";
                        const clicksMultiplier = freeMetrics.avgClicks > 0
                          ? (tier.avgClicks / freeMetrics.avgClicks).toFixed(1)
                          : "0";

                        return (
                          <div key={tier.tier} className="p-4 border rounded-lg space-y-2">
                            <h3 className="font-semibold text-lg">{tier.tier}</h3>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                  <strong>{viewsMultiplier}x</strong> mais visualizações que gratuito
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MousePointer className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                  <strong>{clicksMultiplier}x</strong> mais cliques que gratuito
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              CTR {tier.ctr > freeMetrics.ctr ? "superior" : "similar"} ao plano gratuito (
                              {tier.ctr > freeMetrics.ctr ? "+" : ""}
                              {(tier.ctr - freeMetrics.ctr).toFixed(2)}% de diferença)
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AnaliseComparativa;
