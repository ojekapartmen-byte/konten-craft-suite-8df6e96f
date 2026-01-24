-- Create table for storing generated content drafts
CREATE TABLE public.content_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  template_id TEXT NOT NULL,
  tone TEXT NOT NULL,
  duration INTEGER NOT NULL,
  output_format TEXT NOT NULL,
  field_values JSONB NOT NULL DEFAULT '{}',
  brand_voice JSONB,
  production_options JSONB,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no auth yet)
CREATE POLICY "Allow all access to content_drafts"
ON public.content_drafts
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_drafts_updated_at
BEFORE UPDATE ON public.content_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for content_drafts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_drafts;