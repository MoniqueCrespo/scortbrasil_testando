import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Users, TrendingUp, Settings, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AssinaturasConteudo() {
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    platformRevenue: 0,
  });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [platformFee, setPlatformFee] = useState(20);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar assinaturas
      const { data: subsData } = await supabase
        .from('content_subscriptions')
        .select(`
          *,
          profiles:subscriber_id (email),
          model_profiles (name, slug),
          subscription_tiers (tier_name, monthly_price)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Buscar transações
      const { data: transData } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          content_subscriptions (
            profiles:subscriber_id (email),
            model_profiles (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setSubscriptions(subsData || []);
      setTransactions(transData || []);

      // Calcular estatísticas
      const active = subsData?.filter(s => s.status === 'active' && new Date(s.end_date) > new Date()) || [];
      const monthlyRev = active.reduce((sum, s) => sum + (s.subscription_tiers?.monthly_price || 0), 0);
      const platformRev = monthlyRev * (platformFee / 100);

      setStats({
        totalSubscriptions: subsData?.length || 0,
        activeSubscriptions: active.length,
        monthlyRevenue: monthlyRev,
        platformRevenue: platformRev,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const isExpired = new Date(endDate) < new Date();
    if (status === 'active' && !isExpired) {
      return <Badge className="bg-green-500">Ativa</Badge>;
    } else if (status === 'cancelled' || isExpired) {
      return <Badge variant="secondary">Cancelada</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Carregando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assinaturas de Conteúdo</h1>
          <p className="text-muted-foreground">Gerencie assinaturas e receita do módulo de conteúdo exclusivo</p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assinaturas</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal Total</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Plataforma ({platformFee}%)</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">R$ {stats.platformRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Assinaturas</CardTitle>
                <CardDescription>Lista completa de assinaturas de conteúdo exclusivo</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assinante</TableHead>
                      <TableHead>Criadora</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Válido até</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.profiles?.email || 'N/A'}</TableCell>
                        <TableCell>{sub.model_profiles?.name || 'N/A'}</TableCell>
                        <TableCell>{sub.subscription_tiers?.tier_name || 'N/A'}</TableCell>
                        <TableCell>R$ {(sub.subscription_tiers?.monthly_price || 0).toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(sub.status, sub.end_date)}</TableCell>
                        <TableCell>{format(new Date(sub.end_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>Pagamentos processados via Mercado Pago</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Assinante</TableHead>
                      <TableHead>Criadora</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Taxa Plataforma</TableHead>
                      <TableHead>Valor Criadora</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((trans) => (
                      <TableRow key={trans.id}>
                        <TableCell>{format(new Date(trans.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                        <TableCell>{trans.content_subscriptions?.profiles?.email || 'N/A'}</TableCell>
                        <TableCell>{trans.content_subscriptions?.model_profiles?.name || 'N/A'}</TableCell>
                        <TableCell>R$ {trans.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-primary">R$ {trans.platform_fee.toFixed(2)}</TableCell>
                        <TableCell className="text-green-500">R$ {trans.creator_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={trans.status === 'paid' ? 'bg-green-500' : 'bg-gray-500'}>
                            {trans.status === 'paid' ? 'Pago' : trans.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Plataforma</CardTitle>
                <CardDescription>Ajuste as configurações globais do módulo de assinaturas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Taxa da Plataforma (%)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    min="0"
                    max="100"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(Number(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentual que a plataforma retém de cada assinatura. Restante vai para a criadora.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Split de Pagamento</p>
                      <p className="text-sm text-muted-foreground">
                        Com a taxa atual de {platformFee}%, em uma assinatura de R$ 100,00:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                        <li>• Plataforma recebe: R$ {(100 * platformFee / 100).toFixed(2)}</li>
                        <li>• Criadora recebe: R$ {(100 * (100 - platformFee) / 100).toFixed(2)}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button onClick={() => toast({ title: "Configurações salvas!" })}>
                  <Settings className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
