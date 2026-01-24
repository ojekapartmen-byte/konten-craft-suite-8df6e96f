export interface SlideImage {
  id: string;
  src: string;
  name: string;
  duration: number; // seconds per slide
  source: 'upload' | 'generator';
}

export interface AudioTrack {
  id: string;
  src: string;
  name: string;
  duration: number;
  source: 'upload' | 'dubbing';
}

export interface VideoProject {
  id: string;
  title: string;
  slides: SlideImage[];
  audio: AudioTrack | null;
  totalDuration: number;
  transition: TransitionType;
  createdAt: Date;
}

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom';

export interface VideoHistory {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  createdAt: Date;
  slides: number;
}
