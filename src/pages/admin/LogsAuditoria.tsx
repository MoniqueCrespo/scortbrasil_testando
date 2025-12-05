import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
  ip_address: string | null;
  details: any;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

const LogsAuditoria = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [actionFilter, searchTerm, logs]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_logs")
        .select(`
          *,
          profiles (email, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      approve: "default",
      reject: "destructive",
      suspend: "destructive",
      activate: "default",
      update: "secondary",
      delete: "destructive",
      create: "default",
    };
    return <Badge variant={variants[action] || "secondary"}>{action}</Badge>;
  };

  const exportLogs = () => {
    const csvContent = [
      ["Data/Hora", "Admin", "Ação", "Tipo de Recurso", "IP"].join(","),
      ...filteredLogs.map((log) =>
        [
          format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
          log.profiles.email,
          log.action,
          log.resource_type,
          log.ip_address || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-auditoria-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Logs exportados com sucesso!");
  };

  return (
    <AdminLayout title="Logs de Auditoria">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
        <p className="text-muted-foreground mt-2">
          Histórico completo de ações administrativas
        </p>
      </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Registro de Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por email, ação ou recurso..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filtrar por ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as ações</SelectItem>
                      <SelectItem value="approve">Aprovar</SelectItem>
                      <SelectItem value="reject">Rejeitar</SelectItem>
                      <SelectItem value="suspend">Suspender</SelectItem>
                      <SelectItem value="activate">Ativar</SelectItem>
                      <SelectItem value="update">Atualizar</SelectItem>
                      <SelectItem value="delete">Deletar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={exportLogs} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Administrador</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Tipo de Recurso</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Carregando logs...
                          </TableCell>
                        </TableRow>
                      ) : filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum log encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {log.profiles.full_name || "Admin"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {log.profiles.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{getActionBadge(log.action)}</TableCell>
                            <TableCell className="capitalize">{log.resource_type}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {log.ip_address || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default LogsAuditoria;
