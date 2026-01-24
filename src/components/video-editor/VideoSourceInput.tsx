import { useState, useRef, useEffect } from 'react';
import { Upload, Link, History, Film, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { VideoSource, VideoSourceType } from '@/types/videoEditor';

interface VideoSourceInputProps {
  source: VideoSource | null;
  onSourceChange: (source: VideoSource | null) => void;
  disabled?: boolean;
}

interface HistoryVideo {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
}

export function VideoSourceInput({ source, onSourceChange, disabled }: VideoSourceInputProps) {
  const [activeTab, setActiveTab] = useState<VideoSourceType>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [historyVideos, setHistoryVideos] = useState<HistoryVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('generatedVideos');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistoryVideos(parsed.map((v: HistoryVideo) => ({
          ...v,
          createdAt: new Date(v.createdAt),
        })));
      }
    } catch (err) {
      console.error('Error loading video history:', err);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select a valid video file (MP4, MOV, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 500MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create object URL for preview and upload
      const objectUrl = URL.createObjectURL(file);
      
      // Get video duration
      const video = document.createElement('video');
      video.src = objectUrl;
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      onSourceChange({
        type: 'upload',
        url: objectUrl,
        name: file.name,
        duration: video.duration,
      });

      toast({
        title: 'Video loaded',
        description: `${file.name} ready for editing`,
      });
    } catch (err) {
      toast({
        title: 'Error loading video',
        description: 'Failed to load video file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid video URL',
        variant: 'destructive',
      });
      return;
    }

    onSourceChange({
      type: 'url',
      url: urlInput,
      name: urlInput.split('/').pop() || 'Video from URL',
    });

    toast({
      title: 'URL added',
      description: 'Video URL ready for processing',
    });
  };

  const handleHistorySelect = (video: HistoryVideo) => {
    onSourceChange({
      type: 'history',
      url: video.url,
      name: video.name,
    });

    toast({
      title: 'Video selected',
      description: `${video.name} ready for editing`,
    });
  };

  const clearSource = () => {
    if (source?.type === 'upload' && source.url.startsWith('blob:')) {
      URL.revokeObjectURL(source.url);
    }
    onSourceChange(null);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (source) {
    return (
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-start gap-4">
          <div className="relative aspect-video w-48 overflow-hidden rounded-lg bg-secondary">
            <video
              ref={videoPreviewRef}
              src={source.url}
              className="h-full w-full object-cover"
              muted
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{source.name}</h4>
            <p className="text-sm text-muted-foreground">
              Source: {source.type === 'upload' ? 'Uploaded file' : source.type === 'url' ? 'External URL' : 'AI Generated'}
            </p>
            {source.duration && (
              <p className="text-sm text-muted-foreground">
                Duration: {formatDuration(source.duration)}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSource}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VideoSourceType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed 
              border-border bg-secondary/30 p-8 transition-colors
              ${!disabled && !isUploading ? 'cursor-pointer hover:border-primary hover:bg-secondary/50' : 'opacity-50'}
            `}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                {isUploading ? 'Loading...' : 'Click to upload video'}
              </p>
              <p className="text-sm text-muted-foreground">
                MP4, MOV, AVI, WebM (max 500MB)
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/video.mp4"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
            <Button onClick={handleUrlSubmit} disabled={disabled || !urlInput.trim()}>
              Add
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Enter a direct link to a video file
          </p>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {historyVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Film className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Belum ada video dari AI generator
              </p>
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {historyVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleHistorySelect(video)}
                    disabled={disabled}
                    className="flex w-full items-center gap-3 rounded-lg bg-secondary/50 p-3 text-left transition-colors hover:bg-secondary"
                  >
                    <Film className="h-5 w-5 text-primary" />
                    <div className="flex-1 truncate">
                      <p className="truncate text-sm font-medium text-foreground">
                        {video.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {video.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
