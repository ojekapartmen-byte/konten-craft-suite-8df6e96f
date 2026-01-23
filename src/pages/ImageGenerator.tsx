import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const styles = [
  { value: "realistic", label: "Photorealistic" },
  { value: "anime", label: "Anime / Manga" },
  { value: "digital-art", label: "Digital Art" },
  { value: "oil-painting", label: "Oil Painting" },
  { value: "watercolor", label: "Watercolor" },
  { value: "3d-render", label: "3D Render" },
];

const aspectRatios = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Standard (4:3)" },
];

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the image you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Use a placeholder image for demonstration
    setGeneratedImage(
      `https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&auto=format&fit=crop`
    );
    setIsLoading(false);
    toast({
      title: "Image generated!",
      description: "Your image has been created successfully",
    });
  };

  return (
    <MainLayout>
      <PageHeader
        icon={ImageIcon}
        title="Image Generator"
        description="Generate stunning visuals from text descriptions"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-xl p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="prompt" className="text-sm font-medium text-foreground">
                  Image Description
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., A serene mountain landscape at sunset with a calm lake reflection, cinematic lighting..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2 min-h-[120px] resize-none border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-foreground">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="mt-2 border-border bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ar) => (
                        <SelectItem key={ar.value} value={ar.value}>
                          {ar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <GenerateButton
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={!prompt.trim()}
                className="w-full"
              >
                Generate Image
              </GenerateButton>
            </div>
          </div>

          {/* Style Examples */}
          <div className="glass-card rounded-xl p-6">
            <Label className="text-sm font-medium text-foreground">Tips for better results</Label>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Be specific about lighting, mood, and composition
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Include art style references (e.g., "in the style of...")
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Mention camera angles or lens types for realism
              </li>
            </ul>
          </div>
        </div>

        {/* Output Section */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Generated Image</Label>
              {generatedImage && (
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                  <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>

            <div
              className={`relative overflow-hidden rounded-lg border border-border bg-secondary/30 ${
                aspectRatio === "16:9"
                  ? "aspect-video"
                  : aspectRatio === "9:16"
                  ? "aspect-[9/16] max-h-[500px]"
                  : aspectRatio === "4:3"
                  ? "aspect-[4/3]"
                  : "aspect-square"
              }`}
            >
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your image will appear here
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-4 text-sm text-muted-foreground">Creating your image...</p>
                  </div>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Style: {styles.find((s) => s.value === style)?.label} • Ratio: {aspectRatio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ImageGenerator;
