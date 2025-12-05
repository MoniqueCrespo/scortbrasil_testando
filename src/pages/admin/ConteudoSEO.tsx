import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Tag, Users, FileText, FileCode, Menu, Settings } from "lucide-react";
import GestaoCidades from "./conteudo/GestaoCidades";
import GestaoEtnias from "./conteudo/GestaoEtnias";
import GestaoCategorias from "./conteudo/GestaoCategorias";
import BlocosConteudo from "./conteudo/BlocosConteudo";
import PaginasDinamicas from "./conteudo/PaginasDinamicas";
import EditorMenus from "./conteudo/EditorMenus";
import ConfiguracoesSEO from "./conteudo/ConfiguracoesSEO";

const ConteudoSEO = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/dashboard">Início</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/dashboard">Painel Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Conteúdo & SEO</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <AdminNotifications />
            </div>
          </header>

          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Conteúdo & SEO</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie conteúdo, configurações de SEO e estrutura do site
              </p>
            </div>

            <Tabs defaultValue="cidades" className="space-y-6">
              <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1">
                <TabsTrigger value="cidades" className="text-xs">
                  <MapPin className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Cidades</span>
                </TabsTrigger>
                <TabsTrigger value="etnias" className="text-xs">
                  <Users className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Etnias</span>
                </TabsTrigger>
                <TabsTrigger value="categorias" className="text-xs">
                  <Tag className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Categorias</span>
                </TabsTrigger>
                <TabsTrigger value="blocos" className="text-xs">
                  <FileText className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Blocos</span>
                </TabsTrigger>
                <TabsTrigger value="paginas" className="text-xs">
                  <FileCode className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Páginas</span>
                </TabsTrigger>
                <TabsTrigger value="menus" className="text-xs">
                  <Menu className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Menus</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">
                  <Settings className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">SEO</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cidades">
                <GestaoCidades />
              </TabsContent>

              <TabsContent value="etnias">
                <GestaoEtnias />
              </TabsContent>

              <TabsContent value="categorias">
                <GestaoCategorias />
              </TabsContent>

              <TabsContent value="blocos">
                <BlocosConteudo />
              </TabsContent>

              <TabsContent value="paginas">
                <PaginasDinamicas />
              </TabsContent>

              <TabsContent value="menus">
                <EditorMenus />
              </TabsContent>

              <TabsContent value="seo">
                <ConfiguracoesSEO />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ConteudoSEO;
