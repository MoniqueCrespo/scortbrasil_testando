/**
 * WordPress REST API Service
 * Integração com backend WordPress do ScortRio
 */

import type { LocationProfile } from '@/types/location';
import { mockProfiles } from '@/data/mockProfiles';

// URL base da API WordPress
const API_BASE_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'https://escortsacompanhantes.com/wp-json/scortrio/v1';

// Configuração de timeout e retries
const FETCH_TIMEOUT = 10000; // 10 segundos
const MAX_RETRIES = 2;

// Interface para resposta da API de acompanhantes
interface WordPressAcompanhante {
  id: number;
  nome: string;
  slug: string;
  idade: number;
  cidade: string;
  cidade_slug?: string;
  estado?: string;
  bairro?: string;
  valor_hora: number;
  foto_principal: string;
  fotos?: string[];
  headline?: string;
  descricao?: string;
  verificada: boolean;
  online: boolean;
  plano: 'free' | 'premium' | 'vip';
  categoria?: string;
  categoria_slug?: string;
  altura?: number;
  peso?: number;
  olhos?: string;
  cabelo?: string;
  servicos?: string[];
  horarios?: string[];
  bairros_atendimento?: string[];
  nota?: number;
  total_avaliacoes?: number;
  total_fotos?: number;
  atende_local?: boolean;
  whatsapp?: string;
  telefone?: string;
  created_at?: string;
}

interface WordPressCidade {
  id: number;
  nome: string;
  slug: string;
  count: number;
  estado?: string;
  estado_sigla?: string;
}

interface WordPressCategoria {
  id: number;
  nome: string;
  slug: string;
  count?: number;
}

interface ListagemResponse {
  data: WordPressAcompanhante[];
  total: number;
  pages: number;
  page: number;
}

// Função helper para fetch com timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Função helper para retry
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Backoff
      }
    }
  }
  
  throw lastError;
}

// Mapper: Converte dados do WordPress para formato do Lovable
function mapWordPressToProfile(wp: WordPressAcompanhante): LocationProfile {
  // Determinar categoria baseado no campo
  let category = 'mulheres';
  let gender = 'feminino';
  
  if (wp.categoria_slug) {
    if (wp.categoria_slug.includes('homem') || wp.categoria_slug.includes('homens')) {
      category = 'homens';
      gender = 'masculino';
    } else if (wp.categoria_slug.includes('trans')) {
      category = 'trans';
      gender = 'trans';
    } else if (wp.categoria_slug.includes('casal') || wp.categoria_slug.includes('casais')) {
      category = 'casais';
      gender = 'casal';
    } else if (wp.categoria_slug.includes('massag')) {
      category = 'massagistas';
    }
  }

  return {
    id: wp.id,
    name: wp.nome,
    location: wp.bairro ? `${wp.bairro}, ${wp.cidade}` : wp.cidade,
    age: wp.idade,
    rating: wp.nota || 0,
    image: wp.foto_principal || 'https://via.placeholder.com/400x600',
    description: wp.descricao || wp.headline || '',
    tags: wp.servicos?.slice(0, 3) || [],
    verified: wp.verificada,
    featured: wp.plano === 'vip' || wp.plano === 'premium',
    category,
    gender,
    state: wp.estado || 'RJ',
    city: wp.cidade_slug || wp.cidade.toLowerCase().replace(/\s+/g, '-'),
    price: wp.valor_hora,
    height: wp.altura,
    weight: wp.peso,
    eyeColor: wp.olhos,
    hairColor: wp.cabelo,
    services: wp.servicos || [],
    availability: wp.horarios || [],
    neighborhoods: wp.bairros_atendimento || [],
    isNew: wp.created_at ? isRecent(wp.created_at) : false,
    isOnline: wp.online,
    views: Math.floor(Math.random() * 5000) + 500,
    photos: wp.fotos || [wp.foto_principal],
  };
}

// Verifica se o perfil foi criado nas últimas 48h
function isRecent(dateString: string): boolean {
  const created = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffHours <= 48;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Busca lista de acompanhantes
 */
export async function getAcompanhantes(params: {
  page?: number;
  per_page?: number;
  cidade?: string;
  categoria?: string;
  ordenar?: string;
  verificada?: boolean;
  online?: boolean;
  preco_min?: number;
  preco_max?: number;
} = {}): Promise<{ profiles: LocationProfile[]; total: number; pages: number }> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    if (params.cidade) searchParams.set('cidade', params.cidade);
    if (params.categoria) searchParams.set('categoria', params.categoria);
    if (params.ordenar) searchParams.set('ordenar', params.ordenar);
    if (params.verificada) searchParams.set('verificada', '1');
    if (params.online) searchParams.set('online', '1');
    if (params.preco_min) searchParams.set('preco_min', String(params.preco_min));
    if (params.preco_max) searchParams.set('preco_max', String(params.preco_max));

    const url = `${API_BASE_URL}/acompanhantes?${searchParams.toString()}`;
    console.log('[WordPress API] Fetching:', url);
    
    const response = await fetchWithRetry(url);
    const data: ListagemResponse = await response.json();
    
    return {
      profiles: data.data.map(mapWordPressToProfile),
      total: data.total,
      pages: data.pages,
    };
  } catch (error) {
    console.error('[WordPress API] Error fetching acompanhantes:', error);
    
    // Fallback para dados mock
    let filteredProfiles = [...mockProfiles];
    
    if (params.cidade) {
      filteredProfiles = filteredProfiles.filter(p => 
        p.city?.toLowerCase() === params.cidade?.toLowerCase()
      );
    }
    
    if (params.categoria) {
      filteredProfiles = filteredProfiles.filter(p => 
        p.category?.toLowerCase() === params.categoria?.toLowerCase()
      );
    }
    
    if (params.verificada) {
      filteredProfiles = filteredProfiles.filter(p => p.verified);
    }
    
    if (params.online) {
      filteredProfiles = filteredProfiles.filter(p => p.isOnline);
    }
    
    const page = params.page || 1;
    const perPage = params.per_page || 12;
    const start = (page - 1) * perPage;
    const paginatedProfiles = filteredProfiles.slice(start, start + perPage);
    
    return {
      profiles: paginatedProfiles,
      total: filteredProfiles.length,
      pages: Math.ceil(filteredProfiles.length / perPage),
    };
  }
}

