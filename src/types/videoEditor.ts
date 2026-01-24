export type VideoSourceType = 'upload' | 'url' | 'history';

export interface VideoSource {
  type: VideoSourceType;
  url: string;
  name: string;
  duration?: number;
  thumbnail?: string;
}

export type VideoOperationType = 
  | 'trim' 
  | 'resize' 
  | 'compress' 
  | 'watermark' 
  | 'extract_audio' 
  | 'add_audio';

export interface VideoOperation {
  type: VideoOperationType;
  params?: Record<string, unknown>;
}

export interface TrimParams {
  start: number;
  duration: number;
}

export interface ResizeParams {
  width: number;
  height: number;
  strategy: 'fit' | 'crop' | 'pad';
}

export interface CompressParams {
  bitrate: number; // in kbps
}

export interface WatermarkParams {
  imageUrl: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: string; // percentage like "15%"
}

export interface AddAudioParams {
  audioUrl: string;
}

export type JobStatus = 
  | 'idle'
  | 'submitting'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ProcessingJob {
  id: string;
  status: JobStatus;
  progress: number;
  outputUrls: string[];
  error?: string;
  createdAt: Date;
}
