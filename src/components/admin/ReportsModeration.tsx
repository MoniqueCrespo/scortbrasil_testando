import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Report {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  reporter_id: string | null;
  reported_profile_id: string;
  admin_notes: string | null;
  model_profiles: {
    name: string;
    city: string;
    state: string;
    category: string;
    photo_url: string | null;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  inappropriate_content: "Conteúdo Inapropriado",
  fake_profile: "Perfil Falso",
  spam: "Spam",
  harassment: "Assédio",
  underage: "Menor de Idade",
  other: "Outro",
};

export const ReportsModeration = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [statusFilter, reports]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          model_profiles (
            name, city, state, category, photo_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
      toast.error("Erro ao carregar denúncias");
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    if (statusFilter === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === statusFilter));
    }
  };

  const handleResolve = async (reportId: string, action: "resolved" | "dismissed") => {
    setIsProcessing(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("reports")
        .update({
          status: action,
          reviewed_by: authData.user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq("id", reportId);

      if (error) throw error;

      // Se resolvido, desativar o perfil denunciado
      if (action === "resolved" && selectedReport) {
        await supabase
          .from("model_profiles")
          .update({ is_active: false })
          .eq("id", selectedReport.reported_profile_id);
      }

      toast.success(
        action === "resolved"
          ? "Denúncia resolvida e perfil desativado"
          : "Denúncia arquivada"
      );
      
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      console.error("Erro ao processar denúncia:", error);
      toast.error("Erro ao processar denúncia");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <Badge variant="secondary">Pendente</Badge>,
      under_review: <Badge className="bg-blue-500">Em Análise</Badge>,
      resolved: <Badge variant="default">Resolvida</Badge>,
      dismissed: <Badge variant="outline">Arquivada</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const severity: Record<string, "destructive" | "default" | "secondary"> = {
      underage: "destructive",
      harassment: "destructive",
      inappropriate_content: "default",
      fake_profile: "default",
      spam: "secondary",
      other: "secondary",
    };
    return (
      <Badge variant={severity[category] || "secondary"}>
        {CATEGORY_LABELS[category] || category}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Central de Denúncias e Moderação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtro de status */}
        <div className="flex justify-between items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="under_review">Em Análise</SelectItem>
              <SelectItem value="resolved">Resolvidas</SelectItem>
              <SelectItem value="dismissed">Arquivadas</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {filteredReports.length} {filteredReports.length === 1 ? "denúncia" : "denúncias"}
          </div>
        </div>

        {/* Tabela de denúncias */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil Denunciado</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma denúncia encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.model_profiles.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.model_profiles.city} - {report.model_profiles.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(report.category)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.admin_notes || "");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal de detalhes da denúncia */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Denúncia</DialogTitle>
              <DialogDescription>
                Análise e ações de moderação
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Perfil Denunciado</p>
                    <p className="text-sm font-medium">{selectedReport.model_profiles.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedReport.model_profiles.city}, {selectedReport.model_profiles.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                    <div className="mt-1">{getCategoryBadge(selectedReport.category)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data da Denúncia</p>
                    <p className="text-sm">
                      {format(new Date(selectedReport.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status Atual</p>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Descrição da Denúncia
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Notas Administrativas
                  </p>
                  <Textarea
                    placeholder="Adicione observações sobre a análise desta denúncia..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              {selectedReport?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleResolve(selectedReport.id, "dismissed")}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Arquivar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleResolve(selectedReport.id, "resolved")}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolver e Desativar Perfil
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
