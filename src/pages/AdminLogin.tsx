import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const logLoginAttempt = async (email: string, success: boolean, userId?: string) => {
    try {
      await supabase.from("admin_login_attempts").insert({
        user_id: userId || null,
        email,
        success,
        ip_address: null, // Could be enhanced with actual IP
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Failed to log login attempt:", error);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      // Attempt login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        await logLoginAttempt(data.email, false);
        toast.error("Credenciais inválidas");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        // Not an admin - log out immediately
        await supabase.auth.signOut();
        await logLoginAttempt(data.email, false, authData.user.id);
        toast.error("Acesso negado. Apenas administradores podem acessar este painel.");
        return;
      }

      // Success - log and redirect
      await logLoginAttempt(data.email, true, authData.user.id);
      
      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: authData.user.id,
        action: "login",
        resource_type: "admin_panel",
        details: { email: data.email },
      });

      toast.success("Login realizado com sucesso!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Painel Administrativo</CardTitle>
          <CardDescription className="text-slate-400">
            Acesso restrito a administradores autorizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@exemplo.com"
                        disabled={isLoading}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar no Painel"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Todas as tentativas de login são registradas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
