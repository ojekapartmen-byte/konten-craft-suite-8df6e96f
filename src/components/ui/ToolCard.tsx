import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  gradient: "primary" | "accent" | "success" | "warm";
}

const gradientClasses = {
  primary: "from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10",
  accent: "from-accent/20 to-accent/5 hover:from-accent/30 hover:to-accent/10",
  success: "from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/30 hover:to-emerald-500/10",
  warm: "from-orange-500/20 to-orange-500/5 hover:from-orange-500/30 hover:to-orange-500/10",
};

const iconBgClasses = {
  primary: "bg-primary/20 text-primary",
  accent: "bg-accent/20 text-accent",
  success: "bg-emerald-500/20 text-emerald-400",
  warm: "bg-orange-500/20 text-orange-400",
};

export const ToolCard = ({ icon: Icon, title, description, path, gradient }: ToolCardProps) => {
  return (
    <Link to={path} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-6 transition-all duration-300",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
          "hover:-translate-y-1",
          gradientClasses[gradient]
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
            iconBgClasses[gradient]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Content */}
        <h3 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Open tool
          <svg
            className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20" />
      </div>
    </Link>
  );
};
