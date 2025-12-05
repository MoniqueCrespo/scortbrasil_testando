import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, Eye } from "lucide-react";

interface ContentProtectionSettingsProps {
  profileId: string;
}

export const ContentProtectionSettings = ({ profileId }: ContentProtectionSettingsProps) => {
  const [settings, setSettings] = useState({
    watermark_enabled: true,
    watermark_text: "",
    watermark_opacity: 0.5,
    screenshot_detection_enabled: true,
    download_prevention_enabled: true,
  });
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchViolations();
  }, [profileId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('content_protection_settings')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          watermark_enabled: data.watermark_enabled,
          watermark_text: data.watermark_text || "",
          watermark_opacity: data.watermark_opacity,
          screenshot_detection_enabled: data.screenshot_detection_enabled,
          download_prevention_enabled: data.download_prevention_enabled,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    try {
      const { data } = await supabase
        .from('content_violation_logs')
        .select(`
          *,
          exclusive_content (media_type),
          profiles:user_id (email)
        `)
        .eq('exclusive_content.profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(10);

      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('content_protection_settings')
        .upsert({
          profile_id: profileId,
          ...settings,
        });

      if (error) throw error;

      toast({ title: "Configurações de proteção salvas!" });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Proteção de Conteúdo</h3>
        <p className="text-sm text-muted-foreground">Configure as proteções do seu conteúdo exclusivo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marca D'água</CardTitle>
          <CardDescription>Adicione uma marca d'água personalizada em suas fotos e vídeos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="watermark">Ativar marca d'água</Label>
            <Switch
              id="watermark"
              checked={settings.watermark_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, watermark_enabled: checked })
              }
            />
          </div>

          {settings.watermark_enabled && (
            <>
              <div>
                <Label htmlFor="watermark_text">Texto da marca d'água</Label>
                <Input
                  id="watermark_text"
                  value={settings.watermark_text}
                  onChange={(e) =>
                    setSettings({ ...settings, watermark_text: e.target.value })
                  }
                  placeholder="Ex: @seuperfil • Conteúdo Protegido"
                />
              </div>

              <div>
                <Label>Opacidade da marca d'água: {Math.round(settings.watermark_opacity * 100)}%</Label>
                <Slider
                  value={[settings.watermark_opacity]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, watermark_opacity: value })
                  }
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proteções Avançadas</CardTitle>
          <CardDescription>Proteja seu conteúdo contra capturas e downloads não autorizados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screenshot">Detecção de Screenshot</Label>
              <p className="text-sm text-muted-foreground">
                Detecta quando alguém tenta tirar screenshot do conteúdo
              </p>
            </div>
            <Switch
              id="screenshot"
              checked={settings.screenshot_detection_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, screenshot_detection_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="download">Prevenção de Download</Label>
              <p className="text-sm text-muted-foreground">
                Bloqueia tentativas de download direto do conteúdo
              </p>
            </div>
            <Switch
              id="download"
              checked={settings.download_prevention_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, download_prevention_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        <Shield className="w-4 h-4 mr-2" />
        Salvar Configurações de Proteção
      </Button>

      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Violações Detectadas
            </CardTitle>
            <CardDescription>Tentativas de captura ou download do seu conteúdo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {violations.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">
                        {v.violation_type === 'screenshot' && 'Tentativa de Screenshot'}
                        {v.violation_type === 'download_attempt' && 'Tentativa de Download'}
                        {v.violation_type === 'copy_attempt' && 'Tentativa de Cópia'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.profiles?.email || 'Usuário desconhecido'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
