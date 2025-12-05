import { useMemo } from "react";
import { useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function useAdminBreadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: "Início", href: "/admin/dashboard" },
      { label: "Painel Admin", href: "/admin/dashboard" },
    ];

    // Map routes to breadcrumb configurations
    const routeMap: Record<string, BreadcrumbItem[]> = {
      "/admin/dashboard": [],
      
      // Analytics
      "/admin/analytics": [{ label: "Analytics" }],
      "/admin/analytics/performance-modelos": [
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Performance de Modelos" },
      ],
      "/admin/analytics/analise-comparativa": [
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Análise Comparativa" },
      ],
      
      // Moderação
      "/admin/ads-moderation": [{ label: "Moderação de Anúncios" }],
      "/admin/verificacoes": [{ label: "Verificações de Identidade" }],
      "/admin/denuncias": [{ label: "Denúncias" }],
      
      // Financeiro
      "/admin/financeiro/planos-monetizacao": [
        { label: "Financeiro", href: "/admin/financeiro/planos-monetizacao" },
        { label: "Planos e Monetização" },
      ],
      "/admin/financeiro/transacoes-receita": [
        { label: "Financeiro", href: "/admin/financeiro/planos-monetizacao" },
        { label: "Transações e Receita" },
      ],
      "/admin/financeiro/boosts-performance": [
        { label: "Financeiro", href: "/admin/financeiro/planos-monetizacao" },
        { label: "Boosts e Performance" },
      ],
      
      // Conteúdo
      "/admin/conteudo/gestao-cidades": [
        { label: "Conteúdo", href: "/admin/conteudo/gestao-cidades" },
        { label: "Gestão de Cidades" },
      ],
      "/admin/conteudo/gestao-categorias": [
        { label: "Conteúdo", href: "/admin/conteudo/gestao-cidades" },
        { label: "Gestão de Categorias" },
      ],
      "/admin/conteudo/configuracoes-seo": [
        { label: "Conteúdo", href: "/admin/conteudo/gestao-cidades" },
        { label: "Configurações SEO" },
      ],
      
      // Configurações
      "/admin/configuracoes": [{ label: "Configurações Gerais" }],
      "/admin/configuracoes-notificacoes": [
        { label: "Configurações", href: "/admin/configuracoes" },
        { label: "Notificações" },
      ],
      "/admin/logs-auditoria": [
        { label: "Configurações", href: "/admin/configuracoes" },
        { label: "Logs de Auditoria" },
      ],
    };

    const routeItems = routeMap[pathname] || [{ label: "Página" }];
    return [...items, ...routeItems];
  }, [pathname]);

  return breadcrumbs;
}
