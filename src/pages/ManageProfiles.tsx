import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Film } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

import { StoryUploader } from "@/components/StoryUploader";
import { StoryAnalytics } from "@/components/StoryAnalytics";

type ModelProfile = Tables<"model_profiles">;

const ManageProfiles = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfileForStory, setSelectedProfileForStory] = useState<string | null>(null);

  useEffect(() => {
    if (userRole !== 'model') {
      navigate('/dashboard');
      return;
    }
    fetchProfiles();
  }, [userRole, navigate]);

  const fetchProfiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('model_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar anúncios");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProfileStatus = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('model_profiles')
        .update({ is_active: !currentStatus })
        .eq('id', profileId);

      if (error) throw error;

      toast.success(currentStatus ? "Anúncio despublicado" : "Anúncio publicado");
      fetchProfiles();
    } catch (error: any) {
      toast.error("Erro ao atualizar status");
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;

    try {
      const { error } = await supabase
        .from('model_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      toast.success("Anúncio excluído com sucesso");
      fetchProfiles();
    } catch (error: any) {
      toast.error("Erro ao excluir anúncio");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] bg-clip-text text-transparent mb-2">
                Meus Anúncios
              </h1>
              <p className="text-muted-foreground">
                Gerencie seus perfis e anúncios
              </p>
            </div>
            <Button 
              onClick={() => navigate('/anuncios/novo')}
              className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Novo Anúncio
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : profiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Você ainda não criou nenhum anúncio
                </p>
                <Button 
                  onClick={() => navigate('/anuncios/novo')}
                  className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Primeiro Anúncio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="anuncios" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="anuncios">Meus Anúncios</TabsTrigger>
                <TabsTrigger value="stories">
                  <Film className="h-4 w-4 mr-2" />
                  Stories
                </TabsTrigger>
              </TabsList>

              <TabsContent value="anuncios" className="mt-6">
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <div className="flex flex-col sm:flex-row">
                        {/* Foto (Esquerda) */}
                        <div className="relative w-full h-64 sm:w-64 sm:h-auto flex-shrink-0">
                          {profile.photo_url ? (
                            <img 
                              src={profile.photo_url} 
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                              Sem foto
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              profile.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }`}>
                              {profile.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>

                        {/* Informações Principais (Centro) */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {profile.city}, {profile.state}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <p><strong>Idade:</strong> {profile.age} anos</p>
                            <p><strong>Preço:</strong> R$ {profile.price}</p>
                            <p><strong>Categoria:</strong> {profile.category}</p>
                          </div>
                        </div>

                        {/* Ações (Direita) */}
                        <div className="p-6 border-t sm:border-t-0 sm:border-l flex flex-row sm:flex-col gap-2 w-full sm:w-48">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/anuncios/editar/${profile.id}`)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleProfileStatus(profile.id, profile.is_active || false)}
                            className="flex-1 sm:flex-none"
                          >
                            {profile.is_active ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Publicar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProfile(profile.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="stories" className="mt-6">
                <div className="space-y-6">
                  {profiles.filter(p => p.verified).length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                          Apenas perfis verificados podem publicar stories
                        </p>
                        <Button onClick={() => navigate('/verificacao')}>
                          Solicitar Verificação
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Selecione o perfil:
                        </label>
                        <select
                          value={selectedProfileForStory || ""}
                          onChange={(e) => setSelectedProfileForStory(e.target.value)}
                          className="w-full max-w-md px-4 py-2 rounded-md border border-border bg-background"
                        >
                          <option value="">Selecione um perfil</option>
                          {profiles.filter(p => p.verified).map((profile) => (
                            <option key={profile.id} value={profile.id}>
                              {profile.name} - {profile.city}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedProfileForStory && (
                        <>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Publicar Novo Story</h3>
                            <StoryUploader
                              profileId={selectedProfileForStory}
                              onUploadSuccess={() => {
                                toast.success("Story publicado com sucesso!");
                              }}
                            />
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                            <StoryAnalytics profileId={selectedProfileForStory} />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageProfiles;