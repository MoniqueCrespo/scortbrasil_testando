import { useLocation as useRouterLocation, useParams } from 'react-router-dom';
import { getStateByCode, getStateBySlug, getCityBySlug } from '@/data/locations';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

export const useBreadcrumbs = () => {
  const location = useRouterLocation();
  const params = useParams<{ state?: string; location?: string; city?: string; category?: string }>();

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [];
    const pathname = location.pathname;

    // Sempre começar com Home
    items.push({
      label: 'Brasil',
      href: '/',
    });

    // Detectar estado
    const stateParam = params.state;
    if (stateParam) {
      const state = stateParam.length === 2 
        ? getStateByCode(stateParam.toUpperCase())
        : getStateBySlug(stateParam);

      if (state) {
        const stateCode = state.code.toLowerCase();
        items.push({
          label: state.name,
          href: `/acompanhantes/${stateCode}`,
        });

        // Detectar cidade
        const locationParam = params.location || params.city;
        if (locationParam && state) {
          const city = getCityBySlug(locationParam, state.code);
          
          if (city) {
            items.push({
              label: city.name,
              href: `/acompanhantes/${stateCode}/${city.slug}/categorias`,
            });

            // Detectar categoria
            const categoryParam = params.category;
            if (categoryParam) {
              const categoryNames: Record<string, string> = {
                mulheres: 'Acompanhantes',
                homens: 'Homens',
                trans: 'Trans',
                casais: 'Casais',
                massagistas: 'Massagistas',
              };

              const categoryName = categoryNames[categoryParam] || categoryParam;
              const categoryUrl = categoryParam === 'mulheres'
                ? `/acompanhantes/${stateCode}/${city.slug}`
                : `/acompanhantes/${stateCode}/${city.slug}/${categoryParam}`;

              items.push({
                label: categoryName,
                href: categoryUrl,
                isCurrentPage: !pathname.includes('/perfil/') && !pathname.includes('/categorias'),
              });
            }
          }
        }
      }
    }

    // Marcar último item como página atual se não houver categoria
    if (items.length > 0 && !items.some(item => item.isCurrentPage)) {
      items[items.length - 1].isCurrentPage = true;
    }

    return items;
  }, [location.pathname, params]);

  // Gerar Schema.org JSON-LD
  const schemaMarkup = useMemo(() => {
    const itemListElement = breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${window.location.origin}${item.href}`,
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };
  }, [breadcrumbs]);

  return {
    breadcrumbs,
    schemaMarkup,
  };
};
