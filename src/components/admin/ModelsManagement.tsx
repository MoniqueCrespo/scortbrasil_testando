import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, UserX, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdvancedFilters, FilterValues } from "./AdvancedFilters";

interface ModelProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  model_profiles: Array<{
    id: string;
    name: string;
    is_active: boolean;
    category: string;
    city: string;
    state: string;
    verified: boolean;
  }>;
  premium_subscriptions: Array<{
    status: string;
    plan_id: string;
    end_date: string;
    premium_plans: {
      name: string;
    };
  }>;
}

export const ModelsManagement = () => {
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [filteredModels, setFilteredModels] = useState<ModelProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    filterModels();
  }, [filters, models]);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          model_profiles (
            id, name, is_active, category, city, state, verified
          ),
          premium_subscriptions (
            status, plan_id, end_date,
            premium_plans (name)
          )
        `)
        .eq("role", "model")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error("Erro ao carregar anunciantes:", error);
      toast.error("Erro ao carregar anunciantes");
    } finally {
      setIsLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = [...models];

    // Filtro de busca
    if (filters.search) {
      filtered = filtered.filter(
        (m) =>
          m.email.toLowerCase().includes(filters.search!.toLowerCase()) ||
          m.full_name?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          m.id.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    // Filtro de categoria
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((m) =>
        m.model_profiles.some((p) => p.category === filters.category)
      );
    }

    // Filtro de estado
    if (filters.state && filters.state !== "all") {
      filtered = filtered.filter((m) =>
        m.model_profiles.some((p) => p.state === filters.state)
      );
    }

    // Filtro de verificado
    if (filters.verified && filters.verified !== "all") {
      const isVerified = filters.verified === "true";
      filtered = filtered.filter((m) =>
        m.model_profiles.some((p) => p.verified === isVerified)
      );
    }

    // Filtro de data
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (m) => new Date(m.created_at) >= new Date(filters.dateFrom!)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (m) => new Date(m.created_at) <= new Date(filters.dateTo!)
      );
    }

    setFilteredModels(filtered);
  };

  const handleSuspendModel = async (modelId: string) => {
    try {
      // Desativar todos os perfis do modelo
      const { error } = await supabase
        .from("model_profiles")
        .update({ is_active: false })
        .eq("user_id", modelId);

      if (error) throw error;

      toast.success("Anunciante suspenso com sucesso");
      fetchModels();
    } catch (error) {
      console.error("Erro ao suspender anunciante:", error);
      toast.error("Erro ao suspender anunciante");
    }
  };

  const handleActivateModel = async (modelId: string) => {
    try {
      const { error } = await supabase
        .from("model_profiles")
        .update({ is_active: true })
        .eq("user_id", modelId);

      if (error) throw error;

      toast.success("Anunciante ativado com sucesso");
      fetchModels();
    } catch (error) {
      console.error("Erro ao ativar anunciante:", error);
      toast.error("Erro ao ativar anunciante");
    }
  };

  const getStatusBadge = (model: ModelProfile) => {
    const hasActiveProfiles = model.model_profiles.some((p) => p.is_active);
    return hasActiveProfiles ? (
      <Badge variant="default">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  const getPlanBadge = (model: ModelProfile) => {
    const activeSub = model.premium_subscriptions.find((s) => s.status === "active");
    return activeSub ? (
      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        {activeSub.premium_plans.name}
      </Badge>
    ) : (
      <Badge variant="outline">Gratuito</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Anunciantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdvancedFilters filterType="models" onFilterChange={setFilters} />

        {/* Tabela */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anunciante</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum anunciante encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">
                      {model.full_name || "Sem nome"}
                    </TableCell>
                    <TableCell>{model.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {model.model_profiles.length} {model.model_profiles.length === 1 ? "perfil" : "perfis"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(model)}</TableCell>
                    <TableCell>{getPlanBadge(model)}</TableCell>
                    <TableCell>
                      {format(new Date(model.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedModel(model)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {model.model_profiles.some((p) => p.is_active) ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSuspendModel(model.id)}
                          >
                            <UserX className="h-4 w-4 text-orange-600" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleActivateModel(model.id)}
                          >
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal de detalhes */}
        <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Anunciante</DialogTitle>
              <DialogDescription>
                Informações completas e histórico
              </DialogDescription>
            </DialogHeader>
            {selectedModel && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="text-sm">{selectedModel.full_name || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedModel.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cadastro</p>
                    <p className="text-sm">
                      {format(new Date(selectedModel.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                    <div className="mt-1">{getPlanBadge(selectedModel)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Perfis Cadastrados ({selectedModel.model_profiles.length})
                  </p>
                  <div className="space-y-2">
                    {selectedModel.model_profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="p-3 border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.city} - {profile.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {profile.verified && (
                            <Badge variant="default">Verificado</Badge>
                          )}
                          <Badge variant={profile.is_active ? "default" : "secondary"}>
                            {profile.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedModel.premium_subscriptions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Histórico de Assinaturas
                    </p>
                    <div className="space-y-2">
                      {selectedModel.premium_subscriptions.map((sub, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{sub.premium_plans.name}</p>
                            <Badge
                              variant={sub.status === "active" ? "default" : "secondary"}
                            >
                              {sub.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Expira em:{" "}
                            {format(new Date(sub.end_date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
