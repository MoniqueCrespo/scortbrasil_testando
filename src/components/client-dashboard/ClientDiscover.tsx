import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, TrendingUp, Clock, Users, Eye, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getProfileUrl } from "@/utils/locationUtils";

interface Creator {
  id: string;
  name: string;
  slug: string;
  photo_url: string;
  category: string;
  verified: boolean;
  state: string;
  city: string;
  subscriber_count?: number;
  content_count?: number;
  preview_content?: {
    id: string;
    media_url: string;
    media_type: string;
  }[];
  subscription_tiers?: {
    id: string;
    tier_name: string;
    monthly_price: number;
  }[];
}

export default function ClientDiscover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    fetchCreators();
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [creators, searchQuery, selectedCategory, sortBy]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('content_subscriptions')
        .select('profile_id')
        .eq('subscriber_id', user.id)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      setSubscribedIds(new Set(data?.map(s => s.profile_id) || []));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchCreators = async () => {
    setLoading(true);

    try {
      // Buscar perfis com tier de assinatura
      const { data: profiles, error } = await supabase
        .from('model_profiles')
        .select(`
          id,
          name,
          slug,
          photo_url,
          category,
          verified,
          state,
          city,
          subscription_tiers (
            id,
            tier_name,
            monthly_price,
            sort_order
          )
        `)
        .eq('is_active', true)
        .not('subscription_tiers', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Buscar contagem de assinantes e conteúdo para cada perfil
      const creatorsWithStats = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          // Contar assinantes
          const { count: subscriberCount } = await supabase
            .from('content_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', profile.id)
            .eq('status', 'active');

          // Contar conteúdo exclusivo
          const { count: contentCount } = await supabase
            .from('exclusive_content')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', profile.id);

          // Buscar preview de conteúdo (público)
          const { data: previewContent } = await supabase
            .from('exclusive_content')
            .select('id, media_url, media_type')
            .eq('profile_id', profile.id)
            .eq('is_preview', true)
            .limit(3);

          return {
            ...profile,
            subscriber_count: subscriberCount || 0,
            content_count: contentCount || 0,
            preview_content: previewContent || [],
            subscription_tiers: profile.subscription_tiers?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
          };
        })
      );

      setCreators(creatorsWithStats);
    } catch (error) {
      console.error('Error fetching creators:', error);
      toast.error("Erro ao carregar criadoras");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...creators];

    // Filtro de busca
    if (searchQuery) {
      filtered = filtered.filter(creator =>
        creator.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro de categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter(creator => creator.category === selectedCategory);
    }

    // Ordenação
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.subscriber_count || 0) - (a.subscriber_count || 0));
        break;
      case "new":
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "content":
        filtered.sort((a, b) => (b.content_count || 0) - (a.content_count || 0));
        break;
      case "price_low":
        filtered.sort((a, b) => {
          const priceA = a.subscription_tiers?.[0]?.monthly_price || 999;
          const priceB = b.subscription_tiers?.[0]?.monthly_price || 999;
          return priceA - priceB;
        });
        break;
      case "price_high":
        filtered.sort((a, b) => {
          const priceA = a.subscription_tiers?.[0]?.monthly_price || 0;
          const priceB = b.subscription_tiers?.[0]?.monthly_price || 0;
          return priceB - priceA;
        });
        break;
    }

    setFilteredCreators(filtered);
  };

  const isSubscribed = (profileId: string) => subscribedIds.has(profileId);

  const handleViewProfile = (creator: Creator) => {
    const profileUrl = getProfileUrl(creator.state, creator.city, creator.slug);
    navigate(profileUrl);
  };

  const categories = [
    { value: "all", label: "Todas" },
    { value: "acompanhantes", label: "Acompanhantes" },
    { value: "homens", label: "Homens" },
    { value: "trans", label: "Trans" },
    { value: "casais", label: "Casais" },
    { value: "massagistas", label: "Massagistas" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar criadoras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Mais Populares
                  </div>
                </SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Mais Recentes
                  </div>
                </SelectItem>
                <SelectItem value="content">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Mais Conteúdo
                  </div>
                </SelectItem>
                <SelectItem value="price_low">Menor Preço</SelectItem>
                <SelectItem value="price_high">Maior Preço</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Seções Inteligentes */}
      {filteredCreators.length > 0 && searchQuery === "" && (
        <>
          {/* Recomendados para você */}
          {filteredCreators.filter(c => !isSubscribed(c.id)).slice(0, 3).length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">✨ Recomendados para Você</h2>
                <p className="text-sm text-muted-foreground">Criadoras que você pode gostar</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {filteredCreators.filter(c => !isSubscribed(c.id)).slice(0, 3).map((creator) => {
                  const lowestTier = creator.subscription_tiers?.[0];
                  return (
                    <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={creator.photo_url}
                          alt={creator.name}
                          className="w-full h-64 object-cover"
                        />
                        {creator.verified && (
                          <Badge className="absolute top-3 right-3 bg-primary">
                            <Star className="h-3 w-3 mr-1" />
                            Verificada
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{creator.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(c => c.value === creator.category)?.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {creator.subscriber_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {creator.content_count || 0} posts
                          </div>
                        </div>
                        {lowestTier && (
                          <div className="text-center mb-3 p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">A partir de</div>
                            <div className="text-2xl font-bold text-primary">
                              R$ {lowestTier.monthly_price.toFixed(2)}/mês
                            </div>
                          </div>
                        )}
                        <Button onClick={() => handleViewProfile(creator)} className="w-full">
                          Ver Perfil
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mais Populares */}
          {filteredCreators.filter(c => (c.subscriber_count || 0) > 5).slice(0, 3).length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">🔥 Mais Populares</h2>
                <p className="text-sm text-muted-foreground">Criadoras com mais assinantes</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {filteredCreators.filter(c => (c.subscriber_count || 0) > 5).slice(0, 3).map((creator) => {
                  const lowestTier = creator.subscription_tiers?.[0];
                  const subscribed = isSubscribed(creator.id);
                  return (
                    <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={creator.photo_url}
                          alt={creator.name}
                          className="w-full h-64 object-cover"
                        />
                        {subscribed && (
                          <Badge className="absolute top-3 left-3 bg-green-600">
                            ✓ Inscrito
                          </Badge>
                        )}
                        {creator.verified && (
                          <Badge className="absolute top-3 right-3 bg-primary">
                            <Star className="h-3 w-3 mr-1" />
                            Verificada
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{creator.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(c => c.value === creator.category)?.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {creator.subscriber_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {creator.content_count || 0} posts
                          </div>
                        </div>
                        {lowestTier && (
                          <div className="text-center mb-3 p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">A partir de</div>
                            <div className="text-2xl font-bold text-primary">
                              R$ {lowestTier.monthly_price.toFixed(2)}/mês
                            </div>
                          </div>
                        )}
                        <Button onClick={() => handleViewProfile(creator)} className="w-full" variant={subscribed ? "outline" : "default"}>
                          {subscribed ? "Ver Conteúdo" : "Ver Perfil"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Resultados Completos */}
      {(searchQuery !== "" || selectedCategory !== "all" || sortBy !== "popular") && (
        <>
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {searchQuery ? `Resultados para "${searchQuery}"` : "Todas as Criadoras"}
            </h2>
          </div>

      {filteredCreators.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhuma criadora encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">Tente ajustar os filtros de busca</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => {
            const lowestTier = creator.subscription_tiers?.[0];
            const subscribed = isSubscribed(creator.id);

            return (
              <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={creator.photo_url}
                    alt={creator.name}
                    className="w-full h-64 object-cover"
                  />
                  {subscribed && (
                    <Badge className="absolute top-3 left-3 bg-green-600">
                      ✓ Inscrito
                    </Badge>
                  )}
                  {creator.verified && (
                    <Badge className="absolute top-3 right-3 bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      Verificada
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{creator.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.value === creator.category)?.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {creator.subscriber_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {creator.content_count || 0} posts
                    </div>
                  </div>

                  {/* Preview de Conteúdo */}
                  {creator.preview_content && creator.preview_content.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {creator.preview_content.map((content) => (
                        <div key={content.id} className="relative aspect-square rounded overflow-hidden">
                          {content.media_type === 'video' ? (
                            <video
                              src={content.media_url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={content.media_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {lowestTier && (
                    <div className="text-center mb-3 p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">A partir de</div>
                      <div className="text-2xl font-bold text-primary">
                        R$ {lowestTier.monthly_price.toFixed(2)}/mês
                      </div>
                    </div>
                  )}

                   <Button
                    onClick={() => handleViewProfile(creator)}
                    className="w-full"
                    variant={subscribed ? "outline" : "default"}
                  >
                    {subscribed ? "Ver Conteúdo" : "Ver Perfil"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}
