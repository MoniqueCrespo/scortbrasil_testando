import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, TrendingUp, DollarSign, Gift, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { validatePixKey, isValidEmail } from "@/lib/validation";

export default function Afiliados() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handlePixKeyChange = (value: string) => {
    setPixKey(value);
    
    if (value.trim()) {
      const validation = validatePixKey(value);
      if (validation.isValid) {
        setPixKeyType(validation.type || "");
      } else {
        setPixKeyType("");
      }
    } else {
      setPixKeyType("");
    }
  };

  const handleBecomeAffiliate = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para se tornar um afiliado");
      navigate("/afiliados/auth");
      return;
    }

    // Validação rigorosa da chave PIX
    const pixValidation = validatePixKey(pixKey);
    if (!pixValidation.isValid) {
      toast.error(pixValidation.error || "Chave PIX inválida");
      return;
    }

    // Validação adicional de email do usuário
    if (!user.email || !isValidEmail(user.email)) {
      toast.error("Email inválido. Por favor, atualize seu perfil.");
      return;
    }

    setLoading(true);

    try {
      // Check if user already has an affiliate account
      const { data: existing } = await supabase
        .from("affiliates")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        toast.info("Você já é um afiliado!");
        navigate("/dashboard/afiliado");
        return;
      }

      // Generate unique affiliate code
      const affiliateCode = `AF${user.id.substring(0, 8).toUpperCase()}`;
      const affiliateLink = `${window.location.origin}?ref=${affiliateCode}`;

      // Create affiliate account com validação
      const { error } = await supabase.from("affiliates").insert({
        user_id: user.id,
        affiliate_code: affiliateCode,
        affiliate_link: affiliateLink,
        pix_key: pixKey.trim(),
        status: "active",
        tier_level: "bronze",
        commission_rate: 10,
      });

      if (error) throw error;

      toast.success("Conta de afiliado criada com sucesso! 🎉");
      navigate("/dashboard/afiliado");
    } catch (error: any) {
      console.error("Error creating affiliate:", error);
      toast.error(error.message || "Erro ao criar conta de afiliado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Programa de Afiliados - SCORT BRASIL"
        description="Ganhe comissões vitalícias indicando anunciantes. Sistema profissional de afiliados com pagamentos via PIX."
      />

      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Programa de Afiliados SCORT BRASIL
            </h1>
            <p className="text-xl text-muted-foreground">
              Ganhe comissões vitalícias em todas as transações dos anunciantes que você indicar
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader>
                <DollarSign className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Comissões Vitalícias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ganhe de 10% a 20% em cada transação, para sempre
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Níveis de Afiliado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bronze, Silver, Gold e Diamond com benefícios crescentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Dashboard Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acompanhe indicações, comissões e performance em tempo real
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Gift className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Pagamento via PIX</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receba seus ganhos rapidamente via PIX
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Commission Structure */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Estrutura de Comissões</CardTitle>
              <CardDescription>
                Você ganha em todas as transações dos seus indicados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">Compra de Créditos</p>
                    <p className="text-sm text-muted-foreground">Recarga de créditos no sistema</p>
                  </div>
                  <span className="text-xl font-bold text-primary">10%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">Ativação de Boost</p>
                    <p className="text-sm text-muted-foreground">Destaque de perfil</p>
                  </div>
                  <span className="text-xl font-bold text-primary">15%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">Plano Premium</p>
                    <p className="text-sm text-muted-foreground">Assinatura mensal</p>
                  </div>
                  <span className="text-xl font-bold text-primary">20%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">Assinatura de Conteúdo</p>
                    <p className="text-sm text-muted-foreground">Comissão recorrente mensal!</p>
                  </div>
                  <span className="text-xl font-bold text-primary">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tiers */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Níveis de Afiliado</CardTitle>
              <CardDescription>
                Evolua e ganhe bônus adicionais conforme suas indicações crescem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🥉</div>
                  <h3 className="font-bold mb-1">Bronze</h3>
                  <p className="text-sm text-muted-foreground mb-2">0-5 indicações</p>
                  <p className="text-sm">Comissão base</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🥈</div>
                  <h3 className="font-bold mb-1">Silver</h3>
                  <p className="text-sm text-muted-foreground mb-2">5-20 indicações</p>
                  <p className="text-sm font-semibold text-primary">+2% extra</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🥇</div>
                  <h3 className="font-bold mb-1">Gold</h3>
                  <p className="text-sm text-muted-foreground mb-2">20-50 indicações</p>
                  <p className="text-sm font-semibold text-primary">+5% extra</p>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <div className="text-2xl mb-2">💎</div>
                  <h3 className="font-bold mb-1">Diamond</h3>
                  <p className="text-sm text-muted-foreground mb-2">50+ indicações</p>
                  <p className="text-sm font-semibold text-primary">+10% extra + bônus</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign Up Form */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Comece Agora</CardTitle>
              <CardDescription>
                Preencha seus dados e receba seu link de afiliado instantaneamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pixKey" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Chave PIX para Recebimento *
                </Label>
                <Input
                  id="pixKey"
                  placeholder="CPF, Email, Telefone ou Chave Aleatória"
                  value={pixKey}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  className={pixKey && !pixKeyType ? "border-destructive" : ""}
                />
                {pixKeyType && (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    {pixKeyType} Válido
                  </Badge>
                )}
                {pixKey && !pixKeyType && (
                  <div className="flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Chave PIX inválida. Use CPF válido, email, telefone (+55) ou chave aleatória.</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  Seus dados são protegidos e criptografados
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBecomeAffiliate}
                disabled={loading || !pixKeyType}
              >
                {loading ? "Validando e Criando..." : "Quero Ser Afiliado"}
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Link de indicação único e personalizado</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Dashboard profissional de acompanhamento</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Materiais de divulgação prontos</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Suporte dedicado para afiliados</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
