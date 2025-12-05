import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, PlusCircle } from "lucide-react";

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  // Ativar notificações em tempo real
  useRealtimeNotifications(user?.id);

  // Redirecionar usuários para seus dashboards específicos
  useEffect(() => {
    if (userRole === 'model') {
      navigate('/dashboard/modelo');
    } else if (userRole === 'visitor') {
      navigate('/dashboard/cliente');
    }
  }, [userRole, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
              Meu Painel
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo(a), {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Perfil
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Tipo de conta:</strong> {userRole === 'model' ? 'Modelo' : 'Visitante'}</p>
                </div>
              </CardContent>
            </Card>

            {userRole === 'model' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Meus Anúncios
                  </CardTitle>
                  <CardDescription>
                    Crie e gerencie seus perfis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/anuncios/novo">
                    <Button className="w-full bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Anúncio
                    </Button>
                  </Link>
                  <Link to="/anuncios">
                    <Button variant="outline" className="w-full">
                      Gerenciar Anúncios
                    </Button>
                  </Link>
                  <Link to="/verificacao">
                    <Button variant="outline" className="w-full">
                      Solicitar Verificação
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </CardTitle>
                <CardDescription>
                  Ajuste suas preferências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/favoritos">
                  <Button variant="outline" className="w-full mb-2">
                    Ver Favoritos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  Sair
                </CardTitle>
                <CardDescription>
                  Encerrar sua sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={signOut}
                >
                  Fazer Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
