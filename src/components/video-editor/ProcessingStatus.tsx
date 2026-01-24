import { Loader2, CheckCircle, XCircle, Download, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { ProcessingJob } from '@/types/videoEditor';

interface ProcessingStatusProps {
  job: ProcessingJob | null;
  onCancel: () => void;
  onReset: () => void;
}

export function ProcessingStatus({ job, onCancel, onReset }: ProcessingStatusProps) {
  const { toast } = useToast();

  if (!job) return null;

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'URL Copied',
        description: 'Video URL copied to clipboard',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy URL to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadVideo = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `edited-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveToHistory = (url: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem('generatedVideos') || '[]');
      const newEntry = {
        id: crypto.randomUUID(),
        url,
        name: `Edited Video ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('generatedVideos', JSON.stringify([newEntry, ...existing]));
      toast({
        title: 'Saved to History',
        description: 'Video saved for future editing',
      });
    } catch {
      toast({
        title: 'Failed to save',
        description: 'Could not save to history',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        {job.status === 'submitting' || job.status === 'processing' ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : job.status === 'completed' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : job.status === 'failed' ? (
          <XCircle className="h-5 w-5 text-destructive" />
        ) : null}
        
        <div className="flex-1">
          <h4 className="font-medium text-foreground">
            {job.status === 'submitting' && 'Submitting job...'}
            {job.status === 'processing' && 'Processing video...'}
            {job.status === 'completed' && 'Processing complete!'}
            {job.status === 'failed' && 'Processing failed'}
            {job.status === 'cancelled' && 'Processing cancelled'}
          </h4>
          {job.id && (
            <p className="text-xs text-muted-foreground">
              Job ID: {job.id.slice(0, 12)}...
            </p>
          )}
        </div>

        {(job.status === 'submitting' || job.status === 'processing') && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
          <Button variant="outline" size="sm" onClick={onReset}>
            New Edit
          </Button>
        )}
      </div>

      {(job.status === 'submitting' || job.status === 'processing') && (
        <div className="space-y-2">
          <Progress value={job.progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {job.progress > 0 ? `${job.progress}% complete` : 'Starting...'}
          </p>
        </div>
      )}

      {job.status === 'failed' && job.error && (
        <div className="rounded-lg bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{job.error}</p>
        </div>
      )}

      {job.status === 'completed' && job.outputUrls.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {job.outputUrls.length} output file(s) ready:
          </p>
          {job.outputUrls.map((url, index) => (
            <div
              key={url}
              className="rounded-lg border border-border bg-secondary/30 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Output {index + 1}</span>
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {url.split('/').pop()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => downloadVideo(url)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => saveToHistory(url)}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
