import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "verification" | "report" | "profile" | "subscription";
  message: string;
  timestamp: string;
  link: string;
}

export const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    fetchPendingItems();

    // Setup realtime listeners
    const verificationsChannel = supabase
      .channel('verifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'verification_requests',
          filter: 'status=eq.pending',
        },
        () => {
          toast.info("Nova solicitação de verificação!");
          fetchPendingItems();
        }
      )
      .subscribe();

    const reportsChannel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
          filter: 'status=eq.pending',
        },
        () => {
          toast.info("Nova denúncia recebida!");
          fetchPendingItems();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'model_profiles',
          filter: 'moderation_status=eq.pending',
        },
        () => {
          toast.info("Novo anúncio para moderação!");
          fetchPendingItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(verificationsChannel);
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const fetchPendingItems = async () => {
    const newNotifications: Notification[] = [];

    try {
      // Verificações pendentes
      const { count: verificationsCount } = await supabase
        .from("verification_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (verificationsCount && verificationsCount > 0) {
        newNotifications.push({
          id: "verifications",
          type: "verification",
          message: `${verificationsCount} verificaç${verificationsCount === 1 ? 'ão' : 'ões'} pendente${verificationsCount === 1 ? '' : 's'}`,
          timestamp: new Date().toISOString(),
          link: "/admin/verificacoes",
        });
      }

      // Denúncias pendentes
      const { count: reportsCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (reportsCount && reportsCount > 0) {
        newNotifications.push({
          id: "reports",
          type: "report",
          message: `${reportsCount} denúncia${reportsCount === 1 ? '' : 's'} pendente${reportsCount === 1 ? '' : 's'}`,
          timestamp: new Date().toISOString(),
          link: "/admin/dashboard",
        });
      }

      // Anúncios pendentes
      const { count: profilesCount } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "pending");

      if (profilesCount && profilesCount > 0) {
        newNotifications.push({
          id: "profiles",
          type: "profile",
          message: `${profilesCount} anúncio${profilesCount === 1 ? '' : 's'} aguardando moderação`,
          timestamp: new Date().toISOString(),
          link: "/admin/moderacao",
        });
      }

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const handleNotificationClick = (link: string) => {
    navigate(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação pendente
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="cursor-pointer p-3"
              onClick={() => handleNotificationClick(notification.link)}
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
