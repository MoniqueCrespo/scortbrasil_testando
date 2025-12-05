import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Wallet,
  Headphones,
  FileEdit,
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Package,
  Zap,
  Tag,
  RefreshCw,
  LineChart,
  FileText,
  Users,
  AlertCircle,
  MapPin,
  Palette,
  Grid,
  Code,
  FileCode,
  Settings,
  Menu as MenuIcon,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminPendingCounts } from "@/hooks/useAdminPendingCounts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/admin/dashboard",
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    items: [
      { title: "Performance de Modelos", url: "/admin/analytics/performance-modelos" },
      { title: "Análise Comparativa", url: "/admin/analytics/analise-comparativa" },
    ],
  },
  {
    title: "Moderação",
    icon: AlertCircle,
    items: [
      { title: "Anúncios", url: "/admin/ads-moderation" },
      { title: "Verificações", url: "/admin/verificacoes" },
      { title: "Denúncias", url: "/admin/denuncias" },
    ],
  },
  {
    title: "Financeiro",
    icon: Wallet,
    items: [
      { title: "Planos e Monetização", url: "/admin/financeiro/planos-monetizacao" },
      { title: "Transações e Receita", url: "/admin/financeiro/transacoes-receita" },
      { title: "Boosts e Performance", url: "/admin/financeiro/boosts-performance" },
      { title: "Assinaturas de Conteúdo", url: "/admin/financeiro/assinaturas-conteudo" },
    ],
  },
  {
    title: "Conteúdo",
    icon: FileText,
    items: [
      { title: "Gestão de Cidades", url: "/admin/conteudo/gestao-cidades" },
      { title: "Gestão de Bairros", url: "/admin/conteudo/gestao-bairros" },
      { title: "Gestão de Categorias", url: "/admin/conteudo/gestao-categorias" },
      { title: "Configurações SEO", url: "/admin/conteudo/configuracoes-seo" },
    ],
  },
  {
    title: "Configurações",
    icon: Settings,
    items: [
      { title: "Gerais", url: "/admin/configuracoes" },
      { title: "Notificações", url: "/admin/configuracoes/notificacoes" },
      { title: "Integrações de Pagamento", url: "/admin/configuracoes/integracoes" },
      { title: "Logs de Auditoria", url: "/admin/logs-auditoria" },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { pendingAds, pendingVerifications, pendingReports } = useAdminPendingCounts();

  const isActive = (url: string) => location.pathname === url;
  const hasActiveChild = (items?: { url: string }[]) =>
    items?.some((item) => location.pathname.startsWith(item.url));

  const collapsed = state === "collapsed";

  // Map URLs to pending counts
  const getPendingCount = (url: string) => {
    switch (url) {
      case "/admin/ads-moderation":
        return pendingAds;
      case "/admin/verificacoes":
        return pendingVerifications;
      case "/admin/denuncias":
        return pendingReports;
      default:
        return 0;
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">
            {!collapsed && "Admin Panel"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (!item.items) {
                  // Item simples sem subitens
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Item com subitens (collapsible)
                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={hasActiveChild(item.items)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && (
                            <>
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const pendingCount = getPendingCount(subItem.url);
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                    <Link to={subItem.url} className="flex items-center justify-between w-full">
                                      <span>{subItem.title}</span>
                                      {pendingCount > 0 && (
                                        <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                                          {pendingCount}
                                        </Badge>
                                      )}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
