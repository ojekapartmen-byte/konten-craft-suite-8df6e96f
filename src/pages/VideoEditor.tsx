import { useState } from 'react';
import { Film, Wand2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { VideoSourceInput } from '@/components/video-editor/VideoSourceInput';
import { OperationsPanel } from '@/components/video-editor/OperationsPanel';
import { ProcessingStatus } from '@/components/video-editor/ProcessingStatus';
import { useVideoProcessor } from '@/hooks/useVideoProcessor';
import { useToast } from '@/hooks/use-toast';
import type { VideoSource, VideoOperation } from '@/types/videoEditor';

const VideoEditor = () => {
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const { job, submitJob, cancelJob, reset } = useVideoProcessor();
  const { toast } = useToast();

  const isProcessing = job?.status === 'submitting' || job?.status === 'processing';

  const handleProcess = async () => {
    if (!videoSource) {
      toast({
        title: 'No video selected',
        description: 'Please select a video to process',
        variant: 'destructive',
      });
      return;
    }

    // For uploaded files, we need to upload to a public URL first
    // For now, we only support URL and history sources
    if (videoSource.type === 'upload') {
      toast({
        title: 'Upload in progress',
        description: 'Please use URL or History source for now. Direct upload coming soon!',
        variant: 'destructive',
      });
      return;
    }

    const jobId = await submitJob(videoSource.url, operations);
    
    if (jobId) {
      toast({
        title: 'Processing started',
        description: 'Your video is being processed',
      });
    }
  };

  const handleReset = () => {
    reset();
    setOperations([]);
  };

  return (
    <MainLayout>
      <PageHeader
        icon={Film}
        title="Edit Video"
        description="Process and edit videos using FFmpeg API"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input & Operations */}
        <div className="space-y-6">
          {/* Video Source */}
          <div className="animate-fade-in">
            <h3 className="mb-3 font-medium text-foreground">Video Source</h3>
            <VideoSourceInput
              source={videoSource}
              onSourceChange={setVideoSource}
              disabled={isProcessing}
            />
          </div>

          {/* Operations */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <OperationsPanel
              operations={operations}
              onOperationsChange={setOperations}
              disabled={isProcessing}
            />
          </div>

          {/* Process Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button
              onClick={handleProcess}
              disabled={!videoSource || isProcessing}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
              size="lg"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              {isProcessing ? 'Processing...' : 'Process Video'}
            </Button>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Output: Max 1080p • Efficient bitrate • Fast processing
            </p>
          </div>
        </div>

        {/* Right Column - Preview & Status */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h3 className="mb-3 font-medium text-foreground">Preview</h3>
            <div className="glass-card aspect-video w-full overflow-hidden rounded-xl">
              {videoSource ? (
                <video
                  src={videoSource.url}
                  controls
                  className="h-full w-full object-contain bg-black"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Select a video to preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Processing Status */}
          {job && (
            <div className="animate-fade-in">
              <h3 className="mb-3 font-medium text-foreground">Status</h3>
              <ProcessingStatus
                job={job}
                onCancel={cancelJob}
                onReset={handleReset}
              />
            </div>
          )}

          {/* Instructions */}
          {!job && (
            <div className="animate-fade-in glass-card rounded-xl p-4" style={{ animationDelay: '0.25s' }}>
              <h4 className="font-medium text-foreground mb-2">How it works</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">1</span>
                  Select video from upload, URL, or AI history
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">2</span>
                  Add operations (trim, resize, compress, etc.)
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">3</span>
                  Click Process and wait for completion
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">4</span>
                  Download or copy the output URL
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default VideoEditor;
