import { brazilStates } from "@/data/locations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StateCard from "@/components/StateCard";
import SEOHead from "@/components/SEOHead";

const LocationHome = () => {
  // Meta tags dinâmicas para SEO
  const pageTitle = "HotBrazil | Escolha seu Estado";
  const pageDescription = `Encontre acompanhantes em todo o Brasil no HotBrazil. ${brazilStates.length} estados disponíveis com milhares de perfis verificados. Navegue por estado, cidade e categoria.`;
  const pageKeywords = "hotbrazil, acompanhantes brasil, escorts brasil, acompanhantes por estado, garotas de programa";
  const canonicalUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background">
        <SEOHead 
          title={pageTitle}
          description={pageDescription}
          keywords={pageKeywords}
          canonical={canonicalUrl}
        />
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Escolha seu Estado
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Selecione o estado para encontrar os melhores perfis da sua região
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {brazilStates.map((state) => (
              <StateCard key={state.code} state={state} />
            ))}
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default LocationHome;
