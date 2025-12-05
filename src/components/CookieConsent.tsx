import { useState, useEffect } from "react";
import { Cookie, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show banner after 1 second
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
      } catch (e) {
        console.error("Error parsing cookie preferences:", e);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Here you would initialize analytics/marketing scripts based on preferences
    if (prefs.analytics) {
      // Initialize Google Analytics or similar
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      // Initialize marketing pixels
      console.log("Marketing enabled");
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t shadow-lg animate-in slide-in-from-bottom duration-500">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon & Message */}
            <div className="flex gap-3 flex-1">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  Este site usa cookies
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">LGPD</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Usamos cookies para melhorar sua experiência, personalizar conteúdo e analisar o tráfego. 
                  Ao clicar em &quot;Aceitar todos&quot;, você concorda com o uso de todos os cookies. 
                  Leia nossa{" "}
                  <Link to="/privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={openSettings}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Preferências
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptEssential}
              >
                Apenas Essenciais
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-primary hover:bg-primary/90"
              >
                Aceitar Todos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Preferências de Cookies
            </DialogTitle>
            <DialogDescription>
              Gerencie suas preferências de cookies. Você pode habilitar ou desabilitar diferentes tipos de cookies abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    Cookies Essenciais
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">Sempre Ativos</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Necessários para o funcionamento básico do site. Incluem cookies de sessão, autenticação e segurança.
                  </p>
                </div>
                <Switch
                  checked={preferences.essential}
                  disabled
                  aria-label="Cookies essenciais (sempre ativos)"
                />
              </div>
            </div>

            <Separator />

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="analytics" className="text-base font-semibold">
                    Cookies de Análise
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ajudam-nos a entender como os visitantes interagem com o site, fornecendo informações sobre métricas de visitantes, taxa de rejeição, origem do tráfego, etc.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Exemplos: Google Analytics, Hotjar
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  aria-label="Cookies de análise"
                />
              </div>
            </div>

            <Separator />

            {/* Marketing Cookies */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="marketing" className="text-base font-semibold">
                    Cookies de Marketing
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Usados para rastrear visitantes em sites. A intenção é exibir anúncios relevantes e envolventes para o usuário individual.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Exemplos: Facebook Pixel, Google Ads
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked })
                  }
                  aria-label="Cookies de marketing"
                />
              </div>
            </div>

            <Separator />

            {/* Info */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Sobre cookies:</strong> Cookies são pequenos arquivos de texto que sites colocam no seu dispositivo para armazenar informações. 
                Para mais detalhes, leia nossa{" "}
                <Link to="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveCustomPreferences}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Salvar Preferências
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
