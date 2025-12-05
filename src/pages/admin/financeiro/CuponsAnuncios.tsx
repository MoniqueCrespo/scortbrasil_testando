import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

const CuponsAnuncios = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: "1",
      code: "BEMVINDO20",
      type: "percentage",
      value: 20,
      minValue: 50,
      maxUses: 100,
      usedCount: 23,
      expiresAt: "2025-12-31",
      isActive: true,
    },
    {
      id: "2",
      code: "PROMO50",
      type: "fixed",
      value: 50,
      minValue: 100,
      maxUses: 50,
      usedCount: 12,
      expiresAt: "2025-06-30",
      isActive: true,
    },
  ]);

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minValue: "",
    maxUses: "",
    expiresAt: "",
  });

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: formData.code,
      type: formData.type,
      value: parseFloat(formData.value),
      minValue: parseFloat(formData.minValue),
      maxUses: parseInt(formData.maxUses),
      usedCount: 0,
      expiresAt: formData.expiresAt,
      isActive: true,
    };
    setCoupons([newCoupon, ...coupons]);
    toast.success("Cupom criado com sucesso!");
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minValue: "",
      maxUses: "",
      expiresAt: "",
    });
  };

  const toggleCoupon = (id: string) => {
    setCoupons(
      coupons.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
    toast.success("Status do cupom atualizado!");
  };

  const deleteCoupon = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cupom?")) {
      setCoupons(coupons.filter((c) => c.id !== id));
      toast.success("Cupom excluído!");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cupons de Desconto</h2>
        <p className="text-muted-foreground">
          Crie e gerencie cupons promocionais para anúncios
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cupons Ativos</CardTitle>
            <CardDescription>Lista de todos os cupons cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum cupom cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-semibold">
                          {coupon.code}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 w-6 p-0"
                            onClick={() => copyCode(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          {coupon.type === "percentage"
                            ? `${coupon.value}%`
                            : `R$ ${coupon.value.toFixed(2)}`}
                        </TableCell>
                        <TableCell>
                          {coupon.usedCount}/{coupon.maxUses}
                        </TableCell>
                        <TableCell>{new Date(coupon.expiresAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={coupon.isActive ? "default" : "secondary"}>
                            {coupon.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCoupon(coupon.id)}
                            >
                              <Switch checked={coupon.isActive} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCoupon(coupon.id)}
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

        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Cupom</CardTitle>
            <CardDescription>Adicione um novo cupom promocional</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Cupom</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="CODIGO"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Gerar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Desconto</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFormData({ ...formData, type: value })
                  }
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

              <div className="space-y-2">
                <Label htmlFor="value">Valor do Desconto</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === "percentage" ? "20" : "50.00"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minValue">Valor Mínimo (R$)</Label>
                <Input
                  id="minValue"
                  type="number"
                  step="0.01"
                  value={formData.minValue}
                  onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                  placeholder="100.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Limite de Usos</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Data de Expiração</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Cupom
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CuponsAnuncios;
