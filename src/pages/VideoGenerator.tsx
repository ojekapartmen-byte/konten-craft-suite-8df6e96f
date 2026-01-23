import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Upload, ImageIcon, Mic2, Play, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const voices = [
  { value: "emma", label: "Emma (Female, US)" },
  { value: "james", label: "James (Male, UK)" },
  { value: "sarah", label: "Sarah (Female, AU)" },
  { value: "alex", label: "Alex (Male, US)" },
];

const durations = [
  { value: "5", label: "5 seconds" },
  { value: "10", label: "10 seconds" },
  { value: "15", label: "15 seconds" },
  { value: "30", label: "30 seconds" },
];

const VideoGenerator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("emma");
  const [duration, setDuration] = useState("10");
  const [isLoading, setIsLoading] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      toast({
        title: "Please upload an image",
        description: "An image is required to generate the video",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    setVideoGenerated(true);
    setIsLoading(false);
    toast({
      title: "Video generated!",
      description: "Your video is ready to preview",
    });
  };

  return (
    <MainLayout>
      <PageHeader
        icon={Video}
        title="Video Generator"
        description="Create videos by combining images and voice dubbing"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Image Upload */}
          <div className="glass-card rounded-xl p-6">
            <Label className="text-sm font-medium text-foreground">Upload Image</Label>
            <p className="mb-4 text-xs text-muted-foreground">
              This image will be animated in your video
            </p>

            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full rounded-lg border border-border object-cover"
                  style={{ maxHeight: "200px" }}
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 py-12 transition-colors hover:border-primary/50 hover:bg-secondary/50">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Click to upload</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Voice Settings */}
          <div className="glass-card rounded-xl p-6">
            <Label className="text-sm font-medium text-foreground">Voice & Audio</Label>
            <p className="mb-4 text-xs text-muted-foreground">
              Select a voice or upload your own audio
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">AI Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="mt-2 border-border bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 py-4 transition-colors hover:border-primary/50 hover:bg-secondary/50">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload audio file</span>
                <input type="file" accept="audio/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Duration */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">Video Duration</Label>
                <p className="text-xs text-muted-foreground">
                  Select the length of your video
                </p>
              </div>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-32 border-border bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <GenerateButton
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={!image}
            className="w-full"
          >
            Generate Video
          </GenerateButton>
        </div>

        {/* Output Section */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="glass-card h-full rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Video Preview</Label>
              {videoGenerated && (
                <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <Download className="h-3.5 w-3.5" />
                  Download MP4
                </button>
              )}
            </div>

            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary/30">
              {videoGenerated ? (
                <div className="relative h-full w-full">
                  {image && (
                    <img
                      src={image}
                      alt="Video preview"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                    <button className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105">
                      <Play className="ml-1 h-7 w-7" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-0 bg-primary" />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-white/90">
                      <span>0:00</span>
                      <span>0:{duration}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your video will appear here
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="mt-4 text-sm text-muted-foreground">Generating your video...</p>
                  <p className="text-xs text-muted-foreground">This may take a moment</p>
                </div>
              )}
            </div>

            {videoGenerated && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-lg font-semibold text-foreground">{duration}s</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-lg font-semibold text-foreground">1080p</p>
                  <p className="text-xs text-muted-foreground">Quality</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-lg font-semibold text-foreground">MP4</p>
                  <p className="text-xs text-muted-foreground">Format</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VideoGenerator;
