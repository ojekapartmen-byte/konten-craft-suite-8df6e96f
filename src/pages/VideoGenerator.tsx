import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SlideImage, AudioTrack, TransitionType } from "@/types/videoGenerator";
import { ImageSourceSelector } from "@/components/video-generator/ImageSourceSelector";
import { AudioSourceSelector } from "@/components/video-generator/AudioSourceSelector";
import { TransitionSelector } from "@/components/video-generator/TransitionSelector";
import { SlideshowPreview } from "@/components/video-generator/SlideshowPreview";

// Mock data - in production, these would come from localStorage or database
const MOCK_GENERATED_IMAGES: { id: string; src: string; prompt: string }[] = [];

interface VoiceHistoryItem {
  id: string;
  text: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
}

const VideoGenerator = () => {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [audio, setAudio] = useState<AudioTrack | null>(null);
  const [transition, setTransition] = useState<TransitionType>('fade');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ id: string; src: string; prompt: string }[]>(MOCK_GENERATED_IMAGES);
  const [voiceHistory, setVoiceHistory] = useState<VoiceHistoryItem[]>([]);
  const { toast } = useToast();

  // Load generated images from localStorage
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem('generatedImages');
      if (savedImages) {
        setGeneratedImages(JSON.parse(savedImages));
      }
    } catch (e) {
      console.error('Failed to load generated images:', e);
    }
  }, []);

  // Load voice history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('voiceHistory');
      if (savedHistory) {
        setVoiceHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load voice history:', e);
    }
  }, []);

  const handleGenerate = async () => {
    if (slides.length === 0) {
      toast({
        title: "No slides added",
        description: "Please add at least one image to create a video",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsGenerated(false);

    try {
      // Simulate video generation - in production, this would call an API
      // to actually render the video with FFmpeg or similar
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setIsGenerated(true);
      toast({
        title: "Video created!",
        description: `Slideshow with ${slides.length} images is ready`,
      });
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to create video",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would download the rendered video
    // For now, we'll show a toast explaining this is a preview feature
    toast({
      title: "Download feature",
      description: "Video rendering requires a backend service. Preview mode only.",
    });
  };

  const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);

  return (
    <MainLayout>
      <PageHeader
        icon={Video}
        title="Video Generator"
        description="Create slideshow videos by combining images and audio"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <ImageSourceSelector
            slides={slides}
            onSlidesChange={setSlides}
            generatedImages={generatedImages}
          />

          <AudioSourceSelector
            audio={audio}
            onAudioChange={setAudio}
            voiceHistory={voiceHistory}
          />

          <TransitionSelector
            transition={transition}
            onTransitionChange={setTransition}
          />

          <GenerateButton
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={slides.length === 0}
            className="w-full"
          >
            {isLoading ? 'Creating Video...' : `Create Video (${totalDuration}s)`}
          </GenerateButton>
        </div>

        {/* Output Section */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <SlideshowPreview
            slides={slides}
            audio={audio}
            transition={transition}
            isGenerating={isLoading}
            isGenerated={isGenerated}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default VideoGenerator;
