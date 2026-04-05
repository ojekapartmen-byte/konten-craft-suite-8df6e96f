import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Grid2X2,
  FileText,
  Mic2,
  ImageIcon,
  Video,
  Film,
  CalendarClock,
  Sparkles,
  Globe,
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "../ThemeToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Grid2X2, label: "Command Center", path: "/command-center" },
  { icon: FileText, label: "Text Generator", path: "/text" },
  { icon: Mic2, label: "Voice Dubbing", path: "/voice" },
  { icon: ImageIcon, label: "Image Generator", path: "/image" },
  { icon: Video, label: "Video Generator", path: "/video" },
  { icon: Film, label: "Edit Video", path: "/edit-video" },
  { icon: CalendarClock, label: "Scheduling", path: "/scheduling" },
  {
    icon: Globe,
    label: "TaskFlow",
    path: "https://ebranxmels.lovable.app",
    isExternal: true,
  },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              AI<span className="gradient-text">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const content = (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </>
            );

            const className = cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            );

            if ("isExternal" in item && item.isExternal) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.path} to={item.path} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="glass-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              Powered by AI
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Create stunning content
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
