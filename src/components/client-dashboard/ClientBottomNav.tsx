import { Home, Compass, MessageCircle, Activity, User } from "lucide-react";
import { DashboardSection } from "@/pages/ClientDashboard";
import { Badge } from "@/components/ui/badge";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

interface ClientBottomNavProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export default function ClientBottomNav({ activeSection, onSectionChange }: ClientBottomNavProps) {
  const { unreadCount: messagesCount } = useUnreadMessages();

  const navItems = [
    { id: "feed" as DashboardSection, icon: Home, label: "Feed", badge: 0 },
    { id: "discover" as DashboardSection, icon: Compass, label: "Descobrir", badge: 0 },
    { id: "messages" as DashboardSection, icon: MessageCircle, label: "Mensagens", badge: messagesCount },
    { id: "activity" as DashboardSection, icon: Activity, label: "Atividade", badge: 0 },
    { id: "settings" as DashboardSection, icon: User, label: "Perfil", badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-0
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
                }
              `}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
