import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { brazilStates } from "@/data/locations";
import { TrendingUp, Sparkles, Users, Calendar, Home, Plane, Clock, MapPin, Shield, Star, Filter, Camera, MessageCircle, BadgeDollarSign } from "lucide-react";
import { useMemo } from "react";
import { useAcompanhantes } from "@/hooks/useWordPressAPI";

const SEOContent = () => {
  const mainStates = brazilStates.slice(0, 10);
  
  // Buscar todos os perfis para calcular contagem por estado
  const { profiles } = useAcompanhantes({ per_page: 500 });

  // Calcular contagem por estado
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    profiles.forEach(profile => {
      const state = (profile.state || '').toLowerCase();
      if (state) {
        counts[state] = (counts[state] || 0) + 1;
      }
    });
    return counts;
  }, [profiles]);

  const popularSearches = [
    { label: "Acompanhantes SP", url: "/acompanhantes/sao-paulo" },
    { label: "Mulheres Rio de Janeiro", url: "/acompanhantes/rio-de-janeiro" },
    { label: "Massagistas BH", url: "/acompanhantes/minas-gerais/belo-horizonte/massagistas" },
    { label: "Trans São Paulo", url: "/acompanhantes/sao-paulo/sao-paulo/trans" },
    { label: "Acompanhantes Brasília", url: "/acompanhantes/distrito-federal" },
    { label: "Casais RJ", url: "/acompanhantes/rio-de-janeiro/rio-de-janeiro/casais" },
    { label: "Homens Curitiba", url: "/acompanhantes/parana/curitiba/homens" },
    { label: "Massagistas SP Capital", url: "/acompanhantes/sao-paulo/sao-paulo/massagistas" },
    { label: "Trans Porto Alegre", url: "/acompanhantes/rio-grande-do-sul/porto-alegre/trans" },
    { label: "Acompanhantes Florianópolis", url: "/acompanhantes/santa-catarina/florianopolis" },
    { label: "Mulheres Salvador", url: "/acompanhantes/bahia/salvador" },
    { label: "Acompanhantes Recife", url: "/acompanhantes/pernambuco/recife" },
  ];

  const mainServices = [
    { name: "Massagem", icon: Sparkles, count: "892", filter: "massagem" },
    { name: "Casais", icon: Users, count: "234", filter: "casais" },
    { name: "Eventos", icon: Calendar, count: "567", filter: "eventos" },
    { name: "Local Próprio", icon: Home, count: "1.123", filter: "local-proprio" },
    { name: "Viagens", icon: Plane, count: "345", filter: "viagens" },
    { name: "24 Horas", icon: Clock, count: "456", filter: "24h" },
  ];

  return (
    <section className="mt-12 mb-8">
      <Card className="p-6 md:p-8">
        <article className="prose prose-sm dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Acompanhantes no Brasil - Guia Completo
          </h2>
          
          <div className="space-y-6 text-muted-foreground">
            <p>
              O HotBrazil é a plataforma líder em anúncios de acompanhantes em todo o Brasil. 
              Nossa rede conecta milhares de acompanhantes profissionais com usuários em todos 
              os estados brasileiros, oferecendo um diretório completo, seguro e atualizado diariamente.
            </p>

            <p>
              Com perfis verificados e sistema de avaliações, garantimos transparência e confiança 
              em cada anúncio publicado. Navegue por categorias especializadas incluindo mulheres, 
              homens, trans, casais e massagistas profissionais em sua cidade ou estado.
            </p>

            {/* Buscas Populares por Região */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Buscas Populares por Região
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {popularSearches.map((search) => (
                  <Link key={search.label} to={search.url}>
                    <Badge 
                      variant="outline" 
                      className="w-full justify-center py-1.5 hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer"
                    >
                      {search.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Principais Serviços */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Principais Serviços
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {mainServices.map((service) => (
                  <Link 
                    key={service.name} 
                    to={`/?servico=${service.filter}`}
                    className="group"
                  >
                    <Card className="p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer text-center">
                      <service.icon className="h-6 w-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.count} perfis</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Cobertura Nacional */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Cobertura Nacional
              </h3>
              
              <p className="mb-4 text-muted-foreground">
                Disponível em todas as capitais e principais cidades do Brasil:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {mainStates.map((state) => (
                  <Link
                    key={state.code}
                    to={`/acompanhantes/${state.code.toLowerCase()}`}
                    className="group"
                  >
                    <Card className="p-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center gap-2">
                        <MapPin className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {state.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stateCounts[state.code.toLowerCase()] !== undefined 
                            ? `${stateCounts[state.code.toLowerCase()]} perfis` 
                            : 'Carregando...'}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recursos da Plataforma */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Recursos da Plataforma
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Perfis Verificados</p>
                    <p className="text-xs text-muted-foreground mt-1">Documentação autenticada</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Avaliações Reais</p>
                    <p className="text-xs text-muted-foreground mt-1">Sistema de comentários verificados</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <Filter className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Filtros Avançados</p>
                    <p className="text-xs text-muted-foreground mt-1">Localização, características e serviços</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <Camera className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Fotos Autênticas</p>
                    <p className="text-xs text-muted-foreground mt-1">Imagens reais e atualizadas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Contato Direto</p>
                    <p className="text-xs text-muted-foreground mt-1">WhatsApp e Telegram</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <BadgeDollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Preços Transparentes</p>
                    <p className="text-xs text-muted-foreground mt-1">Disponibilidade em tempo real</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ com Accordion */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Perguntas Frequentes
              </h3>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-foreground text-left">
                    Como funcionam os perfis verificados?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Acompanhantes verificados passaram por processo de autenticação de identidade, 
                    garantindo autenticidade das informações e fotos do perfil.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-foreground text-left">
                    Os anúncios são atualizados?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Sim, perfis são atualizados diariamente e inativos são removidos automaticamente 
                    para garantir informações precisas e atuais.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-foreground text-left">
                    Como entrar em contato?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Cada perfil possui botões de contato direto via WhatsApp ou Telegram para 
                    comunicação rápida e segura com o anunciante.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-foreground text-left">
                    A plataforma é segura?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Implementamos sistema de moderação rigoroso, verificação de identidade e 
                    proteção de dados pessoais para garantir segurança de todos os usuários.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
              HotBrazil - Plataforma de anúncios de acompanhantes em todo o Brasil. 
              Navegue por estado, cidade e categoria para encontrar perfis verificados perto de você.
            </p>
          </div>
        </article>

        {/* Schema Markup para FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Como funcionam os perfis verificados?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Acompanhantes verificados passaram por processo de autenticação de identidade, garantindo autenticidade das informações e fotos do perfil."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Os anúncios são atualizados?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sim, perfis são atualizados diariamente e inativos são removidos automaticamente para garantir informações precisas e atuais."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Como entrar em contato?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Cada perfil possui botões de contato direto via WhatsApp ou Telegram para comunicação rápida e segura com o anunciante."
                  }
                },
                {
                  "@type": "Question",
                  "name": "A plataforma é segura?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Implementamos sistema de moderação rigoroso, verificação de identidade e proteção de dados pessoais para garantir segurança de todos os usuários."
                  }
                }
              ]
            })
          }}
        />
      </Card>
    </section>
  );
};

export default SEOContent;
