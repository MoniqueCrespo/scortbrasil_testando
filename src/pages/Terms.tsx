import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Calendar, Shield, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  useEffect(() => {
    // Add WebPage Schema markup
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Termos de Uso - Acompanhantes Premium",
      "description": "Termos e condições de uso da plataforma Acompanhantes Premium",
      "url": "https://seudominio.com/termos",
      "datePublished": "2024-01-01",
      "dateModified": new Date().toISOString().split('T')[0],
      "publisher": {
        "@type": "Organization",
        "name": "Acompanhantes Premium"
      }
    });
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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
                <BreadcrumbPage>Termos de Uso</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent">
            Termos de Uso
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Vigência imediata
            </span>
          </div>
        </header>

        {/* Content */}
        <article className="max-w-4xl prose prose-slate dark:prose-invert mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold mb-2 mt-0">Aviso Importante</h2>
                <p className="text-sm text-muted-foreground mb-0">
                  Ao acessar e utilizar esta plataforma, você concorda com os termos e condições descritos abaixo. 
                  Leia atentamente antes de prosseguir.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">1.</span> Aceitação dos Termos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e usar a plataforma Acompanhantes Premium ("Plataforma"), você concorda em cumprir e estar vinculado 
              a estes Termos de Uso. Se você não concordar com algum destes termos, não deverá usar nossos serviços.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
              imediatamente após a publicação na Plataforma. O uso continuado dos serviços após tais modificações 
              constitui sua aceitação dos novos termos.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">2.</span> Descrição dos Serviços
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A Plataforma oferece um espaço digital onde profissionais autônomos podem anunciar seus serviços e 
              potenciais clientes podem visualizar, filtrar e buscar esses profissionais. Nossos serviços incluem:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Sistema de busca e filtros avançados por localização, características e serviços</li>
              <li>Visualização de perfis profissionais com fotos, descrições e avaliações</li>
              <li>Sistema de favoritos para salvar perfis de interesse</li>
              <li>Stories temporários para atualizações de profissionais</li>
              <li>Sistema de avaliações e classificações</li>
              <li>Ferramentas de verificação de perfis (selo de verificação)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              A Plataforma atua exclusivamente como intermediária, não sendo responsável pelos serviços prestados 
              pelos profissionais anunciantes nem pelas transações realizadas entre usuários e profissionais.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">3.</span> Elegibilidade e Cadastro
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar a Plataforma, você deve:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Ter no mínimo 18 anos de idade</li>
              <li>Fornecer informações verdadeiras, precisas e completas durante o cadastro</li>
              <li>Manter suas informações de cadastro atualizadas</li>
              <li>Ser legalmente capaz de celebrar contratos vinculantes</li>
              <li>Não ter sido previamente suspenso ou banido da Plataforma</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Profissionais anunciantes devem adicionalmente:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Comprovar identidade através do processo de verificação</li>
              <li>Garantir que todas as fotos publicadas são de sua autoria ou propriedade</li>
              <li>Cumprir todas as leis e regulamentações aplicáveis em sua jurisdição</li>
              <li>Não publicar conteúdo ilegal, ofensivo ou enganoso</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">4.</span> Responsabilidades do Usuário
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao usar a Plataforma, você concorda em:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Usar os serviços apenas para fins legais e de acordo com estes Termos</li>
              <li>Não violar direitos de propriedade intelectual de terceiros</li>
              <li>Não enviar ou transmitir vírus, malware ou código malicioso</li>
              <li>Não tentar acessar áreas restritas da Plataforma sem autorização</li>
              <li>Não fazer engenharia reversa ou tentar extrair código-fonte da Plataforma</li>
              <li>Não usar sistemas automatizados (bots, scrapers) para acessar a Plataforma</li>
              <li>Não assediar, abusar ou prejudicar outros usuários</li>
              <li>Não criar múltiplas contas para manipular avaliações ou rankings</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">5.</span> Propriedade Intelectual
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo da Plataforma, incluindo mas não limitado a textos, gráficos, logotipos, ícones, 
              imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade da Acompanhantes 
              Premium ou de seus fornecedores de conteúdo e é protegido por leis de direitos autorais.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Os usuários concedem à Plataforma uma licença mundial, não exclusiva, livre de royalties, transferível 
              e sublicenciável para usar, reproduzir, distribuir e exibir o conteúdo que publicam na Plataforma.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">6.</span> Privacidade e Proteção de Dados
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              O uso de suas informações pessoais é regido por nossa{" "}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              . Ao usar a Plataforma, você consente com a coleta e uso de informações conforme descrito em nossa 
              Política de Privacidade.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">7.</span> Isenção de Responsabilidade
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A Plataforma é fornecida "no estado em que se encontra" e "conforme disponível", sem garantias de 
              qualquer tipo, expressas ou implícitas. Não garantimos que:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Os serviços estarão disponíveis ininterruptamente ou livres de erros</li>
              <li>Os defeitos serão corrigidos</li>
              <li>A Plataforma estará livre de vírus ou outros componentes prejudiciais</li>
              <li>Os resultados obtidos pelo uso da Plataforma serão precisos ou confiáveis</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Importante:</strong> A Plataforma não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Conteúdo, conduta ou serviços de profissionais anunciantes</li>
              <li>Transações realizadas entre usuários e profissionais</li>
              <li>Veracidade das informações publicadas nos perfis</li>
              <li>Danos diretos, indiretos, incidentais ou consequenciais do uso da Plataforma</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">8.</span> Limitação de Responsabilidade
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Em nenhuma circunstância a Plataforma, seus diretores, funcionários ou afiliados serão responsáveis 
              por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso 
              ou incapacidade de usar nossos serviços.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">9.</span> Suspensão e Encerramento
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de suspender ou encerrar sua conta e acesso à Plataforma, a qualquer momento 
              e sem aviso prévio, por:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violação destes Termos de Uso</li>
              <li>Atividades fraudulentas ou ilegais</li>
              <li>Comportamento abusivo ou assédio a outros usuários</li>
              <li>Fornecimento de informações falsas ou enganosas</li>
              <li>Qualquer outra razão que consideremos apropriada</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">10.</span> Lei Aplicável
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos de Uso serão regidos e interpretados de acordo com as leis da República Federativa do 
              Brasil. Qualquer disputa relacionada a estes Termos será submetida à jurisdição exclusiva dos 
              tribunais brasileiros.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">11.</span> Contato
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através da nossa{" "}
              <Link to="/faq" className="text-primary hover:underline">
                página de FAQ
              </Link>{" "}
              ou pelo e-mail: <a href="mailto:legal@acompanhantes.com" className="text-primary hover:underline">legal@acompanhantes.com</a>
            </p>
          </section>
        </article>

        {/* CTA */}
        <section className="mt-12 text-center bg-card border rounded-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-3">Documentos Relacionados</h2>
          <p className="text-muted-foreground mb-6">
            Leia também nossos outros documentos legais para entender como protegemos seus dados.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/privacidade" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Política de Privacidade
            </Link>
            <Link 
              to="/faq" 
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Perguntas Frequentes
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
