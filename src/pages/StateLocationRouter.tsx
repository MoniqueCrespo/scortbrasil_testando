import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StateView from './StateView';
import LocationRouter from './LocationRouter';
import { CategoryType } from '@/types/location';
import { Loader2 } from 'lucide-react';

/**
 * StateLocationRouter - Router inteligente que detecta se o parâmetro é categoria ou localização
 * 
 * Rotas possíveis:
 * - /acompanhantes/:state/:category (ex: /acompanhantes/rj/homens) → StateView
 * - /acompanhantes/:state/:location (ex: /acompanhantes/rj/duque-de-caxias) → LocationRouter
 */
const StateLocationRouter = () => {
  const { state: stateParam, locationOrCategory } = useParams<{
    state: string;
    locationOrCategory: string;
  }>();
  
  const [component, setComponent] = useState<'state' | 'location' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectType = () => {
      if (!stateParam || !locationOrCategory) {
        setComponent(null);
        setIsLoading(false);
        return;
      }

      // Lista de categorias válidas
      const validCategories: CategoryType[] = ['mulheres', 'homens', 'trans', 'casais', 'massagistas'];
      
      // Se o parâmetro é uma categoria válida → StateView
      if (validCategories.includes(locationOrCategory as CategoryType)) {
        setComponent('state');
      } else {
        // Caso contrário, é uma cidade/bairro → LocationRouter
        setComponent('location');
      }
      
      setIsLoading(false);
    };

    detectType();
  }, [stateParam, locationOrCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!component) {
    return <Navigate to="/404" replace />;
  }

  // Se é categoria → renderiza StateView
  if (component === 'state') {
    return <StateView />;
  }

  // Se é localização → delega para LocationRouter
  return <LocationRouter />;
};

export default StateLocationRouter;
