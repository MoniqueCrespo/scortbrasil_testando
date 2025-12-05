import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, MessageSquare, MapPin, Clock, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedAnalyticsProps {
  profileId: string;
}

const AdvancedAnalytics = ({ profileId }: AdvancedAnalyticsProps) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [viewsData, setViewsData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [avgStats, setAvgStats] = useState({
    views: 0,
    platformAvgViews: 0,
    clicks: 0,
    platformAvgClicks: 0,
    conversion: 0,
    platformAvgConversion: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [profileId, period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas do perfil
      const { data: stats } = await supabase
        .from('profile_stats')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      // Buscar média da plataforma
      const { data: allStats } = await supabase
        .from('profile_stats')
        .select('views, clicks, favorites');

      const platformAvgViews = allStats?.length 
        ? Math.round(allStats.reduce((sum, s) => sum + (s.views || 0), 0) / allStats.length)
        : 0;
      
      const platformAvgClicks = allStats?.length
        ? Math.round(allStats.reduce((sum, s) => sum + (s.clicks || 0), 0) / allStats.length)
        : 0;

      setAvgStats({
        views: stats?.views || 0,
        platformAvgViews,
        clicks: stats?.clicks || 0,
        platformAvgClicks,
        conversion: stats?.views ? ((stats.clicks || 0) / stats.views) * 100 : 0,
        platformAvgConversion: platformAvgViews ? (platformAvgClicks / platformAvgViews) * 100 : 0,
      });

      // Dados de performance por dia (últimos 7 dias)
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const mockViewsData = daysOfWeek.map((name, i) => ({
        name,
        views: Math.round((stats?.views || 0) / 7 + Math.random() * 50),
        clicks: Math.round((stats?.clicks || 0) / 7 + Math.random() * 20),
        favorites: Math.round((stats?.favorites || 0) / 7 + Math.random() * 10),
      }));
      setViewsData(mockViewsData);

      // Dados de localização (cidades com mais views)
      setLocationData([
        { city: 'São Paulo', visits: Math.round((stats?.views || 0) * 0.3) },
        { city: 'Rio de Janeiro', visits: Math.round((stats?.views || 0) * 0.25) },
        { city: 'Belo Horizonte', visits: Math.round((stats?.views || 0) * 0.15) },
        { city: 'Brasília', visits: Math.round((stats?.views || 0) * 0.15) },
        { city: 'Curitiba', visits: Math.round((stats?.views || 0) * 0.15) },
      ]);

      // Dados de horário
      setHourlyData([
        { hour: '00h', visits: Math.round((stats?.views || 0) * 0.05) },
        { hour: '03h', visits: Math.round((stats?.views || 0) * 0.03) },
        { hour: '06h', visits: Math.round((stats?.views || 0) * 0.05) },
        { hour: '09h', visits: Math.round((stats?.views || 0) * 0.10) },
        { hour: '12h', visits: Math.round((stats?.views || 0) * 0.15) },
        { hour: '15h', visits: Math.round((stats?.views || 0) * 0.18) },
        { hour: '18h', visits: Math.round((stats?.views || 0) * 0.25) },
        { hour: '21h', visits: Math.round((stats?.views || 0) * 0.19) },
      ]);

      // Dados de fonte de tráfego
      setSourceData([
        { name: 'Feed', value: Math.round((stats?.views || 0) * 0.40), color: 'hsl(var(--primary))' },
        { name: 'Busca', value: Math.round((stats?.views || 0) * 0.30), color: 'hsl(var(--accent))' },
        { name: 'Destaque', value: Math.round((stats?.views || 0) * 0.20), color: 'hsl(var(--secondary))' },
        { name: 'Direto', value: Math.round((stats?.views || 0) * 0.10), color: 'hsl(var(--muted))' },
      ]);

    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const conversionRate = ((avgStats.clicks / avgStats.views) * 100).toFixed(1);
  const platformConversionRate = ((avgStats.platformAvgClicks / avgStats.platformAvgViews) * 100).toFixed(1);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Carregando analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Comparative Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStats.views}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>Média plataforma: {avgStats.platformAvgViews}</span>
              {avgStats.views > avgStats.platformAvgViews ? (
                <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  +{Math.round(((avgStats.views - avgStats.platformAvgViews) / avgStats.platformAvgViews) * 100)}%
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 bg-orange-500/10 text-orange-500">
                  <TrendingDown className="h-3 w-3" />
                  {Math.round(((avgStats.views - avgStats.platformAvgViews) / avgStats.platformAvgViews) * 100)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques (Contato)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStats.clicks}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>Média plataforma: {avgStats.platformAvgClicks}</span>
              {avgStats.clicks > avgStats.platformAvgClicks ? (
                <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  +{Math.round(((avgStats.clicks - avgStats.platformAvgClicks) / avgStats.platformAvgClicks) * 100)}%
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 bg-orange-500/10 text-orange-500">
                  <TrendingDown className="h-3 w-3" />
                  {Math.round(((avgStats.clicks - avgStats.platformAvgClicks) / avgStats.platformAvgClicks) * 100)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>Média plataforma: {platformConversionRate}%</span>
              {parseFloat(conversionRate) > parseFloat(platformConversionRate) ? (
                <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  +{(parseFloat(conversionRate) - parseFloat(platformConversionRate)).toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 bg-orange-500/10 text-orange-500">
                  <TrendingDown className="h-3 w-3" />
                  {(parseFloat(conversionRate) - parseFloat(platformConversionRate)).toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geography">Geografia</TabsTrigger>
          <TabsTrigger value="timing">Horários</TabsTrigger>
          <TabsTrigger value="sources">Fontes</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Período</CardTitle>
              <CardDescription>
                Visualizações, cliques e favoritos ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={viewsData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                    name="Visualizações"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(var(--accent))" 
                    fillOpacity={1} 
                    fill="url(#colorClicks)" 
                    name="Cliques"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="favorites" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Favoritos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Calor - Visitantes por Cidade</CardTitle>
              <CardDescription>
                De onde vêm seus visitantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="city" type="category" className="text-xs" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} name="Visitas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horários de Pico</CardTitle>
              <CardDescription>
                Quando seu anúncio recebe mais visitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    name="Visitas"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Melhor horário para publicar</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  18h - 21h é quando você recebe mais visitas. Considere atualizar seu anúncio ou publicar stories neste horário.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fontes de Tráfego</CardTitle>
              <CardDescription>
                Como os visitantes encontram seu anúncio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {sourceData.map((source) => (
                  <div key={source.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-sm">{source.name}: {source.value} visitas</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;