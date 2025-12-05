import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import ClientSidebar from "@/components/client-dashboard/ClientSidebar";
import ClientBottomNav from "@/components/client-dashboard/ClientBottomNav";
import ClientFeed from "@/components/client-dashboard/ClientFeed";
import ClientDiscover from "@/components/client-dashboard/ClientDiscover";
import ClientMessages from "@/components/client-dashboard/ClientMessages";
import ClientActivity from "@/components/client-dashboard/ClientActivity";
import ClientWallet from "@/components/client-dashboard/ClientWallet";
import ClientNotifications from "@/components/client-dashboard/ClientNotifications";
import ClientSettings from "@/components/client-dashboard/ClientSettings";

export type DashboardSection = "feed" | "discover" | "messages" | "activity" | "wallet" | "notifications" | "settings";

export default function ClientDashboard() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>("feed");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/cliente/auth" replace />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "feed":
        return <ClientFeed />;
      case "discover":
        return <ClientDiscover />;
      case "messages":
        return <ClientMessages />;
      case "activity":
        return <ClientActivity />;
      case "wallet":
        return <ClientWallet />;
      case "notifications":
        return <ClientNotifications />;
      case "settings":
        return <ClientSettings />;
      default:
        return <ClientFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: Sidebar */}
      <div className="hidden lg:block">
        <ClientSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {renderSection()}
        </div>
      </div>

      {/* Mobile: Bottom Navigation */}
      <div className="lg:hidden">
        <ClientBottomNav 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
      </div>
    </div>
  );
}
