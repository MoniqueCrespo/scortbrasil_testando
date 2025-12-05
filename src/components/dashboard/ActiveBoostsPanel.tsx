import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Eye, MousePointer, TrendingUp, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import BoostSelectionModal from "./BoostSelectionModal";

interface ActiveBoost {
  id: string;
  profile_id: string;
  start_date: string;
  end_date: string;
  views_count: number;
  clicks_count: number;
  status: string;
  boost_packages: {
    name: string;
    badge_text: string;
    badge_color: string;
  };
  model_profiles: {
    id: string;
    name: string;
    photo_url: string;
  };
}

const ActiveBoostsPanel = () => {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState<ActiveBoost[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingBoost, setRenewingBoost] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchActiveBoosts();

      // Realtime subscription
      const channel = supabase
        .channel('active_boosts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'active_boosts',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchActiveBoosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchActiveBoosts = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('active_boosts')
      .select(`
        *,
        boost_packages (name, badge_text, badge_color),
        model_profiles (id, name, photo_url)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('end_date', { ascending: true });

    if (!error && data) {
      setBoosts(data as any);
    }
    setLoading(false);
  };

  const getProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / total) * 100), 100);
  };

  const getCTR = (views: number, clicks: number) => {
    if (views === 0) return 0;
    return ((clicks / views) * 100).toFixed(1);
  };

  const handleRenew = (boost: ActiveBoost) => {
    setSelectedProfile(boost.model_profiles);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (boosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Boosts Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">
            Você não tem nenhum boost ativo no momento
          </p>
          <p className="text-sm text-muted-foreground">
            Impulsione seus anúncios para aumentar a visibilidade
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Boosts Ativos ({boosts.length})
        </h2>

        {boosts.map((boost) => {
          const progress = getProgress(boost.start_date, boost.end_date);
          const ctr = getCTR(boost.views_count, boost.clicks_count);
          const timeRemaining = new Date(boost.end_date).getTime() - Date.now();
          const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

          return (
            <Card key={boost.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Imagem do perfil */}
                  <div className="flex-shrink-0">
                    <img
                      src={boost.model_profiles.photo_url || '/placeholder.svg'}
                      alt={boost.model_profiles.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>

                  {/* Info do boost */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{boost.model_profiles.name}</h3>
                        <Badge 
                          style={{ backgroundColor: boost.boost_packages.badge_color }}
                          className="text-white mt-1"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {boost.boost_packages.badge_text}
                        </Badge>
                      </div>
                      <Badge variant={hoursRemaining < 24 ? "destructive" : "secondary"}>
                        {hoursRemaining < 1 ? 'Expirando em breve' : `${hoursRemaining}h restantes`}
                      </Badge>
                    </div>

                    <Progress value={progress} className="mb-3 h-2" />

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Eye className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{boost.views_count}</p>
                        <p className="text-xs text-muted-foreground">visualizações</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <MousePointer className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{boost.clicks_count}</p>
                        <p className="text-xs text-muted-foreground">cliques</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{ctr}%</p>
                        <p className="text-xs text-muted-foreground">CTR</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Expira em: {format(new Date(boost.end_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRenew(boost)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Renovar Boost
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProfile && (
        <BoostSelectionModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
          onSuccess={fetchActiveBoosts}
        />
      )}
    </>
  );
};

export default ActiveBoostsPanel;