import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: any;
  is_active: boolean;
  created_at: string;
  max_photos: number;
  monthly_credits: number;
  max_active_boosts: number;
  priority_support: boolean;
  advanced_analytics: boolean;
  discount_percentage: number;
}

const PlanosAssinatura = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_days: "",
    features: "",
    is_active: true,
    max_photos: "10",
    monthly_credits: "0",
    max_active_boosts: "1",
    priority_support: false,
    advanced_analytics: false,
    discount_percentage: "0",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("premium_plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      toast.error("Erro ao carregar planos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        features: formData.features ? JSON.parse(formData.features) : [],
        is_active: formData.is_active,
        max_photos: parseInt(formData.max_photos),
        monthly_credits: parseInt(formData.monthly_credits),
        max_active_boosts: parseInt(formData.max_active_boosts),
        priority_support: formData.priority_support,
        advanced_analytics: formData.advanced_analytics,
        discount_percentage: parseInt(formData.discount_percentage),
      };

      if (editingPlan) {
        const { error } = await supabase
          .from("premium_plans")
          .update(planData)
          .eq("id", editingPlan.id);

        if (error) throw error;
        toast.success("Plano atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("premium_plans")
          .insert([planData]);

        if (error) throw error;
        toast.success("Plano criado com sucesso!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      toast.error("Erro ao salvar plano");
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      features: JSON.stringify(plan.features || [], null, 2),
      is_active: plan.is_active,
      max_photos: plan.max_photos.toString(),
      monthly_credits: plan.monthly_credits.toString(),
      max_active_boosts: plan.max_active_boosts.toString(),
      priority_support: plan.priority_support,
      advanced_analytics: plan.advanced_analytics,
      discount_percentage: plan.discount_percentage.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;

    try {
      const { error } = await supabase
        .from("premium_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;
      toast.success("Plano excluído com sucesso!");
      fetchPlans();
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      toast.error("Erro ao excluir plano");
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_days: "",
      features: "",
      is_active: true,
      max_photos: "10",
      monthly_credits: "0",
      max_active_boosts: "1",
      priority_support: false,
      advanced_analytics: false,
      discount_percentage: "0",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
          <p className="text-muted-foreground">Gerencie os planos premium da plataforma</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
              <DialogDescription>
                Preencha os dados do plano de assinatura
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Plano</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Premium Mensal"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os benefícios do plano"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duração (dias)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      placeholder="30"
                      required
                    />
                  </div>
                </div>
                
                {/* Recursos Numéricos */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max_photos">Máx. de Fotos Visíveis</Label>
                    <Input
                      id="max_photos"
                      type="number"
                      value={formData.max_photos}
                      onChange={(e) => setFormData({ ...formData, max_photos: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="monthly_credits">Créditos Mensais</Label>
                    <Input
                      id="monthly_credits"
                      type="number"
                      value={formData.monthly_credits}
                      onChange={(e) => setFormData({ ...formData, monthly_credits: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max_active_boosts">Máx. Boosts Ativos</Label>
                    <Input
                      id="max_active_boosts"
                      type="number"
                      value={formData.max_active_boosts}
                      onChange={(e) => setFormData({ ...formData, max_active_boosts: e.target.value })}
                      placeholder="1"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discount_percentage">Desconto (%)</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Recursos Booleanos */}
                <div className="grid gap-3 p-4 border rounded-lg">
                  <Label className="text-base font-semibold">Recursos Incluídos</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="priority_support"
                      checked={formData.priority_support}
                      onCheckedChange={(checked) => setFormData({ ...formData, priority_support: checked })}
                    />
                    <Label htmlFor="priority_support" className="cursor-pointer">Suporte Prioritário</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="advanced_analytics"
                      checked={formData.advanced_analytics}
                      onCheckedChange={(checked) => setFormData({ ...formData, advanced_analytics: checked })}
                    />
                    <Label htmlFor="advanced_analytics" className="cursor-pointer">Analytics Avançados</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">Plano Ativo</Label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="features">Lista de Benefícios (JSON)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder='["Destaque na busca", "Stories ilimitados", "Selo Premium"]'
                    rows={5}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lista de textos descritivos que aparecerão como benefícios do plano
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPlan ? "Atualizar" : "Criar"} Plano
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos Cadastrados</CardTitle>
          <CardDescription>Lista de todos os planos de assinatura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Boosts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando planos...
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum plano cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{plan.description}</p>
                          )}
                          <div className="flex gap-1 mt-1">
                            {plan.priority_support && (
                              <Badge variant="secondary" className="text-xs">Suporte</Badge>
                            )}
                            {plan.advanced_analytics && (
                              <Badge variant="secondary" className="text-xs">Analytics</Badge>
                            )}
                            {plan.discount_percentage > 0 && (
                              <Badge variant="default" className="text-xs">-{plan.discount_percentage}%</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {plan.price.toFixed(2)}
                      </TableCell>
                      <TableCell>{plan.duration_days} dias</TableCell>
                      <TableCell className="text-center">{plan.max_photos}</TableCell>
                      <TableCell className="text-center">{plan.monthly_credits}</TableCell>
                      <TableCell className="text-center">{plan.max_active_boosts}</TableCell>
                      <TableCell>
                        {plan.is_active ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default PlanosAssinatura;
