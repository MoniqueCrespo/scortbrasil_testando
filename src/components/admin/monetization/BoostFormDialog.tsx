import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, X } from "lucide-react";

const boostSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  duration_hours: z.number().min(1, "Duração deve ser pelo menos 1 hora"),
  visibility_multiplier: z.number().min(1, "Multiplicador deve ser pelo menos 1"),
  price: z.number().min(0).optional(),
  credit_cost: z.number().min(0).optional(),
  priority_score: z.number().min(0).optional(),
  badge_text: z.string().optional(),
  badge_color: z.string().optional(),
  sort_order: z.number().min(0).optional(),
  is_active: z.boolean(),
});

type BoostFormData = z.infer<typeof boostSchema>;

interface BoostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boost?: any;
  onSuccess: () => void;
}

export function BoostFormDialog({ open, onOpenChange, boost, onSuccess }: BoostFormDialogProps) {
  const [features, setFeatures] = useState<string[]>(boost?.features || []);
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BoostFormData>({
    resolver: zodResolver(boostSchema),
    defaultValues: {
      name: boost?.name || "",
      duration_hours: boost?.duration_hours || 24,
      visibility_multiplier: boost?.visibility_multiplier || 2,
      price: boost?.price || 0,
      credit_cost: boost?.credit_cost || 0,
      priority_score: boost?.priority_score || 0,
      badge_text: boost?.badge_text || "",
      badge_color: boost?.badge_color || "#FF6B9D",
      sort_order: boost?.sort_order || 0,
      is_active: boost?.is_active ?? true,
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

  const onSubmit = async (data: BoostFormData) => {
    setLoading(true);
    try {
      const boostData = {
        ...data,
        features: features,
      };

      if (boost) {
        const { error } = await supabase
          .from("boost_packages")
          .update(boostData as any)
          .eq("id", boost.id);
        if (error) throw error;
        toast.success("Boost atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("boost_packages")
          .insert(boostData as any);
        if (error) throw error;
        toast.success("Boost criado com sucesso!");
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
          <DialogTitle>{boost ? "Editar Boost" : "Novo Boost"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="duration_hours">Duração (horas)</Label>
              <Input
                id="duration_hours"
                type="number"
                {...register("duration_hours", { valueAsNumber: true })}
              />
              {errors.duration_hours && <p className="text-sm text-destructive">{errors.duration_hours.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="credit_cost">Custo em Créditos</Label>
              <Input
                id="credit_cost"
                type="number"
                {...register("credit_cost", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="visibility_multiplier">Multiplicador</Label>
              <Input
                id="visibility_multiplier"
                type="number"
                step="0.1"
                {...register("visibility_multiplier", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority_score">Prioridade</Label>
              <Input
                id="priority_score"
                type="number"
                {...register("priority_score", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="badge_text">Texto Badge</Label>
              <Input id="badge_text" {...register("badge_text")} />
            </div>

            <div>
              <Label htmlFor="badge_color">Cor Badge</Label>
              <Input id="badge_color" type="color" {...register("badge_color")} />
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

          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="sort_order">Ordem</Label>
              <Input
                id="sort_order"
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="is_active" {...register("is_active")} />
              <Label htmlFor="is_active">Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : boost ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
