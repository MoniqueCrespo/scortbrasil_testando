import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Check, X, TrendingUp, DollarSign, Users, Zap, Award, BarChart3, Shield } from "lucide-react";
import { isValidCPF, formatCPF, isValidEmail, validatePixKey } from "@/lib/validation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const AfiliadosAuth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [cpfValid, setCpfValid] = useState<boolean | null>(null);
  const [pixKeyValid, setPixKeyValid] = useState<boolean | null>(null);
  
  const [referralCount, setReferralCount] = useState([10]);
  const [currentEarnings, setCurrentEarnings] = useState(600);
  
  useEffect(() => {
    if (user) {
      navigate("/dashboard/afiliado");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (email) {
      setEmailValid(isValidEmail(email));
    }
  }, [email]);

  useEffect(() => {
    if (pixKey) {
      const validation = validatePixKey(pixKey);
      setPixKeyValid(validation.isValid);
    }
  }, [pixKey]);

  useEffect(() => {
    const count = referralCount[0];
    if (count <= 5) setCurrentEarnings(count * 50);
    else if (count <= 10) setCurrentEarnings(count * 60);
    else if (count <= 20) setCurrentEarnings(count * 75);
    else setCurrentEarnings(count * 90);
  }, [referralCount]);

  const handleCpfChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "");
    setCpf(cleanedValue);
    
    if (cleanedValue.length === 11) {
      setCpfValid(isValidCPF(cleanedValue));
    } else {
      setCpfValid(null);
    }
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      toast.error("Por favor, preencha seu nome completo");
      return;
    }

    if (!email || !emailValid) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    if (!cpf || !cpfValid) {
      toast.error("Por favor, insira um CPF válido");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!pixKey || !pixKeyValid) {
      toast.error("Por favor, insira uma chave PIX válida");
      return;
    }

    if (!acceptTerms) {
      toast.error("Você deve aceitar os termos e condições");
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/afiliado`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      const affiliateCode = `${fullName.split(" ")[0].toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const affiliateLink = `${window.location.origin}/cadastro?ref=${affiliateCode}`;

      const { error: insertError } = await supabase.from("affiliates").insert({
        user_id: authData.user.id,
        affiliate_code: affiliateCode,
        affiliate_link: affiliateLink,
        pix_key: pixKey,
        status: "active",
      });

      if (insertError) throw insertError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      toast.success("Conta de afiliado criada com sucesso!");
      navigate("/dashboard/afiliado");
    } catch (error: any) {
      console.error("Erro ao criar conta de afiliado:", error);
      toast.error(error.message || "Erro ao criar conta de afiliado");
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Por favor, preencha email e senha");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: affiliateData, error: affiliateError } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (affiliateError || !affiliateData) {
        await supabase.auth.signOut();
        toast.error("Esta conta não está registrada como afiliado");
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard/afiliado");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast.error(error.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Elegante e Profissional */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background border-b">
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full text-sm border border-primary/10">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Programa de Afiliados
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Monetize Suas Indicações
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Comissões recorrentes vitalícias em todas as transações de seus indicados
            </p>
            
            <div className="flex items-center justify-center gap-8 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">R$ 127k+ pagos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">150+ afiliados</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Até 25% comissão</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Marketing Content - Minimalista */}
          <div className="lg:col-span-3 space-y-8">
            {/* Calculadora Elegante */}
            <Card className="p-8 border-primary/10">
              <h3 className="text-xl font-semibold mb-6">Simulador de Ganhos</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-sm text-muted-foreground">Indicações mensais</Label>
                    <span className="text-lg font-semibold">{referralCount[0]}</span>
                  </div>
                  <Slider
                    value={referralCount}
                    onValueChange={setReferralCount}
                    max={50}
                    min={1}
                    step={1}
                  />
                </div>
                
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Ganho Estimado Mensal</div>
                    <div className="text-4xl font-bold text-primary">
                      R$ {currentEarnings.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Benefícios Limpos */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: DollarSign, title: "Comissão 10-25%", desc: "Todas as transações" },
                { icon: TrendingUp, title: "Recorrente", desc: "Ganhos vitalícios" },
                { icon: Zap, title: "Saque PIX", desc: "24h úteis" },
                { icon: BarChart3, title: "Dashboard", desc: "Tempo real" },
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Níveis Profissional */}
            <Card className="p-8 border-primary/10">
              <h3 className="text-xl font-semibold mb-6">Sistema de Níveis</h3>
              <div className="space-y-3">
                {[
                  { level: "Bronze", range: "0-10", commission: "10%", icon: "○" },
                  { level: "Silver", range: "11-25", commission: "15%", icon: "◐" },
                  { level: "Gold", range: "26-50", commission: "20%", icon: "◑" },
                  { level: "Diamond", range: "51+", commission: "25%", icon: "●" },
                ].map((tier, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tier.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{tier.level}</div>
                        <div className="text-xs text-muted-foreground">{tier.range} indicações</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-primary">{tier.commission}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* FAQ Limpo */}
            <Card className="p-8 border-primary/10">
              <h3 className="text-xl font-semibold mb-6">Perguntas Frequentes</h3>
              <div className="space-y-4">
                {[
                  { q: "Preciso investir?", a: "Não. 100% gratuito." },
                  { q: "Quando recebo?", a: "PIX em até 24h úteis." },
                  { q: "Como funciona?", a: "Comissão vitalícia em todas as transações." },
                ].map((faq, idx) => (
                  <div key={idx} className="border-l-2 border-primary/20 pl-4">
                    <div className="font-semibold text-sm mb-1">{faq.q}</div>
                    <div className="text-sm text-muted-foreground">{faq.a}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Form Profissional */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <Card className="p-6 border-primary/20">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Criar Conta</h2>
                  <p className="text-sm text-muted-foreground">Comece a ganhar hoje</p>
                </div>

                <Tabs defaultValue="cadastrar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
                    <TabsTrigger value="entrar">Entrar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="cadastrar" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm">Nome Completo</Label>
                      <Input
                        id="fullName"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm flex items-center gap-1">
                          Email
                          {emailValid === true && <Check className="w-3 h-3 text-green-500" />}
                          {emailValid === false && <X className="w-3 h-3 text-destructive" />}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-sm flex items-center gap-1">
                          CPF
                          {cpfValid === true && <Check className="w-3 h-3 text-green-500" />}
                          {cpfValid === false && <X className="w-3 h-3 text-destructive" />}
                        </Label>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={formatCPF(cpf)}
                          onChange={(e) => handleCpfChange(e.target.value)}
                          maxLength={14}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pixKey" className="text-sm flex items-center gap-1">
                        Chave PIX
                        {pixKeyValid === true && <Check className="w-3 h-3 text-green-500" />}
                        {pixKeyValid === false && <X className="w-3 h-3 text-destructive" />}
                      </Label>
                      <Input
                        id="pixKey"
                        placeholder="CPF, Email, Telefone ou Chave"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-xs leading-tight cursor-pointer text-muted-foreground">
                        Aceito os termos do programa de afiliados
                      </Label>
                    </div>

                    <Button 
                      onClick={handleSignUp} 
                      className="w-full"
                      disabled={!acceptTerms}
                    >
                      Criar Conta Grátis
                    </Button>
                  </TabsContent>

                  <TabsContent value="entrar" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button onClick={handleSignIn} className="w-full">
                      Entrar
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Rápido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Confiável</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfiliadosAuth;
