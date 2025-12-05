import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Settings } from "lucide-react";

interface SEOSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

const ConfiguracoesSEO = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*");

      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      (data || []).forEach((setting: SEOSetting) => {
        settingsMap[setting.key] = setting.value || "";
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("seo_settings")
          .upsert(update, { onConflict: "key" });

        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configurações de SEO">
        <div className="text-center py-12 text-muted-foreground">
          Carregando configurações...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações de SEO">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Configurações de SEO</h2>
            <p className="text-muted-foreground">Configure as meta tags e integrações</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
              <CardDescription>Configurações básicas do site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="site_name">Nome do Site</Label>
                <Input
                  id="site_name"
                  value={settings.site_name || ""}
                  onChange={(e) => updateSetting("site_name", e.target.value)}
                  placeholder="HotBrazil"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="default_meta_title">Meta Title Padrão</Label>
                <Input
                  id="default_meta_title"
                  value={settings.default_meta_title || ""}
                  onChange={(e) => updateSetting("default_meta_title", e.target.value)}
                  placeholder="HotBrazil - Acompanhantes em Todo o Brasil"
                />
                <p className="text-xs text-muted-foreground">Máximo 60 caracteres recomendado</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="default_meta_description">Meta Description Padrão</Label>
                <Textarea
                  id="default_meta_description"
                  value={settings.default_meta_description || ""}
                  onChange={(e) => updateSetting("default_meta_description", e.target.value)}
                  placeholder="Encontre acompanhantes verificados em todo Brasil"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Máximo 160 caracteres recomendado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OpenGraph & Social</CardTitle>
              <CardDescription>Configurações para compartilhamento em redes sociais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="og_image">URL da Imagem OG Padrão</Label>
                <Input
                  id="og_image"
                  value={settings.og_image || ""}
                  onChange={(e) => updateSetting("og_image", e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground">Tamanho recomendado: 1200x630px</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>Códigos de rastreamento e verificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="google_analytics_id">Google Analytics (GA4)</Label>
                <Input
                  id="google_analytics_id"
                  value={settings.google_analytics_id || ""}
                  onChange={(e) => updateSetting("google_analytics_id", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="google_site_verification">Google Search Console</Label>
                <Input
                  id="google_site_verification"
                  value={settings.google_site_verification || ""}
                  onChange={(e) => updateSetting("google_site_verification", e.target.value)}
                  placeholder="Código de verificação"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConfiguracoesSEO;
