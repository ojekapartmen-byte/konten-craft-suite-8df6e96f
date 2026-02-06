
-- Add image_url column to scheduled_content
ALTER TABLE public.scheduled_content ADD COLUMN image_url text NULL;

-- Create storage bucket for scheduling media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('scheduling-media', 'scheduling-media', true);

-- RLS policies for scheduling-media bucket
CREATE POLICY "Users can view their own scheduling media"
ON storage.objects FOR SELECT
USING (bucket_id = 'scheduling-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own scheduling media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scheduling-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own scheduling media"
ON storage.objects FOR DELETE
USING (bucket_id = 'scheduling-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read access for scheduling media"
ON storage.objects FOR SELECT
USING (bucket_id = 'scheduling-media');
