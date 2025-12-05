import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TicketPlus, Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Report {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  reporter_id: string | null;
  reported_profile_id: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

const IntegracaoDenuncias = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*, profiles:reporter_id(email, full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data as any || []);
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
      toast.error("Erro ao carregar denúncias");
    } finally {
      setIsLoading(false);
    }
  };

  const createTicketFromReport = async (report: Report) => {
    try {
      // Gerar número do ticket
      const { data: ticketNumberData } = await supabase.rpc("generate_ticket_number");
      
      // Criar ticket
      const { error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          ticket_number: ticketNumberData,
          user_id: report.reporter_id,
          subject: `Denúncia: ${report.category}`,
          description: report.description,
          category: "Denúncia",
          priority: "high",
          status: "open",
          report_id: report.id,
        });

      if (ticketError) throw ticketError;

      toast.success("Ticket criado a partir da denúncia!");
      fetchReports();
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      toast.error("Erro ao criar ticket");
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "Conteúdo Impróprio": "bg-red-500/10 text-red-500",
      "Perfil Falso": "bg-orange-500/10 text-orange-500",
      "Spam": "bg-amber-500/10 text-amber-500",
      "Assédio": "bg-purple-500/10 text-purple-500",
      "Outro": "bg-blue-500/10 text-blue-500",
    };
    return <Badge className={colors[category] || ""}>{category}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integração com Denúncias</h2>
        <p className="text-muted-foreground">
          Converta denúncias pendentes em tickets de suporte
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Denúncias Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aguardando Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter((r) => !r.reporter_id).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Com Denunciante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter((r) => r.reporter_id).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Denúncias Pendentes</CardTitle>
          <CardDescription>
            Denúncias que ainda não foram convertidas em tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Denunciante</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando denúncias...
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma denúncia pendente
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {format(new Date(report.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getCategoryBadge(report.category)}</TableCell>
                      <TableCell className="max-w-md truncate">{report.description}</TableCell>
                      <TableCell>
                        {report.profiles ? (
                          <div>
                            <p className="font-medium">{report.profiles.full_name || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{report.profiles.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Anônimo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Ver Denúncia"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => createTicketFromReport(report)}
                            title="Criar Ticket"
                          >
                            <TicketPlus className="h-4 w-4 mr-2" />
                            Criar Ticket
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. Denúncias recebidas aparecem nesta lista quando estão com status "pendente"
          </p>
          <p>
            2. Clique em "Criar Ticket" para converter a denúncia em um ticket de suporte
          </p>
          <p>
            3. O ticket será criado com prioridade ALTA e categoria "Denúncia"
          </p>
          <p>
            4. A denúncia original ficará vinculada ao ticket para rastreabilidade
          </p>
          <p>
            5. Após criar o ticket, você pode gerenciá-lo na aba "Tickets"
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegracaoDenuncias;
