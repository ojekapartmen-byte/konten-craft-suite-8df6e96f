import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { History, Play, Download, Trash2, Search } from "lucide-react";
import { VoiceGenerationResult, ELEVENLABS_VOICES } from "@/types/voiceDubbing";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface VoiceHistoryProps {
  history: VoiceGenerationResult[];
  onPlayAudio: (result: VoiceGenerationResult) => void;
  onDelete: (id: string) => void;
}

export const VoiceHistory = ({
  history,
  onPlayAudio,
  onDelete,
}: VoiceHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredHistory = history.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVoiceName = (voiceId: string): string => {
    return ELEVENLABS_VOICES.find(v => v.id === voiceId)?.name || 'Unknown';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = (result: VoiceGenerationResult) => {
    onPlayAudio(result);
    setPlayingId(result.id);
  };

  const handleDownload = (result: VoiceGenerationResult) => {
    const link = document.createElement('a');
    link.href = result.audioUrl;
    link.download = `voice-${result.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Riwayat Voice</Label>
        </div>
        <span className="text-sm text-muted-foreground">
          {history.length} hasil
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan teks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>

      {/* History List */}
      <ScrollArea className="h-[400px]">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {history.length === 0 
                ? "Belum ada riwayat voice" 
                : "Tidak ditemukan hasil"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {filteredHistory.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "rounded-lg border border-border bg-secondary/30 p-4 transition-all",
                  playingId === result.id && "border-primary bg-primary/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlay(result)}
                    className="h-10 w-10 shrink-0 rounded-full bg-primary/10 hover:bg-primary/20"
                  >
                    <Play className="h-4 w-4 text-primary" />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{result.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{getVoiceName(result.voiceId)}</span>
                      <span>•</span>
                      <span>{result.speed}x</span>
                      <span>•</span>
                      <span>{formatDuration(result.duration)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(result.createdAt), "d MMM yyyy, HH:mm", { locale: id })}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(result)}
                      className="h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(result.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
