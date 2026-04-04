import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Save, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SlideImage, AudioTrack, TransitionType } from "@/types/videoGenerator";
import { ImageSourceSelector } from "@/components/video-generator/ImageSourceSelector";
import { AudioSourceSelector } from "@/components/video-generator/AudioSourceSelector";
import { TransitionSelector } from "@/components/video-generator/TransitionSelector";
import { AspectRatioSelector, VideoAspectRatio, getAspectRatioDimensions } from "@/components/video-generator/AspectRatioSelector";
import { SlideshowPreview } from "@/components/video-generator/SlideshowPreview";
import { VideoProjectGallery } from "@/components/video-generator/VideoProjectGallery";
import { VideoSourceSelector, UploadedVideo } from "@/components/video-generator/VideoSourceSelector";
import { renderVideo, downloadBlob } from "@/lib/videoRenderer";
import { useVideoProjects, VideoProject } from "@/hooks/useVideoProjects";

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
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | undefined>(undefined);

  const handleVideoUpload = (video: UploadedVideo) => {
    setUploadedVideo(video);
    // Add video as a slide
    const videoSlide: SlideImage = {
      id: video.id,
      src: video.src,
      name: video.name,
      duration: Math.round(video.duration),
      source: 'upload',
      type: 'video',
      thumbnailUrl: video.thumbnailUrl,
    };
    setSlides(prev => [...prev, videoSlide]);
  };

  const handleVideoRemove = () => {
    if (uploadedVideo) {
      setSlides(prev => prev.filter(s => s.id !== uploadedVideo.id));
    }
    setUploadedVideo(undefined);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [voiceHistory, setVoiceHistory] = useState<VoiceHistoryItem[]>([]);
  const [projectTitle, setProjectTitle] = useState("Untitled Video");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    projects, 
    isLoading: isLoadingProjects, 
    saveProject, 
    updateProject, 
    deleteProject, 
    toggleFavorite 
  } = useVideoProjects();

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
      // Short delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsGenerated(true);
      toast({
        title: "Video ready!",
        description: `Slideshow with ${slides.length} images is ready. Click Download to render.`,
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

  const handleSaveProject = async () => {
    if (slides.length === 0) {
      toast({
        title: "Tidak ada slides",
        description: "Tambahkan minimal satu gambar untuk menyimpan project",
        variant: "destructive",
      });
      return;
    }

    const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);
    const thumbnailUrl = slides[0]?.src;

    if (editingProjectId) {
      // Update existing project
      const success = await updateProject(editingProjectId, {
        title: projectTitle,
        slides,
        audio,
        transition,
         aspectRatio,
        totalDuration,
        thumbnailUrl,
        status: isGenerated ? 'completed' : 'draft',
      });
      
      if (success) {
        toast({
          title: "Project diupdate!",
          description: "Perubahan berhasil disimpan",
        });
      }
    } else {
      // Save new project
      const savedProject = await saveProject({
        title: projectTitle,
        slides,
        audio,
        transition,
         aspectRatio,
        totalDuration,
        thumbnailUrl,
        status: isGenerated ? 'completed' : 'draft',
      });

      if (savedProject) {
        setEditingProjectId(savedProject.id);
      }
    }
  };

  const handleLoadProject = (project: VideoProject) => {
    setSlides(project.slides);
    setAudio(project.audio);
    setTransition(project.transition);
     setAspectRatio(project.aspectRatio || '16:9');
    setProjectTitle(project.title);
    setEditingProjectId(project.id);
    setIsGenerated(project.status === 'completed');
    
    toast({
      title: "Project dimuat",
      description: `"${project.title}" siap untuk diedit`,
    });
  };

  const handleNewProject = () => {
    setSlides([]);
    setAudio(null);
    setTransition('fade');
    setAspectRatio('16:9');
    setUploadedVideo(undefined);
    setProjectTitle("Untitled Video");
    setEditingProjectId(null);
    setIsGenerated(false);
  };

  const handleDownload = async () => {
    if (slides.length === 0) return;

    setIsRendering(true);
    setRenderProgress(0);

    try {
      toast({
        title: "Rendering video...",
        description: "This may take a few moments depending on video length.",
      });

       const dimensions = getAspectRatioDimensions(aspectRatio);
 
      const videoBlob = await renderVideo({
        slides,
        audio,
        transition,
         width: dimensions.width,
         height: dimensions.height,
        fps: 30,
        onProgress: (progress) => {
          setRenderProgress(progress);
        },
      });

      const extension = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      downloadBlob(videoBlob, `slideshow-${Date.now()}.${extension}`);

      toast({
        title: "Video downloaded!",
        description: `Your ${extension.toUpperCase()} video has been saved.`,
      });

      // Update project status to completed if editing
      if (editingProjectId) {
        await updateProject(editingProjectId, { status: 'completed' });
      }
    } catch (error) {
      console.error('Video rendering error:', error);
      toast({
        title: "Rendering failed",
        description: error instanceof Error ? error.message : "Failed to render video",
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  };

  const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);

  return (
    <MainLayout>
      <PageHeader
        icon={Video}
        title="Video Generator"
        description="Create slideshow videos by combining images and audio"
      />

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-5 md:space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Project Title & Actions */}
          <div className="glass-card rounded-xl p-3 md:p-4">
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Nama project..."
                  className="text-lg font-medium"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleNewProject}
                  className="gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Baru
                </Button>
                <Button
                  onClick={handleSaveProject}
                  disabled={slides.length === 0}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingProjectId ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </div>
            {editingProjectId && (
              <p className="text-xs text-muted-foreground mt-2">
                Mengedit project yang sudah ada
              </p>
            )}
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            <div className="space-y-6">
              <ImageSourceSelector
                slides={slides}
                onSlidesChange={setSlides}
              />

              <VideoSourceSelector
                uploadedVideo={uploadedVideo}
                onVideoUpload={handleVideoUpload}
                onVideoRemove={handleVideoRemove}
              />
            </div>

            <div className="space-y-6">
              <AudioSourceSelector
                audio={audio}
                onAudioChange={setAudio}
                voiceHistory={voiceHistory}
              />

              <TransitionSelector
                transition={transition}
                onTransitionChange={setTransition}
              />

              <AspectRatioSelector
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
              />
            </div>
          </div>

          <GenerateButton
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={slides.length === 0}
            className="w-full"
          >
            {isLoading ? 'Creating Video...' : `Create Video (${totalDuration}s)`}
          </GenerateButton>

          <SlideshowPreview
            slides={slides}
            audio={audio}
            transition={transition}
             aspectRatio={aspectRatio}
            isGenerating={isLoading}
            isGenerated={isGenerated}
            renderProgress={renderProgress}
            onDownload={handleDownload}
            isRendering={isRendering}
          />
        </div>

        {/* Project Gallery Section */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <VideoProjectGallery
            projects={projects}
            isLoading={isLoadingProjects}
            onDelete={deleteProject}
            onUpdate={updateProject}
            onToggleFavorite={toggleFavorite}
            onLoadProject={handleLoadProject}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default VideoGenerator;
