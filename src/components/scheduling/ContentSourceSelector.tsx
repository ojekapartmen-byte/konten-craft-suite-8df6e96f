import { useState, useEffect } from "react";
import { FileText, Image, Video, Film, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ContentItem {
  id: string;
  title: string;
  type: "text" | "image" | "video";
  preview: string;
  createdAt: Date;
  metadata?: {
    caption?: string;
    imageUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  };
}

interface ContentSourceSelectorProps {
  onSelect: (content: ContentItem) => void;
  selectedId?: string;
}

export const ContentSourceSelector = ({ onSelect, selectedId }: ContentSourceSelectorProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("text");
  const [isLoading, setIsLoading] = useState(false);
  const [textContents, setTextContents] = useState<ContentItem[]>([]);
  const [imageContents, setImageContents] = useState<ContentItem[]>([]);
  const [videoContents, setVideoContents] = useState<ContentItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchAllContent();
    }
  }, [user]);

  const fetchAllContent = async () => {
    if (!user) return;
    setIsLoading(true);

    // Fetch each content type independently to avoid one failure blocking others
    const fetchDrafts = async () => {
      try {
        const { data: drafts, error } = await supabase
          .from("content_drafts")
          .select("id, title, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        if (drafts) {
          setTextContents(
            drafts.map((d) => {
              const content = d.content as { mainScript?: string; caption?: string };
              return {
                id: d.id,
                title: d.title,
                type: "text" as const,
                preview: content?.mainScript?.slice(0, 100) || "No preview",
                createdAt: new Date(d.created_at),
                metadata: {
                  caption: content?.caption,
                },
              };
            })
          );
        }
      } catch (error) {
        console.error("Error fetching drafts:", error);
      }
    };

    const fetchImages = async () => {
      try {
        const { data: images, error } = await supabase
          .from("generated_images")
          .select("id, title, prompt, image_url, thumbnail_url, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        if (images) {
          setImageContents(
            images.map((img) => ({
              id: img.id,
              title: img.title || "Untitled Image",
              type: "image" as const,
              preview: img.prompt.slice(0, 100),
              createdAt: new Date(img.created_at),
              metadata: {
                imageUrl: img.image_url,
                thumbnailUrl: img.thumbnail_url || img.image_url,
              },
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    const fetchVideos = async () => {
      try {
        const { data: videos, error } = await supabase
          .from("video_projects")
          .select("id, title, slides, total_duration, thumbnail_url, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        if (videos) {
          setVideoContents(
            videos.map((vid) => ({
              id: vid.id,
              title: vid.title,
              type: "video" as const,
              preview: `${(vid.slides as unknown[])?.length || 0} slides, ${vid.total_duration}s`,
              createdAt: new Date(vid.created_at),
              metadata: {
                thumbnailUrl: vid.thumbnail_url || undefined,
              },
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    // Run all fetches in parallel - each handles its own errors
    await Promise.all([fetchDrafts(), fetchImages(), fetchVideos()]);
    setIsLoading(false);
  };

  const renderContentList = (items: ContentItem[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary ${
              selectedId === item.id
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => onSelect(item)}
          >
            <div className="flex items-start gap-3">
              {item.type === "image" && item.metadata?.thumbnailUrl && (
                <img
                  src={item.metadata.thumbnailUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              {item.type === "video" && item.metadata?.thumbnailUrl && (
                <img
                  src={item.metadata.thumbnailUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{item.title}</span>
                  {selectedId === item.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {item.preview}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(item.createdAt, "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          Pilih Konten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Teks</span>
              {textContents.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {textContents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Gambar</span>
              {imageContents.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {imageContents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Video</span>
              {videoContents.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {videoContents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[250px]">
            <TabsContent value="text" className="mt-0">
              {renderContentList(
                textContents,
                "Belum ada konten teks. Buat di Text Generator."
              )}
            </TabsContent>
            <TabsContent value="image" className="mt-0">
              {renderContentList(
                imageContents,
                "Belum ada gambar. Buat di Image Generator."
              )}
            </TabsContent>
            <TabsContent value="video" className="mt-0">
              {renderContentList(
                videoContents,
                "Belum ada proyek video. Buat di Video Generator."
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export type { ContentItem };
