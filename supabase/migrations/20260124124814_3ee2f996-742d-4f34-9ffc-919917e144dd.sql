-- Create table for generated images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'realistic',
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  tags TEXT[],
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no auth yet)
-- Note: This should be updated to user-specific when auth is implemented
CREATE POLICY "Allow all access to generated_images"
ON public.generated_images
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_images_updated_at
BEFORE UPDATE ON public.generated_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_generated_images_created_at ON public.generated_images(created_at DESC);
CREATE INDEX idx_generated_images_is_favorite ON public.generated_images(is_favorite) WHERE is_favorite = true;