/**
 * Busca perfil individual por slug
 */
export async function getAcompanhanteBySlug(slug: string): Promise<LocationProfile | null> {
  try {
    const url = `${API_BASE_URL}/acompanhantes/${slug}`;
    console.log('[WordPress API] Fetching profile:', url);
    
    const response = await fetchWithRetry(url);
    const data: WordPressAcompanhante = await response.json();
    
    return mapWordPressToProfile(data);
  } catch (error) {
    console.error('[WordPress API] Error fetching profile:', error);
    
    // Fallback para dados mock
    const mockProfile = mockProfiles.find(p => 
      p.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );
    
    return mockProfile || null;
  }
}

/**
 * Busca lista de cidades
 */
export async function getCidades(): Promise<WordPressCidade[]> {
  try {
    const url = `${API_BASE_URL}/cidades`;
    console.log('[WordPress API] Fetching cidades:', url);
    
    const response = await fetchWithRetry(url);
    const data: WordPressCidade[] = await response.json();
    
    return data;
  } catch (error) {
    console.error('[WordPress API] Error fetching cidades:', error);
    
    // Fallback para cidades mock
    return [
      { id: 1, nome: 'Rio de Janeiro', slug: 'rio-de-janeiro', count: 150, estado_sigla: 'RJ' },
      { id: 2, nome: 'São Paulo', slug: 'sao-paulo', count: 200, estado_sigla: 'SP' },
      { id: 3, nome: 'Belo Horizonte', slug: 'belo-horizonte', count: 80, estado_sigla: 'MG' },
      { id: 4, nome: 'Brasília', slug: 'brasilia', count: 60, estado_sigla: 'DF' },
      { id: 5, nome: 'Salvador', slug: 'salvador', count: 70, estado_sigla: 'BA' },
      { id: 6, nome: 'Fortaleza', slug: 'fortaleza', count: 50, estado_sigla: 'CE' },
      { id: 7, nome: 'Curitiba', slug: 'curitiba', count: 45, estado_sigla: 'PR' },
      { id: 8, nome: 'Recife', slug: 'recife', count: 40, estado_sigla: 'PE' },
      { id: 9, nome: 'Porto Alegre', slug: 'porto-alegre', count: 35, estado_sigla: 'RS' },
      { id: 10, nome: 'Goiânia', slug: 'goiania', count: 30, estado_sigla: 'GO' },
      { id: 11, nome: 'Manaus', slug: 'manaus', count: 25, estado_sigla: 'AM' },
      { id: 12, nome: 'Florianópolis', slug: 'florianopolis', count: 40, estado_sigla: 'SC' },
    ];
  }
}

/**
 * Busca lista de categorias
 */
export async function getCategorias(): Promise<WordPressCategoria[]> {
  try {
    const url = `${API_BASE_URL}/categorias`;
    console.log('[WordPress API] Fetching categorias:', url);
    
    const response = await fetchWithRetry(url);
    const data: WordPressCategoria[] = await response.json();
    
    return data;
  } catch (error) {
    console.error('[WordPress API] Error fetching categorias:', error);
    
    // Fallback para categorias mock
    return [
      { id: 1, nome: 'Mulheres', slug: 'mulheres', count: 500 },
      { id: 2, nome: 'Homens', slug: 'homens', count: 100 },
      { id: 3, nome: 'Trans', slug: 'trans', count: 80 },
      { id: 4, nome: 'Casais', slug: 'casais', count: 30 },
      { id: 5, nome: 'Massagistas', slug: 'massagistas', count: 50 },
    ];
  }
}

/**
 * Busca perfis em destaque
 */
export async function getDestaques(limit = 8): Promise<LocationProfile[]> {
  try {
    const url = `${API_BASE_URL}/acompanhantes?per_page=${limit}&ordenar=popular&destaque=1`;
    console.log('[WordPress API] Fetching destaques:', url);
    
    const response = await fetchWithRetry(url);
    const data: ListagemResponse = await response.json();
    
    return data.data.map(mapWordPressToProfile);
  } catch (error) {
    console.error('[WordPress API] Error fetching destaques:', error);
    
    // Fallback para dados mock
    return mockProfiles
      .filter(p => p.featured)
      .slice(0, limit);
  }
}

/**
 * Busca perfis por cidade
 */
export async function getAcompanhantesPorCidade(cidade: string, limit = 12): Promise<LocationProfile[]> {
  const result = await getAcompanhantes({ cidade, per_page: limit });
  return result.profiles;
}

/**
 * Busca perfis por categoria
 */
export async function getAcompanhantesPorCategoria(categoria: string, limit = 12): Promise<LocationProfile[]> {
  const result = await getAcompanhantes({ categoria, per_page: limit });
  return result.profiles;
}

// Export types
export type { WordPressAcompanhante, WordPressCidade, WordPressCategoria, ListagemResponse };
