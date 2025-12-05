import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Heart, Users, CheckCircle, Lock, Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const About = () => {
  return (
    <>
      <SEOHead 
        title="Sobre Nós | Acompanhantes Premium"
        description="Conheça a plataforma líder em anúncios de acompanhantes verificados. Conectamos profissionais com clientes de forma segura, discreta e profissional."
        canonical="/sobre"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sobre Nós
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A plataforma líder em conexões profissionais, seguras e discretas no Brasil
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="h-6 w-6 text-primary" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Somos a principal plataforma brasileira dedicada a conectar profissionais do entretenimento adulto 
                com clientes de forma segura, transparente e respeitosa. Nossa missão é proporcionar um ambiente 
                profissional onde anunciantes podem promover seus serviços com dignidade e clientes podem encontrar 
                acompanhantes verificados com total confiança.
              </p>
              <p>
                Acreditamos que todos merecem um espaço digital seguro, discreto e livre de julgamentos. 
                Por isso, desenvolvemos uma plataforma que prioriza a verificação de identidade, proteção de dados 
                e experiência premium tanto para anunciantes quanto para usuários.
              </p>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Proteção em primeiro lugar</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Todos os perfis passam por verificação rigorosa de identidade. Utilizamos tecnologia de ponta 
                para garantir a autenticidade dos anunciantes e a proteção dos dados de todos os usuários.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Discrição</CardTitle>
                <CardDescription>Privacidade garantida</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Respeitamos a privacidade de todos. As informações pessoais são protegidas com criptografia 
                avançada e nunca compartilhamos dados com terceiros sem consentimento explícito.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Qualidade</CardTitle>
                <CardDescription>Excelência no serviço</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Mantemos padrões elevados de qualidade. Nossa equipe de moderação trabalha 24/7 para garantir 
                que todos os anúncios atendam nossas diretrizes de autenticidade e profissionalismo.
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CheckCircle className="h-6 w-6 text-primary" />
                O Que Nos Diferencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Verificação de Identidade</h3>
                      <p className="text-sm text-muted-foreground">
                        Sistema rigoroso de verificação documental para garantir autenticidade
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Moderação Profissional</h3>
                      <p className="text-sm text-muted-foreground">
                        Equipe dedicada que analisa cada anúncio antes da publicação
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Plataforma Premium</h3>
                      <p className="text-sm text-muted-foreground">
                        Interface moderna e intuitiva para melhor experiência de navegação
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Proteção de Dados</h3>
                      <p className="text-sm text-muted-foreground">
                        Conformidade total com LGPD e criptografia de ponta a ponta
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Busca Avançada</h3>
                      <p className="text-sm text-muted-foreground">
                        Filtros inteligentes por localização, categoria, características e disponibilidade
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Sistema de Avaliações</h3>
                      <p className="text-sm text-muted-foreground">
                        Reviews verificados para maior transparência e confiança
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Suporte Dedicado</h3>
                      <p className="text-sm text-muted-foreground">
                        Atendimento rápido e profissional para anunciantes e usuários
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Dashboard Completo</h3>
                      <p className="text-sm text-muted-foreground">
                        Anunciantes têm acesso a métricas, analytics e gestão profissional de perfis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-primary" />
                Nossa Comunidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                  <p className="text-sm text-muted-foreground">Anunciantes Verificados</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">50+</div>
                  <p className="text-sm text-muted-foreground">Cidades Cobertas</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-sm text-muted-foreground">Moderação Ativa</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">Perfis Verificados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commitment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Nosso Compromisso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Estamos comprometidos em criar um ecossistema digital profissional que beneficia todos os envolvidos. 
                Para os anunciantes, oferecemos ferramentas poderosas de marketing, verificação que gera confiança, 
                e uma plataforma que respeita sua dignidade profissional.
              </p>
              <p>
                Para os usuários, garantimos transparência total, perfis autênticos verificados, e um ambiente 
                seguro para explorar suas preferências sem julgamentos. Trabalhamos continuamente para melhorar 
                nossa plataforma, implementando novas funcionalidades e mantendo os mais altos padrões de segurança.
              </p>
              <p className="font-semibold text-foreground">
                Acreditamos que profissionalismo, respeito e tecnologia podem coexistir para criar 
                a melhor experiência possível no mercado brasileiro de entretenimento adulto.
              </p>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
