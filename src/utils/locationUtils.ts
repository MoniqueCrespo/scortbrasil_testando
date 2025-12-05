import { brazilStates } from "@/data/locations";

/**
 * Converte nome completo do estado para sigla
 * Ex: "Rio de Janeiro" -> "rj"
 */
export const getStateCodeFromName = (stateName: string): string | null => {
  const state = brazilStates.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  return state ? state.code.toLowerCase() : null;
};

/**
 * Converte cidade para slug
 * Ex: "Rio de Janeiro" -> "rio-de-janeiro"
 */
export const getCitySlug = (cityName: string): string => {
  return cityName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Gera URL do perfil no formato correto
 * Ex: /acompanhantes/rj/rio-de-janeiro/julia-santos
 */
export const getProfileUrl = (
  stateCode: string,
  citySlug: string,
  profileSlug: string
): string => {
  // stateCode já vem como sigla (RJ, SP, etc)
  const normalizedStateCode = stateCode.toLowerCase();
  const normalizedCitySlug = getCitySlug(citySlug);
  
  return `/acompanhantes/${normalizedStateCode}/${normalizedCitySlug}/${profileSlug}`;
};
