import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { PreprocessingMode } from "@/types/voiceDubbing";
import { preprocessTextForVoice, getPreprocessingChanges } from "@/lib/textPreprocessing";
import { cn } from "@/lib/utils";

interface PreprocessingPanelProps {
  originalText: string;
  preprocessedText: string;
  mode: PreprocessingMode;
  onModeChange: (mode: PreprocessingMode) => void;
  onPreprocess: (text: string) => void;
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const PreprocessingPanel = ({
  originalText,
  preprocessedText,
  mode,
  onModeChange,
  onPreprocess,
  isEnabled,
  onEnabledChange,
}: PreprocessingPanelProps) => {
  const [showChanges, setShowChanges] = useState(false);
  const [changes, setChanges] = useState<{ original: string; processed: string }[]>([]);

  const modes: { id: PreprocessingMode; label: string; description: string }[] = [
    { id: 'natural', label: 'Natural', description: 'Semua angka jadi kata' },
    { id: 'angka', label: 'Angka', description: 'Angka tetap angka' },
    { id: 'campuran', label: 'Campuran', description: 'Angka kecil jadi kata' },
  ];

  const handlePreprocess = () => {
    if (!originalText.trim()) return;
    
    const processed = preprocessTextForVoice(originalText, mode);
    onPreprocess(processed);
    
    // Get changes for preview
    const detectedChanges = getPreprocessingChanges(originalText, processed);
    setChanges(detectedChanges);
  };

  // Auto-preprocess when mode changes and enabled
  useEffect(() => {
    if (isEnabled && originalText.trim()) {
      handlePreprocess();
    }
  }, [mode, isEnabled]);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">Rapikan untuk Voice</Label>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {isEnabled && (
        <>
          <p className="text-xs text-muted-foreground">
            Mengubah angka, tanggal, mata uang, dan singkatan menjadi bentuk yang lebih natural untuk diucapkan
          </p>

          {/* Mode Selector */}
          <div className="flex gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={cn(
                  "flex-1 rounded-lg border p-2 text-center transition-all",
                  mode === m.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/30 hover:bg-secondary/50"
                )}
              >
                <p className={cn(
                  "text-sm font-medium",
                  mode === m.id ? "text-primary" : "text-foreground"
                )}>
                  {m.label}
                </p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </button>
            ))}
          </div>

          {/* Process Button */}
          <Button
            onClick={handlePreprocess}
            disabled={!originalText.trim()}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Proses Teks
          </Button>

          {/* Changes Preview */}
          {changes.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowChanges(!showChanges)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                {showChanges ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {changes.length} perubahan terdeteksi
              </button>

              {showChanges && (
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2 pr-4">
                    {changes.slice(0, 10).map((change, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="font-mono shrink-0">
                          {change.original}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {change.processed}
                        </span>
                      </div>
                    ))}
                    {changes.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        +{changes.length - 10} perubahan lainnya
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Processed Text Preview */}
          {preprocessedText && preprocessedText !== originalText && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <Label className="text-xs text-muted-foreground">Preview Hasil</Label>
              <p className="text-sm mt-1 line-clamp-4">{preprocessedText}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
