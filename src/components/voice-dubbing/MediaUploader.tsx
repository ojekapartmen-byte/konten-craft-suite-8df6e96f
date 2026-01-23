import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Music, Video, Clock } from "lucide-react";
import { UploadedMedia } from "@/types/voiceDubbing";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  uploadedMedia?: UploadedMedia;
  onMediaUpload: (media: UploadedMedia) => void;
  onMediaRemove: () => void;
}

export const MediaUploader = ({
  uploadedMedia,
  onMediaUpload,
  onMediaRemove,
}: MediaUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      
      if (file.type.startsWith('audio/')) {
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(url);
          resolve(audio.duration);
        });
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load audio'));
        });
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(url);
          resolve(video.duration);
        });
        video.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load video'));
        });
      } else {
        URL.revokeObjectURL(url);
        reject(new Error('Unsupported file type'));
      }
    });
  };

  const handleFile = async (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'video/mp4', 'video/webm', 'video/quicktime'];
    
    if (!validTypes.some(t => file.type.includes(t.split('/')[1]))) {
      toast({
        title: "Format tidak didukung",
        description: "Upload file MP3, MP4, atau WAV",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Maksimal 100MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const duration = await getMediaDuration(file);
      const type = file.type.startsWith('audio/') ? 'audio' : 'video';
      
      onMediaUpload({
        file,
        type,
        duration,
        name: file.name,
      });

      toast({
        title: "File berhasil diupload",
        description: `Durasi: ${formatDuration(duration)}`,
      });
    } catch (error) {
      toast({
        title: "Gagal memproses file",
        description: "Coba file lain",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        Upload Sumber Video/Audio
        <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
      </Label>

      {!uploadedMedia ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border bg-secondary/30 hover:bg-secondary/50",
            isProcessing && "pointer-events-none opacity-50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            onChange={handleChange}
            className="hidden"
          />
          
          {isProcessing ? (
            <>
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Memproses file...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drop file atau klik untuk upload</p>
              <p className="text-xs text-muted-foreground mt-1">MP3, MP4, WAV (maks 100MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
          {uploadedMedia.type === 'audio' ? (
            <Music className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-lg" />
          ) : (
            <Video className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-lg" />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{uploadedMedia.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(uploadedMedia.duration)}</span>
              <span className="uppercase">{uploadedMedia.type}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onMediaRemove}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload video/audio referensi untuk menghitung estimasi durasi voice over
      </p>
    </div>
  );
};
