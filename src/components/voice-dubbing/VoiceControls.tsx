import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic2, Gauge } from "lucide-react";
import { ELEVENLABS_VOICES } from "@/types/voiceDubbing";
import { cn } from "@/lib/utils";

interface VoiceControlsProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const VoiceControls = ({
  selectedVoice,
  onVoiceChange,
  speed,
  onSpeedChange,
}: VoiceControlsProps) => {
  const selectedVoiceData = ELEVENLABS_VOICES.find(v => v.id === selectedVoice);

  return (
    <div className="space-y-5">
      {/* Voice Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Mic2 className="h-4 w-4" />
          Pilih Voice
        </Label>
        <Select value={selectedVoice} onValueChange={onVoiceChange}>
          <SelectTrigger className="border-border bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ELEVENLABS_VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs text-muted-foreground">
                    - {voice.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVoiceData && (
          <p className="text-xs text-muted-foreground">
            {selectedVoiceData.description}
          </p>
        )}
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Speed
          </Label>
          <span className="text-sm font-medium text-primary">{speed}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([v]) => onSpeedChange(v)}
          min={0.7}
          max={1.2}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Lambat (0.7x)</span>
          <span>Normal</span>
          <span>Cepat (1.2x)</span>
        </div>

        {/* Speed Presets */}
        <div className="flex gap-2">
          {[0.9, 1.0, 1.1].map((preset) => (
            <button
              key={preset}
              onClick={() => onSpeedChange(preset)}
              className={cn(
                "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all",
                speed === preset
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-foreground hover:bg-secondary/50"
              )}
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
