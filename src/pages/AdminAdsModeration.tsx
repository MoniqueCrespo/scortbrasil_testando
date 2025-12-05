import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Eye, Calendar, MapPin, DollarSign, Ban, Trash2, Image as ImageIcon, Clock, TrendingUp } from "lucide-react";
import { AdvancedFilters, FilterValues } from "@/components/admin/AdvancedFilters";

interface Profile {
  id: string;
  name: string;
  age: number;
  category: string;
  state: string;
  city: string;
  photo_url: string;
  photos: string[];
  description: string;
  price: number;
  pricing: any;
  services: string[];
  created_at: string;
  moderation_status: string;
  rejection_reason?: string;
  user_id: string;
}

const AdminAdsModeration = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "ban" | "delete" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [filters, setFilters] = useState<FilterValues>({});
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, approvedToday: 0 });
  const [previewPhotos, setPreviewPhotos] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (userRole !== "admin") {
      navigate("/");
      toast.error("Acesso negado");
      return;
    }
    fetchProfiles();
    fetchStats();
  }, [user, userRole, navigate, activeTab]);

  useEffect(() => {
    applyFilters();
  }, [filters, profiles]);

  const applyFilters = () => {
    let filtered = [...profiles];

    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.id.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters.state && filters.state !== "all") {
      filtered = filtered.filter((p) => p.state === filters.state);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (p) => new Date(p.created_at) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (p) => new Date(p.created_at) <= new Date(filters.dateTo!)
      );
    }

    setFilteredProfiles(filtered);
  };

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("model_profiles")
        .select("*")
        .eq("moderation_status", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Erro ao carregar anúncios");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [pendingRes, approvedRes, rejectedRes, approvedTodayRes] = await Promise.all([
        supabase.from("model_profiles").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
        supabase.from("model_profiles").select("id", { count: "exact", head: true }).eq("moderation_status", "approved"),
        supabase.from("model_profiles").select("id", { count: "exact", head: true }).eq("moderation_status", "rejected"),
        supabase.from("model_profiles").select("id", { count: "exact", head: true }).eq("moderation_status", "approved").gte("moderated_at", today.toISOString()),
      ]);

      setStats({
        pending: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        rejected: rejectedRes.count || 0,
        approvedToday: approvedTodayRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const openModal = (profile: Profile, action: "approve" | "reject" | "ban" | "delete") => {
    setSelectedProfile(profile);
    setActionType(action);
    setRejectionReason("");
    setBanReason("");
    setModalOpen(true);
  };

  const handleModeration = async () => {
    if (!selectedProfile || !actionType || !user) return;

    if (actionType === "reject" && !rejectionReason.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }

    if (actionType === "ban" && !banReason.trim()) {
      toast.error("Informe o motivo do banimento");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ação de banir
      if (actionType === "ban") {
        const { error } = await supabase
          .from("model_profiles")
          .update({
            status: "suspended",
            is_active: false,
            moderated_by: user.id,
            moderated_at: new Date().toISOString(),
          })
          .eq("id", selectedProfile.id);

        if (error) throw error;

        await supabase.from("admin_logs").insert({
          admin_id: user.id,
          action: "ban_profile",
          resource_type: "model_profile",
          resource_id: selectedProfile.id,
          details: {
            profile_name: selectedProfile.name,
            reason: banReason,
          },
        });

        toast.success("Anúncio banido com sucesso!");
        setModalOpen(false);
        fetchProfiles();
        fetchStats();
        return;
      }

      // Ação de excluir
      if (actionType === "delete") {
        const { error } = await supabase
          .from("model_profiles")
          .delete()
          .eq("id", selectedProfile.id);

        if (error) throw error;

        await supabase.from("admin_logs").insert({
          admin_id: user.id,
          action: "delete_profile",
          resource_type: "model_profile",
          resource_id: selectedProfile.id,
          details: {
            profile_name: selectedProfile.name,
          },
        });

        toast.success("Anúncio excluído permanentemente!");
        setModalOpen(false);
        fetchProfiles();
        fetchStats();
        return;
      }

      const updateData: any = {
        moderation_status: actionType === "approve" ? "approved" : "rejected",
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      };

      if (actionType === "reject") {
        updateData.rejection_reason = rejectionReason;
        updateData.is_active = false;
      } else {
        updateData.rejection_reason = null;
        updateData.is_active = true;
      }

      const { error: updateError } = await supabase
        .from("model_profiles")
        .update(updateData)
        .eq("id", selectedProfile.id);

      if (updateError) throw updateError;

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: actionType === "approve" ? "approve_profile" : "reject_profile",
        resource_type: "model_profile",
        resource_id: selectedProfile.id,
        details: {
          profile_name: selectedProfile.name,
          reason: actionType === "reject" ? rejectionReason : null,
        },
      });

      toast.success(
        actionType === "approve"
          ? "Anúncio aprovado com sucesso!"
          : "Anúncio rejeitado"
      );

      setModalOpen(false);
      fetchProfiles();
      fetchStats();
    } catch (error) {
      console.error("Error moderating profile:", error);
      toast.error("Erro ao processar moderação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Rejeitado</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Moderação de Anúncios">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Moderação de Anúncios">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
            Moderação de Anúncios
          </h1>
          <p className="text-muted-foreground">
            Gerencie e aprove os anúncios publicados na plataforma
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Aguardando moderação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedToday}</div>
              <p className="text-xs text-muted-foreground">Aprovados nas últimas 24h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aprovados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Anúncios ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">Total rejeitado</p>
            </CardContent>
          </Card>
        </div>

        <AdvancedFilters filterType="moderation" onFilterChange={setFilters} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes ({filteredProfiles.length})
            </TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredProfiles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum anúncio {activeTab === "pending" ? "pendente" : activeTab === "approved" ? "aprovado" : "rejeitado"}
                  </p>
                </CardContent>
              </Card>
            ) : (
                <div className="grid gap-4">
                {filteredProfiles.map((profile) => (
                  <Card key={profile.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Fotos */}
                        <div className="flex-shrink-0">
                          <img
                            src={profile.photo_url || profile.photos?.[0]}
                            alt={profile.name}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewPhotos(!previewPhotos)}
                          />
                          {profile.photos && profile.photos.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-1 text-xs px-1 h-6"
                              onClick={() => setPreviewPhotos(!previewPhotos)}
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {profile.photos.length}
                            </Button>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold truncate">{profile.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {profile.age} anos • {profile.category}
                              </p>
                            </div>
                            {getStatusBadge(profile.moderation_status)}
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{profile.city}, {profile.state}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R$ {profile.price}/h
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>

                          {/* Galeria de fotos expandida */}
                          {previewPhotos && profile.photos && profile.photos.length > 1 && (
                            <div className="grid grid-cols-5 gap-1">
                              {profile.photos.slice(0, 10).map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`${profile.name} - ${index + 1}`}
                                  className="w-full h-16 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}

                          {/* Serviços */}
                          {profile.services && profile.services.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {profile.services.slice(0, 5).map((service, index) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                                  {service}
                                </Badge>
                              ))}
                              {profile.services.length > 5 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  +{profile.services.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Preços */}
                          {profile.pricing && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {profile.pricing.hourly && (
                                <span className="text-muted-foreground">
                                  <strong>1h:</strong> R$ {profile.pricing.hourly}
                                </span>
                              )}
                              {profile.pricing.half_period && (
                                <span className="text-muted-foreground">
                                  <strong>4h:</strong> R$ {profile.pricing.half_period}
                                </span>
                              )}
                            </div>
                          )}

                          {profile.rejection_reason && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                              <p className="text-xs text-red-600">
                                <strong>Motivo:</strong> {profile.rejection_reason}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/acompanhantes/${profile.state}/${profile.city}/${profile.category}/${profile.id}`)}
                              className="h-7 text-xs px-2"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            {activeTab === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700 h-7 text-xs px-2"
                                  onClick={() => openModal(profile, "approve")}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openModal(profile, "reject")}
                                  className="h-7 text-xs px-2"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejeitar
                                </Button>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   className="border-orange-500 text-orange-600 hover:bg-orange-50 h-7 text-xs px-2"
                                   onClick={() => openModal(profile, "ban")}
                                 >
                                   <Ban className="h-3 w-3 mr-1" />
                                   Banir Usuário
                                 </Button>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   className="border-red-600 text-red-600 hover:bg-red-50 h-7 text-xs px-2"
                                   onClick={() => openModal(profile, "delete")}
                                 >
                                   <Trash2 className="h-3 w-3 mr-1" />
                                   Excluir Anúncio
                                 </Button>
                               </>
                             )}
                             {activeTab === "approved" && (
                               <>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   className="border-orange-500 text-orange-600 hover:bg-orange-50 h-7 text-xs px-2"
                                   onClick={() => openModal(profile, "ban")}
                                 >
                                   <Ban className="h-3 w-3 mr-1" />
                                   Banir Usuário
                                 </Button>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   className="border-red-600 text-red-600 hover:bg-red-50 h-7 text-xs px-2"
                                   onClick={() => openModal(profile, "delete")}
                                 >
                                   <Trash2 className="h-3 w-3 mr-1" />
                                   Excluir Anúncio
                                 </Button>
                               </>
                             )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Aprovar Anúncio"}
              {actionType === "reject" && "Rejeitar Anúncio"}
              {actionType === "ban" && "Banir Usuário"}
              {actionType === "delete" && "Excluir Anúncio"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "Tem certeza que deseja aprovar este anúncio? Ele ficará visível na plataforma."}
              {actionType === "reject" && "Informe o motivo da rejeição. O anunciante será notificado."}
              {actionType === "ban" && "⚠️ Banir o USUÁRIO suspende a conta do anunciante completamente. Ele não poderá criar novos anúncios ou acessar a plataforma. Use para violações graves."}
              {actionType === "delete" && "⚠️ Excluir o ANÚNCIO remove apenas este anúncio específico. O usuário ainda pode criar outros anúncios. Use para conteúdo inadequado em anúncio individual."}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Rejeição*</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Fotos inadequadas, informações falsas, etc."
                rows={4}
              />
            </div>
          )}

          {actionType === "ban" && (
            <div className="space-y-2">
              <Label htmlFor="banReason">Motivo do Banimento*</Label>
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
                Esta ação irá excluir permanentemente APENAS ESTE ANÚNCIO:
              </p>
              <ul className="text-sm text-destructive list-disc list-inside space-y-1">
                <li>Este perfil/anúncio específico</li>
                <li>Fotos e arquivos deste anúncio</li>
                <li>Histórico de moderação deste anúncio</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2 italic">
                * O usuário NÃO será banido e pode criar outros anúncios
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleModeration}
              disabled={isSubmitting}
              className={
                actionType === "approve" ? "bg-green-600 hover:bg-green-700" : 
                actionType === "ban" ? "bg-orange-600 hover:bg-orange-700" : ""
              }
              variant={actionType === "delete" || actionType === "reject" ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : actionType === "approve" ? (
                "Aprovar"
              ) : actionType === "reject" ? (
                "Rejeitar"
              ) : actionType === "ban" ? (
                "Banir"
              ) : (
                "Excluir Permanentemente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAdsModeration;
