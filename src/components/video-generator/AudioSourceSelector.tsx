import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, History, Mic2, X, Play, Pause } from "lucide-react";
import { AudioTrack } from "@/types/videoGenerator";

interface VoiceHistoryItem {
  id: string;
  text: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
}

interface AudioSourceSelectorProps {
  audio: AudioTrack | null;
  onAudioChange: (audio: AudioTrack | null) => void;
  voiceHistory: VoiceHistoryItem[];
}

export const AudioSourceSelector = ({
  audio,
  onAudioChange,
  voiceHistory,
}: AudioSourceSelectorProps) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const audioEl = new Audio(reader.result as string);
      audioEl.onloadedmetadata = () => {
        const newAudio: AudioTrack = {
          id: `audio-${Date.now()}`,
          src: reader.result as string,
          name: file.name,
          duration: Math.round(audioEl.duration),
          source: 'upload',
        };
        onAudioChange(newAudio);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectVoiceHistory = (item: VoiceHistoryItem) => {
    const newAudio: AudioTrack = {
      id: item.id,
      src: item.audioUrl,
      name: item.text.substring(0, 30) + '...',
      duration: item.duration,
      source: 'dubbing',
    };
    onAudioChange(newAudio);
  };

  const handleRemoveAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setIsPlaying(false);
    onAudioChange(null);
  };

  const togglePlayPause = () => {
    if (!audio) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      const el = new Audio(audio.src);
      el.onended = () => setIsPlaying(false);
      el.play();
      setAudioElement(el);
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <Label className="text-sm font-medium text-foreground">Audio / Voice Over</Label>
      <p className="mb-4 text-xs text-muted-foreground">
        Add audio from Voice Dubbing or upload manually
      </p>

      {audio ? (
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{audio.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDuration(audio.duration)} • {audio.source === 'dubbing' ? 'Voice Dubbing' : 'Upload'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleRemoveAudio}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="dubbing" className="gap-2">
              <History className="h-4 w-4" />
              Voice Dubbing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 py-8 transition-colors hover:border-primary/50 hover:bg-secondary/50">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Upload audio file</p>
              <p className="mt-1 text-xs text-muted-foreground">MP3, WAV, M4A</p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </TabsContent>

          <TabsContent value="dubbing">
            {voiceHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 py-8">
                <Mic2 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No voice recordings yet</p>
                <p className="text-xs text-muted-foreground">Generate voice in Voice Dubbing first</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {voiceHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectVoiceHistory(item)}
                    className="w-full flex items-center gap-3 rounded-lg bg-secondary/50 p-3 hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Mic2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.text.substring(0, 40)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(item.duration)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
