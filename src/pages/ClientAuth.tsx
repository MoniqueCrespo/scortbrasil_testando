import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Lock, Sparkles, ShieldCheck, Clock, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

export default function ClientAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const profileName = searchParams.get("profile");
  const profilePhoto = searchParams.get("photo");
  const returnUrl = searchParams.get("returnUrl");

  useEffect(() => {
    if (user) {
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate("/");
      }
    }
  }, [user, navigate, returnUrl]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}${returnUrl || "/"}`;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: "visitor" });

        if (roleError) {
          console.error("Error creating user role:", roleError);
        }

        toast.success("Cadastro realizado! Bem-vindo!");
        
        // Store return URL for after redirect
        if (returnUrl) {
          localStorage.setItem("client_return_url", returnUrl);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      
      if (returnUrl) {
        navigate(returnUrl);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Benefits Section */}
          <div className="space-y-6 text-center md:text-left">
            {profilePhoto && profileName && (
              <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50">
                <img 
                  src={profilePhoto} 
                  alt={profileName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Assinar perfil de</p>
                  <p className="font-semibold text-lg">{profileName}</p>
                </div>
              </div>
            )}

            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Conteúdo Exclusivo
              </h1>
              <p className="text-xl text-muted-foreground">
                Acesse fotos e vídeos das melhores acompanhantes
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Conteúdo Exclusivo</h3>
                  <p className="text-sm text-muted-foreground">
                    Acesso a fotos e vídeos que não estão disponíveis no perfil público
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Interação Direta</h3>
                  <p className="text-sm text-muted-foreground">
                    Comente, curta e interaja diretamente com suas criadoras favoritas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Conteúdo Novo</h3>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando suas criadoras publicarem novo conteúdo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Pagamento Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Privacidade Garantida</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-primary" />
                <span>Cancele Quando Quiser</span>
              </div>
            </div>
          </div>

          {/* Auth Form Section */}
          <Card className="border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Sua Conta</CardTitle>
              <CardDescription>
                Crie sua conta ou faça login para acessar conteúdo exclusivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                </TabsList>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome (opcional)</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Crie uma senha forte"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <PasswordStrengthIndicator password={password} />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Ao criar uma conta, você concorda com nossos{" "}
                      <a href="/termos" className="text-primary hover:underline">
                        Termos de Uso
                      </a>{" "}
                      e{" "}
                      <a href="/privacidade" className="text-primary hover:underline">
                        Política de Privacidade
                      </a>
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Senha</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
