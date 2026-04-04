export interface SlideImage {
  id: string;
  src: string;
  name: string;
  duration: number; // seconds per slide
  source: 'upload' | 'generator';
  type?: 'image' | 'video'; // default 'image'
  thumbnailUrl?: string;
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
 
 export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '4:5';

export interface VideoHistory {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  createdAt: Date;
  slides: number;
}
