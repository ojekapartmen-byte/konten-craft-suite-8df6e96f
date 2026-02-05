export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter';
export type ScheduleStatus = 'scheduled' | 'reminded' | 'posted' | 'cancelled';

export interface ScheduledContent {
  id: string;
  user_id: string;
  title: string;
  platform: Platform;
  scheduled_at: string;
  status: ScheduleStatus;
  caption: string | null;
  hashtags: string[] | null;
  video_url: string | null;
  thumbnail_url: string | null;
  notification_email: boolean;
  notification_whatsapp: boolean;
  whatsapp_number: string | null;
  email_address: string | null;
  reminder_sent_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledContent {
  title: string;
  platform: Platform;
  scheduled_at: string;
  caption?: string;
  hashtags?: string[];
  video_url?: string;
  thumbnail_url?: string;
  notification_email?: boolean;
  notification_whatsapp?: boolean;
  whatsapp_number?: string;
  email_address?: string;
  notes?: string;
}

export const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'facebook', label: 'Facebook', icon: '👍' },
  { value: 'twitter', label: 'Twitter/X', icon: '𝕏' },
];
