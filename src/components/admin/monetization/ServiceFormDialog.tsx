import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const serviceSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  description: z.string().max(500).optional(),
  service_type: z.string().min(1, "Tipo obrigatório"),
  credit_cost: z.number().min(1, "Custo deve ser pelo menos 1 crédito"),
  duration_days: z.number().min(1).optional(),
  icon: z.string().optional(),
  sort_order: z.number().min(0).optional(),
  is_active: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: any;
  onSuccess: () => void;
}

const serviceTypes = [
  { value: "profile_highlight", label: "Destaque de Perfil" },
  { value: "top_search", label: "Topo das Buscas" },
  { value: "verified_badge", label: "Selo de Verificado" },
  { value: "analytics_pro", label: "Analytics Profissional" },
  { value: "priority_support", label: "Suporte Prioritário" },
  { value: "custom_url", label: "URL Personalizada" },
];

export function ServiceFormDialog({ open, onOpenChange, service, onSuccess }: ServiceFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      service_type: service?.service_type || "",
      credit_cost: service?.credit_cost || 10,
      duration_days: service?.duration_days || 30,
      icon: service?.icon || "star",
      sort_order: service?.sort_order || 0,
      is_active: service?.is_active ?? true,
    },
  });

  const serviceType = watch("service_type");

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true);
    try {
      const serviceData = {
        ...data,
        config: {},
      };

      if (service) {
        const { error } = await supabase
          .from("premium_services")
          .update(serviceData as any)
          .eq("id", service.id);
        if (error) throw error;
        toast.success("Serviço atualizado!");
      } else {
        const { error } = await supabase
          .from("premium_services")
          .insert(serviceData as any);
        if (error) throw error;
        toast.success("Serviço criado!");
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
          <DialogTitle>{service ? "Editar Serviço Premium" : "Novo Serviço Premium"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input id="name" {...register("name")} placeholder="Destaque Premium" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="service_type">Tipo de Serviço</Label>
            <Select
              value={serviceType}
              onValueChange={(value) => setValue("service_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_type && <p className="text-sm text-destructive">{errors.service_type.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva os benefícios do serviço..."
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credit_cost">Custo em Créditos</Label>
              <Input
                id="credit_cost"
                type="number"
                {...register("credit_cost", { valueAsNumber: true })}
              />
              {errors.credit_cost && <p className="text-sm text-destructive">{errors.credit_cost.message}</p>}
            </div>

            <div>
              <Label htmlFor="duration_days">Duração (dias)</Label>
              <Input
                id="duration_days"
                type="number"
                {...register("duration_days", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Ícone</Label>
              <Input id="icon" {...register("icon")} placeholder="star" />
            </div>

            <div>
              <Label htmlFor="sort_order">Ordem</Label>
              <Input
                id="sort_order"
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="is_active" {...register("is_active")} />
            <Label htmlFor="is_active">Serviço Ativo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : service ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
