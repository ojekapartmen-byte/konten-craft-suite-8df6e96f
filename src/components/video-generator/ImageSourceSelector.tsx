import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Upload, Database, X, GripVertical, Plus, Heart, Loader2 } from "lucide-react";
import { SlideImage } from "@/types/videoGenerator";
import { useGeneratedImages, GeneratedImage } from "@/hooks/useGeneratedImages";

interface ImageSourceSelectorProps {
  slides: SlideImage[];
  onSlidesChange: (slides: SlideImage[]) => void;
}

export const ImageSourceSelector = ({
  slides,
  onSlidesChange,
}: ImageSourceSelectorProps) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const { images: dbImages, isLoading: isLoadingDbImages } = useGeneratedImages();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newSlide: SlideImage = {
          id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          src: reader.result as string,
          name: file.name,
          duration: 3,
          source: 'upload',
        };
        onSlidesChange([...slides, newSlide]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSelectDbImage = (img: GeneratedImage) => {
    const newSlide: SlideImage = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      src: img.imageUrl,
      name: img.title || img.prompt.substring(0, 30) + '...',
      duration: 3,
      source: 'generator',
    };
    onSlidesChange([...slides, newSlide]);
  };

  const handleRemoveSlide = (id: string) => {
    onSlidesChange(slides.filter((s) => s.id !== id));
  };

  const handleDurationChange = (id: string, duration: number) => {
    onSlidesChange(
      slides.map((s) => (s.id === id ? { ...s, duration } : s))
    );
  };

  const moveSlide = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= slides.length) return;
    
    const newSlides = [...slides];
    [newSlides[fromIndex], newSlides[toIndex]] = [newSlides[toIndex], newSlides[fromIndex]];
    onSlidesChange(newSlides);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <Label className="text-sm font-medium text-foreground">Images (Slideshow)</Label>
      <p className="mb-4 text-xs text-muted-foreground">
        Add images for your video slideshow
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Dari Galeri
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 py-8 transition-colors hover:border-primary/50 hover:bg-secondary/50">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Click to add images</p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG (multiple files supported)</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </TabsContent>

        <TabsContent value="database">
          {isLoadingDbImages ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Memuat gambar...</p>
            </div>
          ) : dbImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 py-8">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada gambar di galeri</p>
              <p className="text-xs text-muted-foreground">Generate gambar di Image Generator dulu</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {dbImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => handleSelectDbImage(img)}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                >
                  <img src={img.imageUrl} alt={img.title || img.prompt} className="w-full h-full object-cover" />
                  {img.isFavorite && (
                    <div className="absolute left-1 top-1">
                      <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Slides List */}
      {slides.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-xs text-muted-foreground">
            Slides ({slides.length}) - Total: {slides.reduce((acc, s) => acc + s.duration, 0)}s
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <img
                  src={slide.src}
                  alt={slide.name}
                  className="h-12 w-16 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {index + 1}. {slide.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={slide.duration}
                      onChange={(e) => handleDurationChange(slide.id, Number(e.target.value))}
                      min={1}
                      max={30}
                      className="w-14 h-6 text-xs rounded border border-border bg-background px-2"
                    />
                    <span className="text-xs text-muted-foreground">detik</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                  >
                    <span className="text-xs">↑</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                  >
                    <span className="text-xs">↓</span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveSlide(slide.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
