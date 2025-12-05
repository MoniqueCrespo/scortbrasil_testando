import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type PremiumPlan = Tables<"premium_plans">;

const AdminPlans = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '',
    features: [''],
    is_active: true,
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      return;
    }
    fetchPlans();
  }, [userRole, navigate]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('premium_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar planos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (plan?: PremiumPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price.toString(),
        duration_days: plan.duration_days.toString(),
        features: Array.isArray(plan.features) && plan.features.length > 0 
          ? (plan.features as string[])
          : [''],
        is_active: plan.is_active || false,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration_days: '',
        features: [''],
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.duration_days) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsProcessing(true);
    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        features: formData.features.filter(f => f.trim() !== ''),
        is_active: formData.is_active,
      };

      if (editingPlan) {
        // Update
        const { error } = await supabase
          .from('premium_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success("Plano atualizado com sucesso!");
      } else {
        // Create
        const { error } = await supabase
          .from('premium_plans')
          .insert(planData);

        if (error) throw error;
        toast.success("Plano criado com sucesso!");
      }

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast.error("Erro ao salvar plano");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;

    try {
      const { error } = await supabase
        .from('premium_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      toast.success("Plano excluído com sucesso");
      fetchPlans();
    } catch (error: any) {
      toast.error("Erro ao excluir plano");
      console.error(error);
    }
  };

  const toggleActive = async (plan: PremiumPlan) => {
    try {
      const { error } = await supabase
        .from('premium_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;
      toast.success(plan.is_active ? "Plano desativado" : "Plano ativado");
      fetchPlans();
    } catch (error: any) {
      toast.error("Erro ao atualizar status");
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
                Gerenciar Planos Premium
              </h1>
              <p className="text-muted-foreground">
                Crie e edite planos de assinatura
              </p>
            </div>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Carregando planos...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Switch
                        checked={plan.is_active || false}
                        onCheckedChange={() => toggleActive(plan)}
                      />
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      R$ {Number(plan.price).toFixed(2)}
                      <span className="text-sm text-muted-foreground font-normal">
                        /{plan.duration_days} dias
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Recursos:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {Array.isArray(plan.features) && plan.features.map((feature: any, index: number) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openDialog(plan)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Dialog de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do plano premium
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Premium Mensal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Breve descrição do plano"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (dias) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                placeholder="30"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recursos</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Ex: 3 anúncios simultâneos"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="active">Plano ativo</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing}
                className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
              >
                {isProcessing ? 'Salvando...' : editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlans;
