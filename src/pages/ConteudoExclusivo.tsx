import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExclusiveContentFeed } from "@/components/ExclusiveContentFeed";

export default function ConteudoExclusivo() {
  const { profileSlug } = useParams<{ profileSlug: string }>();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Conteúdo Exclusivo</h1>
          <p className="text-muted-foreground mb-8">
            Aproveite o conteúdo exclusivo do seu perfil favorito
          </p>
          <ExclusiveContentFeed profileSlug={profileSlug} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
