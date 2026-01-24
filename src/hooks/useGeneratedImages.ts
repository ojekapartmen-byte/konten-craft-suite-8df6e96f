import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title?: string;
  tags?: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GeneratedImageRow {
  id: string;
  prompt: string;
  style: string;
  aspect_ratio: string;
  image_url: string;
  thumbnail_url: string | null;
  title: string | null;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const mapRowToImage = (row: GeneratedImageRow): GeneratedImage => ({
  id: row.id,
  prompt: row.prompt,
  style: row.style,
  aspectRatio: row.aspect_ratio,
  imageUrl: row.image_url,
  thumbnailUrl: row.thumbnail_url || undefined,
  title: row.title || undefined,
  tags: row.tags || undefined,
  isFavorite: row.is_favorite,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const useGeneratedImages = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch images from database
  const fetchImages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedImages = (data as GeneratedImageRow[]).map(mapRowToImage);
      setImages(mappedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    fetchImages();

    const channel = supabase
      .channel('generated_images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_images',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newImage = mapRowToImage(payload.new as GeneratedImageRow);
            setImages((prev) => [newImage, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedImage = mapRowToImage(payload.new as GeneratedImageRow);
            setImages((prev) =>
              prev.map((img) => (img.id === updatedImage.id ? updatedImage : img))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setImages((prev) => prev.filter((img) => img.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchImages]);

  // Save new image
  const saveImage = async (
    imageData: {
      prompt: string;
      style: string;
      aspectRatio: string;
      imageUrl: string;
      title?: string;
    }
  ) => {
    try {
      const insertData = {
        prompt: imageData.prompt,
        style: imageData.style,
        aspect_ratio: imageData.aspectRatio,
        image_url: imageData.imageUrl,
        title: imageData.title || imageData.prompt.substring(0, 50),
      };

      const { data, error } = await supabase
        .from('generated_images')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Gambar tersimpan!',
        description: 'Gambar berhasil disimpan ke galeri',
      });

      return mapRowToImage(data as GeneratedImageRow);
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: 'Gagal menyimpan gambar',
        description: 'Terjadi kesalahan, coba lagi',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update image
  const updateImage = async (
    id: string,
    updates: {
      title?: string;
      tags?: string[];
      isFavorite?: boolean;
    }
  ) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

      const { error } = await supabase
        .from('generated_images')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: 'Gagal mengupdate gambar',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete image
  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Gambar dihapus',
      });

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Gagal menghapus gambar',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image) return false;

    return updateImage(id, { isFavorite: !image.isFavorite });
  };

  return {
    images,
    isLoading,
    saveImage,
    updateImage,
    deleteImage,
    toggleFavorite,
    refetch: fetchImages,
  };
};
