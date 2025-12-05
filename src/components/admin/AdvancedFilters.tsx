import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  filterType: "models" | "verifications" | "moderation" | "reports";
}

export interface FilterValues {
  search?: string;
  status?: string;
  state?: string;
  city?: string;
  category?: string;
  verified?: string;
  featured?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const AdvancedFilters = ({ onFilterChange, filterType }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== "all");

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, ID..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <CollapsibleContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Status filter */}
              {(filterType === "verifications" || filterType === "moderation" || filterType === "reports") && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status || "all"} onValueChange={(v) => handleFilterChange("status", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category filter */}
              {filterType === "models" && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={filters.category || "all"} onValueChange={(v) => handleFilterChange("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="mulheres">Mulheres</SelectItem>
                      <SelectItem value="homens">Homens</SelectItem>
                      <SelectItem value="trans">Trans</SelectItem>
                      <SelectItem value="casais">Casais</SelectItem>
                      <SelectItem value="massagistas">Massagistas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* State filter */}
              {filterType === "models" && (
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={filters.state || "all"} onValueChange={(v) => handleFilterChange("state", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Verified filter */}
              {filterType === "models" && (
                <div className="space-y-2">
                  <Label>Verificado</Label>
                  <Select value={filters.verified || "all"} onValueChange={(v) => handleFilterChange("verified", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Verificados</SelectItem>
                      <SelectItem value="false">Não Verificados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date From */}
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
