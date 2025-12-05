import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, Trash2, Copy, Tag } from "lucide-react";
import { CouponFormDialog } from "@/components/admin/monetization/CouponFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CuponsDesconto() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponDialog, setCouponDialog] = useState({ open: false, data: null as any });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: "" });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("discount_coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar cupons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("discount_coupons")
        .delete()
        .eq("id", deleteDialog.id);

      if (error) throw error;
      toast.success("Cupom excluído!");
      fetchCoupons();
    } catch (error: any) {
      toast.error("Erro ao excluir cupom");
    }
    setDeleteDialog({ open: false, id: "" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const getApplicableLabel = (applicable: string) => {
    const labels: Record<string, string> = {
      all: "Todos",
      plans: "Planos",
      boosts: "Boosts",
      credits: "Créditos",
      services: "Serviços",
      bundles: "Pacotes",
    };
    return labels[applicable] || applicable;
  };

  if (loading) {
    return (
      <AdminLayout title="Cupons de Desconto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Cupons de Desconto">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setCouponDialog({ open: true, data: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        </div>

        {coupons.map((coupon) => {
          const isExpired = new Date(coupon.valid_until) < new Date();
          const isMaxedOut = coupon.max_uses && coupon.current_uses >= coupon.max_uses;
          const isActive = coupon.is_active && !isExpired && !isMaxedOut;

          return (
            <Card key={coupon.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-lg font-bold bg-muted px-3 py-1 rounded">
                        {coupon.code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(coupon.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      {isExpired && <Badge variant="destructive">Expirado</Badge>}
                      {isMaxedOut && <Badge variant="destructive">Limite Atingido</Badge>}
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {getApplicableLabel(coupon.applicable_to)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Desconto</p>
                    <p className="text-xl font-bold text-primary">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `R$ ${coupon.discount_value.toFixed(2)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usos</p>
                    <p className="text-lg font-semibold">
                      {coupon.current_uses} / {coupon.max_uses || "∞"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="text-sm">
                      {format(new Date(coupon.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Válido até</p>
                    <p className="text-sm">
                      {format(new Date(coupon.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCouponDialog({ open: true, data: coupon })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteDialog({ open: true, id: coupon.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {coupons.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum cupom cadastrado
            </CardContent>
          </Card>
        )}
      </div>

      <CouponFormDialog
        open={couponDialog.open}
        onOpenChange={(open) => setCouponDialog({ open, data: null })}
        coupon={couponDialog.data}
        onSuccess={fetchCoupons}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open, id: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
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
