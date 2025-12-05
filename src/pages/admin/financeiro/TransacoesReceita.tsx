import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  Download, 
  Search,
  Zap,
  ShoppingCart,
  Star,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UnifiedTransaction {
  id: string;
  type: 'subscription' | 'credits' | 'boost' | 'service';
  user_email: string;
  user_name: string;
  amount: number;
  payment_id: string | null;
  payment_method: string;
  status: string;
  created_at: string;
  description: string;
}

const ITEMS_PER_PAGE = 20;
const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const TransacoesReceita = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("30days");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, typeFilter, periodFilter, transactions]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const allTransactions: UnifiedTransaction[] = [];

      // 1. Assinaturas Premium
      const { data: subscriptions } = await supabase
        .from("premium_subscriptions")
        .select(`
          *,
          premium_plans(name, price),
          profiles(email, full_name)
        `)
        .eq("status", "active");

      if (subscriptions) {
        subscriptions.forEach((sub: any) => {
          allTransactions.push({
            id: sub.id,
            type: 'subscription',
            user_email: sub.profiles?.email || '',
            user_name: sub.profiles?.full_name || '',
            amount: sub.premium_plans?.price || 0,
            payment_id: sub.payment_id,
            payment_method: sub.payment_method || 'mercadopago',
            status: sub.status,
            created_at: sub.created_at,
            description: `Assinatura ${sub.premium_plans?.name || 'Premium'}`
          });
        });
      }

      // 2. Compras de Créditos
      const { data: creditPurchases } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("transaction_type", "purchase")
        .not("payment_id", "is", null);

      if (creditPurchases) {
        for (const credit of creditPurchases) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", credit.user_id)
            .single();

          allTransactions.push({
            id: credit.id,
            type: 'credits',
            user_email: profile?.email || '',
            user_name: profile?.full_name || '',
            amount: Math.abs(credit.amount) * 0.1, // Estimativa: 1 crédito = R$ 0.10
            payment_id: credit.payment_id,
            payment_method: 'mercadopago',
            status: 'completed',
            created_at: credit.created_at,
            description: `${Math.abs(credit.amount)} créditos`
          });
        }
      }

      // 3. Boosts Ativos
      const { data: boosts } = await supabase
        .from("active_boosts")
        .select(`
          *,
          boost_packages(name, price),
          profiles(email, full_name)
        `)
        .not("payment_id", "is", null);

      if (boosts) {
        boosts.forEach((boost: any) => {
          allTransactions.push({
            id: boost.id,
            type: 'boost',
            user_email: boost.profiles?.email || '',
            user_name: boost.profiles?.full_name || '',
            amount: boost.boost_packages?.price || 0,
            payment_id: boost.payment_id,
            payment_method: boost.payment_method || 'credits',
            status: boost.status,
            created_at: boost.created_at,
            description: `Boost ${boost.boost_packages?.name || ''}`
          });
        });
      }

      // 4. Serviços Premium
      const { data: services } = await supabase
        .from("active_premium_services")
        .select(`
          *,
          premium_services(name, credit_cost),
          profiles(email, full_name)
        `);

      if (services) {
        services.forEach((service: any) => {
          allTransactions.push({
            id: service.id,
            type: 'service',
            user_email: service.profiles?.email || '',
            user_name: service.profiles?.full_name || '',
            amount: (service.premium_services?.credit_cost || 0) * 0.1,
            payment_id: null,
            payment_method: 'credits',
            status: service.status,
            created_at: service.created_at,
            description: `Serviço ${service.premium_services?.name || 'Premium'}`
          });
        });
      }

      setTransactions(allTransactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filtro por período
    const now = new Date();
    let startDate: Date;
    
    switch (periodFilter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1));
        const endDate = endOfMonth(subMonths(now, 1));
        filtered = filtered.filter(t => {
          const date = new Date(t.created_at);
          return date >= startDate && date <= endDate;
        });
        break;
      default:
        startDate = subDays(now, 30);
    }

    if (periodFilter !== 'lastMonth') {
      filtered = filtered.filter(t => new Date(t.created_at) >= startDate);
    }

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <CreditCard className="h-4 w-4" />;
      case 'credits': return <ShoppingCart className="h-4 w-4" />;
      case 'boost': return <Zap className="h-4 w-4" />;
      case 'service': return <Star className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      subscription: { variant: "default", label: "Assinatura" },
      credits: { variant: "secondary", label: "Créditos" },
      boost: { variant: "outline", label: "Boost" },
      service: { variant: "outline", label: "Serviço" },
    };

    const { variant, label } = config[type] || { variant: "secondary", label: type };
    return (
      <Badge variant={variant} className="gap-1">
        {getTypeIcon(type)}
        {label}
      </Badge>
    );
  };

  // Cálculos de métricas
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Comparação com período anterior
  const getPreviousPeriodData = () => {
    let previousStartDate: Date;
    let previousEndDate: Date;
    const now = new Date();
    
    switch (periodFilter) {
      case '7days':
        previousEndDate = subDays(now, 7);
        previousStartDate = subDays(previousEndDate, 7);
        break;
      case '30days':
        previousEndDate = subDays(now, 30);
        previousStartDate = subDays(previousEndDate, 30);
        break;
      case 'thisMonth':
        previousStartDate = startOfMonth(subMonths(now, 1));
        previousEndDate = endOfMonth(subMonths(now, 1));
        break;
      default:
        previousEndDate = subDays(now, 30);
        previousStartDate = subDays(previousEndDate, 30);
    }

    return transactions.filter(t => {
      const date = new Date(t.created_at);
      return date >= previousStartDate && date <= previousEndDate;
    });
  };

  const previousPeriodTransactions = getPreviousPeriodData();
  const previousRevenue = previousPeriodTransactions.reduce((sum, t) => sum + t.amount, 0);
  const revenueGrowth = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;

  const previousTransactionCount = previousPeriodTransactions.length;
  const transactionGrowth = previousTransactionCount > 0
    ? ((filteredTransactions.length - previousTransactionCount) / previousTransactionCount) * 100
    : 0;

  const avgTicket = filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0;
  const previousAvgTicket = previousTransactionCount > 0 ? previousRevenue / previousTransactionCount : 0;
  const ticketGrowth = previousAvgTicket > 0
    ? ((avgTicket - previousAvgTicket) / previousAvgTicket) * 100
    : 0;

  // MRR (Monthly Recurring Revenue)
  const mrr = transactions
    .filter(t => t.type === 'subscription' && t.status === 'active')
    .reduce((sum, t) => sum + t.amount, 0);

  // Receita Avulsa
  const oneTimeRevenue = filteredTransactions
    .filter(t => t.type !== 'subscription')
    .reduce((sum, t) => sum + t.amount, 0);

  // Dados para gráficos
  const getDailyRevenueData = () => {
    const days = 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.created_at);
        return tDate.toDateString() === date.toDateString();
      });
      data.push({
        date: format(date, 'dd/MM'),
        receita: dayTransactions.reduce((sum, t) => sum + t.amount, 0)
      });
    }
    return data;
  };

  const getRevenueByType = () => {
    const types = ['subscription', 'credits', 'boost', 'service'];
    return types.map(type => {
      const amount = filteredTransactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const labels: Record<string, string> = {
        subscription: 'Assinaturas',
        credits: 'Créditos',
        boost: 'Boosts',
        service: 'Serviços'
      };

      return {
        name: labels[type],
        value: amount
      };
    }).filter(item => item.value > 0);
  };

  const getMonthlyComparison = () => {
    const currentMonth = filteredTransactions
      .filter(t => new Date(t.created_at).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonth = transactions
      .filter(t => {
        const date = new Date(t.created_at);
        const lastMonthDate = subMonths(new Date(), 1);
        return date.getMonth() === lastMonthDate.getMonth() && 
               date.getFullYear() === lastMonthDate.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { month: 'Mês Anterior', receita: lastMonth },
      { month: 'Mês Atual', receita: currentMonth }
    ];
  };

  const exportToCSV = () => {
    const headers = ["Data", "Tipo", "Cliente", "Email", "Descrição", "Valor", "Método Pagamento", "ID Pagamento"];
    const rows = filteredTransactions.map((t) => [
      format(new Date(t.created_at), "dd/MM/yyyy HH:mm"),
      t.type === 'subscription' ? 'Assinatura' : t.type === 'credits' ? 'Créditos' : t.type === 'boost' ? 'Boost' : 'Serviço',
      t.user_name || "—",
      t.user_email || "—",
      t.description || "—",
      `R$ ${t.amount.toFixed(2)}`,
      t.payment_method,
      t.payment_id || "—",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    const filterLabel = typeFilter !== 'all' ? `_${typeFilter}` : '';
    const periodLabel = `_${periodFilter}`;
    a.download = `transacoes${filterLabel}${periodLabel}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    
    a.click();
    toast.success("Relatório exportado com sucesso");
  };

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <AdminLayout title="Transações e Receita">
        <div className="p-6">Carregando transações...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Transações e Receita">
      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações e Receita</h2>
          <p className="text-muted-foreground">Análise completa de todas as transações financeiras</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, email, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês anterior</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="subscription">Assinaturas</SelectItem>
                <SelectItem value="credits">Créditos</SelectItem>
                <SelectItem value="boost">Boosts</SelectItem>
                <SelectItem value="service">Serviços</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Mais recentes</SelectItem>
                <SelectItem value="date-asc">Mais antigas</SelectItem>
                <SelectItem value="amount-desc">Maior valor</SelectItem>
                <SelectItem value="amount-asc">Menor valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <div className={`flex items-center text-xs ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(revenueGrowth).toFixed(1)}% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {mrr.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Receita recorrente mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Avulsa</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {oneTimeRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Créditos, boosts e serviços</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <div className={`flex items-center text-xs ${transactionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transactionGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(transactionGrowth).toFixed(1)}% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {avgTicket.toFixed(2)}</div>
            <div className={`flex items-center text-xs ${ticketGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ticketGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(ticketGrowth).toFixed(1)}% vs período anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="temporal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="temporal">Receita Temporal</TabsTrigger>
          <TabsTrigger value="tipo">Por Tipo</TabsTrigger>
          <TabsTrigger value="comparacao">Comparação Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita dos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getDailyRevenueData()}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.date}</p>
                            <p className="text-sm text-primary">R$ {(payload[0].value as number).toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorReceita)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Tipo de Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getRevenueByType()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {getRevenueByType().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].name}</p>
                            <p className="text-sm text-primary">R$ {(payload[0].value as number).toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyComparison()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.month}</p>
                            <p className="text-sm text-primary">R$ {(payload[0].value as number).toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de {filteredTransactions.length} transações
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{transaction.user_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{transaction.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {transaction.payment_method === 'mercadopago' ? 'Mercado Pago' : 'Créditos'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
};

export default TransacoesReceita;
