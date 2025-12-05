import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Shield, Calendar, Lock, Eye, Database, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  useEffect(() => {
    // Add WebPage Schema markup
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Política de Privacidade - Acompanhantes Premium",
      "description": "Política de privacidade e proteção de dados da plataforma Acompanhantes Premium",
      "url": "https://seudominio.com/privacidade",
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
                <BreadcrumbPage>Política de Privacidade</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Em conformidade com LGPD
            </span>
          </div>
        </header>

        {/* Content */}
        <article className="max-w-4xl prose prose-slate dark:prose-invert mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold mb-2 mt-0">Seu Compromisso com a Privacidade</h2>
                <p className="text-sm text-muted-foreground mb-0">
                  Levamos sua privacidade a sério. Esta política descreve como coletamos, usamos, armazenamos e 
                  protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                </p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">1.</span> Informações que Coletamos
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 mt-6">
              <Database className="h-5 w-5 text-primary" />
              1.1 Informações Fornecidas por Você
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos informações que você nos fornece diretamente ao:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Criar uma conta:</strong> nome, e-mail, senha, data de nascimento</li>
              <li><strong>Criar perfil de anunciante:</strong> fotos, descrição, localização, serviços oferecidos, preços</li>
              <li><strong>Usar recursos da plataforma:</strong> buscas, filtros aplicados, perfis favoritados</li>
              <li><strong>Entrar em contato:</strong> mensagens de suporte, feedback, avaliações</li>
              <li><strong>Verificação de identidade:</strong> documentos de identificação (apenas para perfis verificados)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 mt-6">
              <Eye className="h-5 w-5 text-primary" />
              1.2 Informações Coletadas Automaticamente
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Quando você usa nossa plataforma, coletamos automaticamente:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Dados de uso:</strong> páginas visitadas, tempo de navegação, cliques, interações</li>
              <li><strong>Informações do dispositivo:</strong> tipo de navegador, sistema operacional, resolução de tela</li>
              <li><strong>Dados de localização:</strong> endereço IP, localização aproximada (se autorizado)</li>
              <li><strong>Cookies e tecnologias similares:</strong> preferências, sessão, análise de comportamento</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 mt-6">
              <UserCheck className="h-5 w-5 text-primary" />
              1.3 Informações de Terceiros
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Podemos receber informações de:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Serviços de autenticação social (Google, Facebook) se você optar por usá-los</li>
              <li>Serviços de análise e monitoramento (Google Analytics)</li>
              <li>Serviços de prevenção de fraude e segurança</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">2.</span> Como Usamos Suas Informações
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos suas informações pessoais para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Fornecer nossos serviços:</strong> permitir que você navegue, busque e encontre profissionais</li>
              <li><strong>Personalizar sua experiência:</strong> mostrar resultados relevantes baseados em suas preferências</li>
              <li><strong>Melhorar a plataforma:</strong> analisar uso, identificar problemas, desenvolver novos recursos</li>
              <li><strong>Comunicação:</strong> enviar notificações, atualizações, novidades (com seu consentimento)</li>
              <li><strong>Segurança:</strong> prevenir fraudes, abusos e atividades ilegais</li>
              <li><strong>Verificação:</strong> validar identidade de anunciantes para perfis verificados</li>
              <li><strong>Cumprimento legal:</strong> atender requisitos legais e regulatórios</li>
              <li><strong>Analytics:</strong> entender como os usuários interagem com a plataforma</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">3.</span> Base Legal para Processamento (LGPD)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Processamos seus dados pessoais com base em:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Consentimento:</strong> quando você nos autoriza expressamente</li>
              <li><strong>Execução de contrato:</strong> para fornecer os serviços que você solicitou</li>
              <li><strong>Obrigação legal:</strong> para cumprir leis e regulamentações</li>
              <li><strong>Legítimo interesse:</strong> para melhorar nossos serviços, segurança e prevenção de fraudes</li>
              <li><strong>Exercício de direitos:</strong> para proteger direitos em processos judiciais</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">4.</span> Compartilhamento de Informações
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Não vendemos suas informações pessoais.</strong> Podemos compartilhar dados limitados com:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Outros usuários:</strong> informações de perfil público (nome, foto, localização, serviços)</li>
              <li><strong>Prestadores de serviço:</strong> hospedagem, analytics, suporte (sob confidencialidade)</li>
              <li><strong>Autoridades:</strong> quando exigido por lei ou para proteger direitos e segurança</li>
              <li><strong>Parceiros de negócios:</strong> em caso de fusão, aquisição ou venda de ativos (com aviso prévio)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Todos os terceiros que recebem seus dados são contratualmente obrigados a protegê-los e usar apenas 
              para os fins autorizados.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">5.</span> Armazenamento e Segurança de Dados
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas técnicas e organizacionais para proteger suas informações:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Criptografia:</strong> HTTPS/TLS para todas as comunicações</li>
              <li><strong>Armazenamento seguro:</strong> servidores protegidos com controles de acesso rigorosos</li>
              <li><strong>Senhas:</strong> criptografadas com algoritmos seguros (bcrypt)</li>
              <li><strong>Monitoramento:</strong> detecção e resposta a incidentes de segurança</li>
              <li><strong>Backups:</strong> cópias de segurança regulares e protegidas</li>
              <li><strong>Acesso limitado:</strong> apenas funcionários autorizados acessam dados pessoais</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Retenção de dados:</strong> mantemos seus dados pelo tempo necessário para fornecer nossos 
              serviços ou conforme exigido por lei. Você pode solicitar a exclusão a qualquer momento.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">6.</span> Seus Direitos (LGPD)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              De acordo com a LGPD, você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Confirmação:</strong> saber se processamos seus dados</li>
              <li><strong>Acesso:</strong> obter cópia de seus dados pessoais</li>
              <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários ou excessivos</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado e interoperável</li>
              <li><strong>Exclusão:</strong> solicitar a remoção de dados processados com seu consentimento</li>
              <li><strong>Revogação do consentimento:</strong> retirar autorização a qualquer momento</li>
              <li><strong>Oposição:</strong> opor-se ao processamento em certas circunstâncias</li>
              <li><strong>Revisão:</strong> solicitar revisão de decisões automatizadas</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para exercer esses direitos, entre em contato através do e-mail:{" "}
              <a href="mailto:privacidade@acompanhantes.com" className="text-primary hover:underline">
                privacidade@acompanhantes.com
              </a>
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">7.</span> Cookies e Tecnologias Similares
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Usamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Cookies essenciais:</strong> necessários para funcionamento da plataforma (login, sessão)</li>
              <li><strong>Cookies de preferência:</strong> salvam suas configurações (idioma, tema, filtros)</li>
              <li><strong>Cookies de analytics:</strong> analisam como você usa a plataforma (Google Analytics)</li>
              <li><strong>Cookies de publicidade:</strong> personalizam anúncios (com seu consentimento)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Você pode gerenciar cookies através das configurações do seu navegador. Note que desabilitar cookies 
              pode afetar a funcionalidade da plataforma.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">8.</span> Privacidade de Menores
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente informações 
              de menores. Se descobrirmos que coletamos dados de um menor, tomaremos medidas imediatas para excluí-los.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Se você acredita que um menor forneceu informações para nós, entre em contato imediatamente.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">9.</span> Transferência Internacional de Dados
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados podem ser armazenados e processados em servidores localizados no Brasil ou em outros países. 
              Quando transferimos dados para fora do Brasil, garantimos que:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>O país de destino oferece nível adequado de proteção de dados</li>
              <li>Ou implementamos salvaguardas contratuais (cláusulas-padrão)</li>
              <li>Ou obtemos seu consentimento explícito</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">10.</span> Alterações nesta Política
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações 
              significativas através de:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Aviso destacado na plataforma</li>
              <li>E-mail (se você forneceu)</li>
              <li>Atualização da data no topo desta página</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Recomendamos revisar esta política regularmente para se manter informado sobre como protegemos suas informações.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">11.</span> Encarregado de Dados (DPO)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Nosso Encarregado de Proteção de Dados (DPO) pode ser contatado através de:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>E-mail:</strong> <a href="mailto:dpo@acompanhantes.com" className="text-primary hover:underline">dpo@acompanhantes.com</a></li>
              <li><strong>Assunto:</strong> "LGPD - Exercício de Direitos"</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">12.</span> Contato
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas, solicitações ou reclamações sobre privacidade:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>E-mail:</strong> <a href="mailto:privacidade@acompanhantes.com" className="text-primary hover:underline">privacidade@acompanhantes.com</a></li>
              <li><strong>FAQ:</strong> <Link to="/faq" className="text-primary hover:underline">Perguntas Frequentes</Link></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Você também pode apresentar uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD) se 
              considerar que seus direitos não foram respeitados.
            </p>
          </section>
        </article>

        {/* CTA */}
        <section className="mt-12 text-center bg-card border rounded-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-3">Documentos Relacionados</h2>
          <p className="text-muted-foreground mb-6">
            Leia também nossos termos de uso e perguntas frequentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/termos" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Termos de Uso
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

export default Privacy;
