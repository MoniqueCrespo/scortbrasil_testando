import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { brazilStates, getCitiesByState, getNeighborhoodsByCity } from "@/data/locations";

interface FilterState {
  category: string;
  state: string;
  city: string;
  neighborhoods: string[];
  priceRange: [number, number];
  onlyVerified: boolean;
  onlyWithStories: boolean;
}

interface FeedFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const FeedFilters = ({ filters, onFilterChange }: FeedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  useEffect(() => {
    if (filters.state && filters.state !== 'todos') {
      // Converter slug para código do estado
      const selectedState = brazilStates.find(s => s.slug === filters.state);
      if (selectedState) {
        const stateCities = getCitiesByState(selectedState.code);
        setCities(stateCities);
      }
    } else {
      setCities([]);
    }
  }, [filters.state]);

  useEffect(() => {
    if (filters.city) {
      const cityNeighborhoods = getNeighborhoodsByCity(filters.city);
      setNeighborhoods(cityNeighborhoods);
    } else {
      setNeighborhoods([]);
    }
  }, [filters.city]);

  const activeFilterCount = [
    filters.category,
    filters.state,
    filters.city,
    filters.neighborhoods.length > 0,
    filters.onlyVerified,
    filters.onlyWithStories,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFilterChange({
      category: 'todos',
      state: 'todos',
      city: 'todos',
      neighborhoods: [],
      priceRange: [0, 1000],
      onlyVerified: false,
      onlyWithStories: false,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed top-20 left-4 z-40 rounded-full shadow-lg bg-card text-foreground border border-border hover:bg-muted"
          size="lg"
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filtros
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => onFilterChange({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="mulheres">Mulheres</SelectItem>
                <SelectItem value="homens">Homens</SelectItem>
                <SelectItem value="trans">Trans</SelectItem>
                <SelectItem value="casais">Casais</SelectItem>
                <SelectItem value="massagistas">Massagistas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filters.state}
              onValueChange={(value) => onFilterChange({ ...filters, state: value, city: 'todos', neighborhoods: [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {brazilStates.map((state) => (
                  <SelectItem key={state.code} value={state.slug}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Cidade */}
          {filters.state && filters.state !== 'todos' && (
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Select
                value={filters.city}
                onValueChange={(value) => onFilterChange({ ...filters, city: value, neighborhoods: [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.slug} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}
          
          {/* Faixa de Preço */}
          <div className="space-y-4">
            <Label>Faixa de Preço (R$/hora)</Label>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => onFilterChange({ ...filters, priceRange: value as [number, number] })}
                min={0}
                max={1000}
                step={50}
                className="mt-2"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>R$ {filters.priceRange[0]}</span>
                <span>R$ {filters.priceRange[1]}</span>
              </div>
            </div>
          </div>
          
          {/* Apenas Verificados */}
          <div className="flex items-center justify-between">
            <Label htmlFor="verified">Apenas Verificados</Label>
            <Switch
              id="verified"
              checked={filters.onlyVerified}
              onCheckedChange={(checked) => onFilterChange({ ...filters, onlyVerified: checked })}
            />
          </div>
          
          {/* Apenas com Stories */}
          <div className="flex items-center justify-between">
            <Label htmlFor="stories">Apenas com Stories</Label>
            <Switch
              id="stories"
              checked={filters.onlyWithStories}
              onCheckedChange={(checked) => onFilterChange({ ...filters, onlyWithStories: checked })}
            />
          </div>
          
          <Button
            className="w-full mt-6"
            onClick={() => setIsOpen(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FeedFilters;
