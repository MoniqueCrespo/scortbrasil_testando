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

const creditSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  credits: z.number().min(1, "Créditos devem ser pelo menos 1"),
  bonus_credits: z.number().min(0, "Bônus não pode ser negativo"),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  sort_order: z.number().min(0).optional(),
  is_active: z.boolean(),
});

type CreditFormData = z.infer<typeof creditSchema>;

interface CreditFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credit?: any;
  onSuccess: () => void;
}

export function CreditFormDialog({ open, onOpenChange, credit, onSuccess }: CreditFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreditFormData>({
    resolver: zodResolver(creditSchema),
    defaultValues: {
      name: credit?.name || "",
      credits: credit?.credits || 100,
      bonus_credits: credit?.bonus_credits || 0,
      price: credit?.price || 0,
      sort_order: credit?.sort_order || 0,
      is_active: credit?.is_active ?? true,
    },
  });

  const credits = watch("credits");
  const bonusCredits = watch("bonus_credits");

  const onSubmit = async (data: CreditFormData) => {
    setLoading(true);
    try {
      if (credit) {
        const { error } = await supabase
          .from("credit_packages")
          .update(data as any)
          .eq("id", credit.id);
        if (error) throw error;
        toast.success("Pacote de créditos atualizado!");
      } else {
        const { error } = await supabase
          .from("credit_packages")
          .insert(data as any);
        if (error) throw error;
        toast.success("Pacote de créditos criado!");
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{credit ? "Editar Pacote de Créditos" : "Novo Pacote de Créditos"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Pacote</Label>
            <Input id="name" {...register("name")} placeholder="Pacote Bronze" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credits">Créditos Base</Label>
              <Input
                id="credits"
                type="number"
                {...register("credits", { valueAsNumber: true })}
              />
              {errors.credits && <p className="text-sm text-destructive">{errors.credits.message}</p>}
            </div>

            <div>
              <Label htmlFor="bonus_credits">Créditos Bônus</Label>
              <Input
                id="bonus_credits"
                type="number"
                {...register("bonus_credits", { valueAsNumber: true })}
              />
              {errors.bonus_credits && <p className="text-sm text-destructive">{errors.bonus_credits.message}</p>}
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium">Total de Créditos</p>
            <p className="text-2xl font-bold text-primary">
              {credits + bonusCredits} créditos
            </p>
            {bonusCredits > 0 && (
              <p className="text-xs text-muted-foreground">
                ({credits} base + {bonusCredits} bônus)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="sort_order">Ordem de Exibição</Label>
              <Input
                id="sort_order"
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="is_active" {...register("is_active")} />
            <Label htmlFor="is_active">Pacote Ativo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : credit ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
