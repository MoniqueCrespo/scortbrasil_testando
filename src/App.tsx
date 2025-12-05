import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CookieConsent from "@/components/CookieConsent";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import Home from "./pages/Home";
import ManageProfiles from "./pages/ManageProfiles";
import CreateProfile from "./pages/CreateProfile";
import EditProfile from "./pages/EditProfile";
import ProfileVerification from "./pages/ProfileVerification";
import StateView from "./pages/StateView";
import LocationRouter from "./pages/LocationRouter";
import StateLocationRouter from "./pages/StateLocationRouter";
import ProfileDetail from "./pages/ProfileDetail";
import Favorites from "./pages/Favorites";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ClientAuth from "./pages/ClientAuth";
import ClientDashboard from "./pages/ClientDashboard";
import Dashboard from "./pages/Dashboard";
import ModelDashboard from "./pages/ModelDashboard";
import AdminVerifications from "./pages/AdminVerifications";
import AdminPlans from "./pages/AdminPlans";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminAdsModeration from "./pages/AdminAdsModeration";
import PremiumPlans from "./pages/PremiumPlans";
import MySubscriptions from "./pages/MySubscriptions";
import MinhasAssinaturas from "./pages/MinhasAssinaturas";
import ConteudoExclusivo from "./pages/ConteudoExclusivo";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/admin/Analytics";
import PerformanceModelos from "./pages/admin/analytics/PerformanceModelos";
import AnaliseComparativa from "./pages/admin/analytics/AnaliseComparativa";
import PlanosMonetizacao from "./pages/admin/financeiro/PlanosMonetizacao";
import TransacoesReceita from "./pages/admin/financeiro/TransacoesReceita";
import BoostsPerformance from "./pages/admin/financeiro/BoostsPerformance";
import GestaoRenovacoes from "./pages/admin/financeiro/GestaoRenovacoes";
import AssinaturasConteudo from "./pages/admin/financeiro/AssinaturasConteudo";

