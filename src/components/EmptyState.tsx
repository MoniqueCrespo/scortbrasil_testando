import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Heart, Filter } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'no-profiles' | 'no-favorites';
  category?: string;
  location?: string;
  onClearFilters?: () => void;
  onExploreNearby?: () => void;
}

export const EmptyState = ({
  type,
  category = 'perfis',
  location = '',
  onClearFilters,
  onExploreNearby,
}: EmptyStateProps) => {
  const getContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: <Filter className="w-16 h-16 text-muted-foreground/40" />,
          title: 'Nenhum perfil encontrado',
          description: `Não encontramos ${category} com esses filtros em ${location}.`,
          suggestions: [
            'Tente remover alguns filtros',
            'Expanda a área de busca',
            'Explore outras categorias',
          ],
          primaryAction: onClearFilters ? {
            label: 'Limpar Filtros',
            onClick: onClearFilters,
          } : undefined,
          secondaryAction: onExploreNearby ? {
            label: 'Ver Cidades Próximas',
            onClick: onExploreNearby,
          } : undefined,
        };
      
      case 'no-profiles':
        return {
          icon: <MapPin className="w-16 h-16 text-muted-foreground/40" />,
          title: `Ainda não há ${category} em ${location}`,
          description: 'Esta região ainda não possui anúncios publicados.',
          suggestions: [
            'Explore cidades próximas',
            'Veja outras categorias',
            'Volte mais tarde para novos perfis',
          ],
          primaryAction: onExploreNearby ? {
            label: 'Explorar Cidades Próximas',
            onClick: onExploreNearby,
          } : undefined,
        };
      
      case 'no-favorites':
        return {
          icon: <Heart className="w-16 h-16 text-muted-foreground/40" />,
          title: 'Nenhum perfil favoritado',
          description: 'Você ainda não adicionou perfis aos favoritos.',
          suggestions: [
            'Explore perfis na sua região',
            'Use o ícone de coração para salvar perfis',
            'Acesse seus favoritos a qualquer momento',
          ],
          primaryAction: {
            label: 'Explorar Perfis',
            onClick: () => window.location.href = '/',
          },
        };
      
      default:
        return {
          icon: <Search className="w-16 h-16 text-muted-foreground/40" />,
          title: 'Nenhum resultado',
          description: 'Não encontramos o que você está procurando.',
          suggestions: [],
        };
    }
  };

  const content = getContent();

  return (
    <Card className="p-8 md:p-12 text-center max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-full bg-muted p-6">
          {content.icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">{content.title}</h3>
          <p className="text-muted-foreground text-lg">{content.description}</p>
        </div>

        {content.suggestions.length > 0 && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">Sugestões:</p>
            <ul className="space-y-1">
              {content.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
          {content.primaryAction && (
            <Button 
              onClick={content.primaryAction.onClick}
              size="lg"
              className="w-full sm:w-auto"
            >
              {content.primaryAction.label}
            </Button>
          )}
          {content.secondaryAction && (
            <Button 
              onClick={content.secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              {content.secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
