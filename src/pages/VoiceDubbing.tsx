import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { TextSourceSelector } from "@/components/voice-dubbing/TextSourceSelector";
import { MediaUploader } from "@/components/voice-dubbing/MediaUploader";
import { PreprocessingPanel } from "@/components/voice-dubbing/PreprocessingPanel";
import { DurationEstimator } from "@/components/voice-dubbing/DurationEstimator";
import { VoiceControls } from "@/components/voice-dubbing/VoiceControls";
import { AudioPlayer } from "@/components/voice-dubbing/AudioPlayer";
import { VoiceHistory } from "@/components/voice-dubbing/VoiceHistory";
import { TextSourceType, PreprocessingMode, UploadedMedia, VoiceGenerationResult, ELEVENLABS_VOICES } from "@/types/voiceDubbing";
import { DraftHistory } from "@/types/textGenerator";
import { preprocessTextForVoice } from "@/lib/textPreprocessing";
import { Mic2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContentDrafts } from "@/hooks/useContentDrafts";

const VoiceDubbing = () => {
  const { toast } = useToast();
  const { drafts } = useContentDrafts();
  
  // Text source state
  const [textSource, setTextSource] = useState<TextSourceType>('manual');
  const [manualText, setManualText] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState<string>();
  
  // Preprocessing state
  const [preprocessingEnabled, setPreprocessingEnabled] = useState(true);
  const [preprocessingMode, setPreprocessingMode] = useState<PreprocessingMode>('natural');
  const [preprocessedText, setPreprocessedText] = useState("");
  
  // Media upload state
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia>();
  
  // Voice controls state
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0].id);
  const [speed, setSpeed] = useState(1.0);
  
  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{ url: string; duration: number } | null>(null);
  const [quotaWarning, setQuotaWarning] = useState(false);
  
  // History state
  const [history, setHistory] = useState<VoiceGenerationResult[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('voiceHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load voice history:', e);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      // Keep last 20 items
      const historyToSave = history.slice(0, 20);
      localStorage.setItem('voiceHistory', JSON.stringify(historyToSave));
    } catch (e) {
      console.error('Failed to save voice history:', e);
    }
  }, [history]);

  // Get the current text to use
  const getCurrentText = (): string => {
    if (textSource === 'manual') {
      return manualText;
    }
    const draft = drafts.find(d => d.id === selectedDraftId);
    return draft?.content.content.mainScript || "";
  };

  // Get the final text (preprocessed or original)
  const getFinalText = (): string => {
    const original = getCurrentText();
    if (preprocessingEnabled && preprocessedText) {
      return preprocessedText;
    }
    return original;
  };

  const handleSelectDraft = (draft: DraftHistory) => {
    setSelectedDraftId(draft.id);
    if (preprocessingEnabled) {
      setPreprocessedText(preprocessTextForVoice(draft.content.content.mainScript, preprocessingMode));
    }
  };

  const handleGenerate = async () => {
    const text = getFinalText();
    
    if (!text.trim()) {
      toast({
        title: "Teks kosong",
        description: "Masukkan teks untuk dikonversi ke voice",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setQuotaWarning(false);

    try {
      const response = await fetch(
        `https://xdlssuosmuoeyrfbcnru.supabase.co/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbHNzdW9zbXVvZXlyZmJjbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjc2MjMsImV4cCI6MjA4NDc0MzYyM30.FEO9ecrj9IP3yP_k1fsVGR7lvVqqydBpevKfNp5NaPk",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbHNzdW9zbXVvZXlyZmJjbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjc2MjMsImV4cCI6MjA4NDc0MzYyM30.FEO9ecrj9IP3yP_k1fsVGR7lvVqqydBpevKfNp5NaPk`,
          },
          body: JSON.stringify({
            text,
            voiceId: selectedVoice,
            speed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.quotaError) {
          setQuotaWarning(true);
        }
        throw new Error(data.error || "Failed to generate voice");
      }

      // Create audio URL from base64
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      setGeneratedAudio({
        url: audioUrl,
        duration: data.duration,
      });

      // Add to history
      const result: VoiceGenerationResult = {
        id: Date.now().toString(),
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        voiceId: selectedVoice,
        speed,
        audioUrl,
        duration: data.duration,
        createdAt: new Date(),
        sourceType: textSource,
        sourceId: selectedDraftId,
      };
      setHistory(prev => [result, ...prev]);

      toast({
        title: "Voice berhasil digenerate!",
        description: `Durasi: ${data.duration} detik`,
      });
    } catch (error) {
      console.error("TTS error:", error);
      toast({
        title: "Gagal generate voice",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayFromHistory = (result: VoiceGenerationResult) => {
    setGeneratedAudio({
      url: result.audioUrl,
      duration: result.duration,
    });
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const currentText = getCurrentText();

  return (
    <MainLayout>
      <PageHeader
        icon={Mic2}
        title="Voice Dubbing"
        description="Ubah teks menjadi voice over dengan ElevenLabs AI"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,400px] overflow-hidden">
        {/* Left Column - Input */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-4 md:p-6 animate-fade-in">
            <div className="space-y-5 md:space-y-6">
              {/* Text Source */}
              <TextSourceSelector
                sourceType={textSource}
                onSourceTypeChange={setTextSource}
                manualText={manualText}
                onManualTextChange={setManualText}
                drafts={drafts}
                selectedDraftId={selectedDraftId}
                onSelectDraft={handleSelectDraft}
              />

              {/* Media Upload */}
              <MediaUploader
                uploadedMedia={uploadedMedia}
                onMediaUpload={setUploadedMedia}
                onMediaRemove={() => setUploadedMedia(undefined)}
              />

              {/* Preprocessing */}
              {currentText && (
                <PreprocessingPanel
                  originalText={currentText}
                  preprocessedText={preprocessedText}
                  mode={preprocessingMode}
                  onModeChange={setPreprocessingMode}
                  onPreprocess={setPreprocessedText}
                  isEnabled={preprocessingEnabled}
                  onEnabledChange={setPreprocessingEnabled}
                />
              )}

              {/* Duration Estimator */}
              {currentText && (
                <DurationEstimator
                  text={getFinalText()}
                  uploadedMedia={uploadedMedia}
                  currentSpeed={speed}
                  onSpeedSuggestion={setSpeed}
                />
              )}

              {/* Voice Controls */}
              <VoiceControls
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                speed={speed}
                onSpeedChange={setSpeed}
              />

              {/* Quota Warning */}
              {quotaWarning && (
                <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Quota ElevenLabs habis. Periksa plan Anda.</span>
                </div>
              )}

              {/* Generate Button */}
              <GenerateButton
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={!currentText.trim()}
                className="w-full"
              >
                Generate Voice
              </GenerateButton>
            </div>
          </div>

          {/* Audio Player */}
          {generatedAudio && (
            <div className="animate-fade-in">
              <AudioPlayer
                audioUrl={generatedAudio.url}
                duration={generatedAudio.duration}
                voiceName={ELEVENLABS_VOICES.find(v => v.id === selectedVoice)?.name}
                speed={speed}
                onRegenerate={handleGenerate}
                isRegenerating={isLoading}
              />
            </div>
          )}
        </div>

        {/* Right Column - History */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <VoiceHistory
            history={history}
            onPlayAudio={handlePlayFromHistory}
            onDelete={handleDeleteFromHistory}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default VoiceDubbing;
