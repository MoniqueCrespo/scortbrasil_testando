import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useContentNotifications } from "@/hooks/useContentNotifications";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { brazilStates, cities } from "@/data/locations";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye,
  MousePointer,
  Heart,
  TrendingUp,
  PlusCircle,
  Shield,
  Edit,
  Star,
  Zap,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Info,
  EyeOff,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProfileOptimizationCard } from "@/components/ProfileOptimizationCard";
import { BoostCallToAction } from "@/components/BoostCallToAction";
import { FeedOptimizationGuide } from "@/components/FeedOptimizationGuide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreditsCard from "@/components/dashboard/CreditsCard";
import DailyMissionsCard from "@/components/dashboard/DailyMissionsCard";
import ActiveBoostsPanel from "@/components/dashboard/ActiveBoostsPanel";
import PremiumMarketplace from "@/components/dashboard/PremiumMarketplace";
import BoostSelectionModal from "@/components/dashboard/BoostSelectionModal";
import { useNotificationSystem } from "@/hooks/useNotificationSystem";
import { StoryUploader } from "@/components/StoryUploader";
import { StoryAnalytics } from "@/components/StoryAnalytics";
import { MessagesCenter } from "@/components/dashboard/MessagesCenter";
import WeeklyReportCard from "@/components/dashboard/WeeklyReportCard";
import AdvancedAnalytics from "@/components/dashboard/AdvancedAnalytics";
import OptimizationTools from "@/components/dashboard/OptimizationTools";
import LeadsManager from "@/components/dashboard/LeadsManager";
import { SubscriptionTiersManager } from "@/components/dashboard/SubscriptionTiersManager";
import { ExclusiveContentUploader } from "@/components/dashboard/ExclusiveContentUploader";
import { ExclusiveContentManager } from "@/components/dashboard/ExclusiveContentManager";
import { SubscribersDashboard } from "@/components/dashboard/SubscribersDashboard";
import { CreatorEarningsPanel } from "@/components/dashboard/CreatorEarningsPanel";
import { PPVContentManager } from "@/components/dashboard/PPVContentManager.tsx"
import { ContentProtectionSettings } from "@/components/dashboard/ContentProtectionSettings";
import { PhotoLimitCard } from "@/components/dashboard/PhotoLimitCard";
import { PlanosTab } from "@/components/dashboard/PlanosTab";

type ModelProfile = Tables<"model_profiles">;
type ProfileStats = Tables<"profile_stats">;

interface ProfileWithStats extends ModelProfile {
  stats?: ProfileStats;
}

const ModelDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userRole } = useAuth();
  useContentNotifications();
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    views: 0,
    clicks: 0,
    favorites: 0,
    messages: 0,
  });
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "premium">("all");
  const [sortBy, setSortBy] = useState<"views" | "recent" | "performance">("views");
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("visao-geral");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [boostModalProfile, setBoostModalProfile] = useState<ModelProfile | null>(null);
  const [selectedStoryProfile, setSelectedStoryProfile] = useState<ModelProfile | null>(null);
  
  // Ativar notificações em tempo real
  useRealtimeNotifications(user?.id);
  
  // Ativar sistema de notificações
  useNotificationSystem();

  const chartData = [
    { day: "Dom", views: Math.round(totalStats.views / 7 * 0.9) },
    { day: "Seg", views: Math.round(totalStats.views / 7 * 1.1) },
    { day: "Ter", views: Math.round(totalStats.views / 7 * 0.95) },
    { day: "Qua", views: Math.round(totalStats.views / 7 * 1.15) },
    { day: "Qui", views: Math.round(totalStats.views / 7 * 1.05) },
    { day: "Sex", views: Math.round(totalStats.views / 7 * 1.3) },
    { day: "Sáb", views: Math.round(totalStats.views / 7 * 1.2) },
  ];

  useEffect(() => {
    if (userRole !== "model") {
      navigate("/dashboard");
      return;
    }
    fetchProfilesWithStats();
    
    // Verificar parâmetro da URL para abrir tab específica
    const tab = searchParams.get('tab');
    if (tab === 'boosts') {
      setActiveTab('boosts');
    }
  }, [userRole, navigate, searchParams]);

  // Inicializar selectedStoryProfile com o primeiro perfil quando carregado
  useEffect(() => {
    if (profiles.length > 0 && !selectedStoryProfile) {
      setSelectedStoryProfile(profiles[0]);
    }
  }, [profiles, selectedStoryProfile]);

  const fetchProfilesWithStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("model_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      if (profilesData && profilesData.length > 0) {
        const profileIds = profilesData.map((p) => p.id);
        const { data: statsData, error: statsError } = await supabase
          .from("profile_stats")
          .select("*")
          .in("profile_id", profileIds);

        if (statsError) throw statsError;

        const profilesWithStats = profilesData.map((profile) => ({
          ...profile,
          stats: statsData?.find((stat) => stat.profile_id === profile.id),
        }));

        setProfiles(profilesWithStats);

        const totals = statsData?.reduce(
          (acc, stat) => ({
            views: acc.views + (stat.views || 0),
            clicks: acc.clicks + (stat.clicks || 0),
            favorites: acc.favorites + (stat.favorites || 0),
            messages: acc.messages + (stat.messages || 0),
          }),
          { views: 0, clicks: 0, favorites: 0, messages: 0 }
        );

        setTotalStats(totals || { views: 0, clicks: 0, favorites: 0, messages: 0 });
      } else {
        setProfiles([]);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar estatísticas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceTips = (profile: ProfileWithStats) => {
    const tips = [];
    const views = profile.stats?.views || 0;
    const clicks = profile.stats?.clicks || 0;
    const rate = views > 0 ? (clicks / views) * 100 : 0;

    if (views < 50) {
      tips.push({
        icon: Eye,
        title: "Baixa visibilidade",
        message: "Adicione mais fotos e melhore a descrição para aparecer mais nas buscas",
        action: "Otimizar Perfil",
        actionUrl: `/anuncios/editar/${profile.id}`,
      });
    }

    if (rate < 2 && views > 0) {
      tips.push({
        icon: MousePointer,
        title: "Taxa de cliques baixa",
        message: "Atualize sua foto principal e preço para atrair mais interesse",
        action: "Atualizar Foto",
        actionUrl: `/anuncios/editar/${profile.id}`,
      });
    }

    if (!profile.featured && views > 100) {
      tips.push({
        icon: TrendingUp,
        title: "Bom desempenho! 🎉",
        message: "Seu anúncio está performando bem. Impulsione para triplicar resultados!",
        action: "Ver Boosts",
        actionOnClick: () => setActiveTab('boosts'),
        variant: "success",
      });
    }

    return tips;
  };

  const filteredProfiles = profiles.filter((profile) => {
    // Filtro de busca por nome
    if (searchTerm && !profile.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtros de status
    if (filter === "active") return profile.is_active;
    if (filter === "inactive") return !profile.is_active;
    if (filter === "premium") return profile.featured;
    return true;
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === "views") {
      return (b.stats?.views || 0) - (a.stats?.views || 0);
    }
    if (sortBy === "recent") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "performance") {
      const aRate = a.stats?.views ? (a.stats.clicks || 0) / a.stats.views : 0;
      const bRate = b.stats?.views ? (b.stats.clicks || 0) / b.stats.views : 0;
      return bRate - aRate;
    }
    return 0;
  });

  const averageViews = profiles.length > 0
    ? Math.round(profiles.reduce((sum, p) => sum + (p.stats?.views || 0), 0) / profiles.length)
    : 0;

  const engagementRate = totalStats.views > 0 ? ((totalStats.clicks / totalStats.views) * 100).toFixed(1) : "0";

  const calculateRate = (profile: ProfileWithStats) => {
    const views = profile.stats?.views || 0;
    const clicks = profile.stats?.clicks || 0;
    return views > 0 ? ((clicks / views) * 100).toFixed(1) : "0";
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedProfiles.length === 0) return;

    if (action === "delete") {
      if (!confirm(`Tem certeza que deseja excluir ${selectedProfiles.length} anúncio(s)?`)) return;
    }

    try {
      if (action === "delete") {
        const { error } = await supabase.from("model_profiles").delete().in("id", selectedProfiles);
        if (error) throw error;
        toast.success("Anúncios excluídos com sucesso");
      } else {
        const { error } = await supabase
          .from("model_profiles")
          .update({ is_active: action === "activate" })
          .in("id", selectedProfiles);
        if (error) throw error;
        toast.success(
          action === "activate" ? "Anúncios ativados com sucesso" : "Anúncios desativados com sucesso"
        );
      }
      setSelectedProfiles([]);
      fetchProfilesWithStats();
    } catch (error) {
      toast.error("Erro ao executar ação");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
              Dashboard de Performance
            </h1>
            <p className="text-muted-foreground">Acompanhe o desempenho dos seus anúncios</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-7xl grid-cols-10 h-auto">
              <TabsTrigger value="visao-geral" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="otimizacao" className="text-xs sm:text-sm">Otimização</TabsTrigger>
              <TabsTrigger value="leads" className="text-xs sm:text-sm">Leads</TabsTrigger>
              <TabsTrigger value="boosts" className="text-xs sm:text-sm">Boosts</TabsTrigger>
              <TabsTrigger value="planos" className="text-xs sm:text-sm">Planos</TabsTrigger>
              <TabsTrigger value="conteudo" className="text-xs sm:text-sm">Conteúdo</TabsTrigger>
              <TabsTrigger value="mensagens" className="text-xs sm:text-sm">Mensagens</TabsTrigger>
              <TabsTrigger value="relatorios" className="text-xs sm:text-sm">Relatórios</TabsTrigger>
              <TabsTrigger value="stories" className="text-xs sm:text-sm">Stories</TabsTrigger>
            </TabsList>

            <TabsContent value="boosts" className="mt-6 space-y-6">
              <ActiveBoostsPanel />
              <PremiumMarketplace />
            </TabsContent>

            <TabsContent value="planos" className="mt-6">
              <PlanosTab profiles={profiles} />
            </TabsContent>

            <TabsContent value="conteudo" className="mt-6 space-y-6">
              {profiles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você precisa criar um perfil primeiro para gerenciar conteúdo exclusivo
                    </p>
                    <Button onClick={() => navigate("/anuncios/novo")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Seletor de Perfil */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Selecione um Perfil</CardTitle>
                      <CardDescription>Escolha o perfil para gerenciar conteúdo exclusivo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedStoryProfile?.id || profiles[0]?.id}
                        onValueChange={(value) => {
                          const profile = profiles.find((p) => p.id === value);
                          setSelectedStoryProfile(profile || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name} - {profile.city}, {profile.state}
                              {profile.featured && <Badge className="ml-2">Premium</Badge>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {selectedStoryProfile && (
                    <>
                      <Tabs defaultValue="planos" className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                          <TabsTrigger value="planos">Planos</TabsTrigger>
                          <TabsTrigger value="upload">Upload</TabsTrigger>
                          <TabsTrigger value="ppv">PPV</TabsTrigger>
                          <TabsTrigger value="assinantes">Assinantes</TabsTrigger>
                          <TabsTrigger value="ganhos">Ganhos</TabsTrigger>
                          <TabsTrigger value="protecao">Proteção</TabsTrigger>
                        </TabsList>

                        <TabsContent value="planos" className="mt-6">
                          <SubscriptionTiersManager profileId={selectedStoryProfile.id} />
                        </TabsContent>

                        <TabsContent value="upload" className="mt-6 space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Publicar Conteúdo Exclusivo</CardTitle>
                              <CardDescription>
                                Faça upload de fotos e vídeos exclusivos para seus assinantes
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ExclusiveContentUploader profileId={selectedStoryProfile.id} />
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Meus Conteúdos</CardTitle>
                              <CardDescription>
                                Gerencie todos os conteúdos exclusivos publicados
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ExclusiveContentManager profileId={selectedStoryProfile.id} />
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="assinantes" className="mt-6">
                          <SubscribersDashboard profileId={selectedStoryProfile.id} />
                        </TabsContent>

                        <TabsContent value="ganhos" className="mt-6">
                          <CreatorEarningsPanel profileId={selectedStoryProfile.id} />
                        </TabsContent>

                        <TabsContent value="ppv" className="mt-6">
                          <PPVContentManager profileId={selectedStoryProfile.id} />
                        </TabsContent>

                        <TabsContent value="protecao" className="mt-6">
                          <ContentProtectionSettings profileId={selectedStoryProfile.id} />
                        </TabsContent>
                      </Tabs>
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stories" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Stories</CardTitle>
                  <CardDescription>Publique e acompanhe stories dos seus perfis</CardDescription>
                </CardHeader>
                <CardContent>
                  {profiles.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        Você precisa criar um perfil primeiro para publicar stories
                      </p>
                      <Button onClick={() => navigate("/anuncios/novo")}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar Primeiro Anúncio
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Seletor de Perfil */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Selecione o perfil</label>
                        <Select
                          value={selectedStoryProfile?.id || ""}
                          onValueChange={(value) => {
                            const profile = profiles.find(p => p.id === value);
                            setSelectedStoryProfile(profile || null);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um perfil para publicar story" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.name} - {profile.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedStoryProfile && (
                        <>
                          {/* Upload de Story */}
                          <div>
                            <h3 className="text-sm font-semibold mb-3">Publicar Novo Story</h3>
                            <StoryUploader
                              profileId={selectedStoryProfile.id}
                              onUploadSuccess={() => {
                                toast.success("Story publicado com sucesso!");
                                // Força refresh dos analytics
                                setSelectedStoryProfile({...selectedStoryProfile});
                              }}
                            />
                          </div>

                          {/* Analytics de Stories */}
                          <div>
                            <h3 className="text-sm font-semibold mb-3">Analytics dos Stories</h3>
                            <StoryAnalytics profileId={selectedStoryProfile.id} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6 space-y-6">
              {profiles.length > 0 ? (
                <AdvancedAnalytics profileId={profiles[0].id} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você precisa criar um perfil primeiro para acessar analytics avançado
                    </p>
                    <Button onClick={() => navigate("/anuncios/novo")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="otimizacao" className="mt-6 space-y-6">
              {profiles.length > 0 ? (
                <OptimizationTools profileId={profiles[0].id} profileData={profiles[0]} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você precisa criar um perfil primeiro para acessar ferramentas de otimização
                    </p>
                    <Button onClick={() => navigate("/anuncios/novo")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="leads" className="mt-6 space-y-6">
              {profiles.length > 0 ? (
                <LeadsManager profileId={profiles[0].id} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você precisa criar um perfil primeiro para gerenciar leads
                    </p>
                    <Button onClick={() => navigate("/anuncios/novo")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="mensagens" className="mt-6 space-y-6">
              {profiles.length > 0 ? (
                <MessagesCenter profileId={profiles[0].id} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você precisa criar um perfil primeiro para receber mensagens
                    </p>
                    <Button onClick={() => navigate("/anuncios/novo")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="relatorios" className="mt-6 space-y-6">
              {profiles.length > 0 ? (
                <WeeklyReportCard profileId={profiles[0].id} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você precisa criar um perfil primeiro para visualizar relatórios
                    </p>
                    <Button onClick={() => navigate("/anuncios/novo")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="guia-feed" className="mt-6">
              {profiles.length > 0 ? (
                <FeedOptimizationGuide profile={profiles[0]} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Você precisa criar um perfil primeiro para acessar o guia de otimização
                    </p>
                    <Button onClick={() => navigate("/anuncios/novo")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="visao-geral" className="mt-6">
              {/* Banner CTA para Planos Premium (apenas perfis gratuitos) */}
              {profiles.length > 0 && !profiles.some(p => p.featured) && (
                <Alert className="mb-6 border-primary/50 bg-gradient-to-r from-primary/10 to-secondary/10">
                  <Star className="h-4 w-4" />
                  <AlertTitle className="text-lg font-bold">
                    🚀 Destaque seu anúncio e aumente suas visualizações em 3x
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="mb-3">
                      Perfis Premium aparecem no topo das buscas e recebem até 10x mais visualizações.
                      Aumente suas fotos visíveis, ganhe badges exclusivos e converta mais clientes.
                    </p>
                    <Button onClick={() => navigate('/planos')} className="bg-gradient-to-r from-primary to-secondary">
                      <Star className="h-4 w-4 mr-2" />
                      Ver Planos Premium
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

          {isLoading ? (
            <div className="text-center py-12">Carregando estatísticas...</div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
                <StatsCard icon={Eye} title="Visualizações" value={totalStats.views} change="+12%" trend="up" />
                <StatsCard icon={MousePointer} title="Cliques" value={totalStats.clicks} change="+8%" trend="up" />
                <StatsCard icon={Heart} title="Favoritos" value={totalStats.favorites} change="+5%" trend="up" />
                <StatsCard
                  icon={TrendingUp}
                  title="Taxa de Engajamento"
                  value={`${engagementRate}%`}
                  change="+3%"
                  trend="up"
                />
                <CreditsCard />
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Visualizações nos Últimos 7 Dias</CardTitle>
                  <CardDescription>Acompanhe a evolução do seu perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <PlusCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Criar Novo Anúncio</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Publique mais perfis e aumente sua visibilidade
                    </p>
                    <Button
                      onClick={() => navigate("/anuncios/novo")}
                      className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
                    >
                      Criar Anúncio
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Verificação</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Obtenha o selo verificado e ganhe mais confiança
                    </p>
                    <Button variant="outline" onClick={() => navigate("/verificacao")}>
                      Solicitar Verificação
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Boosts & Serviços Premium</h3>
                    <p className="text-sm text-muted-foreground mb-4">Impulsione seus anúncios e aumente sua visibilidade</p>
                    <Button variant="outline" onClick={() => setActiveTab('boosts')}>
                      <Zap className="h-4 w-4 mr-2" />
                      Ver Opções
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {profiles.length > 0 && <BoostCallToAction averageViews={averageViews} onViewPlans={() => setActiveTab('boosts')} />}

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                {profiles.length > 0 && (
                  <>
                    <ProfileOptimizationCard 
                      profile={profiles[0]} 
                      onOptimize={() => navigate(`/anuncios/${profiles[0].id}/editar`)}
                    />
                    <PhotoLimitCard 
                      profileId={profiles[0].id}
                      totalPhotos={profiles[0].photos?.length || 0}
                    />
                  </>
                )}
                {profiles.length === 0 && <DailyMissionsCard />}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Meus Anúncios</h2>
                  <Button variant="outline" onClick={() => navigate("/anuncios/novo")}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Criar Novo
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por nome do anúncio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                    Todos ({profiles.length})
                  </Button>
                  <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
                    Ativos ({profiles.filter((p) => p.is_active).length})
                  </Button>
                  <Button variant={filter === "inactive" ? "default" : "outline"} onClick={() => setFilter("inactive")}>
                    Inativos ({profiles.filter((p) => !p.is_active).length})
                  </Button>
                  <Button variant={filter === "premium" ? "default" : "outline"} onClick={() => setFilter("premium")}>
                    <Star className="h-4 w-4 mr-1" />
                    Em Destaque ({profiles.filter((p) => p.featured).length})
                  </Button>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-48 ml-auto">
                      <SelectValue placeholder="Ordenar por..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">Mais Visualizados</SelectItem>
                      <SelectItem value="recent">Mais Recentes</SelectItem>
                      <SelectItem value="performance">Melhor Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedProfiles.length > 0 && (
                  <Card className="mb-4 border-primary">
                    <CardContent className="p-4 flex items-center justify-between">
                      <p className="text-sm font-medium">{selectedProfiles.length} anúncio(s) selecionado(s)</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                          Ativar Todos
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                          Desativar Todos
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                          Excluir Selecionados
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {sortedProfiles.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      {filter === "all" ? "Você ainda não possui anúncios" : "Nenhum anúncio encontrado com este filtro"}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {sortedProfiles.map((profile) => {
                      const tips = getPerformanceTips(profile);
                      const stateData = brazilStates.find(s => s.code === profile.state || s.slug === profile.state);
                      const cityData = cities.find(c => 
                        (c.slug === profile.city || c.name === profile.city) && c.state === stateData?.code
                      );
                      const isSelected = selectedProfiles.includes(profile.id);

                      return (
                        <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-all">
                          <div className="flex flex-col sm:flex-row">
                            {/* Foto (Esquerda) */}
                            <div className="relative w-full h-64 sm:w-64 sm:h-auto flex-shrink-0">
                              <img
                                src={profile.photo_url || "/placeholder.svg"}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 left-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedProfiles([...selectedProfiles, profile.id]);
                                    } else {
                                      setSelectedProfiles(selectedProfiles.filter(id => id !== profile.id));
                                    }
                                  }}
                                  className="bg-background/80 backdrop-blur-sm"
                                />
                              </div>
                              <div className="absolute top-3 right-3">
                                <Badge variant={profile.is_active ? "default" : "secondary"}>
                                  {profile.featured && <Star className="h-3 w-3 mr-1 fill-current" />}
                                  {profile.featured ? "Destaque" : profile.is_active ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                            </div>

                            {/* Informações Principais (Centro) */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {cityData?.name || profile.city}, {stateData?.code || profile.state}
                                  </p>
                                </div>
                                <Badge variant="outline">{profile.category}</Badge>
                              </div>

                              {/* Estatísticas em Grid Horizontal */}
                              <div className="grid grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                  <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-lg font-semibold">{profile.stats?.views || 0}</p>
                                  <p className="text-xs text-muted-foreground">Visualizações</p>
                                </div>
                                <div className="text-center">
                                  <MousePointer className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-lg font-semibold">{profile.stats?.clicks || 0}</p>
                                  <p className="text-xs text-muted-foreground">Cliques</p>
                                </div>
                                <div className="text-center">
                                  <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-lg font-semibold">{profile.stats?.favorites || 0}</p>
                                  <p className="text-xs text-muted-foreground">Favoritos</p>
                                </div>
                                <div className="text-center">
                                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-lg font-semibold">{calculateRate(profile)}%</p>
                                  <p className="text-xs text-muted-foreground">Taxa</p>
                                </div>
                              </div>

                              {/* Tips de Otimização */}
                              {tips.length > 0 && (
                                <Alert 
                                  variant={tips[0].variant === "success" ? "default" : "default"} 
                                  className="mb-0 cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => {
                                    if (tips[0].actionOnClick) {
                                      tips[0].actionOnClick();
                                    } else if (tips[0].actionUrl) {
                                      navigate(tips[0].actionUrl);
                                    }
                                  }}
                                >
                                  {tips[0].variant === "success" ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4" />
                                  )}
                                  <AlertTitle className="text-sm font-semibold">{tips[0].title}</AlertTitle>
                                  <AlertDescription className="text-xs">
                                    {tips[0].message}
                                    {tips[0].action && (
                                      <span className="block mt-1 text-primary font-medium">
                                        → {tips[0].action}
                                      </span>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            {/* Ações (Direita) */}
                            <div className="p-6 border-t sm:border-t-0 sm:border-l flex flex-row sm:flex-col gap-2 w-full sm:w-48">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/anuncios/editar/${profile.id}`)}
                                className="flex-1 sm:flex-none"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              {!profile.featured && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => setBoostModalProfile(profile)}
                                  className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-[hsl(320,75%,58%)]"
                                >
                                  <Zap className="h-4 w-4 mr-1" />
                                  Impulsionar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from("model_profiles")
                                      .update({ is_active: !profile.is_active })
                                      .eq("id", profile.id);
                                    if (error) throw error;
                                    toast.success(profile.is_active ? "Anúncio ocultado" : "Anúncio publicado");
                                    fetchProfilesWithStats();
                                  } catch (error) {
                                    toast.error("Erro ao atualizar status");
                                  }
                                }}
                                className="flex-1 sm:flex-none"
                              >
                                {profile.is_active ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                {profile.is_active ? "Ocultar" : "Publicar"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
                                  try {
                                    const { error } = await supabase
                                      .from("model_profiles")
                                      .delete()
                                      .eq("id", profile.id);
                                    if (error) throw error;
                                    toast.success("Anúncio excluído");
                                    fetchProfilesWithStats();
                                  } catch (error) {
                                    toast.error("Erro ao excluir");
                                  }
                                }}
                                className="flex-1 sm:flex-none"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {boostModalProfile && (
        <BoostSelectionModal
          isOpen={!!boostModalProfile}
          onClose={() => setBoostModalProfile(null)}
          profile={boostModalProfile}
          onSuccess={fetchProfilesWithStats}
        />
      )}
    </div>
  );
};

export default ModelDashboard;
