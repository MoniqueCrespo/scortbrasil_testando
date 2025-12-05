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
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bundleSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  original_price: z.number().min(0, "Preço original deve ser positivo"),
  bundle_price: z.number().min(0, "Preço do pacote deve ser positivo"),
  discount_percentage: z.number().min(0).max(100).optional(),
  badge_text: z.string().optional(),
  badge_color: z.string().optional(),
  sort_order: z.number().min(0).optional(),
  is_active: z.boolean(),
});

type BundleFormData = z.infer<typeof bundleSchema>;

interface BundleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle?: any;
  onSuccess: () => void;
}

interface BundleItem {
  type: "plan" | "boost" | "credits" | "service" | "geographic_boost";
  id: string;
  quantity: number;
}

export function BundleFormDialog({ open, onOpenChange, bundle, onSuccess }: BundleFormDialogProps) {
  const [items, setItems] = useState<BundleItem[]>(bundle?.included_items || []);
  const [loading, setLoading] = useState(false);
  
  // Available items to add
  const [plans, setPlans] = useState<any[]>([]);
  const [boosts, setBoosts] = useState<any[]>([]);
  const [creditPackages, setCreditPackages] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [geoBoosts, setGeoBoosts] = useState<any[]>([]);

  const [newItemType, setNewItemType] = useState<string>("");
  const [newItemId, setNewItemId] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<BundleFormData>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: bundle?.name || "",
      description: bundle?.description || "",
      original_price: bundle?.original_price || 0,
      bundle_price: bundle?.bundle_price || 0,
      discount_percentage: bundle?.discount_percentage || 0,
      badge_text: bundle?.badge_text || "",
      badge_color: bundle?.badge_color || "#FF6B9D",
      sort_order: bundle?.sort_order || 0,
      is_active: bundle?.is_active ?? true,
    },
  });

  const originalPrice = watch("original_price");
  const bundlePrice = watch("bundle_price");

  // Auto-calculate discount percentage
  useEffect(() => {
    if (originalPrice > 0 && bundlePrice > 0) {
      const discount = Math.round(((originalPrice - bundlePrice) / originalPrice) * 100);
      setValue("discount_percentage", discount);
    }
  }, [originalPrice, bundlePrice, setValue]);

  // Fetch available items
  useEffect(() => {
    const fetchItems = async () => {
      const [plansRes, boostsRes, creditsRes, servicesRes, geoRes] = await Promise.all([
        supabase.from("premium_plans").select("*").eq("is_active", true),
        supabase.from("boost_packages").select("*").eq("is_active", true),
        supabase.from("credit_packages").select("*").eq("is_active", true),
        supabase.from("premium_services").select("*").eq("is_active", true),
        supabase.from("geographic_boosts").select("*").eq("is_active", true),
      ]);

      if (plansRes.data) setPlans(plansRes.data);
      if (boostsRes.data) setBoosts(boostsRes.data);
      if (creditsRes.data) setCreditPackages(creditsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (geoRes.data) setGeoBoosts(geoRes.data);
    };

    if (open) fetchItems();
  }, [open]);

  const addItem = () => {
    if (newItemType && newItemId) {
      const newItem: BundleItem = {
        type: newItemType as any,
        id: newItemId,
        quantity: newItemQuantity,
      };
      setItems([...items, newItem]);
      setNewItemType("");
      setNewItemId("");
      setNewItemQuantity(1);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getItemName = (item: BundleItem) => {
    let source: any[] = [];
    switch (item.type) {
      case "plan": source = plans; break;
      case "boost": source = boosts; break;
      case "credits": source = creditPackages; break;
      case "service": source = services; break;
      case "geographic_boost": source = geoBoosts; break;
    }
    const found = source.find(s => s.id === item.id);
    return found?.name || item.id;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      plan: "Plano",
      boost: "Boost",
      credits: "Créditos",
      service: "Serviço Premium",
      geographic_boost: "Boost Geográfico",
    };
    return labels[type] || type;
  };

  const onSubmit = async (data: BundleFormData) => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item ao pacote");
      return;
    }

    setLoading(true);
    try {
      const bundleData = {
        ...data,
        included_items: items,
      };

      if (bundle) {
        const { error } = await supabase
          .from("monetization_bundles")
          .update(bundleData as any)
          .eq("id", bundle.id);
        if (error) throw error;
        toast.success("Pacote atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("monetization_bundles")
          .insert(bundleData as any);
        if (error) throw error;
        toast.success("Pacote criado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
      reset();
      setItems([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableItems = () => {
    switch (newItemType) {
      case "plan": return plans;
      case "boost": return boosts;
      case "credits": return creditPackages;
      case "service": return services;
      case "geographic_boost": return geoBoosts;
      default: return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bundle ? "Editar Pacote" : "Novo Pacote Combinado"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Pacote</Label>
              <Input id="name" {...register("name")} placeholder="Pacote Premium Plus" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="badge_text">Texto Badge</Label>
                <Input id="badge_text" {...register("badge_text")} placeholder="OFERTA" />
              </div>
              <div>
                <Label htmlFor="badge_color">Cor</Label>
                <Input id="badge_color" type="color" {...register("badge_color")} />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} placeholder="Descrição do pacote..." />
          </div>

          <div className="border rounded-lg p-4 bg-muted/30">
            <Label className="text-base mb-3 block">Itens do Pacote</Label>
            
            <div className="grid grid-cols-4 gap-2 mb-3">
              <Select value={newItemType} onValueChange={setNewItemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plan">Plano</SelectItem>
                  <SelectItem value="boost">Boost</SelectItem>
                  <SelectItem value="credits">Créditos</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                  <SelectItem value="geographic_boost">Geo Boost</SelectItem>
                </SelectContent>
              </Select>

              <Select value={newItemId} onValueChange={setNewItemId} disabled={!newItemType}>
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableItems().map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-1">
                <Input
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Qtd"
                />
                <Button type="button" onClick={addItem} size="icon" disabled={!newItemType || !newItemId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-background p-2 rounded border">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{getTypeLabel(item.type)}</span>
                    <span className="font-medium">{getItemName(item)}</span>
                    {item.quantity > 1 && (
                      <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum item adicionado
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="original_price">Preço Original (R$)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                {...register("original_price", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="bundle_price">Preço do Pacote (R$)</Label>
              <Input
                id="bundle_price"
                type="number"
                step="0.01"
                {...register("bundle_price", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="discount_percentage">Desconto (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                {...register("discount_percentage", { valueAsNumber: true })}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="sort_order">Ordem de Exibição</Label>
              <Input
                id="sort_order"
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="is_active" {...register("is_active")} />
              <Label htmlFor="is_active">Pacote Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : bundle ? "Atualizar" : "Criar Pacote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
