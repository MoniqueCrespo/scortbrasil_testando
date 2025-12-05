import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle, XCircle, Upload } from "lucide-react";

interface Affiliate {
  id: string;
  affiliate_code: string;
  tier_level: string;
  total_earned: number;
  pending_payout: number;
  status: string;
  created_at: string;
}

interface Payout {
  id: string;
  affiliate_id: string;
  amount: number;
  payout_method: string;
  pix_key: string;
  status: string;
  created_at: string;
  affiliates: {
    affiliate_code: string;
  };
}

export default function GestaoAfiliados() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch affiliates
      const { data: affiliatesData } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      setAffiliates(affiliatesData || []);

      // Fetch pending payouts
      const { data: payoutsData } = await supabase
        .from("affiliate_payouts")
        .select(
          `
          *,
          affiliates (
            affiliate_code
          )
        `
        )
        .order("created_at", { ascending: false });

      setPayouts(payoutsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAffiliateStatus = async (affiliateId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({ status })
        .eq("id", affiliateId);

      if (error) throw error;

      toast.success("Status atualizado com sucesso");
      fetchData();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleProcessPayout = async (payoutId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };

      if (newStatus === "completed") {
        updateData.processed_at = new Date().toISOString();
        updateData.proof_url = proofUrl;

        // Update affiliate balance
        if (selectedPayout) {
          const { data: affiliate } = await supabase
            .from("affiliates")
            .select("pending_payout, total_paid_out")
            .eq("id", selectedPayout.affiliate_id)
            .single();

          if (affiliate) {
            await supabase
              .from("affiliates")
              .update({
                pending_payout: affiliate.pending_payout - selectedPayout.amount,
                total_paid_out: affiliate.total_paid_out + selectedPayout.amount,
              })
              .eq("id", selectedPayout.affiliate_id);
          }
        }
      }

      const { error } = await supabase
        .from("affiliate_payouts")
        .update(updateData)
        .eq("id", payoutId);

      if (error) throw error;

      toast.success(
        newStatus === "completed" ? "Saque aprovado e processado" : "Saque rejeitado"
      );
      setSelectedPayout(null);
      setProofUrl("");
      fetchData();
    } catch (error: any) {
      console.error("Error processing payout:", error);
      toast.error("Erro ao processar saque");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
      pending: "outline",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Afiliados</h1>
          <p className="text-muted-foreground">
            Gerencie afiliados, comissões e pagamentos
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Afiliados Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {affiliates.filter((a) => a.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saques Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payouts.filter((p) => p.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R${" "}
                {payouts
                  .filter((p) => p.status === "pending")
                  .reduce((acc, p) => acc + p.amount, 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="affiliates">
          <TabsList>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            <TabsTrigger value="payouts">
              Saques Pendentes
              {payouts.filter((p) => p.status === "pending").length > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {payouts.filter((p) => p.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="affiliates">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Afiliados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Total Ganho</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell className="font-mono">
                          {affiliate.affiliate_code}
                        </TableCell>
                        <TableCell className="capitalize">{affiliate.tier_level}</TableCell>
                        <TableCell>R$ {affiliate.total_earned.toFixed(2)}</TableCell>
                        <TableCell>R$ {affiliate.pending_payout.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                        <TableCell>
                          <Select
                            value={affiliate.status}
                            onValueChange={(value) =>
                              handleUpdateAffiliateStatus(affiliate.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                              <SelectItem value="suspended">Suspenso</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Saque</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Afiliado</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono">
                          {payout.affiliates.affiliate_code}
                        </TableCell>
                        <TableCell className="font-semibold">
                          R$ {payout.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payout.pix_key}
                        </TableCell>
                        <TableCell>
                          {new Date(payout.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.status === "pending" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedPayout(payout)}
                                >
                                  Processar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Processar Saque</DialogTitle>
                                  <DialogDescription>
                                    Valor: R$ {payout.amount.toFixed(2)} | PIX:{" "}
                                    {payout.pix_key}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>URL do Comprovante (opcional)</Label>
                                    <Input
                                      placeholder="https://..."
                                      value={proofUrl}
                                      onChange={(e) => setProofUrl(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      className="flex-1"
                                      onClick={() =>
                                        handleProcessPayout(payout.id, "completed")
                                      }
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Aprovar e Pagar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      className="flex-1"
                                      onClick={() =>
                                        handleProcessPayout(payout.id, "failed")
                                      }
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Rejeitar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
