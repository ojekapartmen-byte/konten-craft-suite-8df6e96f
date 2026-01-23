import { MainLayout } from "@/components/layout/MainLayout";
import { ToolCard } from "@/components/ui/ToolCard";
import { FileText, Mic2, ImageIcon, Video, Zap, TrendingUp } from "lucide-react";

const tools = [
  {
    icon: FileText,
    title: "Text Generator",
    description: "Create scripts, articles, and creative content with AI assistance",
    path: "/text",
    gradient: "primary" as const,
  },
  {
    icon: Mic2,
    title: "Voice Dubbing",
    description: "Transform text into natural-sounding speech with multiple voices",
    path: "/voice",
    gradient: "accent" as const,
  },
  {
    icon: ImageIcon,
    title: "Image Generator",
    description: "Generate stunning visuals from text descriptions",
    path: "/image",
    gradient: "success" as const,
  },
  {
    icon: Video,
    title: "Video Generator",
    description: "Create videos by combining images and voice dubbing",
    path: "/video",
    gradient: "warm" as const,
  },
];

const stats = [
  { label: "Creations Today", value: "128", icon: Zap },
  { label: "Total Generated", value: "2,847", icon: TrendingUp },
];

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="mb-12 animate-fade-in">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Welcome to{" "}
          <span className="gradient-text">AI Studio</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Your all-in-one creative toolkit. Generate text, voice, images, and videos
          with the power of artificial intelligence.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 flex gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card flex items-center gap-4 rounded-xl px-6 py-4 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
          Creation Tools
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool, index) => (
            <div
              key={tool.path}
              className="animate-fade-in"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mt-12">
        <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
          Recent Creations
        </h2>
        <div className="glass-card rounded-xl p-8 text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Your recent creations will appear here
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Start creating with any of the tools above
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
