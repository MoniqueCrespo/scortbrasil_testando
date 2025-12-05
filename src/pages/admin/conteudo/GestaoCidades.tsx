import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Upload, Download, FileText, Database, Loader2 } from "lucide-react";

interface CitySEO {
  id: string;
  state_code: string;
  state_name: string;
  city_name: string;
  city_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  is_active: boolean;
}

const GestaoCidades = () => {
  const [cities, setCities] = useState<CitySEO[]>([]);
  const [filteredCities, setFilteredCities] = useState<CitySEO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPopulatingBrazil, setIsPopulatingBrazil] = useState(false);
  const [editingCity, setEditingCity] = useState<CitySEO | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCities, setTotalCities] = useState(0);
  const itemsPerPage = 50;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    state_code: "",
    state_name: "",
    city_name: "",
    city_slug: "",
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCities();
  }, [currentPage, searchTerm, stateFilter]);

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("cities_seo")
        .select("*", { count: 'exact' })
        .order("state_code", { ascending: true })
        .order("city_name", { ascending: true });

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`city_name.ilike.%${searchTerm}%,state_name.ilike.%${searchTerm}%`);
      }

      if (stateFilter !== "all") {
        query = query.eq("state_code", stateFilter);
      }

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      
      setCities(data || []);
      setFilteredCities(data || []);
      setTotalCities(count || 0);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      toast.error("Erro ao carregar cidades");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCity) {
        const { error } = await supabase
          .from("cities_seo")
          .update(formData)
          .eq("id", editingCity.id);

        if (error) throw error;
        toast.success("Cidade atualizada!");
      } else {
        const { error } = await supabase
          .from("cities_seo")
          .insert([formData]);

        if (error) throw error;
        toast.success("Cidade criada!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCities();
    } catch (error) {
      console.error("Erro ao salvar cidade:", error);
      toast.error("Erro ao salvar cidade");
    }
  };

  const handleEdit = (city: CitySEO) => {
    setEditingCity(city);
    setFormData({
      state_code: city.state_code,
      state_name: city.state_name,
      city_name: city.city_name,
      city_slug: city.city_slug,
      meta_title: city.meta_title || "",
      meta_description: city.meta_description || "",
      canonical_url: city.canonical_url || "",
      is_active: city.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (cityId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cidade?")) return;

    try {
      const { error } = await supabase
        .from("cities_seo")
        .delete()
        .eq("id", cityId);

      if (error) throw error;
      toast.success("Cidade excluída!");
      fetchCities();
    } catch (error) {
      console.error("Erro ao excluir cidade:", error);
      toast.error("Erro ao excluir cidade");
    }
  };

  const resetForm = () => {
    setEditingCity(null);
    setFormData({
      state_code: "",
      state_name: "",
      city_name: "",
      city_slug: "",
      meta_title: "",
      meta_description: "",
      canonical_url: "",
      is_active: true,
    });
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['state_code', 'state_name', 'city_name', 'city_slug', 'meta_title', 'meta_description', 'canonical_url', 'is_active'].join(','),
      ...cities.map(city => [
        city.state_code,
        `"${city.state_name}"`,
        `"${city.city_name}"`,
        city.city_slug,
        `"${city.meta_title || ''}"`,
        `"${city.meta_description || ''}"`,
        `"${city.canonical_url || ''}"`,
        city.is_active ? '1' : '0'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cidades_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV exportado com sucesso!');
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const requiredHeaders = ['state_code', 'state_name', 'city_name', 'city_slug'];
      const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
      
      if (!hasRequiredHeaders) {
        throw new Error('CSV deve conter as colunas: state_code, state_name, city_name, city_slug');
      }

      const citiesToImport = lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
        const cityData: any = {};
        headers.forEach((header, index) => {
          cityData[header] = values[index] || '';
        });
        
        return {
          state_code: cityData.state_code?.toUpperCase(),
          state_name: cityData.state_name,
          city_name: cityData.city_name,
          city_slug: cityData.city_slug,
          meta_title: cityData.meta_title || null,
          meta_description: cityData.meta_description || null,
          canonical_url: cityData.canonical_url || null,
          is_active: cityData.is_active === '1' || cityData.is_active === 'true' || cityData.is_active === 'TRUE',
        };
      }).filter(city => city.state_code && city.city_name && city.city_slug);

      if (citiesToImport.length === 0) {
        throw new Error('Nenhuma cidade válida encontrada no CSV');
      }

      const { error } = await supabase
        .from('cities_seo')
        .upsert(citiesToImport, {
          onConflict: 'city_slug,state_code'
        });

      if (error) throw error;

      toast.success(`${citiesToImport.length} cidades importadas com sucesso!`);
      fetchCities();
    } catch (error: any) {
      console.error('Erro ao importar CSV:', error);
      toast.error(error.message || 'Erro ao importar CSV');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['state_code', 'state_name', 'city_name', 'city_slug', 'meta_title', 'meta_description', 'canonical_url', 'is_active'].join(','),
      ['SP', '"São Paulo"', '"São Paulo"', 'sao-paulo', '"Acompanhantes em São Paulo - SP"', '"Encontre as melhores acompanhantes em São Paulo"', '"/acompanhantes/sao-paulo/sao-paulo"', '1'].join(','),
      ['RJ', '"Rio de Janeiro"', '"Rio de Janeiro"', 'rio-de-janeiro', '"Acompanhantes no Rio de Janeiro - RJ"', '"Encontre as melhores acompanhantes no Rio"', '"/acompanhantes/rio-de-janeiro/rio-de-janeiro"', '1'].join(',')
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_cidades.csv';
    link.click();
    toast.success('Template baixado!');
  };

  const handlePopulateBrazil = async () => {
    if (!confirm('Isto irá importar todas as cidades e estados do Brasil com SEO pré-configurado. Continuar?')) {
      return;
    }

    setIsPopulatingBrazil(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-brazil-locations');

      if (error) throw error;

      if (data?.success) {
        toast.success(`${data.totalCities} cidades importadas de ${data.totalStates} estados!`);
        fetchCities();
      } else {
        throw new Error(data?.error || 'Erro ao popular dados');
      }
    } catch (error: any) {
      console.error('Erro ao popular Brasil:', error);
      toast.error(error.message || 'Erro ao importar cidades do Brasil');
    } finally {
      setIsPopulatingBrazil(false);
    }
  };

  // Buscar estados únicos dos dados carregados
  const [allStates, setAllStates] = useState<{code: string, name: string}[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        // Buscar TODAS as cidades sem limite para extrair estados únicos
        const { data, error } = await supabase
          .from("cities_seo")
          .select("state_code, state_name")
          .limit(10000); // Aumentar limite para garantir todos os estados
        
        if (error) {
          console.error("Erro ao carregar estados:", error);
          return;
        }
        
        if (data) {
          // Extrair estados únicos usando Map
          const uniqueStates = Array.from(
            new Map(data.map(d => [d.state_code, { code: d.state_code, name: d.state_name }])).values()
          ).sort((a, b) => a.name.localeCompare(b.name));
          
          console.log("Estados carregados:", uniqueStates.length, uniqueStates);
          setAllStates(uniqueStates);
        }
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
      }
    };
    fetchStates();
  }, []);

  const totalPages = Math.ceil(totalCities / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCities);

  return (
    <AdminLayout title="Gestão de Cidades">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestão de Cidades</h2>
            <p className="text-muted-foreground">Configure SEO para cidades e importe em massa via CSV</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button 
              variant="default" 
              onClick={handlePopulateBrazil} 
              disabled={isPopulatingBrazil}
              className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
            >
              {isPopulatingBrazil ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando Brasil...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Importar Todo o Brasil
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <FileText className="h-4 w-4 mr-2" />
              Template CSV
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={cities.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importando...' : 'Importar CSV'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Cidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCity ? "Editar Cidade" : "Nova Cidade"}</DialogTitle>
                  <DialogDescription>
                    Preencha os dados SEO da cidade
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="state_code">Código UF</Label>
                        <Input
                          id="state_code"
                          value={formData.state_code}
                          onChange={(e) => setFormData({ ...formData, state_code: e.target.value.toUpperCase() })}
                          placeholder="SP"
                          maxLength={2}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state_name">Nome do Estado</Label>
                        <Input
                          id="state_name"
                          value={formData.state_name}
                          onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
                          placeholder="São Paulo"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city_name">Nome da Cidade</Label>
                        <Input
                          id="city_name"
                          value={formData.city_name}
                          onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
                          placeholder="São Paulo"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="city_slug">Slug da Cidade</Label>
                        <Input
                          id="city_slug"
                          value={formData.city_slug}
                          onChange={(e) => setFormData({ ...formData, city_slug: e.target.value })}
                          placeholder="sao-paulo"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        placeholder="Acompanhantes em São Paulo - SP"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        placeholder="Encontre as melhores acompanhantes em São Paulo..."
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="canonical_url">URL Canônica</Label>
                      <Input
                        id="canonical_url"
                        value={formData.canonical_url}
                        onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                        placeholder="/acompanhantes/sp/sao-paulo"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Cidade ativa</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCity ? "Atualizar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Cidades Cadastradas</CardTitle>
                <CardDescription>
                  {totalCities > 0 
                    ? `Exibindo ${startItem} a ${endItem} de ${totalCities.toLocaleString('pt-BR')} cidades`
                    : 'Nenhuma cidade cadastrada'}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-4 pt-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cidade ou estado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {allStates.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name} - {state.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Meta Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Carregando cidades...
                      </TableCell>
                    </TableRow>
                  ) : filteredCities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma cidade encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">{city.city_name}</TableCell>
                        <TableCell>
                          {city.state_code} - {city.state_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{city.city_slug}</TableCell>
                        <TableCell className="max-w-xs truncate">{city.meta_title || "-"}</TableCell>
                        <TableCell>
                          {city.is_active ? (
                            <Badge variant="default">Ativa</Badge>
                          ) : (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(city)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(city.id)}>
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
            
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {currentPage > 2 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 3 && <PaginationEllipsis />}
                      </>
                    )}
                    
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage - 1)} className="cursor-pointer">
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationLink isActive>
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage + 1)} className="cursor-pointer">
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <PaginationEllipsis />}
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default GestaoCidades;
