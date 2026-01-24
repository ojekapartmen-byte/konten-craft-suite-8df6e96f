import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Heart, 
  MoreVertical, 
  Play, 
  Pencil, 
  Trash2, 
  Video,
  Clock,
  Images,
  Loader2
} from "lucide-react";
import { VideoProject } from "@/hooks/useVideoProjects";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface VideoProjectGalleryProps {
  projects: VideoProject[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; isFavorite?: boolean }) => void;
  onToggleFavorite: (id: string) => void;
  onLoadProject: (project: VideoProject) => void;
}

export const VideoProjectGallery = ({
  projects,
  isLoading,
  onDelete,
  onUpdate,
  onToggleFavorite,
  onLoadProject,
}: VideoProjectGalleryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [viewProject, setViewProject] = useState<VideoProject | null>(null);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || project.isFavorite;
    return matchesSearch && matchesFavorites;
  });

  const handleStartEdit = (project: VideoProject) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdate(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Selesai</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="glass-card h-full">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Project Video ({projects.length})
          </CardTitle>
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-1"
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Video className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery || showFavoritesOnly
                  ? "Tidak ada project yang cocok"
                  : "Belum ada project video"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-all"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded-md bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {project.slides[0]?.src ? (
                        <img
                          src={project.slides[0].src}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === project.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(project.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(project.id)}>
                            Simpan
                          </Button>
                        </div>
                      ) : (
                        <h4 className="font-medium text-sm truncate">{project.title}</h4>
                      )}

                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Images className="h-3 w-3" />
                          {project.slides.length} slides
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(project.totalDuration)}
                        </span>
                        {getStatusBadge(project.status)}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {format(project.createdAt, "dd MMM yyyy, HH:mm", { locale: localeId })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onToggleFavorite(project.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            project.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                          }`}
                        />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewProject(project)}>
                            <Play className="h-4 w-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onLoadProject(project)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStartEdit(project)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(project.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* View Project Dialog */}
      <Dialog open={!!viewProject} onOpenChange={() => setViewProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {viewProject?.title}
            </DialogTitle>
          </DialogHeader>

          {viewProject && (
            <div className="space-y-4">
              {/* Slides Preview */}
              <div>
                <h4 className="text-sm font-medium mb-2">Slides ({viewProject.slides.length})</h4>
                <div className="grid grid-cols-4 gap-2">
                  {viewProject.slides.map((slide, index) => (
                    <div key={slide.id} className="relative aspect-video rounded-md overflow-hidden bg-muted">
                      <img src={slide.src} alt={slide.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                        {slide.duration}s
                      </div>
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Durasi</p>
                  <p className="font-medium">{formatDuration(viewProject.totalDuration)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transisi</p>
                  <p className="font-medium capitalize">{viewProject.transition}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Audio</p>
                  <p className="font-medium">{viewProject.audio?.name || "Tidak ada"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(viewProject.status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Dibuat</p>
                  <p className="font-medium">
                    {format(viewProject.createdAt, "dd MMMM yyyy, HH:mm", { locale: localeId })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Diupdate</p>
                  <p className="font-medium">
                    {format(viewProject.updatedAt, "dd MMMM yyyy, HH:mm", { locale: localeId })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProject(null)}>
              Tutup
            </Button>
            <Button onClick={() => {
              if (viewProject) {
                onLoadProject(viewProject);
                setViewProject(null);
              }
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
