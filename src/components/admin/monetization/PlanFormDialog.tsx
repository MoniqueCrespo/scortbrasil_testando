import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, X } from "lucide-react";

const planSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço deve ser positivo"),
  duration_days: z.number().min(1, "Duração deve ser pelo menos 1 dia"),
  monthly_credits: z.number().min(0).optional(),
  max_active_boosts: z.number().min(0).optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  advanced_analytics: z.boolean(),
  priority_support: z.boolean(),
  is_active: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: any;
  onSuccess: () => void;
}

export function PlanFormDialog({ open, onOpenChange, plan, onSuccess }: PlanFormDialogProps) {
  const [features, setFeatures] = useState<string[]>(plan?.features || []);
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      price: plan?.price || 0,
      duration_days: plan?.duration_days || 30,
      monthly_credits: plan?.monthly_credits || 0,
      max_active_boosts: plan?.max_active_boosts || 1,
      discount_percentage: plan?.discount_percentage || 0,
      advanced_analytics: plan?.advanced_analytics || false,
      priority_support: plan?.priority_support || false,
      is_active: plan?.is_active ?? true,
    },
  });

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PlanFormData) => {
    setLoading(true);
    try {
      const planData = {
        ...data,
        features: features,
      };

      if (plan) {
        const { error } = await supabase
          .from("premium_plans")
          .update(planData as any)
          .eq("id", plan.id);
        if (error) throw error;
        toast.success("Plano atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("premium_plans")
          .insert(planData as any);
        if (error) throw error;
        toast.success("Plano criado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
      reset();
      setFeatures([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_days">Duração (dias)</Label>
              <Input
                id="duration_days"
                type="number"
                {...register("duration_days", { valueAsNumber: true })}
              />
              {errors.duration_days && <p className="text-sm text-destructive">{errors.duration_days.message}</p>}
            </div>

            <div>
              <Label htmlFor="monthly_credits">Créditos Mensais</Label>
              <Input
                id="monthly_credits"
                type="number"
                {...register("monthly_credits", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_active_boosts">Boosts Simultâneos</Label>
              <Input
                id="max_active_boosts"
                type="number"
                {...register("max_active_boosts", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="discount_percentage">Desconto (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                {...register("discount_percentage", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label>Recursos</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Adicionar recurso..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="flex-1">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="advanced_analytics" {...register("advanced_analytics")} />
              <Label htmlFor="advanced_analytics">Analytics Avançado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="priority_support" {...register("priority_support")} />
              <Label htmlFor="priority_support">Suporte Prioritário</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="is_active" {...register("is_active")} />
              <Label htmlFor="is_active">Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : plan ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
