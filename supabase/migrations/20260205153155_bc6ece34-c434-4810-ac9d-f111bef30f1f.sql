-- Create scheduled_content table for content scheduling
CREATE TABLE public.scheduled_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL, -- instagram, tiktok, youtube, facebook, twitter
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, reminded, posted, cancelled
  caption TEXT,
  hashtags TEXT[],
  video_url TEXT,
  thumbnail_url TEXT,
  notification_email BOOLEAN DEFAULT true,
  notification_whatsapp BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  email_address TEXT,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scheduled content"
ON public.scheduled_content
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled content"
ON public.scheduled_content
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled content"
ON public.scheduled_content
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled content"
ON public.scheduled_content
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_content_updated_at
BEFORE UPDATE ON public.scheduled_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();