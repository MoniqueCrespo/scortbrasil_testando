import { Search, UserCheck, MessageCircle, Star } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Busque e Filtre",
      description: "Use nossos filtros avançados para encontrar profissionais por localização, idade, serviços e muito mais.",
      number: "01"
    },
    {
      icon: UserCheck,
      title: "Veja Perfis Verificados",
      description: "Navegue por perfis com fotos reais, avaliações autênticas e informações completas. Perfis verificados garantem segurança.",
      number: "02"
    },
    {
      icon: MessageCircle,
      title: "Entre em Contato",
      description: "Conecte-se diretamente com profissionais através de WhatsApp ou Telegram. Comunicação rápida e segura.",
      number: "03"
    },
    {
      icon: Star,
      title: "Avalie sua Experiência",
      description: "Após o contato, deixe sua avaliação para ajudar outros usuários a fazer escolhas informadas.",
      number: "04"
    }
  ];

  return (
    <section id="como-funciona" className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre profissionais verificados em apenas 4 passos simples. Rápido, seguro e transparente.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={index}
                className="relative group"
              >
                {/* Connector Line (hidden on mobile, last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                <div className="relative bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-lg shadow-lg hover:shadow-xl"
          >
            Começar Agora
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
