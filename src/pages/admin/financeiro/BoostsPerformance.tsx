import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, TrendingUp, Eye, MousePointer, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ActiveBoost {
  id: string;
  profile_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  status: string;
  views_count: number;
  clicks_count: number;
  boost_packages: {
    name: string;
    visibility_multiplier: number;
  };
  model_profiles: {
    name: string;
    city: string;
    state: string;
  };
}

const BoostsPerformance = () => {
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveBoosts();

    // Real-time subscription
    const channel = supabase
      .channel("active-boosts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_boosts",
        },
        () => {
          fetchActiveBoosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveBoosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("active_boosts")
        .select(`
          *,
          boost_packages(name, visibility_multiplier),
          model_profiles(name, city, state)
        `)
        .eq("status", "active")
        .order("start_date", { ascending: false });

      if (error) throw error;
      if (data) setActiveBoosts(data as any);
    } catch (error) {
      toast.error("Erro ao carregar boosts ativos");
    } finally {
      setLoading(false);
    }
  };

  const totalViews = activeBoosts.reduce((sum, boost) => sum + (boost.views_count || 0), 0);
  const totalClicks = activeBoosts.reduce((sum, boost) => sum + (boost.clicks_count || 0), 0);
  const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  if (loading) {
    return (
      <AdminLayout title="Boosts e Performance">
        <div className="p-6">Carregando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Boosts e Performance">
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Boosts Ativos e Performance</h2>
        <p className="text-muted-foreground">
          Monitore o desempenho de boosts em tempo real
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boosts Ativos</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBoosts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCTR}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boosts Ativos em Tempo Real</CardTitle>
          <CardDescription>
            Atualizações automáticas de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Pacote</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Término</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBoosts.map((boost) => {
                const ctr = boost.views_count > 0 
                  ? ((boost.clicks_count / boost.views_count) * 100).toFixed(2) 
                  : "0.00";
                
                return (
                  <TableRow key={boost.id}>
                    <TableCell className="font-medium">
                      {boost.model_profiles?.name}
                    </TableCell>
                    <TableCell>
                      {boost.model_profiles?.city}, {boost.model_profiles?.state}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Zap className="h-3 w-3 mr-1" />
                        {boost.boost_packages?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(boost.start_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(boost.end_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{boost.views_count || 0}</TableCell>
                    <TableCell>{boost.clicks_count || 0}</TableCell>
                    <TableCell>
                      <Badge variant={parseFloat(ctr) > 5 ? "default" : "secondary"}>
                        {ctr}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {activeBoosts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum boost ativo no momento
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
};

export default BoostsPerformance;
