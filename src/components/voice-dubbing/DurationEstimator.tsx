import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Clock, Gauge } from "lucide-react";
import { UploadedMedia, estimateDuration, calculateSpeedSuggestion } from "@/types/voiceDubbing";
import { cn } from "@/lib/utils";

interface DurationEstimatorProps {
  text: string;
  uploadedMedia?: UploadedMedia;
  currentSpeed: number;
  onSpeedSuggestion: (speed: number) => void;
}

export const DurationEstimator = ({
  text,
  uploadedMedia,
  currentSpeed,
  onSpeedSuggestion,
}: DurationEstimatorProps) => {
  const voiceDuration = estimateDuration(text);
  const adjustedDuration = Math.round(voiceDuration / currentSpeed);
  
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} detik`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins} menit ${secs} detik` : `${mins} menit`;
  };

  const getSpeedSuggestion = () => {
    if (!uploadedMedia) return null;
    return calculateSpeedSuggestion(voiceDuration, uploadedMedia.duration);
  };

  const suggestion = getSpeedSuggestion();
  
  const getSuggestionText = () => {
    if (!suggestion) return null;
    
    switch (suggestion.suggestion) {
      case 'ok':
        return { text: 'Durasi sudah pas!', type: 'success' };
      case 'speed-up':
        return { text: `Coba speed ${suggestion.speed}x agar pas`, type: 'warning' };
      case 'speed-down':
        return { text: `Coba speed ${suggestion.speed}x agar pas`, type: 'info' };
      case 'trim':
        return { text: 'Teks terlalu panjang, pertimbangkan untuk memangkas', type: 'error' };
    }
  };

  const suggestionInfo = getSuggestionText();

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Estimasi Durasi</Label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Voice Duration */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Gauge className="h-3 w-3" />
            Perkiraan Voice
          </div>
          <p className="text-lg font-semibold text-foreground">
            ±{formatDuration(adjustedDuration)}
          </p>
          <p className="text-xs text-muted-foreground">
            ~{text.split(/\s+/).filter(w => w).length} kata @ {currentSpeed}x
          </p>
        </div>

        {/* Media Duration */}
        {uploadedMedia && (
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              Durasi {uploadedMedia.type === 'video' ? 'Video' : 'Audio'}
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatDuration(Math.round(uploadedMedia.duration))}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {uploadedMedia.name}
            </p>
          </div>
        )}
      </div>

      {/* Sync Suggestion */}
      {suggestionInfo && uploadedMedia && (
        <div className={cn(
          "flex items-start gap-2 rounded-lg p-3",
          suggestionInfo.type === 'success' && "bg-green-500/10 border border-green-500/20",
          suggestionInfo.type === 'warning' && "bg-yellow-500/10 border border-yellow-500/20",
          suggestionInfo.type === 'info' && "bg-blue-500/10 border border-blue-500/20",
          suggestionInfo.type === 'error' && "bg-red-500/10 border border-red-500/20",
        )}>
          {suggestionInfo.type === 'success' ? (
            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className={cn(
              "h-4 w-4 shrink-0 mt-0.5",
              suggestionInfo.type === 'warning' && "text-yellow-500",
              suggestionInfo.type === 'info' && "text-blue-500",
              suggestionInfo.type === 'error' && "text-red-500",
            )} />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{suggestionInfo.text}</p>
            {suggestion && suggestion.suggestion !== 'ok' && suggestion.suggestion !== 'trim' && (
              <button
                onClick={() => onSpeedSuggestion(suggestion.speed)}
                className="text-xs text-primary hover:underline mt-1"
              >
                Terapkan speed {suggestion.speed}x
              </button>
            )}
          </div>
          <Badge variant="outline" className="shrink-0">
            Selisih: {Math.abs(adjustedDuration - Math.round(uploadedMedia.duration))}s
          </Badge>
        </div>
      )}
    </div>
  );
};
