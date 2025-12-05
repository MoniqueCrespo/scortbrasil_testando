import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react";

interface SubscriptionTier {
  id: string;
  tier_name: string;
  monthly_price: number;
  description: string;
  benefits: any;
  is_active: boolean;
  sort_order: number;
}

interface SubscriptionTiersManagerProps {
  profileId: string;
}

export const SubscriptionTiersManager = ({ profileId }: SubscriptionTiersManagerProps) => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [formData, setFormData] = useState({
    tier_name: "",
    monthly_price: "",
    description: "",
    benefits: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTiers();
  }, [profileId]);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('profile_id', profileId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTiers((data || []).map(tier => ({
        ...tier,
        benefits: Array.isArray(tier.benefits) ? tier.benefits : []
      })));
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos de assinatura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tierData = {
        profile_id: profileId,
        tier_name: formData.tier_name,
        monthly_price: parseFloat(formData.monthly_price),
        description: formData.description,
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
        is_active: formData.is_active,
        sort_order: tiers.length,
      };

      if (editingTier) {
        const { error } = await supabase
          .from('subscription_tiers')
          .update(tierData)
          .eq('id', editingTier.id);

        if (error) throw error;
        toast({ title: "Plano atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('subscription_tiers')
          .insert(tierData);

        if (error) throw error;
        toast({ title: "Plano criado com sucesso!" });
      }

      fetchTiers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tier:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Plano excluído com sucesso!" });
      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o plano",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tier: SubscriptionTier) => {
    setEditingTier(tier);
    setFormData({
      tier_name: tier.tier_name,
      monthly_price: tier.monthly_price.toString(),
      description: tier.description || "",
      benefits: tier.benefits.join('\n'),
      is_active: tier.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTier(null);
    setFormData({
      tier_name: "",
      monthly_price: "",
      description: "",
      benefits: "",
      is_active: true,
    });
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Planos de Assinatura</h3>
          <p className="text-sm text-muted-foreground">Gerencie seus níveis de assinatura de conteúdo exclusivo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTier ? 'Editar Plano' : 'Novo Plano de Assinatura'}</DialogTitle>
              <DialogDescription>
                Configure os detalhes do seu plano de assinatura
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tier_name">Nome do Plano</Label>
                <Input
                  id="tier_name"
                  value={formData.tier_name}
                  onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                  placeholder="Ex: Plano Básico"
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthly_price">Preço Mensal (R$)</Label>
                <Input
                  id="monthly_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthly_price}
                  onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                  placeholder="29.90"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do plano..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="benefits">Benefícios (um por linha)</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="Acesso a fotos exclusivas&#10;Vídeos em HD&#10;Conteúdo semanal"
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Plano ativo</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingTier ? 'Atualizar Plano' : 'Criar Plano'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tiers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Você ainda não criou nenhum plano de assinatura.
            <br />
            Comece criando seu primeiro plano!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tier.tier_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold">R$ {tier.monthly_price.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                  </div>
                  {!tier.is_active && (
                    <span className="px-2 py-1 text-xs rounded-full bg-muted">Inativo</span>
                  )}
                </div>
                {tier.description && (
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {tier.benefits && tier.benefits.length > 0 && (
                  <ul className="mb-4 space-y-1 text-sm">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tier)}
                    className="flex-1"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tier.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
