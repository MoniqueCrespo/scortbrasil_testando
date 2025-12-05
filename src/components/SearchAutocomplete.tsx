import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, User, X, Clock, ArrowRight, Trash2, TrendingUp, Flame } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface SearchAutocompleteProps {
  className?: string;
}

const SearchAutocomplete = ({ className }: SearchAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { results, searchHistory, trendingProfiles, trendingCities, isLoadingTrends, clearHistory, handleSelect } = useSearch(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleResultClick = (result: typeof results[0]) => {
    handleSelect(result);
    setQuery('');
    setIsOpen(false);
  };

  const handleClearInput = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'state':
      case 'city':
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
      case 'profile':
        return <User className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const showHistory = !query && searchHistory.length > 0;
  const showTrends = !query && searchHistory.length === 0 && !isLoadingTrends;
  const showDropdown = isOpen && (results.length > 0 || showHistory || showTrends);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar estados, cidades ou perfis..."
          className="pl-10 pr-10 h-11 bg-background border-border focus-visible:ring-primary"
        />
        {query && (
          <button
            onClick={handleClearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto"
        >
          {showHistory && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Buscas Recentes
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearHistory();
                  }}
                  className="h-7 text-xs hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>
            </>
          )}

          {!query && showHistory && (
            <div className="py-1">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground italic">
                  Clique em uma busca recente para acessá-la novamente
                </p>
              </div>
            </div>
          )}

          {(query || showHistory) && (
            <ul className="py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 hover:bg-accent/50 transition-colors flex items-center gap-3 group"
                  >
                    {result.type === 'profile' && result.image ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.image} alt={result.title} />
                        <AvatarFallback>{result.title[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getIcon(result.type)}
                      </div>
                    )}

                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
