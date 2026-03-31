import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/scheduling/EditableField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Download, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGeneratedImages } from "@/hooks/useGeneratedImages";
import { ImageGallery } from "@/components/image-generator/ImageGallery";
import { Button } from "@/components/ui/button";

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
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState("");
  const { toast } = useToast();
  
  const {
    images,
    isLoading: isLoadingImages,
    saveImage,
    updateImage,
    deleteImage,
    toggleFavorite,
  } = useGeneratedImages();

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
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: prompt.trim(),
          style,
          aspectRatio,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate image');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.imageUrl) {
        throw new Error('No image URL in response');
      }

      setGeneratedImage(data.imageUrl);
      setLastGeneratedPrompt(prompt.trim());

      toast({
        title: "Image generated!",
        description: "Your image has been created successfully",
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage) return;

    setIsSaving(true);
    try {
      await saveImage({
        prompt: lastGeneratedPrompt,
        style,
        aspectRatio,
        imageUrl: generatedImage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      if (generatedImage.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Downloaded!",
        description: "Image saved to your device",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
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
                <EditableField
                  value={prompt}
                  onChange={setPrompt}
                  multiline
                  placeholder="E.g., A serene mountain landscape at sunset with a calm lake reflection, cinematic lighting..."
                  className="mt-2"
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

          {/* Generated Output */}
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Generated Image</Label>
              {generatedImage && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveToGallery}
                    disabled={isSaving}
                    className="gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? 'Saving...' : 'Simpan'}
                  </Button>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
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

          {/* Tips */}
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

        {/* Gallery Section */}
        <div className="animate-fade-in lg:sticky lg:top-8" style={{ animationDelay: "0.2s" }}>
          <ImageGallery
            images={images}
            isLoading={isLoadingImages}
            onDelete={deleteImage}
            onUpdate={updateImage}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ImageGenerator;
