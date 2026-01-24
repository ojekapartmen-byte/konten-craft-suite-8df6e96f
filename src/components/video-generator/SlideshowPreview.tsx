import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, Loader2 } from "lucide-react";
import { SlideImage, AudioTrack, TransitionType } from "@/types/videoGenerator";

interface SlideshowPreviewProps {
  slides: SlideImage[];
  audio: AudioTrack | null;
  transition: TransitionType;
  isGenerating: boolean;
  isGenerated: boolean;
  renderProgress: number;
  onDownload: () => void;
  isRendering: boolean;
}

export const SlideshowPreview = ({
  slides,
  audio,
  transition,
  isGenerating,
  isGenerated,
  renderProgress,
  onDownload,
  isRendering,
}: SlideshowPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startPlayback = () => {
    if (slides.length === 0) return;

    setIsPlaying(true);
    setCurrentSlide(0);
    setProgress(0);

    if (audio) {
      audioRef.current = new Audio(audio.src);
      audioRef.current.muted = isMuted;
      audioRef.current.play();
    }

    let elapsed = 0;
    let slideIndex = 0;
    let slideElapsed = 0;

    intervalRef.current = setInterval(() => {
      elapsed += 0.1;
      slideElapsed += 0.1;

      const currentSlideDuration = slides[slideIndex]?.duration || 3;

      if (slideElapsed >= currentSlideDuration && slideIndex < slides.length - 1) {
        slideIndex++;
        slideElapsed = 0;
        setCurrentSlide(slideIndex);
      }

      const progressPercent = (elapsed / totalDuration) * 100;
      setProgress(Math.min(progressPercent, 100));

      if (elapsed >= totalDuration) {
        stopPlayback();
      }
    }, 100);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const getTransitionClass = () => {
    switch (transition) {
      case 'fade':
        return 'transition-opacity duration-500';
      case 'slide':
        return 'transition-transform duration-500';
      case 'zoom':
        return 'transition-transform duration-500 hover:scale-105';
      default:
        return '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card h-full rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">Preview</Label>
        {isGenerated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            disabled={isRendering}
            className="gap-2"
          >
            {isRendering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rendering {Math.round(renderProgress)}%
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Video
              </>
            )}
          </Button>
        )}
      </div>

      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary/30">
        {slides.length > 0 ? (
          <>
            <div className={`relative h-full w-full ${getTransitionClass()}`}>
              <img
                src={slides[currentSlide]?.src}
                alt={`Slide ${currentSlide + 1}`}
                className="h-full w-full object-cover"
              />
              
              {/* Slide indicator */}
              <div className="absolute top-3 right-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>

            {/* Controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              {/* Progress bar */}
              <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => goToSlide(currentSlide - 1)}
                    disabled={currentSlide === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white hover:bg-white/20"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => goToSlide(currentSlide + 1)}
                    disabled={currentSlide === slides.length - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-white">
                    {formatTime((progress / 100) * totalDuration)} / {formatTime(totalDuration)}
                  </span>
                  {audio && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Add images to preview</p>
          </div>
        )}

        {(isGenerating || isRendering) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              {isRendering ? `Rendering video... ${Math.round(renderProgress)}%` : 'Creating your video...'}
            </p>
            {isRendering && (
              <div className="mt-2 w-48 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">This may take a moment</p>
          </div>
        )}
      </div>

      {/* Slide thumbnails */}
      {slides.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                currentSlide === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={slide.src}
                alt={`Thumbnail ${index + 1}`}
                className="h-12 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      {slides.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-lg font-semibold text-foreground">{slides.length}</p>
            <p className="text-xs text-muted-foreground">Slides</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-lg font-semibold text-foreground">{formatTime(totalDuration)}</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-lg font-semibold text-foreground">{audio ? 'Yes' : 'No'}</p>
            <p className="text-xs text-muted-foreground">Audio</p>
          </div>
        </div>
      )}
    </div>
  );
};
