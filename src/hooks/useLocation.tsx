import { useParams, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { CategoryType } from "@/types/location";
import { getStateBySlug, getStateByCode, getCityBySlug } from "@/data/locations";

export const useLocation = () => {
  const { 
    state: stateParam, 
    city: citySlug, 
    location: locationSlug,
    category: categoryParam 
  } = useParams<{
    state?: string;
    city?: string;
    location?: string;
    category?: CategoryType;
  }>();
  
  const navigate = useNavigate();
  const location = useRouterLocation();

  // Detectar se stateParam é sigla (2 caracteres) ou slug completo
  const state = stateParam 
    ? (stateParam.length === 2 ? getStateByCode(stateParam.toUpperCase()) : getStateBySlug(stateParam))
    : undefined;
  
  // citySlug pode vir do parâmetro :city ou :location dependendo da rota
  const effectiveCitySlug = citySlug || locationSlug;
  const city = effectiveCitySlug && state ? getCityBySlug(effectiveCitySlug, state.code) : undefined;
  
  // Detectar categoria da URL (pathname) quando não há parâmetro :category
  let category: CategoryType = 'mulheres';
  
  if (categoryParam) {
    // Se há parâmetro :category na rota, usar ele
    category = categoryParam as CategoryType;
  } else if (location.pathname.includes('/homens')) {
    category = 'homens';
  } else if (location.pathname.includes('/trans')) {
    category = 'trans';
  } else if (location.pathname.includes('/casais')) {
    category = 'casais';
  } else if (location.pathname.includes('/massagistas')) {
    category = 'massagistas';
  }

  const changeLocation = (newStateCode: string, newCitySlug?: string) => {
    // Usar sigla do estado em vez de slug completo
    if (newCitySlug) {
      navigate(`/acompanhantes/${newStateCode.toLowerCase()}/${newCitySlug}`);
    } else {
      navigate(`/acompanhantes/${newStateCode.toLowerCase()}`);
    }
  };

  const changeCategory = (newCategory: CategoryType) => {
    // Usar sigla do estado e manter o contexto da localização atual (cidade ou bairro)
    const stateCode = state?.code.toLowerCase();
    const currentLocation = effectiveCitySlug;
    
    if (stateCode && currentLocation) {
      // Se a categoria for "mulheres", não incluir na URL (SEO otimizado)
      if (newCategory === 'mulheres') {
        navigate(`/acompanhantes/${stateCode}/${currentLocation}`);
      } else {
        navigate(`/acompanhantes/${stateCode}/${currentLocation}/${newCategory}`);
      }
    } else if (stateCode) {
      // Navigation for state-level pages
      if (newCategory === 'mulheres') {
        navigate(`/acompanhantes/${stateCode}`);
      } else {
        navigate(`/acompanhantes/${stateCode}/${newCategory}`);
      }
    }
  };

  const goToCategories = () => {
    const stateCode = state?.code.toLowerCase();
    if (stateCode && citySlug) {
      navigate(`/acompanhantes/${stateCode}/${citySlug}/categorias`);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    stateSlug: state?.code.toLowerCase(), // Retornar sigla em vez de slug
    citySlug: effectiveCitySlug,
    category,
    state,
    city,
    changeLocation,
    changeCategory,
    goToCategories,
    goBack,
  };
};
