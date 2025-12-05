/**
 * React Hook para consumir a API WordPress
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAcompanhantes,
  getAcompanhanteBySlug,
  getCidades,
  getCategorias,
  getDestaques,
  type WordPressCidade,
  type WordPressCategoria,
} from '@/lib/wordpress-api';
import type { LocationProfile } from '@/types/location';

// Hook para listar acompanhantes com filtros
export function useAcompanhantes(params: {
  page?: number;
  per_page?: number;
  cidade?: string;
  categoria?: string;
  ordenar?: string;
  verificada?: boolean;
  online?: boolean;
  preco_min?: number;
  preco_max?: number;
} = {}) {
  const [profiles, setProfiles] = useState<LocationProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAcompanhantes(params);
      setProfiles(result.profiles);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    params.page,
    params.per_page,
    params.cidade,
    params.categoria,
    params.ordenar,
    params.verificada,
    params.online,
    params.preco_min,
    params.preco_max,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { profiles, total, pages, loading, error, refetch: fetchData };
}

// Hook para buscar perfil individual
export function useAcompanhante(slug: string | undefined) {
  const [profile, setProfile] = useState<LocationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAcompanhanteBySlug(slug);
        setProfile(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  return { profile, loading, error };
}

// Hook para listar cidades
export function useCidades() {
  const [cidades, setCidades] = useState<WordPressCidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCidades = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCidades();
        setCidades(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCidades();
  }, []);

  return { cidades, loading, error };
}

// Hook para listar categorias
export function useCategorias() {
  const [categorias, setCategorias] = useState<WordPressCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
}

// Hook para perfis em destaque
export function useDestaques(limit = 8) {
  const [destaques, setDestaques] = useState<LocationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDestaques = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDestaques(limit);
        setDestaques(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestaques();
  }, [limit]);

  return { destaques, loading, error };
}

// Hook combinado para dados da home
export function useHomeData() {
  const { destaques, loading: loadingDestaques } = useDestaques(8);
  const { cidades, loading: loadingCidades } = useCidades();
  const { categorias, loading: loadingCategorias } = useCategorias();

  return {
    destaques,
    cidades,
    categorias,
    loading: loadingDestaques || loadingCidades || loadingCategorias,
  };
}
