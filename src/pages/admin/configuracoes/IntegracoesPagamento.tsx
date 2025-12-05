import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface IntegrationSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

export default function IntegracoesPagamento() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [environment, setEnvironment] = useState("test");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("integration_settings")
        .select("*")
        .in("key", ["mercadopago_access_token", "mercadopago_public_key", "mercadopago_environment"]);

      if (error) throw error;

      if (data) {
        const tokenSetting = data.find(s => s.key === "mercadopago_access_token");
        const publicKeySetting = data.find(s => s.key === "mercadopago_public_key");
        const envSetting = data.find(s => s.key === "mercadopago_environment");

        setAccessToken(tokenSetting?.value || "");
        setPublicKey(publicKeySetting?.value || "");
        setEnvironment(envSetting?.value || "test");
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const updates = [
        { key: "mercadopago_access_token", value: accessToken },
        { key: "mercadopago_public_key", value: publicKey },
        { key: "mercadopago_environment", value: environment }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("integration_settings")
          .update({ value: update.value })
          .eq("key", update.key);

        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrações de Pagamento</h1>
          <p className="text-muted-foreground mt-2">
            Configure as credenciais de integração com o Mercado Pago
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mercado Pago</CardTitle>
            <CardDescription>
              Configure suas credenciais do Mercado Pago. Estas credenciais serão usadas para processar
              pagamentos de créditos, boosts e planos premium.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Environment Selection */}
            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger id="environment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Teste (Sandbox)</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Use "Teste" para desenvolvimento e "Produção" para ambiente real
              </p>
            </div>

            {/* Access Token */}
            <div className="space-y-2">
              <Label htmlFor="access-token">Access Token</Label>
              <div className="relative">
                <Input
                  id="access-token"
                  type={showToken ? "text" : "password"}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder={environment === "test" ? "TEST-..." : "APP_USR-..."}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Token de acesso para processar pagamentos. Obtenha em:{" "}
                <a
                  href="https://www.mercadopago.com.br/developers/panel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Painel de Desenvolvedores
                </a>
              </p>
            </div>

            {/* Public Key */}
            <div className="space-y-2">
              <Label htmlFor="public-key">Public Key</Label>
              <div className="relative">
                <Input
                  id="public-key"
                  type={showPublicKey ? "text" : "password"}
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder={environment === "test" ? "TEST-..." : "APP_USR-..."}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPublicKey(!showPublicKey)}
                >
                  {showPublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Chave pública para integrações frontend (opcional)
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Como Obter as Credenciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Acesse o{" "}
                <a
                  href="https://www.mercadopago.com.br/developers/panel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Painel de Desenvolvedores do Mercado Pago
                </a>
              </li>
              <li>Faça login com sua conta Mercado Pago</li>
              <li>Selecione ou crie uma aplicação</li>
              <li>Vá em "Credenciais" no menu lateral</li>
              <li>
                Escolha o ambiente correto:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Teste:</strong> Para desenvolvimento (token começa com TEST-)</li>
                  <li><strong>Produção:</strong> Para uso real (token começa com APP_USR-)</li>
                </ul>
              </li>
              <li>Copie o <strong>Access Token</strong> e cole acima</li>
              <li>Opcionalmente, copie a <strong>Public Key</strong></li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
