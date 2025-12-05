import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Users, DollarSign } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalyticsData {
  newModelsData: Array<{ date: string; count: number }>;
  revenueData: Array<{ month: string; revenue: number }>;
  categoryData: Array<{ name: string; value: number }>;
  stateData: Array<{ state: string; count: number }>;
}

const COLORS = ["#E91E63", "#9C27B0", "#3F51B5", "#00BCD4", "#4CAF50"];

export const AnalyticsCharts = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    newModelsData: [],
    revenueData: [],
    categoryData: [],
    stateData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"7days" | "30days" | "90days">("30days");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const days = period === "7days" ? 7 : period === "30days" ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days));

      // Novos modelos por dia
      const { data: modelsData } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("role", "model")
        .gte("created_at", startDate.toISOString());

      const modelsByDay: Record<string, number> = {};
      modelsData?.forEach((model) => {
        const date = format(new Date(model.created_at), "dd/MM", { locale: ptBR });
        modelsByDay[date] = (modelsByDay[date] || 0) + 1;
      });

      const newModelsData = Object.entries(modelsByDay).map(([date, count]) => ({
        date,
        count,
      }));

      // Receita por mês (de transações de créditos)
      const { data: transactions } = await supabase
        .from("credit_transactions")
        .select("created_at, amount, transaction_type")
        .eq("transaction_type", "purchase")
        .gte("created_at", startDate.toISOString());

      const revenueByMonth: Record<string, number> = {};
      transactions?.forEach((tx) => {
        const month = format(new Date(tx.created_at), "MMM", { locale: ptBR });
        revenueByMonth[month] =
          (revenueByMonth[month] || 0) + Math.abs(tx.amount || 0);
      });

      const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month,
        revenue,
      }));

      // Perfis por categoria
      const { data: profiles } = await supabase
        .from("model_profiles")
        .select("category")
        .eq("is_active", true);

      const categoryCount: Record<string, number> = {};
      profiles?.forEach((profile) => {
        categoryCount[profile.category] = (categoryCount[profile.category] || 0) + 1;
      });

      const categoryLabels: Record<string, string> = {
        mulheres: "Mulheres",
        homens: "Homens",
        trans: "Trans",
        casais: "Casais",
        massagistas: "Massagistas",
      };

      const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
        name: categoryLabels[name] || name,
        value,
      }));

      // Perfis por estado
      const { data: stateProfiles } = await supabase
        .from("model_profiles")
        .select("state")
        .eq("is_active", true);

      const stateCount: Record<string, number> = {};
      stateProfiles?.forEach((profile) => {
        stateCount[profile.state] = (stateCount[profile.state] || 0) + 1;
      });

      const stateData = Object.entries(stateCount)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setAnalytics({
        newModelsData,
        revenueData,
        categoryData,
        stateData,
      });
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Analytics e Relatórios</h3>
        <div className="flex gap-2">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList>
              <TabsTrigger value="7days">7 dias</TabsTrigger>
              <TabsTrigger value="30days">30 dias</TabsTrigger>
              <TabsTrigger value="90days">90 dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando dados...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Novos Cadastros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Novos Cadastros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.newModelsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#E91E63"
                    strokeWidth={2}
                    name="Novos Anunciantes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Receita por Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4CAF50" name="Receita (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Perfis por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Distribuição por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Estados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Top 10 Estados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.stateData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="state" type="category" width={40} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#9C27B0" name="Perfis Ativos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
