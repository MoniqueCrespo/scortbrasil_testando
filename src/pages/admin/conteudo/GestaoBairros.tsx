import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, Upload, Download, MapPin } from "lucide-react";
import { brazilStates } from "@/data/locations";

interface Neighborhood {
  id: string;
  state_code: string;
  city_slug: string;
  neighborhood_name: string;
  neighborhood_slug: string;
  is_active: boolean;
  created_at: string;
}

interface City {
  city_slug: string;
  city_name: string;
  state_code: string;
}

const GestaoBairros = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null);
  const [deletingNeighborhood, setDeletingNeighborhood] = useState<Neighborhood | null>(null);
  
  // Filtros
  const [stateFilter, setStateFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    state_code: "",
    city_slug: "",
    neighborhood_name: "",
    neighborhood_slug: "",
    is_active: true,
  });

  useEffect(() => {
    fetchNeighborhoods();
    fetchCities();
  }, [stateFilter, cityFilter]);

  const fetchCities = async () => {
    const { data, error } = await supabase
      .from("cities_seo")
      .select("city_slug, city_name, state_code")
      .eq("is_active", true)
      .eq("is_neighborhood", false)
      .order("city_name");

    if (error) {
      console.error("Erro ao carregar cidades:", error);
      return;
    }

    setCities(data || []);
  };

  const fetchNeighborhoods = async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from("neighborhoods")
        .select("*")
        .order("state_code")
        .order("neighborhood_name");

      if (stateFilter) {
        query = query.eq("state_code", stateFilter);
      }

      if (cityFilter) {
        query = query.eq("city_slug", cityFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar bairros:', error);
        toast({
          title: "Erro ao carregar bairros",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setNeighborhoods(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os bairros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBrazil = async () => {
    setIsImporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke(
        "populate-brazil-neighborhoods"
      );

      if (error) throw error;

      toast({
        title: "Importação concluída!",
        description: `${data.imported} bairros importados com sucesso.`,
      });

      fetchNeighborhoods();
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenDialog = (neighborhood?: Neighborhood) => {
    if (neighborhood) {
      setEditingNeighborhood(neighborhood);
      setFormData({
        state_code: neighborhood.state_code,
        city_slug: neighborhood.city_slug,
        neighborhood_name: neighborhood.neighborhood_name,
        neighborhood_slug: neighborhood.neighborhood_slug,
        is_active: neighborhood.is_active,
      });
    } else {
      setEditingNeighborhood(null);
      setFormData({
        state_code: "",
        city_slug: "",
        neighborhood_name: "",
        neighborhood_slug: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.state_code || !formData.city_slug || !formData.neighborhood_name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Auto-gerar slug se não fornecido
    const slug = formData.neighborhood_slug || 
      formData.neighborhood_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = {
      ...formData,
      neighborhood_slug: slug,
    };

    if (editingNeighborhood) {
      const { error } = await supabase
        .from("neighborhoods")
        .update(payload)
        .eq("id", editingNeighborhood.id);

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bairro atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      const { error } = await supabase.from("neighborhoods").insert([payload]);

      if (error) {
        toast({
          title: "Erro ao criar",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bairro criado!",
        description: "O bairro foi adicionado com sucesso.",
      });
    }

    setIsDialogOpen(false);
    fetchNeighborhoods();
  };

  const handleDelete = async () => {
    if (!deletingNeighborhood) return;

    const { error } = await supabase
      .from("neighborhoods")
      .delete()
      .eq("id", deletingNeighborhood.id);

    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bairro deletado",
      description: "O bairro foi removido com sucesso.",
    });

    setIsDeleteDialogOpen(false);
    setDeletingNeighborhood(null);
    fetchNeighborhoods();
  };

  const handleExportCSV = () => {
    const csv = [
      ["Estado", "Cidade", "Bairro", "Slug", "Ativo"].join(","),
      ...filteredNeighborhoods.map(n =>
        [n.state_code, n.city_slug, n.neighborhood_name, n.neighborhood_slug, n.is_active ? "Sim" : "Não"].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bairros-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.neighborhood_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    n.neighborhood_slug.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredCities = cities.filter(c => 
    stateFilter ? c.state_code === stateFilter : true
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Bairros</h1>
            <p className="text-muted-foreground">
              Gerencie os bairros cadastrados na plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleImportBrazil}
              disabled={isImporting}
              variant="outline"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isImporting ? "Importando..." : "Importar Bairros do Brasil"}
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Bairro
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Estado</Label>
            <Select value={stateFilter || "all"} onValueChange={(value) => setStateFilter(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {brazilStates.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cidade</Label>
            <Select value={cityFilter || "all"} onValueChange={(value) => setCityFilter(value === "all" ? "" : value)} disabled={!stateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {filteredCities.map((city) => (
                  <SelectItem key={city.city_slug} value={city.city_slug}>
                    {city.city_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Nome ou slug do bairro..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Total de Bairros</p>
            <p className="text-2xl font-bold">{neighborhoods.length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Bairros Ativos</p>
            <p className="text-2xl font-bold">
              {neighborhoods.filter((n) => n.is_active).length}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Resultados da Busca</p>
            <p className="text-2xl font-bold">{filteredNeighborhoods.length}</p>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredNeighborhoods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum bairro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredNeighborhoods.map((neighborhood) => (
                  <TableRow key={neighborhood.id}>
                    <TableCell className="font-medium">
                      {neighborhood.state_code.toUpperCase()}
                    </TableCell>
                    <TableCell>{neighborhood.city_slug}</TableCell>
                    <TableCell>{neighborhood.neighborhood_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {neighborhood.neighborhood_slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant={neighborhood.is_active ? "default" : "secondary"}>
                        {neighborhood.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(neighborhood)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingNeighborhood(neighborhood);
                            setIsDeleteDialogOpen(true);
                          }}
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
      </div>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNeighborhood ? "Editar Bairro" : "Novo Bairro"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do bairro
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Estado *</Label>
              <Select
                value={formData.state_code}
                onValueChange={(value) =>
                  setFormData({ ...formData, state_code: value, city_slug: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {brazilStates.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cidade *</Label>
              <Select
                value={formData.city_slug}
                onValueChange={(value) =>
                  setFormData({ ...formData, city_slug: value })
                }
                disabled={!formData.state_code}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities
                    .filter((c) => c.state_code === formData.state_code)
                    .map((city) => (
                      <SelectItem key={city.city_slug} value={city.city_slug}>
                        {city.city_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome do Bairro *</Label>
              <Input
                value={formData.neighborhood_name}
                onChange={(e) =>
                  setFormData({ ...formData, neighborhood_name: e.target.value })
                }
                placeholder="Ex: Copacabana"
              />
            </div>

            <div>
              <Label>Slug (deixe vazio para gerar automaticamente)</Label>
              <Input
                value={formData.neighborhood_slug}
                onChange={(e) =>
                  setFormData({ ...formData, neighborhood_slug: e.target.value })
                }
                placeholder="copacabana"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="is_active">Bairro ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Deletar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o bairro "{deletingNeighborhood?.neighborhood_name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default GestaoBairros;
