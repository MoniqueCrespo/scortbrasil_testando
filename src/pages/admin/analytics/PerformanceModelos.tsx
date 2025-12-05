import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Eye, MousePointer, Heart, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ModelPerformance {
  profile_id: string;
  name: string;
  category: string;
  state: string;
  city: string;
  views: number;
  clicks: number;
  favorites: number;
  messages: number;
  ctr: number;
  featured: boolean;
}

const PerformanceModelos = () => {
  const [performances, setPerformances] = useState<ModelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("views");

  useEffect(() => {
    fetchPerformances();
  }, [categoryFilter, sortBy]);

  const fetchPerformances = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profile_stats")
        .select(`
          profile_id,
          views,
          clicks,
          favorites,
          messages,
          model_profiles(name, category, state, city, featured)
        `);

      // Aplicar filtro de categoria se selecionado
      if (categoryFilter !== "all") {
        query = query.eq("model_profiles.category", categoryFilter);
      }

      // Ordenar por métrica selecionada
      query = query.order(sortBy, { ascending: false }).limit(50);

      const { data, error } = await query;

      if (error) throw error;

      const formattedData: ModelPerformance[] = (data || []).map((item: any) => ({
        profile_id: item.profile_id,
        name: item.model_profiles?.name || "N/A",
        category: item.model_profiles?.category || "N/A",
        state: item.model_profiles?.state || "N/A",
        city: item.model_profiles?.city || "N/A",
        views: item.views || 0,
        clicks: item.clicks || 0,
        favorites: item.favorites || 0,
        messages: item.messages || 0,
        ctr: item.views > 0 ? ((item.clicks / item.views) * 100) : 0,
        featured: item.model_profiles?.featured || false,
      }));

      setPerformances(formattedData);
    } catch (error) {
      console.error("Erro ao buscar performance dos modelos:", error);
    } finally {
      setLoading(false);
    }
  };

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
                  <BreadcrumbPage>Performance de Modelos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <AdminNotifications />
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Performance de Modelos</h1>
              <p className="text-muted-foreground mt-2">
                Ranking e métricas individuais dos top 50 perfis
              </p>
            </div>

            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="mulheres">Mulheres</SelectItem>
                  <SelectItem value="homens">Homens</SelectItem>
                  <SelectItem value="trans">Trans</SelectItem>
                  <SelectItem value="casais">Casais</SelectItem>
                  <SelectItem value="massagistas">Massagistas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="clicks">Cliques</SelectItem>
                  <SelectItem value="favorites">Favoritos</SelectItem>
                  <SelectItem value="messages">Mensagens</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top 50 Perfis - Ranking de Performance</CardTitle>
                <CardDescription>
                  Métricas de engajamento e conversão dos melhores perfis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-4 w-4" />
                              Views
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MousePointer className="h-4 w-4" />
                              Cliques
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Heart className="h-4 w-4" />
                              Favoritos
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Mail className="h-4 w-4" />
                              Mensagens
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              CTR
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performances.map((perf, index) => (
                          <TableRow key={perf.profile_id}>
                            <TableCell className="font-bold">#{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {perf.name}
                                {perf.featured && (
                                  <Badge variant="default" className="text-xs">Destaque</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{perf.category}</TableCell>
                            <TableCell>
                              {perf.city}, {perf.state}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {perf.views.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {perf.clicks.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {perf.favorites.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {perf.messages.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {perf.ctr.toFixed(2)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PerformanceModelos;
