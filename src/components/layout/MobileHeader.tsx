import { useState } from "react";
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
  Menu,
  X,
  Globe,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

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

export const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-sidebar/95 backdrop-blur-xl px-4 md:hidden safe-area-top">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            AI<span className="gradient-text">Studio</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Slide-down menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div
            className="absolute top-14 left-0 right-0 border-b border-border bg-sidebar/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 safe-area-top"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="max-h-[70vh] overflow-y-auto px-3 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const content = (
                  <>
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                  </>
                );

                const className = cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground active:bg-secondary"
                );

                if ("isExternal" in item && item.isExternal) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                      onClick={() => setIsOpen(false)}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
