import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getStateByCode, getStateBySlug, getCitiesByState } from '@/data/locations';
import { getAcompanhanteBySlug, getCidades } from '@/lib/wordpress-api';
import CityView from './CityView';
import Index from './Index';
import ProfileDetail from './ProfileDetail';
import { Loader2 } from 'lucide-react';
import { CategoryType } from '@/types/location';

/**
 * LocationRouter - Roteador hierárquico para localizações
 * Detecta se é cidade ou bairro e renderiza o componente apropriado
 */
const LocationRouter = () => {
  const { state: stateParam, locationOrCategory, category: categoryParam, profileSlug } = useParams<{
    state: string;
    locationOrCategory: string;
    category?: string;
    profileSlug?: string;
  }>();
  
  const location = locationOrCategory;
  
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [component, setComponent] = useState<'city' | 'index' | 'profile' | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      if (!stateParam || !location) {
        setRedirectTo('/404');
        setIsLoading(false);
        return;
      }

      // Resolver estado (aceitar sigla ou slug)
      let state = getStateByCode(stateParam.toUpperCase());
      if (!state) {
        state = getStateBySlug(stateParam);
      }
      
      if (!state) {
        setRedirectTo('/404');
        setIsLoading(false);
        return;
      }

      // Redirecionar slug completo para sigla
      if (stateParam.length > 2) {
        const url = categoryParam 
          ? `/acompanhantes/${state.code.toLowerCase()}/${location}/${categoryParam}`
          : `/acompanhantes/${state.code.toLowerCase()}/${location}`;
        setRedirectTo(url);
        setIsLoading(false);
        return;
      }

      // Verificar se location é uma cidade válida
      const cities = getCitiesByState(state.code);
      const cityData = cities.find(c => c.slug === location);

      // Se temos profileSlug (4º nível), verificar se é um perfil válido
      if (profileSlug) {
        try {
          const profileData = await getAcompanhanteBySlug(profileSlug);
          if (profileData) {
            setComponent('profile');
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Perfil não encontrado
        }
        
        // profileSlug inválido - 404
        setRedirectTo('/404');
        setIsLoading(false);
        return;
      }
      
      // Categorias válidas
      const validCategories: CategoryType[] = ['mulheres', 'homens', 'trans', 'casais', 'massagistas'];
      
      // Se categoryParam existe mas NÃO é uma categoria válida, pode ser um slug de perfil
      if (categoryParam && !validCategories.includes(categoryParam as CategoryType)) {
        try {
          const profileData = await getAcompanhanteBySlug(categoryParam);
          if (profileData) {
            // É um perfil - renderizar ProfileDetail
            setComponent('profile');
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Não é um perfil válido
        }
        
        // Não é categoria nem perfil - 404
        setRedirectTo('/404');
        setIsLoading(false);
        return;
      }
      
      const category = (categoryParam && validCategories.includes(categoryParam as CategoryType))
        ? categoryParam as CategoryType
        : 'mulheres';

      // Se cidade não existe nos dados locais, buscar da API
      if (!cityData) {
        try {
          const apiCidades = await getCidades();
          const apiCity = apiCidades.find(c => c.slug === location);
          
          if (apiCity) {
            setLocationData({
              state,
              city: {
                id: apiCity.id,
                name: apiCity.nome,
                slug: apiCity.slug,
                state: state.code,
                isNeighborhood: false
              },
              category
            });
            
            // Cidade COM categoria → Index (listagem)
            // Cidade SEM categoria → CityView (grid de categorias)
            if (categoryParam) {
              setComponent('index');
            } else {
              setComponent('city');
            }
            
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // API falhou
        }
        
        // Cidade não encontrada - renderiza Index mesmo assim (pode ser bairro)
        setLocationData({
          state,
          city: {
            id: location,
            name: location.charAt(0).toUpperCase() + location.slice(1).replace(/-/g, ' '),
            slug: location,
            state: state.code,
            isNeighborhood: true
          },
          category
        });
        setComponent('index');
        setIsLoading(false);
        return;
      }

      setLocationData({
        state,
        city: {
          id: cityData.slug,
          name: cityData.name,
          slug: cityData.slug,
          state: state.code,
          isNeighborhood: false
        },
        category
      });

      // Decisão de renderização:
      // - Cidade SEM categoria → CityView (grid de categorias)
      // - Cidade COM categoria → Index (listagem de perfis)
      if (!categoryParam) {
        setComponent('city');
      } else {
        setComponent('index');
      }

      setIsLoading(false);
    };

    detectLocation();
  }, [stateParam, location, categoryParam, profileSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (component === 'profile') {
    return <ProfileDetail />;
  }

  if (component === 'city' && locationData) {
    return <CityView state={locationData.state} city={locationData.city} />;
  }

  if (component === 'index') {
    return <Index />;
  }

  return null;
};

export default LocationRouter;
