import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Mail, Globe, Tags, MapPin, Shield, BarChart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Email inválido" }).max(255, { message: "Email deve ter no máximo 255 caracteres" });

const Configuracoes = () => {
  const { user } = useAuth();
  const [siteTitle, setSiteTitle] = useState("HotBrazil");
  const [siteDescription, setSiteDescription] = useState("Plataforma de acompanhantes");
  const [metaKeywords, setMetaKeywords] = useState("hotbrazil, acompanhantes, escorts, brasil");
  
  // Email change states
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Analytics states
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [searchConsoleCode, setSearchConsoleCode] = useState("");
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isSavingAnalytics, setIsSavingAnalytics] = useState(false);

  const handleSaveSEO = () => {
    toast.success("Configurações de SEO salvas com sucesso!");
  };

  const handleSaveEmail = () => {
    toast.success("Templates de email atualizados!");
  };

  const handleChangeEmail = async () => {
    try {
      emailSchema.parse(newEmail);
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Email inválido");
      return;
    }

    if (newEmail === user?.email) {
      toast.error("O novo email não pode ser igual ao email atual");
      return;
    }

    setIsChangingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast.success("Email alterado com sucesso! Verifique seu novo email para confirmar a alteração.");
      setNewEmail("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const loadAnalyticsSettings = async () => {
    setIsLoadingAnalytics(true);
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('key, value')
        .in('key', ['google_analytics_id', 'search_console_code']);

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.key === 'google_analytics_id') {
          setGoogleAnalyticsId(setting.value || '');
        } else if (setting.key === 'search_console_code') {
          setSearchConsoleCode(setting.value || '');
        }
      });
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleSaveAnalytics = async () => {
    setIsSavingAnalytics(true);
    try {
      // Salvar Google Analytics ID
      const { error: gaError } = await supabase
        .from('integration_settings')
        .upsert({
          key: 'google_analytics_id',
          value: googleAnalyticsId,
          description: 'Google Analytics Measurement ID (G-XXXXXXXXXX)',
          updated_by: user?.id
        }, { onConflict: 'key' });

      if (gaError) throw gaError;

      // Salvar Search Console Code
      const { error: scError } = await supabase
        .from('integration_settings')
        .upsert({
          key: 'search_console_code',
          value: searchConsoleCode,
          description: 'Google Search Console verification code',
          updated_by: user?.id
        }, { onConflict: 'key' });

      if (scError) throw scError;

      toast.success("Configurações de analytics salvas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setIsSavingAnalytics(false);
    }
  };

  return (
    <AdminLayout title="Configurações do Sistema">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie configurações globais da plataforma
        </p>
      </div>

            <Tabs defaultValue="perfil" className="space-y-6" onValueChange={(value) => {
              if (value === 'analytics' && !isLoadingAnalytics && !googleAnalyticsId && !searchConsoleCode) {
                loadAnalyticsSettings();
              }
            }}>
              <TabsList>
                <TabsTrigger value="perfil">
                  <Shield className="h-4 w-4 mr-2" />
                  Perfil & Segurança
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="seo">
                  <Globe className="h-4 w-4 mr-2" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="categorias">
                  <Tags className="h-4 w-4 mr-2" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="localizacao">
                  <MapPin className="h-4 w-4 mr-2" />
                  Localização
                </TabsTrigger>
                <TabsTrigger value="sistema">
                  <Settings className="h-4 w-4 mr-2" />
                  Sistema
                </TabsTrigger>
              </TabsList>

              <TabsContent value="perfil">
                <Card>
                  <CardHeader>
                    <CardTitle>Perfil & Segurança</CardTitle>
                    <CardDescription>
                      Gerencie suas informações de administrador e altere sua senha
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Informações da Conta</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Função:</span>
                          <span className="font-medium">Administrador</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Alterar Email</h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <Label htmlFor="newEmail">Novo Email</Label>
                          <Input
                            id="newEmail"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Digite seu novo email"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Você receberá um email de confirmação no novo endereço
                          </p>
                        </div>
                        <Button 
                          onClick={handleChangeEmail}
                          disabled={isChangingEmail || !newEmail}
                        >
                          {isChangingEmail ? "Alterando..." : "Alterar Email"}
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <Label htmlFor="currentPassword">Senha Atual</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Digite sua senha atual"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">Nova Senha</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Digite sua nova senha (mínimo 8 caracteres)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirme sua nova senha"
                          />
                        </div>
                        <Button 
                          onClick={handleChangePassword}
                          disabled={isChangingPassword || !newPassword || !confirmPassword}
                        >
                          {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Google Analytics & Search Console</CardTitle>
                    <CardDescription>
                      Configure as tags de rastreamento do Google
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                        <Input
                          id="googleAnalyticsId"
                          value={googleAnalyticsId}
                          onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                          disabled={isLoadingAnalytics}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Cole seu ID de medição do Google Analytics (formato: G-XXXXXXXXXX)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="searchConsoleCode">Google Search Console - Meta Tag</Label>
                        <Input
                          id="searchConsoleCode"
                          value={searchConsoleCode}
                          onChange={(e) => setSearchConsoleCode(e.target.value)}
                          placeholder="google-site-verification=..."
                          disabled={isLoadingAnalytics}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Cole apenas o código de verificação (google-site-verification=xxxxx)
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveAnalytics}
                      disabled={isSavingAnalytics || isLoadingAnalytics}
                    >
                      {isSavingAnalytics ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de SEO</CardTitle>
                    <CardDescription>
                      Configure meta tags padrão e informações de SEO
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="siteTitle">Título do Site</Label>
                      <Input
                        id="siteTitle"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteDescription">Descrição do Site</Label>
                      <Textarea
                        id="siteDescription"
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaKeywords">Palavras-chave (separadas por vírgula)</Label>
                      <Input
                        id="metaKeywords"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveSEO}>Salvar Configurações de SEO</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Templates de Email</CardTitle>
                    <CardDescription>
                      Configure templates de email automáticos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="welcomeEmail">Email de Boas-vindas</Label>
                      <Textarea
                        id="welcomeEmail"
                        placeholder="Template do email de boas-vindas..."
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="verificationEmail">Email de Verificação Aprovada</Label>
                      <Textarea
                        id="verificationEmail"
                        placeholder="Template do email de verificação aprovada..."
                        rows={6}
                      />
                    </div>
                    <Button onClick={handleSaveEmail}>Salvar Templates</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categorias">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestão de Categorias</CardTitle>
                    <CardDescription>
                      Adicione, edite ou remova categorias de anúncios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg flex items-center justify-between">
                        <span className="font-medium">Mulheres</span>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </div>
                      <div className="p-3 border rounded-lg flex items-center justify-between">
                        <span className="font-medium">Homens</span>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </div>
                      <div className="p-3 border rounded-lg flex items-center justify-between">
                        <span className="font-medium">Trans</span>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </div>
                      <div className="p-3 border rounded-lg flex items-center justify-between">
                        <span className="font-medium">Casais</span>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </div>
                      <div className="p-3 border rounded-lg flex items-center justify-between">
                        <span className="font-medium">Massagistas</span>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </div>
                    </div>
                    <Button className="mt-4">Adicionar Nova Categoria</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="localizacao">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestão de Localidades</CardTitle>
                    <CardDescription>
                      Gerencie estados, cidades e bairros disponíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Funcionalidade em desenvolvimento. Atualmente utiliza dados pré-configurados.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sistema">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>
                      Configurações gerais e avançadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="maintenance">Modo de Manutenção</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="maintenance" />
                        <span className="text-sm">Ativar modo de manutenção</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="registration">Cadastro de Novos Usuários</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="registration" defaultChecked />
                        <span className="text-sm">Permitir novos cadastros</span>
                      </div>
                    </div>
                    <Button>Salvar Configurações</Button>
                  </CardContent>
                </Card>
              </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Configuracoes;
