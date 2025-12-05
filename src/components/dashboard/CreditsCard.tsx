import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, ShoppingCart, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CreditShopModal from "./CreditShopModal";
import CreditHistoryModal from "./CreditHistoryModal";

const CreditsCard = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState({
    balance: 0,
    total_earned: 0,
    total_spent: 0,
  });
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCredits();
      
      // Realtime subscription
      const channel = supabase
        .channel('user_credits_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_credits',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchCredits();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setCredits(data);
    } else if (error && error.code === 'PGRST116') {
      // Usuário ainda não tem registro de créditos
      setCredits({ balance: 0, total_earned: 0, total_spent: 0 });
    }
  };

  const percentageUsed = credits.total_earned > 0 
    ? Math.round((credits.total_spent / credits.total_earned) * 100)
    : 0;

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            Meus Créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">
            {credits.balance}
            <span className="text-sm font-normal text-muted-foreground ml-2">créditos</span>
          </div>
          
          <Progress value={100 - percentageUsed} className="mb-3 h-2" />
          
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div>
              <p className="text-muted-foreground">Total ganho</p>
              <p className="font-semibold">{credits.total_earned}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total gasto</p>
              <p className="font-semibold">{credits.total_spent}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setIsShopOpen(true)}
              className="flex-1"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Comprar
            </Button>
            <Button 
              onClick={() => setIsHistoryOpen(true)}
              variant="outline"
              size="sm"
            >
              <History className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreditShopModal 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
      />
      
      <CreditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
};

export default CreditsCard;