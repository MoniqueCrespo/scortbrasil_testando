import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, Eye, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AdvancedFilters, FilterValues } from "@/components/admin/AdvancedFilters";

type VerificationRequest = Tables<"verification_requests">;

interface VerificationWithProfile extends VerificationRequest {
  profile?: {
    name: string;
    photo_url: string | null;
    city: string;
    state: string;
  };
}

const AdminVerifications = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [requests, setRequests] = useState<VerificationWithProfile[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VerificationWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationWithProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "ban" | "delete">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      return;
    }
    fetchVerificationRequests();
  }, [userRole, navigate]);

  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  const applyFilters = () => {
    let filtered = [...requests];

    if (filters.search) {
      filtered = filtered.filter(
        (r) =>
          r.profile?.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          r.id.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) <= new Date(filters.dateTo!)
      );
    }

    setFilteredRequests(filtered);
  };

  const fetchVerificationRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profile:model_profiles(name, photo_url, city, state)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as any || []);
    } catch (error: any) {
      toast.error("Erro ao carregar solicitações");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (request: VerificationWithProfile, type: "approve" | "reject" | "ban" | "delete") => {
    setSelectedRequest(request);
    setActionType(type);
    setRejectionReason("");
    setBanReason("");
    setIsDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedRequest) return;
    
    if (actionType === "reject" && !rejectionReason.trim()) {
      toast.error("Por favor, forneça um motivo para a rejeição");
      return;
    }

    if (actionType === "ban" && !banReason.trim()) {
      toast.error("Por favor, forneça um motivo para o banimento");
      return;
    }

    setIsProcessing(true);
    try {
      // Ação de banir anúncio
      if (actionType === "ban") {
        const { error: profileError } = await supabase
          .from('model_profiles')
          .update({ 
            status: 'suspended',
            is_active: false 
          })
          .eq('id', selectedRequest.profile_id);

        if (profileError) throw profileError;

        toast.success("Anúncio banido com sucesso!");
        setIsDialogOpen(false);
        fetchVerificationRequests();
        return;
      }

      // Ação de excluir anúncio
      if (actionType === "delete") {
        // Excluir a solicitação de verificação primeiro
        await supabase
          .from('verification_requests')
          .delete()
          .eq('id', selectedRequest.id);

        // Excluir o perfil
        const { error: deleteError } = await supabase
          .from('model_profiles')
          .delete()
          .eq('id', selectedRequest.profile_id);

        if (deleteError) throw deleteError;

        toast.success("Anúncio excluído permanentemente!");
        setIsDialogOpen(false);
        fetchVerificationRequests();
        return;
      }

      const newStatus = actionType === "approve" ? "approved" : "rejected";
      
      // Atualizar solicitação de verificação
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: newStatus,
          rejection_reason: actionType === "reject" ? rejectionReason : null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Se aprovado, atualizar o perfil para verificado
      if (actionType === "approve") {
        const { error: profileError } = await supabase
          .from('model_profiles')
          .update({ verified: true })
          .eq('id', selectedRequest.profile_id);

        if (profileError) throw profileError;
      }

      toast.success(
        actionType === "approve" 
          ? "Verificação aprovada com sucesso!" 
          : "Verificação rejeitada"
      );
      
      // Enviar notificação por email
      try {
        const { data: profileData } = await supabase
          .from('model_profiles')
          .select('user_id')
          .eq('id', selectedRequest.profile_id)
          .single();

        if (profileData?.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(profileData.user_id);
          
          if (userData?.user?.email) {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                type: actionType === "approve" ? "verification_approved" : "verification_rejected",
                to: userData.user.email,
                data: {
                  model_name: selectedRequest.profile?.name,
                  city: selectedRequest.profile?.city,
                  state: selectedRequest.profile?.state,
                  rejection_reason: actionType === "reject" ? rejectionReason : null,
                }
              }
            });
          }
        }
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não interrompe o fluxo se o email falhar
      }
      
      setIsDialogOpen(false);
      fetchVerificationRequests();
    } catch (error: any) {
      toast.error("Erro ao processar ação");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return null;
    }
  };

  const pendingRequests = filteredRequests.filter(r => r.status === "pending");
  const approvedRequests = filteredRequests.filter(r => r.status === "approved");
  const rejectedRequests = filteredRequests.filter(r => r.status === "rejected");

  return (
    <AdminLayout title="Verificações">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Início</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Painel Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Verificações</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
              Painel de Verificações
            </h1>
            <p className="text-muted-foreground">
              Analise e aprove solicitações de verificação de perfis
            </p>
          </div>

          <AdvancedFilters filterType="verifications" onFilterChange={setFilters} />

          {isLoading ? (
            <div className="text-center py-12">Carregando solicitações...</div>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList className="mb-6">
                <TabsTrigger value="pending">
                  Pendentes ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Aprovados ({approvedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejeitados ({rejectedRequests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingRequests.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Nenhuma solicitação pendente
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              {request.profile?.photo_url ? (
                                <img 
                                  src={request.profile.photo_url} 
                                  alt={request.profile.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  Sem foto
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{request.profile?.name}</CardTitle>
                              <CardDescription className="truncate">
                                {request.profile?.city}, {request.profile?.state}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-sm">
                            <p className="text-muted-foreground mb-1">Tipo de documento:</p>
                            <p className="font-medium">{request.document_type}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground mb-1">Data da solicitação:</p>
                            <p className="font-medium">
                              {new Date(request.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open(request.document_url, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Documento
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => openDialog(request, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => openDialog(request, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
                              onClick={() => openDialog(request, "ban")}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Banir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                              onClick={() => openDialog(request, "delete")}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved">
                {approvedRequests.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Nenhuma verificação aprovada ainda
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {approvedRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                                {request.profile?.photo_url && (
                                  <img 
                                    src={request.profile.photo_url} 
                                    alt={request.profile.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">{request.profile?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {request.profile?.city}, {request.profile?.state}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(request.status)}
                              <p className="text-xs text-muted-foreground mt-1">
                                {request.reviewed_at && new Date(request.reviewed_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected">
                {rejectedRequests.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Nenhuma verificação rejeitada
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {rejectedRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                                {request.profile?.photo_url && (
                                  <img 
                                    src={request.profile.photo_url} 
                                    alt={request.profile.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">{request.profile?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {request.profile?.city}, {request.profile?.state}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(request.status)}
                              <p className="text-xs text-muted-foreground mt-1">
                                {request.reviewed_at && new Date(request.reviewed_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          {request.rejection_reason && (
                            <div className="mt-4 p-4 bg-red-50 rounded-lg">
                              <p className="text-sm font-medium text-red-900 mb-1">Motivo da rejeição:</p>
                              <p className="text-sm text-red-700">{request.rejection_reason}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

        {/* Dialog de confirmação */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Aprovar Verificação"}
              {actionType === "reject" && "Rejeitar Verificação"}
              {actionType === "ban" && "Banir Anúncio"}
              {actionType === "delete" && "Excluir Anúncio"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && `Tem certeza que deseja aprovar a verificação de ${selectedRequest?.profile?.name}? O perfil receberá o selo verificado.`}
              {actionType === "reject" && `Você está rejeitando a verificação de ${selectedRequest?.profile?.name}. Forneça um motivo:`}
              {actionType === "ban" && `Tem certeza que deseja banir o anúncio de ${selectedRequest?.profile?.name}? O perfil será suspenso e desativado.`}
              {actionType === "delete" && `⚠️ ATENÇÃO: Esta ação é PERMANENTE e não pode ser desfeita! O anúncio de ${selectedRequest?.profile?.name} e todos os dados relacionados serão excluídos do sistema.`}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da rejeição *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Documento ilegível, informações não conferem, etc."
                rows={4}
              />
            </div>
          )}

          {actionType === "ban" && (
            <div className="space-y-2">
              <Label htmlFor="banReason">Motivo do banimento *</Label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Ex: Violação dos termos de uso, conteúdo inapropriado, etc."
                rows={4}
              />
            </div>
          )}

          {actionType === "delete" && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">
                Esta ação irá excluir permanentemente:
              </p>
              <ul className="text-sm text-destructive list-disc list-inside space-y-1">
                <li>Perfil do anunciante</li>
                <li>Todas as fotos e arquivos</li>
                <li>Histórico de verificações</li>
                <li>Dados relacionados ao perfil</li>
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAction}
              disabled={isProcessing}
              className={
                actionType === "approve" ? "bg-green-600 hover:bg-green-700" : 
                actionType === "ban" ? "bg-orange-600 hover:bg-orange-700" : ""
              }
              variant={actionType === "delete" || actionType === "reject" ? "destructive" : "default"}
            >
              {isProcessing ? "Processando..." : 
                actionType === "approve" ? "Aprovar" : 
                actionType === "reject" ? "Rejeitar" :
                actionType === "ban" ? "Banir" : "Excluir Permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminVerifications;
