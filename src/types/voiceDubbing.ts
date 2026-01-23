// Types for Voice Dubbing with ElevenLabs

export type TextSourceType = 'history' | 'draft' | 'manual';

export type PreprocessingMode = 'natural' | 'angka' | 'campuran';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export interface TextSegment {
  id: string;
  text: string;
  originalText: string;
  estimatedDuration: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  audioUrl?: string;
}

export interface UploadedMedia {
  file: File;
  type: 'audio' | 'video';
  duration: number; // in seconds
  name: string;
}

export interface DurationEstimate {
  voiceDuration: number;
  mediaDuration: number;
  difference: number;
  suggestion: 'speed-up' | 'speed-down' | 'trim' | 'ok';
  suggestedSpeed: number;
}

export interface VoiceGenerationResult {
  id: string;
  text: string;
  voiceId: string;
  speed: number;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  sourceType: TextSourceType;
  sourceId?: string; // ID of the draft if from history
}

export interface VoiceDubbingState {
  textSource: TextSourceType;
  selectedDraftId?: string;
  manualText: string;
  preprocessedText: string;
  preprocessingMode: PreprocessingMode;
  uploadedMedia?: UploadedMedia;
  selectedVoice: string;
  speed: number;
  segments: TextSegment[];
  isProcessing: boolean;
  history: VoiceGenerationResult[];
}

// ElevenLabs voice list (free tier compatible)
export const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Wanita, tenang dan profesional' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Pria, autoritatif dan hangat' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Pria muda, energik' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Wanita, ramah dan bersahabat' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Wanita, lembut dan menenangkan' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Pria, tegas dan jelas' },
];

// Words per minute for Indonesian speech (average)
export const WORDS_PER_MINUTE = 130;

// Calculate estimated duration from text
export function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.round((words / WORDS_PER_MINUTE) * 60);
}

// Calculate speed suggestion based on target duration
export function calculateSpeedSuggestion(
  textDuration: number, 
  targetDuration: number
): { speed: number; suggestion: 'speed-up' | 'speed-down' | 'trim' | 'ok' } {
  const ratio = textDuration / targetDuration;
  
  if (ratio >= 0.9 && ratio <= 1.1) {
    return { speed: 1.0, suggestion: 'ok' };
  } else if (ratio < 0.9) {
    // Voice is shorter than target, slow down
    const speed = Math.max(0.7, ratio);
    return { speed: Math.round(speed * 10) / 10, suggestion: 'speed-down' };
  } else if (ratio > 1.1 && ratio <= 1.3) {
    // Voice is slightly longer, speed up
    const speed = Math.min(1.2, ratio);
    return { speed: Math.round(speed * 10) / 10, suggestion: 'speed-up' };
  } else {
    // Voice is much longer, suggest trimming
    return { speed: 1.1, suggestion: 'trim' };
  }
}
