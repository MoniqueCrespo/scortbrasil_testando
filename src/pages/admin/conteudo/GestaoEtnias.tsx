import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Ethnicity {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

const GestaoEtnias = () => {
  const [ethnicities, setEthnicities] = useState<Ethnicity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEthnicity, setEditingEthnicity] = useState<Ethnicity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    is_active: true,
  });

  useEffect(() => {
    fetchEthnicities();
  }, []);

  const fetchEthnicities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ethnicities")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setEthnicities(data || []);
    } catch (error) {
      console.error("Erro ao carregar etnias:", error);
      toast.error("Erro ao carregar etnias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEthnicity) {
        const { error } = await supabase
          .from("ethnicities")
          .update(formData)
          .eq("id", editingEthnicity.id);

        if (error) throw error;
        toast.success("Etnia atualizada!");
      } else {
        const { error } = await supabase
          .from("ethnicities")
          .insert([{ ...formData, sort_order: ethnicities.length }]);

        if (error) throw error;
        toast.success("Etnia criada!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEthnicities();
    } catch (error) {
      console.error("Erro ao salvar etnia:", error);
      toast.error("Erro ao salvar etnia");
    }
  };

  const handleEdit = (ethnicity: Ethnicity) => {
    setEditingEthnicity(ethnicity);
    setFormData({
      name: ethnicity.name,
      is_active: ethnicity.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (ethnicityId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta etnia?")) return;

    try {
      const { error } = await supabase
        .from("ethnicities")
        .delete()
        .eq("id", ethnicityId);

      if (error) throw error;
      toast.success("Etnia excluída!");
      fetchEthnicities();
    } catch (error) {
      console.error("Erro ao excluir etnia:", error);
      toast.error("Erro ao excluir etnia");
    }
  };

  const resetForm = () => {
    setEditingEthnicity(null);
    setFormData({
      name: "",
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Etnias</h2>
          <p className="text-muted-foreground">Gerencie as opções de etnia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Etnia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEthnicity ? "Editar Etnia" : "Nova Etnia"}</DialogTitle>
              <DialogDescription>
                Preencha os dados da etnia
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Branca, Negra, Parda..."
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Etnia ativa</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEthnicity ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etnias Cadastradas</CardTitle>
          <CardDescription>Lista de todas as etnias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Carregando etnias...
                    </TableCell>
                  </TableRow>
                ) : ethnicities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Nenhuma etnia cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  ethnicities.map((ethnicity) => (
                    <TableRow key={ethnicity.id}>
                      <TableCell className="font-medium">{ethnicity.name}</TableCell>
                      <TableCell>
                        {ethnicity.is_active ? (
                          <Badge variant="default">Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(ethnicity)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(ethnicity.id)}>
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
    </div>
  );
};

export default GestaoEtnias;
