import { Link, useLocation } from "react-router-dom";
import { Apple, BarChart3, Calendar, Lightbulb, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Apple },
    { path: "/analyzer", label: "Analyzer", icon: BarChart3 },
    { path: "/planner", label: "AI Planner", icon: Lightbulb },
    { path: "/tracker", label: "Tracker", icon: Calendar },
    { path: "/insights", label: "Insights", icon: BarChart3 },
    { path: "/about", label: "About", icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Apple className="h-7 w-7" />
            NutriScan
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu - simplified for demo */}
          <div className="flex md:hidden items-center gap-2">
            {navItems.slice(1, 4).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
