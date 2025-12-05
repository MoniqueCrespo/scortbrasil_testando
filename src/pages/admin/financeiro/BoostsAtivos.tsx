import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Eye, MousePointer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActiveBoost {
  id: string;
  profileName: string;
  packageName: string;
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  progress: number;
}

const BoostsAtivos = () => {
  const [activeBoosts] = useState<ActiveBoost[]>([
    {
      id: "1",
      profileName: "Julia Santos",
      packageName: "Boost Plus",
      startDate: "2025-01-15",
      endDate: "2025-01-22",
      views: 1250,
      clicks: 89,
      progress: 65,
    },
    {
      id: "2",
      profileName: "Mariana Silva",
      packageName: "Boost Premium",
      startDate: "2025-01-10",
      endDate: "2025-01-25",
      views: 2180,
      clicks: 156,
      progress: 40,
    },
    {
      id: "3",
      profileName: "Carolina Lima",
      packageName: "Boost Básico",
      startDate: "2025-01-20",
      endDate: "2025-01-21",
      views: 450,
      clicks: 32,
      progress: 85,
    },
  ]);

  const totalViews = activeBoosts.reduce((acc, boost) => acc + boost.views, 0);
  const totalClicks = activeBoosts.reduce((acc, boost) => acc + boost.clicks, 0);
  const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Boosts Ativos</h2>
        <p className="text-muted-foreground">
          Monitore os boosts em andamento em tempo real
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Boosts Ativos</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBoosts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em execução agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nos boosts ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cliques (CTR)</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCTR}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média geral
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Boosts Ativos</CardTitle>
          <CardDescription>
            Acompanhe o desempenho de cada boost individualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anúncio</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Visualizações</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBoosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum boost ativo no momento
                    </TableCell>
                  </TableRow>
                ) : (
                  activeBoosts.map((boost) => {
                    const ctr = boost.views > 0 ? ((boost.clicks / boost.views) * 100).toFixed(2) : "0.00";
                    return (
                      <TableRow key={boost.id}>
                        <TableCell className="font-medium">{boost.profileName}</TableCell>
                        <TableCell>
                          <Badge variant="default">{boost.packageName}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(boost.startDate), "dd/MM/yyyy", { locale: ptBR })}</div>
                            <div className="text-muted-foreground text-xs">
                              até {format(new Date(boost.endDate), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {boost.views.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                            {boost.clicks}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ctr}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={boost.progress} className="h-2" />
                            <div className="text-xs text-muted-foreground">{boost.progress}%</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoostsAtivos;
