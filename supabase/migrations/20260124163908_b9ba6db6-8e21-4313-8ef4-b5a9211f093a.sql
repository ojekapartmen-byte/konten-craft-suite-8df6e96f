-- Create video_projects table for storing video generator results
CREATE TABLE public.video_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Video',
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  audio JSONB DEFAULT NULL,
  transition TEXT NOT NULL DEFAULT 'fade',
  total_duration INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT DEFAULT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for user_id for faster queries
CREATE INDEX idx_video_projects_user_id ON public.video_projects(user_id);
CREATE INDEX idx_video_projects_created_at ON public.video_projects(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view their own video projects"
ON public.video_projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video projects"
ON public.video_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video projects"
ON public.video_projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video projects"
ON public.video_projects
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_projects_updated_at
BEFORE UPDATE ON public.video_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();