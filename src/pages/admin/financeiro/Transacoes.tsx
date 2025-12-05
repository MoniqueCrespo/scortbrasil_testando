import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  payment_id: string | null;
  status: string;
  created_at: string;
  premium_plans: {
    name: string;
    price: number;
  };
  profiles: {
    email: string;
    full_name: string | null;
  };
}

const Transacoes = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("premium_subscriptions")
        .select(`
          *,
          premium_plans (name, price),
          profiles:user_id (email, full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      active: <Badge variant="default">Ativa</Badge>,
      pending: <Badge variant="secondary">Pendente</Badge>,
      expired: <Badge variant="outline">Expirada</Badge>,
      cancelled: <Badge variant="destructive">Cancelada</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Data", "Cliente", "Email", "Plano", "Valor", "Status", "ID Pagamento"].join(","),
      ...filteredTransactions.map((t) =>
        [
          format(new Date(t.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
          t.profiles.full_name || "N/A",
          t.profiles.email,
          t.premium_plans.name,
          `R$ ${t.premium_plans.price.toFixed(2)}`,
          t.status,
          t.payment_id || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    toast.success("Transações exportadas com sucesso!");
  };

  const totalRevenue = filteredTransactions.reduce(
    (acc, t) => acc + (t.premium_plans?.price || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Histórico de Transações</h2>
        <p className="text-muted-foreground">Visualize e gerencie todas as transações da plataforma</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Média por Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {filteredTransactions.length > 0 ? (totalRevenue / filteredTransactions.length).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Transações</CardTitle>
              <CardDescription>Lista completa de todas as transações</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
          <div className="flex gap-4 pt-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ID Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando transações...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), "HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {transaction.profiles.full_name || "Cliente"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.profiles.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.premium_plans.name}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {transaction.premium_plans.price.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {transaction.payment_id || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transacoes;
