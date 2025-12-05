import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const couponSchema = z.object({
  code: z.string().min(3, "Código deve ter pelo menos 3 caracteres").max(50).regex(/^[A-Z0-9_-]+$/, "Use apenas letras maiúsculas, números, _ e -"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().min(0.01, "Valor deve ser maior que zero"),
  applicable_to: z.string().min(1, "Selecione a aplicação"),
  max_uses: z.number().min(1).optional(),
  valid_until: z.string().min(1, "Data de validade obrigatória"),
  is_active: z.boolean(),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: any;
  onSuccess: () => void;
}

export function CouponFormDialog({ open, onOpenChange, coupon, onSuccess }: CouponFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [validUntil, setValidUntil] = useState<Date | undefined>(
    coupon?.valid_until ? new Date(coupon.valid_until) : undefined
  );

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || "",
      discount_type: coupon?.discount_type || "percentage",
      discount_value: coupon?.discount_value || 10,
      applicable_to: coupon?.applicable_to || "",
      max_uses: coupon?.max_uses || undefined,
      valid_until: coupon?.valid_until || "",
      is_active: coupon?.is_active ?? true,
    },
  });

  const discountType = watch("discount_type");
  const discountValue = watch("discount_value");

  const onSubmit = async (data: CouponFormData) => {
    setLoading(true);
    try {
      if (coupon) {
        const { error } = await supabase
          .from("discount_coupons")
          .update(data as any)
          .eq("id", coupon.id);
        if (error) throw error;
        toast.success("Cupom atualizado!");
      } else {
        const { error } = await supabase
          .from("discount_coupons")
          .insert({
            ...data,
            valid_from: new Date().toISOString(),
            current_uses: 0,
          } as any);
        if (error) throw error;
        toast.success("Cupom criado!");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar Cupom" : "Novo Cupom de Desconto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="code">Código do Cupom</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="PROMO2024"
              className="uppercase font-mono"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register("code").onChange(e);
              }}
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Use apenas letras maiúsculas, números, _ e -
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_type">Tipo de Desconto</Label>
              <Select
                value={discountType}
                onValueChange={(value) => setValue("discount_type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount_value">
                Valor ({discountType === "percentage" ? "%" : "R$"})
              </Label>
              <Input
                id="discount_value"
                type="number"
                step={discountType === "percentage" ? "1" : "0.01"}
                max={discountType === "percentage" ? "100" : undefined}
                {...register("discount_value", { valueAsNumber: true })}
              />
              {errors.discount_value && <p className="text-sm text-destructive">{errors.discount_value.message}</p>}
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium">Desconto Aplicado</p>
            <p className="text-xl font-bold text-primary">
              {discountType === "percentage" 
                ? `${discountValue}% de desconto`
                : `R$ ${discountValue.toFixed(2)} de desconto`
              }
            </p>
          </div>

          <div>
            <Label htmlFor="applicable_to">Aplicável a</Label>
            <Select
              value={watch("applicable_to")}
              onValueChange={(value) => setValue("applicable_to", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione onde aplicar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Produtos</SelectItem>
                <SelectItem value="plans">Apenas Planos</SelectItem>
                <SelectItem value="boosts">Apenas Boosts</SelectItem>
                <SelectItem value="credits">Apenas Créditos</SelectItem>
                <SelectItem value="services">Apenas Serviços</SelectItem>
                <SelectItem value="bundles">Apenas Pacotes</SelectItem>
              </SelectContent>
            </Select>
            {errors.applicable_to && <p className="text-sm text-destructive">{errors.applicable_to.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Validade</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validUntil && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validUntil ? format(validUntil, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validUntil}
                    onSelect={(date) => {
                      setValidUntil(date);
                      if (date) {
                        setValue("valid_until", date.toISOString());
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.valid_until && <p className="text-sm text-destructive">{errors.valid_until.message}</p>}
            </div>

            <div>
              <Label htmlFor="max_uses">Limite de Usos (opcional)</Label>
              <Input
                id="max_uses"
                type="number"
                {...register("max_uses", { valueAsNumber: true })}
                placeholder="Ilimitado"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe vazio para usos ilimitados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="is_active" {...register("is_active")} />
            <Label htmlFor="is_active">Cupom Ativo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : coupon ? "Atualizar" : "Criar Cupom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
