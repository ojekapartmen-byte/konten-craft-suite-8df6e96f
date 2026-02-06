import { useState, useRef } from "react";
import { Image, Video, Upload, X, Link, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MediaUploadSectionProps {
  imageUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  onImageUrlChange: (url: string) => void;
  onVideoUrlChange: (url: string) => void;
  onThumbnailUrlChange: (url: string) => void;
}

export const MediaUploadSection = ({
  imageUrl,
  videoUrl,
  thumbnailUrl,
  onImageUrlChange,
  onVideoUrlChange,
  onThumbnailUrlChange,
}: MediaUploadSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({ title: "Silakan login terlebih dahulu", variant: "destructive" });
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({ title: "File terlalu besar", description: "Maksimal 50MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("scheduling-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("scheduling-media")
        .getPublicUrl(fileName);

      if (file.type.startsWith("image/")) {
        onImageUrlChange(publicUrl);
        onThumbnailUrlChange(publicUrl);
      } else if (file.type.startsWith("video/")) {
        onVideoUrlChange(publicUrl);
      }

      toast({ title: "File berhasil diupload!" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Gagal upload file", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const previewUrl = imageUrl || thumbnailUrl;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Media Konten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/30 hover:bg-secondary/50",
                isUploading && "pointer-events-none opacity-50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Mengupload...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drop file atau klik untuk upload</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gambar (JPG, PNG, WebP) atau Video (MP4, WebM) — maks 50MB
                  </p>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">URL Gambar</Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="image_url"
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
                  value={imageUrl}
                  onChange={(e) => {
                    onImageUrlChange(e.target.value);
                    if (!thumbnailUrl) onThumbnailUrlChange(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">URL Video</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="video_url"
                  placeholder="https://example.com/video.mp4"
                  className="pl-10"
                  value={videoUrl}
                  onChange={(e) => onVideoUrlChange(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {(previewUrl || videoUrl) && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Preview</Label>
            <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Media preview"
                    className="w-full max-h-48 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      onImageUrlChange("");
                      onThumbnailUrlChange("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {videoUrl && !previewUrl && (
                <div className="flex items-center gap-3 p-4">
                  <Video className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoUrl}</p>
                    <p className="text-xs text-muted-foreground">Video</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onVideoUrlChange("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
