import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Code2,
} from "lucide-react";
import { authService } from "@/services/authService";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mijozlar", href: "/clients", icon: Users },
  { name: "Reservatsiyalar", href: "/reservations", icon: BookOpen },
  { name: "Suhbatlar", href: "/conversations", icon: MessageSquare },
  { name: "PDF Kanallar", href: "/pdf-channels", icon: FileText },
  { name: "Planlar", href: "/plans", icon: FileText },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-card/95 backdrop-blur-xl border-r border-border/50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border/50 bg-card/50">
            <div className="flex items-center gap-3">
              <img
                src="/image.png"
                alt="365 Logo"
                className="h-9 w-9 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-none">
                  365 Magazine
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border/50 p-4 bg-card/30">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-all mb-4"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Chiqish
            </Button>

            <div className="pt-4 border-t border-border/10 flex justify-center">
              <a
                href="https://www.cognilabs.org/uz"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-all duration-300"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                  Powered by
                </span>
                <Code2 className="h-3 w-3 text-primary" />
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Cognilabs
                </span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-card/95 backdrop-blur-xl px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        <main className="p-4 md:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
