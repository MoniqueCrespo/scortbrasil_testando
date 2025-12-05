import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Grid3x3, List, Heart } from "lucide-react";

interface FilterBarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFiltersClick: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showOnlyFavorites?: boolean;
  onToggleFavorites?: () => void;
}

const FilterBar = ({ viewMode, onViewModeChange, onFiltersClick, selectedCategory, onCategoryChange, showOnlyFavorites, onToggleFavorites }: FilterBarProps) => {
  const categories = ["Todos", "Destaque", "Novos", "Premium", "Verificados", "Populares", "Com Stories"];
  
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile: Stack vertically */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Categories - Horizontal scroll on mobile */}
          <div className="overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            <div className="flex items-center gap-2 min-w-max md:min-w-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category)}
                  className={category === selectedCategory ? "bg-gradient-to-r from-primary to-primary hover:opacity-90" : "hover:bg-secondary hover:text-secondary-foreground"}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`rounded-none h-9 px-3 ${viewMode === 'grid' ? 'bg-secondary' : ''}`}
                onClick={() => onViewModeChange('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`rounded-none h-9 px-3 border-l border-border ${viewMode === 'list' ? 'bg-secondary' : ''}`}
                onClick={() => onViewModeChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {onToggleFavorites && (
              <Button 
                variant={showOnlyFavorites ? "default" : "outline"}
                size="sm" 
                className={`gap-2 min-h-[44px] md:min-h-0 ${showOnlyFavorites ? 'bg-gradient-to-r from-primary to-primary hover:opacity-90' : ''}`}
                onClick={onToggleFavorites}
              >
                <Heart className={`h-4 w-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Favoritos</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 min-h-[44px] md:min-h-0 w-full md:w-auto" 
              onClick={onFiltersClick}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="md:inline">Filtros</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
