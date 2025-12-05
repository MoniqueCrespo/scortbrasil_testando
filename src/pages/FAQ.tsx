import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { HelpCircle, Shield, Heart, Search, CreditCard, Star } from "lucide-react";

const FAQ = () => {
  useEffect(() => {
    // Add FAQ Schema markup for featured snippets
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Como funciona a plataforma de acompanhantes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nossa plataforma conecta você com profissionais verificados de forma segura e transparente. Você pode navegar pelos perfis, filtrar por localização, idade, serviços e outras características, visualizar fotos e avaliações, e entrar em contato diretamente com os profissionais através dos botões de WhatsApp ou Telegram disponíveis em cada perfil."
          }
        },
        {
          "@type": "Question",
          "name": "Os perfis são verificados?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim! Perfis com o selo de verificação (ícone de check azul) passaram por nosso processo de verificação de identidade, que inclui validação de documentos e fotos. Isso garante mais segurança e autenticidade para todos os usuários da plataforma."
          }
        },
        {
          "@type": "Question",
          "name": "Como posso encontrar profissionais na minha região?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use a barra de busca no topo da página para inserir sua localização. Você também pode usar os filtros avançados para definir a distância máxima desejada (em km) e selecionar bairros ou regiões específicas. Os resultados serão ordenados por proximidade."
          }
        },
        {
          "@type": "Question",
          "name": "O que significam as avaliações e estrelas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "As avaliações são notas de 1 a 5 estrelas deixadas por usuários que já entraram em contato com os profissionais. Quanto maior a avaliação, melhor a experiência relatada pelos clientes. Perfis premium geralmente têm avaliações acima de 4.8 estrelas."
          }
        },
        {
          "@type": "Question",
          "name": "Como funciona o sistema de favoritos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Clique no ícone de coração em qualquer perfil para adicioná-lo aos seus favoritos. Seus favoritos ficam salvos no navegador e podem ser acessados a qualquer momento através da página 'Favoritos' no menu principal. Você pode ativar um filtro para ver apenas seus perfis favoritos na listagem."
          }
        },
        {
          "@type": "Question",
          "name": "Preciso pagar para usar a plataforma?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Não! A navegação, busca, visualização de perfis e uso dos filtros são completamente gratuitos. Os valores exibidos em cada perfil referem-se aos honorários dos profissionais anunciantes, não da plataforma. O contato é feito diretamente entre você e o profissional."
          }
        },
        {
          "@type": "Question",
          "name": "O que são perfis 'Em Destaque' e 'Premium'?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Perfis 'Em Destaque' são profissionais destacados na plataforma, geralmente com alta avaliação e atividade recente. Perfis 'Premium' são profissionais que oferecem serviços diferenciados, têm excelentes avaliações (4.8+) e perfis completos com fotos profissionais."
          }
        },
        {
          "@type": "Question",
          "name": "Como funcionam os Stories?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Assim como nas redes sociais, profissionais podem postar Stories temporários para compartilhar novidades, promoções ou disponibilidade. Os Stories aparecem no topo da página inicial. Um anel colorido indica Stories não visualizados, enquanto um anel cinza indica Stories já vistos."
          }
        },
        {
          "@type": "Question",
          "name": "Meus dados estão seguros?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim! Levamos sua privacidade muito a sério. Seus dados de navegação, favoritos e buscas ficam armazenados apenas localmente no seu navegador. Não compartilhamos, vendemos ou rastreamos suas informações pessoais. Toda comunicação na plataforma usa criptografia HTTPS."
          }
        },
        {
          "@type": "Question",
          "name": "Posso anunciar meus serviços na plataforma?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim! Se você é um profissional autônomo e deseja anunciar seus serviços, clique no botão 'Entrar' no topo da página e selecione a opção 'Cadastrar-se como Anunciante'. Você poderá criar seu perfil, adicionar fotos, definir suas tarifas, serviços oferecidos e disponibilidade."
          }
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const faqs = [
    {
      id: "como-funciona",
      icon: HelpCircle,
      question: "Como funciona a plataforma de acompanhantes?",
      answer: "Nossa plataforma conecta você com profissionais verificados de forma segura e transparente. Você pode navegar pelos perfis, filtrar por localização, idade, serviços e outras características, visualizar fotos e avaliações, e entrar em contato diretamente com os profissionais através dos botões de WhatsApp ou Telegram disponíveis em cada perfil."
    },
    {
      id: "verificacao",
      icon: Shield,
      question: "Os perfis são verificados?",
      answer: "Sim! Perfis com o selo de verificação (ícone de check azul) passaram por nosso processo de verificação de identidade, que inclui validação de documentos e fotos. Isso garante mais segurança e autenticidade para todos os usuários da plataforma."
    },
    {
      id: "localizacao",
      icon: Search,
      question: "Como posso encontrar profissionais na minha região?",
      answer: "Use a barra de busca no topo da página para inserir sua localização. Você também pode usar os filtros avançados para definir a distância máxima desejada (em km) e selecionar bairros ou regiões específicas. Os resultados serão ordenados por proximidade."
    },
    {
      id: "avaliacoes",
      icon: Star,
      question: "O que significam as avaliações e estrelas?",
      answer: "As avaliações são notas de 1 a 5 estrelas deixadas por usuários que já entraram em contato com os profissionais. Quanto maior a avaliação, melhor a experiência relatada pelos clientes. Perfis premium geralmente têm avaliações acima de 4.8 estrelas."
    },
    {
      id: "favoritos",
      icon: Heart,
      question: "Como funciona o sistema de favoritos?",
      answer: "Clique no ícone de coração em qualquer perfil para adicioná-lo aos seus favoritos. Seus favoritos ficam salvos no navegador e podem ser acessados a qualquer momento através da página 'Favoritos' no menu principal. Você pode ativar um filtro para ver apenas seus perfis favoritos na listagem."
    },
    {
      id: "pagamento",
      icon: CreditCard,
      question: "Preciso pagar para usar a plataforma?",
      answer: "Não! A navegação, busca, visualização de perfis e uso dos filtros são completamente gratuitos. Os valores exibidos em cada perfil referem-se aos honorários dos profissionais anunciantes, não da plataforma. O contato é feito diretamente entre você e o profissional."
    },
    {
      id: "destaque-premium",
      icon: Star,
      question: "O que são perfis 'Em Destaque' e 'Premium'?",
      answer: "Perfis 'Em Destaque' são profissionais destacados na plataforma, geralmente com alta avaliação e atividade recente. Perfis 'Premium' são profissionais que oferecem serviços diferenciados, têm excelentes avaliações (4.8+) e perfis completos com fotos profissionais."
    },
    {
      id: "stories",
      icon: HelpCircle,
      question: "Como funcionam os Stories?",
      answer: "Assim como nas redes sociais, profissionais podem postar Stories temporários para compartilhar novidades, promoções ou disponibilidade. Os Stories aparecem no topo da página inicial. Um anel colorido indica Stories não visualizados, enquanto um anel cinza indica Stories já vistos."
    },
    {
      id: "privacidade",
      icon: Shield,
      question: "Meus dados estão seguros?",
      answer: "Sim! Levamos sua privacidade muito a sério. Seus dados de navegação, favoritos e buscas ficam armazenados apenas localmente no seu navegador. Não compartilhamos, vendemos ou rastreamos suas informações pessoais. Toda comunicação na plataforma usa criptografia HTTPS."
    },
    {
      id: "anunciar",
      icon: HelpCircle,
      question: "Posso anunciar meus serviços na plataforma?",
      answer: "Sim! Se você é um profissional autônomo e deseja anunciar seus serviços, clique no botão 'Entrar' no topo da página e selecione a opção 'Cadastrar-se como Anunciante'. Você poderá criar seu perfil, adicionar fotos, definir suas tarifas, serviços oferecidos e disponibilidade."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Perguntas Frequentes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre nossa plataforma, segurança, verificação de perfis e como usar nossos recursos.
          </p>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq) => {
              const Icon = faq.icon;
              return (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="border rounded-lg px-6 bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="hover:no-underline py-5">
                    <div className="flex items-center gap-3 text-left">
                      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-semibold">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pt-2 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center bg-gradient-to-r from-primary/10 to-[hsl(320,75%,58%)]/10 rounded-lg p-8 max-w-3xl mx-auto border">
          <h2 className="text-2xl font-bold mb-3">Ainda tem dúvidas?</h2>
          <p className="text-muted-foreground mb-6">
            Nossa equipe de suporte está pronta para ajudar você. Entre em contato conosco.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Voltar para Início
            </Link>
            <a 
              href="#contato" 
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
            >
              Fale Conosco
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
