import { useState } from 'react';
import { X, Save, Trash2, Bookmark, Search, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { FilterState, SavedFilter } from '@/hooks/useFilters';

interface AdvancedFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  savedFilters: SavedFilter[];
  onSaveFilters: (name: string) => void;
  onLoadFilter: (id: string) => void;
  onDeleteFilter: (id: string) => void;
  cities?: Array<{ id: string; name: string; slug: string; state: string }>;
  neighborhoods?: string[];
}

const AdvancedFilters = ({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onReset,
  savedFilters,
  onSaveFilters,
  onLoadFilter,
  onDeleteFilter,
  cities = [],
  neighborhoods = ['Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Zona Leste'],
}: AdvancedFiltersProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const eyeColors = ['Castanhos', 'Azuis', 'Verdes', 'Pretos', 'Mel'];
  const hairColors = ['Preto', 'Castanho', 'Loiro', 'Ruivo', 'Grisalho'];
  const services = [
    'Massagem',
    'Acompanhante',
    'Modelo',
    'Dança',
    'Fotografia',
    'Consultoria',
  ];
  const availabilities = [
    'Manhã (6h-12h)',
    'Tarde (12h-18h)',
    'Noite (18h-0h)',
    'Madrugada (0h-6h)',
    'Finais de semana',
  ];

  const toggleArrayValue = (
    key: 'eyeColor' | 'hairColor' | 'services' | 'availability' | 'neighborhoods',
    value: string
  ) => {
    const current = filters[key];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange(key, newValue);
  };

  const handleSaveFilters = () => {
    if (filterName.trim()) {
      onSaveFilters(filterName.trim());
      setFilterName('');
      setSaveDialogOpen(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
            <SheetDescription>
              Refine sua busca com filtros personalizados
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-200px)] px-4 mt-6 mb-4">
            <div className="space-y-6">
              {/* Busca por Nome */}
              <div className="space-y-3 px-1">
                <Label className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar por Nome
                </Label>
                <Input
                  type="text"
                  placeholder="Digite o nome do perfil..."
                  value={filters.searchName}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.slice(0, 100).replace(/[<>]/g, '');
                    onFilterChange('searchName', sanitizedValue);
                  }}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Filtro de Cidade */}
              {cities.length > 0 && (
                <>
                  <div className="space-y-3 px-1">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Filtrar por Cidade
                    </Label>
                    <Select 
                      value={filters.city} 
                      onValueChange={(value) => onFilterChange('city', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas as cidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as cidades</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.slug}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                </>
              )}

              {/* Filtros Salvos */}
              {savedFilters.length > 0 && (
                <div className="space-y-3 px-1">
                  <Label className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Filtros Salvos
                  </Label>
                  <div className="space-y-2">
                    {savedFilters.map(saved => (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between p-2 bg-secondary rounded-md"
                      >
                        <button
                          onClick={() => onLoadFilter(saved.id)}
                          className="text-sm flex-1 text-left hover:text-primary transition-colors"
                        >
                          {saved.name}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDeleteFilter(saved.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Faixa de Idade */}
              <div className="space-y-3 px-1">
                <Label>Faixa de Idade</Label>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium min-w-[50px]">
                    {filters.ageRange[0]} anos
                  </span>
                  <Slider
                    value={filters.ageRange}
                    onValueChange={value => onFilterChange('ageRange', value as [number, number])}
                    min={18}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium min-w-[50px] text-right">
                    {filters.ageRange[1]} anos
                  </span>
                </div>
              </div>

              <Separator />

              {/* Faixa de Preço */}
              <div className="space-y-3 px-1">
                <Label>Faixa de Preço (R$/hora)</Label>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium min-w-[60px]">
                    R$ {filters.priceRange[0]}
                  </span>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={value => onFilterChange('priceRange', value as [number, number])}
                    min={0}
                    max={1000}
                    step={50}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium min-w-[60px] text-right">
                    R$ {filters.priceRange[1]}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Distância */}
              <div className="space-y-3 px-1">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Distância Máxima
                </Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[filters.distance]}
                    onValueChange={value => onFilterChange('distance', value[0])}
                    min={1}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium min-w-[60px] text-right">
                    {filters.distance} km
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mostra perfis dentro do raio selecionado
                </p>
              </div>

              <Separator />

              {/* Características Físicas */}
              <div className="space-y-4 px-1">
                <h3 className="font-semibold">Características Físicas</h3>

                {/* Altura */}
                <div className="space-y-3">
                  <Label>Altura (cm)</Label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium min-w-[50px]">
                      {filters.height[0]}cm
                    </span>
                    <Slider
                      value={filters.height}
                      onValueChange={value => onFilterChange('height', value as [number, number])}
                      min={150}
                      max={190}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium min-w-[50px] text-right">
                      {filters.height[1]}cm
                    </span>
                  </div>
                </div>

                {/* Peso */}
                <div className="space-y-3">
                  <Label>Peso (kg)</Label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium min-w-[50px]">
                      {filters.weight[0]}kg
                    </span>
                    <Slider
                      value={filters.weight}
                      onValueChange={value => onFilterChange('weight', value as [number, number])}
                      min={45}
                      max={90}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium min-w-[50px] text-right">
                      {filters.weight[1]}kg
                    </span>
                  </div>
                </div>

                {/* Cor dos Olhos */}
                <div className="space-y-3">
                  <Label>Cor dos Olhos</Label>
                  <div className="flex flex-wrap gap-2">
                    {eyeColors.map(color => (
                      <Badge
                        key={color}
                        variant={filters.eyeColor.includes(color) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayValue('eyeColor', color)}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Cor do Cabelo */}
                <div className="space-y-3">
                  <Label>Cor do Cabelo</Label>
                  <div className="flex flex-wrap gap-2">
                    {hairColors.map(color => (
                      <Badge
                        key={color}
                        variant={filters.hairColor.includes(color) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayValue('hairColor', color)}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Serviços Oferecidos */}
              <div className="space-y-3 px-1">
                <Label>Serviços Oferecidos</Label>
                <div className="space-y-2">
                  {services.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service}`}
                        checked={filters.services.includes(service)}
                        onCheckedChange={() => toggleArrayValue('services', service)}
                      />
                      <label
                        htmlFor={`service-${service}`}
                        className="text-sm cursor-pointer"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Disponibilidade */}
              <div className="space-y-3 px-1">
                <Label>Disponibilidade</Label>
                <div className="space-y-2">
                  {availabilities.map(time => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox
                        id={`availability-${time}`}
                        checked={filters.availability.includes(time)}
                        onCheckedChange={() => toggleArrayValue('availability', time)}
                      />
                      <label
                        htmlFor={`availability-${time}`}
                        className="text-sm cursor-pointer"
                      >
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Bairro/Região */}
              <div className="space-y-3 pb-4 px-1">
                <Label>Bairro/Região</Label>
                <div className="flex flex-wrap gap-2">
                  {neighborhoods.map(neighborhood => (
                    <Badge
                      key={neighborhood}
                      variant={filters.neighborhoods.includes(neighborhood) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayValue('neighborhoods', neighborhood)}
                    >
                      {neighborhood}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer com ações */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onReset}
                className="flex-1"
              >
                Limpar
              </Button>
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(true)}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog para salvar filtros */}
      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar Filtros</AlertDialogTitle>
            <AlertDialogDescription>
              Dê um nome para este conjunto de filtros para acessá-lo rapidamente no futuro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Ex: Modelos Zona Sul"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveFilters()}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveFilters}>
              Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdvancedFilters;
