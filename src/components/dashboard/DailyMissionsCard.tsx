import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Camera, DollarSign, CheckCircle, ShieldCheck, Trophy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Mission {
  id: string;
  name: string;
  description: string;
  mission_type: string;
  credit_reward: number;
  target_value: number;
  icon: string;
}

interface MissionProgress {
  mission_id: string;
  current_value: number;
  completed: boolean;
}

const iconMap: Record<string, any> = {
  Camera,
  DollarSign,
  CheckCircle,
  ShieldCheck,
};

const DailyMissionsCard = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [progress, setProgress] = useState<Record<string, MissionProgress>>({});
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMissions();
      fetchProgress();
    }
  }, [user]);

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('is_active', true)
      .order('credit_reward', { ascending: false });

    if (data) {
      setMissions(data);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('user_mission_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);

    if (data) {
      const progressMap: Record<string, MissionProgress> = {};
      data.forEach(p => {
        progressMap[p.mission_id] = p;
      });
      setProgress(progressMap);
    }
  };

  const handleClaimReward = async (missionId: string) => {
    setClaiming(missionId);

    try {
      const { data, error } = await supabase.functions.invoke('complete-mission', {
        body: { mission_id: missionId },
      });

      if (error) throw error;

      toast.success(data.message);
      fetchProgress();
    } catch (error: any) {
      toast.error(error.message || "Erro ao resgatar recompensa");
    } finally {
      setClaiming(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Missões do Dia - Ganhe Créditos Grátis!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {missions.map((mission) => {
            const missionProgress = progress[mission.id];
            const isCompleted = missionProgress?.completed || false;
            const currentValue = missionProgress?.current_value || 0;
            const progressPercent = Math.min((currentValue / mission.target_value) * 100, 100);
            const Icon = iconMap[mission.icon] || CheckCircle;

            return (
              <div 
                key={mission.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-500/20' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-muted-foreground'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{mission.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{mission.description}</p>
                  {!isCompleted && (
                    <Progress value={progressPercent} className="h-1 mt-2" />
                  )}
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  {isCompleted ? (
                    <Badge variant="default" className="bg-green-600">
                      ✓ Completo
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-xs">
                        +{mission.credit_reward} créditos
                      </Badge>
                      {progressPercent >= 100 && (
                        <Button
                          size="sm"
                          onClick={() => handleClaimReward(mission.id)}
                          disabled={claiming === mission.id}
                          className="h-7 text-xs"
                        >
                          {claiming === mission.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Resgatar'
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyMissionsCard;