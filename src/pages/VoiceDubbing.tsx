import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Mic2, Play, Pause, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const voices = [
  { value: "emma", label: "Emma (Female, US)", description: "Warm and friendly" },
  { value: "james", label: "James (Male, UK)", description: "Professional and clear" },
  { value: "sarah", label: "Sarah (Female, AU)", description: "Energetic and upbeat" },
  { value: "alex", label: "Alex (Male, US)", description: "Deep and authoritative" },
  { value: "maya", label: "Maya (Female, UK)", description: "Calm and soothing" },
];

const VoiceDubbing = () => {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("emma");
  const [speed, setSpeed] = useState([1]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const selectedVoice = voices.find((v) => v.value === voice);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Please enter text",
        description: "Enter the text you want to convert to speech",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setAudioGenerated(true);
    setIsLoading(false);
    toast({
      title: "Voice generated!",
      description: "Your audio is ready to play",
    });
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate playback ending
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        icon={Mic2}
        title="Voice Dubbing"
        description="Transform text into natural-sounding speech"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-xl p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="text" className="text-sm font-medium text-foreground">
                  Enter your text
                </Label>
                <Textarea
                  id="text"
                  placeholder="Type or paste the text you want to convert to speech..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-2 min-h-[150px] resize-none border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {text.length} characters
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Select Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="mt-2 border-border bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        <div>
                          <span>{v.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            - {v.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Speed</Label>
                  <span className="text-sm text-muted-foreground">{speed[0]}x</span>
                </div>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="mt-3"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              <GenerateButton
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={!text.trim()}
                className="w-full"
              >
                Generate Voice
              </GenerateButton>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="glass-card h-full rounded-xl p-6">
            <Label className="text-sm font-medium text-foreground">Audio Preview</Label>

            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/30 p-8">
              {audioGenerated ? (
                <>
                  {/* Waveform visualization */}
                  <div className="mb-6 flex h-20 items-center gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full bg-primary transition-all duration-150 ${
                          isPlaying ? "animate-pulse" : ""
                        }`}
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayback}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="ml-1 h-6 w-6" />
                      )}
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-foreground">
                      {selectedVoice?.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Speed: {speed[0]}x • Duration: 0:15
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Mic2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your audio will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VoiceDubbing;
