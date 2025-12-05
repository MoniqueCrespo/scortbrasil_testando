import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react";
import { PlanFormDialog } from "@/components/admin/monetization/PlanFormDialog";
import { BoostFormDialog } from "@/components/admin/monetization/BoostFormDialog";
import { BundleFormDialog } from "@/components/admin/monetization/BundleFormDialog";
import { CreditFormDialog } from "@/components/admin/monetization/CreditFormDialog";
import { ServiceFormDialog } from "@/components/admin/monetization/ServiceFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  monthly_credits: number;
  is_active: boolean;
  features: any;
}

interface BoostPackage {
  id: string;
  name: string;
  price: number;
  credit_cost: number;
  duration_hours: number;
  visibility_multiplier: number;
  is_active: boolean;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus_credits: number;
  price: number;
  is_active: boolean;
}

export default function PlanosMonetizacao() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [boosts, setBoosts] = useState<BoostPackage[]>([]);
  const [credits, setCredits] = useState<CreditPackage[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [planDialog, setPlanDialog] = useState({ open: false, data: null as any });
  const [boostDialog, setBoostDialog] = useState({ open: false, data: null as any });
  const [bundleDialog, setBundleDialog] = useState({ open: false, data: null as any });
  const [creditDialog, setCreditDialog] = useState({ open: false, data: null as any });
  const [serviceDialog, setServiceDialog] = useState({ open: false, data: null as any });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: "", id: "" });
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchPlans(), fetchBoosts(), fetchCredits(), fetchBundles(), fetchServices()]);
    setLoading(false);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("premium_services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar serviços");
      console.error(error);
    } else {
      setServices(data || []);
    }
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("premium_plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar planos");
      console.error(error);
    } else {
      setPlans(data || []);
    }
  };

  const fetchBoosts = async () => {
    const { data, error } = await supabase
      .from("boost_packages")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar boosts");
      console.error(error);
    } else {
      setBoosts(data || []);
    }
  };

  const fetchCredits = async () => {
    const { data, error } = await supabase
      .from("credit_packages")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar pacotes de créditos");
      console.error(error);
    } else {
      setCredits(data || []);
    }
  };

  const fetchBundles = async () => {
    const { data, error } = await supabase
      .from("monetization_bundles")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar pacotes combinados");
      console.error(error);
    } else {
      setBundles(data || []);
    }
  };

  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("premium_plans")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
      fetchPlans();
    }
  };

  const toggleBoostStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("boost_packages")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
      fetchBoosts();
    }
  };

  const toggleCreditStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("credit_packages")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
      fetchCredits();
    }
  };

  const toggleBundleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("monetization_bundles")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
      fetchBundles();
    }
  };

  const handleDelete = async () => {
    const { type, id } = deleteDialog;
    let tableName = "";
    
    if (type === "plan") tableName = "premium_plans";
    else if (type === "boost") tableName = "boost_packages";
    else if (type === "credit") tableName = "credit_packages";
    else if (type === "bundle") tableName = "monetization_bundles";
    else if (type === "service") tableName = "premium_services";

    const { error } = await supabase.from(tableName as any).delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir item");
    } else {
      toast.success("Item excluído com sucesso!");
      fetchAllData();
    }
    setDeleteDialog({ open: false, type: "", id: "" });
  };

  return (
    <AdminLayout title="Planos e Monetização">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="boosts">Boosts</TabsTrigger>
            <TabsTrigger value="credits">Créditos</TabsTrigger>
            <TabsTrigger value="services">Serviços Premium</TabsTrigger>
            <TabsTrigger value="bundles">
              <Package className="h-4 w-4 mr-2" />
              Pacotes Combinados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setPlanDialog({ open: true, data: null })}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.duration_days} dias • {plan.monthly_credits || 0} créditos/mês
                      </CardDescription>
                    </div>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</div>
                  <div className="flex items-center justify-between gap-2">
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => togglePlanStatus(plan.id, plan.is_active)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPlanDialog({ open: true, data: plan })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, type: "plan", id: plan.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="boosts" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setBoostDialog({ open: true, data: null })}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Boost
              </Button>
            </div>
            {boosts.map((boost) => (
              <Card key={boost.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{boost.name}</CardTitle>
                      <CardDescription>
                        {boost.duration_hours}h • {boost.visibility_multiplier}x visibilidade
                      </CardDescription>
                    </div>
                    <Badge variant={boost.is_active ? "default" : "secondary"}>
                      {boost.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço</p>
                      <p className="text-xl font-bold">R$ {boost.price?.toFixed(2) || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Créditos</p>
                      <p className="text-xl font-bold">{boost.credit_cost || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Switch
                      checked={boost.is_active}
                      onCheckedChange={() => toggleBoostStatus(boost.id, boost.is_active)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBoostDialog({ open: true, data: boost })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, type: "boost", id: boost.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setCreditDialog({ open: true, data: null })}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pacote de Créditos
              </Button>
            </div>
            {credits.map((credit) => (
              <Card key={credit.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{credit.name}</CardTitle>
                      <CardDescription>
                        {credit.credits} créditos{credit.bonus_credits > 0 && ` + ${credit.bonus_credits} bônus`}
                      </CardDescription>
                    </div>
                    <Badge variant={credit.is_active ? "default" : "secondary"}>
                      {credit.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">R$ {credit.price.toFixed(2)}</div>
                  <div className="flex items-center justify-between gap-2">
                    <Switch
                      checked={credit.is_active}
                      onCheckedChange={() => toggleCreditStatus(credit.id, credit.is_active)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreditDialog({ open: true, data: credit })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, type: "credit", id: credit.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setServiceDialog({ open: true, data: null })}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço Premium
              </Button>
            </div>
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="text-sm font-medium">{service.service_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Custo</p>
                      <p className="text-lg font-bold">{service.credit_cost} créditos</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duração</p>
                      <p className="text-sm">{service.duration_days || "—"} dias</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Switch checked={service.is_active} disabled />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setServiceDialog({ open: true, data: service })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, type: "service", id: service.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setBundleDialog({ open: true, data: null })}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pacote Combinado
              </Button>
            </div>
            {bundles.map((bundle) => (
              <Card key={bundle.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{bundle.name}</CardTitle>
                        {bundle.badge_text && (
                          <Badge style={{ backgroundColor: bundle.badge_color }}>
                            {bundle.badge_text}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{bundle.description}</CardDescription>
                    </div>
                    <Badge variant={bundle.is_active ? "default" : "secondary"}>
                      {bundle.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço Original</p>
                      <p className="text-lg font-semibold line-through text-muted-foreground">
                        R$ {bundle.original_price?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preço do Pacote</p>
                      <p className="text-2xl font-bold text-primary">
                        R$ {bundle.bundle_price?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Economia</p>
                      <p className="text-lg font-semibold text-green-600">
                        {bundle.discount_percentage}% OFF
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Itens Inclusos:</p>
                    <div className="space-y-1">
                      {bundle.included_items?.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span>{item.quantity}x Item</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Switch
                      checked={bundle.is_active}
                      onCheckedChange={() => toggleBundleStatus(bundle.id, bundle.is_active)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBundleDialog({ open: true, data: bundle })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, type: "bundle", id: bundle.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      <PlanFormDialog
        open={planDialog.open}
        onOpenChange={(open) => setPlanDialog({ open, data: null })}
        plan={planDialog.data}
        onSuccess={fetchAllData}
      />

      <BoostFormDialog
        open={boostDialog.open}
        onOpenChange={(open) => setBoostDialog({ open, data: null })}
        boost={boostDialog.data}
        onSuccess={fetchAllData}
      />

      <BundleFormDialog
        open={bundleDialog.open}
        onOpenChange={(open) => setBundleDialog({ open, data: null })}
        bundle={bundleDialog.data}
        onSuccess={fetchAllData}
      />

      <CreditFormDialog
        open={creditDialog.open}
        onOpenChange={(open) => setCreditDialog({ open, data: null })}
        credit={creditDialog.data}
        onSuccess={fetchAllData}
      />

      <ServiceFormDialog
        open={serviceDialog.open}
        onOpenChange={(open) => setServiceDialog({ open, data: null })}
        service={serviceDialog.data}
        onSuccess={fetchAllData}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open, type: "", id: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
