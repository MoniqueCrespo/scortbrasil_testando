import { Home, Compass, MessageCircle, Activity, Wallet, Bell, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { DashboardSection } from "@/pages/ClientDashboard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ClientSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export default function ClientSidebar({ activeSection, onSectionChange }: ClientSidebarProps) {
  const { user, signOut } = useAuth();
  const { unreadCount: notificationsCount } = useNotifications();
  const { unreadCount: messagesCount } = useUnreadMessages();

  const menuItems = [
    { id: "feed" as DashboardSection, icon: Home, label: "Feed", badge: 0 },
    { id: "discover" as DashboardSection, icon: Compass, label: "Descobrir", badge: 0 },
    { id: "messages" as DashboardSection, icon: MessageCircle, label: "Mensagens", badge: messagesCount },
    { id: "activity" as DashboardSection, icon: Activity, label: "Atividade", badge: 0 },
    { id: "wallet" as DashboardSection, icon: Wallet, label: "Carteira", badge: 0 },
    { id: "notifications" as DashboardSection, icon: Bell, label: "Notificações", badge: notificationsCount },
    { id: "settings" as DashboardSection, icon: Settings, label: "Configurações", badge: 0 },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="font-semibold text-sm">SCORT</div>
            <div className="text-xs text-muted-foreground">BRASIL</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.badge > 0 && (
                <Badge variant={isActive ? "secondary" : "default"} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.[0].toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.email?.split("@")[0]}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