import ConteudoSEO from "./pages/admin/ConteudoSEO";
import Denuncias from "./pages/admin/Denuncias";
import Configuracoes from "./pages/admin/Configuracoes";
import ConfiguracoesNotificacoes from "./pages/admin/ConfiguracoesNotificacoes";
import IntegracoesPagamento from "./pages/admin/configuracoes/IntegracoesPagamento";
import LogsAuditoria from "./pages/admin/LogsAuditoria";
import GestaoCidades from "./pages/admin/conteudo/GestaoCidades";
import GestaoCategorias from "./pages/admin/conteudo/GestaoCategorias";
import GestaoBairros from "./pages/admin/conteudo/GestaoBairros";
import ConfiguracoesSEO from "./pages/admin/conteudo/ConfiguracoesSEO";
import FeedExplorer from "./pages/FeedExplorer";
import Afiliados from "./pages/Afiliados";
import AfiliadosAuth from "./pages/AfiliadosAuth";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import GestaoAfiliados from "./pages/admin/GestaoAfiliados";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider>
            <AuthProvider>
              <AnalyticsScripts />
              <Toaster />
              <Sonner />
              <CookieConsent />
              <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<FeedExplorer />} />
            
            {/* === ESTRUTURA DE ROTAS HIERÁRQUICA === */}
            {/* Todas as rotas usam SIGLAS de estado (rj, sp, mg, etc) */}
            
            {/* Nível 1: Estado */}
            <Route path="/acompanhantes/:state" element={<StateView />} />
            
            {/* Nível 2: Cidade/Bairro OU Categoria (StateLocationRouter detecta automaticamente) */}
            <Route path="/acompanhantes/:state/:locationOrCategory" element={<StateLocationRouter />} />
            
            {/* Nível 3: Cidade/Bairro + Categoria (ou Perfil) */}
            <Route path="/acompanhantes/:state/:locationOrCategory/:category" element={<LocationRouter />} />
            
            {/* Nível 4: Cidade + Categoria + Perfil */}
            <Route path="/acompanhantes/:state/:locationOrCategory/:category/:profileSlug" element={<LocationRouter />} />
            
            {/* Nível 4: Perfil específico (legacy) */}
            <Route path="/perfil/:profileId" element={<ProfileDetail />} />


            {/* Páginas estáticas */}
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cliente/auth" element={<ClientAuth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/anuncios" element={
              <ProtectedRoute requiredRole="model">
                <ManageProfiles />
              </ProtectedRoute>
            } />
            <Route path="/anuncios/novo" element={
              <ProtectedRoute requiredRole="model">
                <CreateProfile />
              </ProtectedRoute>
            } />
            <Route path="/anuncios/editar/:profileId" element={
              <ProtectedRoute requiredRole="model">
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/verificacao" element={
              <ProtectedRoute requiredRole="model">
                <ProfileVerification />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/modelo" element={
              <ProtectedRoute requiredRole="model">
                <ModelDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/moderacao" element={
              <ProtectedRoute requiredRole="admin">
                <AdminAdsModeration />
              </ProtectedRoute>
            } />
            <Route path="/admin/verificacoes" element={
              <ProtectedRoute requiredRole="admin">
                <AdminVerifications />
              </ProtectedRoute>
            } />
            <Route path="/admin/planos" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPlans />
              </ProtectedRoute>
            } />
            {/* Novas rotas do painel admin */}
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics/performance-modelos" element={
              <ProtectedRoute requiredRole="admin">
                <PerformanceModelos />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics/analise-comparativa" element={
              <ProtectedRoute requiredRole="admin">
                <AnaliseComparativa />
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro/planos-monetizacao" element={
              <ProtectedRoute requiredRole="admin">
                <PlanosMonetizacao />
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro/transacoes-receita" element={
              <ProtectedRoute requiredRole="admin">
                <TransacoesReceita />
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro/boosts-performance" element={
              <ProtectedRoute requiredRole="admin">
                <BoostsPerformance />
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro/gestao-renovacoes" element={
              <ProtectedRoute requiredRole="admin">
                <GestaoRenovacoes />
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro/assinaturas-conteudo" element={
              <ProtectedRoute requiredRole="admin">
                <AssinaturasConteudo />
              </ProtectedRoute>
            } />
            <Route path="/admin/conteudo-seo/*" element={
              <ProtectedRoute requiredRole="admin">
                <ConteudoSEO />
              </ProtectedRoute>
            } />
            <Route path="/admin/denuncias" element={
              <ProtectedRoute requiredRole="admin">
                <Denuncias />
              </ProtectedRoute>
            } />
            <Route path="/admin/ads-moderation" element={
              <ProtectedRoute requiredRole="admin">
                <AdminAdsModeration />
              </ProtectedRoute>
            } />
            <Route path="/admin/conteudo/gestao-cidades" element={
              <ProtectedRoute requiredRole="admin">
                <GestaoCidades />
              </ProtectedRoute>
            } />
            <Route path="/admin/conteudo/gestao-categorias" element={
              <ProtectedRoute requiredRole="admin">
                <GestaoCategorias />
              </ProtectedRoute>
            } />
            <Route path="/admin/conteudo/gestao-bairros" element={
              <ProtectedRoute requiredRole="admin">
                <GestaoBairros />
              </ProtectedRoute>
            } />
            <Route path="/admin/conteudo/configuracoes-seo" element={
              <ProtectedRoute requiredRole="admin">
                <ConfiguracoesSEO />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
              <ProtectedRoute requiredRole="admin">
                <Configuracoes />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes/notificacoes" element={
              <ProtectedRoute requiredRole="admin">
                <ConfiguracoesNotificacoes />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes/integracoes" element={
              <ProtectedRoute requiredRole="admin">
                <IntegracoesPagamento />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs-auditoria" element={
              <ProtectedRoute requiredRole="admin">
                <LogsAuditoria />
              </ProtectedRoute>
            } />
            <Route path="/planos" element={<PremiumPlans />} />
            <Route path="/minhas-assinaturas" element={
              <ProtectedRoute>
                <MinhasAssinaturas />
              </ProtectedRoute>
            } />
            <Route path="/conteudo-exclusivo/:profileSlug" element={
              <ProtectedRoute>
                <ConteudoExclusivo />
              </ProtectedRoute>
            } />
            <Route path="/afiliados" element={<Afiliados />} />
            <Route path="/afiliados/auth" element={<AfiliadosAuth />} />
            <Route path="/dashboard/afiliado" element={
              <ProtectedRoute>
                <AffiliateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/cliente" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/afiliados" element={
              <ProtectedRoute requiredRole="admin">
                <GestaoAfiliados />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
