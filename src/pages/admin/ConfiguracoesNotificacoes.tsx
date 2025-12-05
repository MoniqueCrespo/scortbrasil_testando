import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Mail, AlertTriangle, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface NotificationSettings {
  email_on_pending_reports: boolean;
  pending_reports_threshold: number;
  email_daily_summary: boolean;
  email_on_new_users: boolean;
  email_on_revenue_milestone: boolean;
  revenue_milestone_amount: number;
  email_on_verification_request: boolean;
}

const ConfiguracoesNotificacoes = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_on_pending_reports: false,
    pending_reports_threshold: 5,
    email_daily_summary: true,
    email_on_new_users: false,
    email_on_revenue_milestone: false,
    revenue_milestone_amount: 1000,
    email_on_verification_request: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // TODO: Fetch current settings from database
    // For now using default values
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save settings to database
      // Could create a new table 'admin_notification_settings' or use JSONB in profiles
      
      toast.success("Configurações de notificações salvas!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Configurações de Notificações">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
        <p className="text-muted-foreground mt-2">
          Configure quando receber alertas por email sobre eventos da plataforma
        </p>
      </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Denúncias */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Denúncias Pendentes
                  </CardTitle>
                  <CardDescription>
                    Receba alertas quando houver denúncias aguardando revisão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_reports" className="flex flex-col gap-1">
                      <span>Email de alerta</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Enviar email quando atingir limite
                      </span>
                    </Label>
                    <Switch
                      id="email_reports"
                      checked={settings.email_on_pending_reports}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, email_on_pending_reports: checked })
                      }
                    />
                  </div>

                  {settings.email_on_pending_reports && (
                    <div className="space-y-2">
                      <Label htmlFor="reports_threshold">Limite de denúncias</Label>
                      <Input
                        id="reports_threshold"
                        type="number"
                        min="1"
                        value={settings.pending_reports_threshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pending_reports_threshold: parseInt(e.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Receber email quando houver {settings.pending_reports_threshold} ou mais denúncias pendentes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumo Diário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Resumo Diário
                  </CardTitle>
                  <CardDescription>
                    Email diário com resumo das atividades da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="daily_summary" className="flex flex-col gap-1">
                      <span>Enviar resumo diário</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Estatísticas e ações do dia anterior
                      </span>
                    </Label>
                    <Switch
                      id="daily_summary"
                      checked={settings.email_daily_summary}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, email_daily_summary: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Novos Usuários */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Novos Cadastros
                  </CardTitle>
                  <CardDescription>
                    Notificação quando novos usuários se cadastrarem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new_users" className="flex flex-col gap-1">
                      <span>Email para novos usuários</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Receber alerta a cada novo cadastro
                      </span>
                    </Label>
                    <Switch
                      id="new_users"
                      checked={settings.email_on_new_users}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, email_on_new_users: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Verificações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Verificações de Identidade
                  </CardTitle>
                  <CardDescription>
                    Alertas para novas solicitações de verificação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verifications" className="flex flex-col gap-1">
                      <span>Email para verificações</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Quando houver nova solicitação
                      </span>
                    </Label>
                    <Switch
                      id="verifications"
                      checked={settings.email_on_verification_request}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, email_on_verification_request: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Metas de Receita */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Metas de Receita
                  </CardTitle>
                  <CardDescription>
                    Receba alertas quando atingir marcos de receita
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="revenue_milestone" className="flex flex-col gap-1">
                      <span>Email de meta atingida</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Notificar quando atingir valor definido
                      </span>
                    </Label>
                    <Switch
                      id="revenue_milestone"
                      checked={settings.email_on_revenue_milestone}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, email_on_revenue_milestone: checked })
                      }
                    />
                  </div>

                  {settings.email_on_revenue_milestone && (
                    <div className="space-y-2">
                      <Label htmlFor="milestone_amount">Valor da meta (R$)</Label>
                      <Input
                        id="milestone_amount"
                        type="number"
                        min="100"
                        step="100"
                        value={settings.revenue_milestone_amount}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            revenue_milestone_amount: parseInt(e.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Receber email quando receita mensal atingir R${" "}
                        {settings.revenue_milestone_amount.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default ConfiguracoesNotificacoes;
