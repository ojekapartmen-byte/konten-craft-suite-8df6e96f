import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SlideImage, AudioTrack, TransitionType } from '@/types/videoGenerator';

export interface VideoProject {
  id: string;
  title: string;
  slides: SlideImage[];
  audio: AudioTrack | null;
  transition: TransitionType;
  totalDuration: number;
  thumbnailUrl?: string;
  isFavorite: boolean;
  status: 'draft' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface VideoProjectRow {
  id: string;
  user_id: string;
  title: string;
  slides: SlideImage[];
  audio: AudioTrack | null;
  transition: string;
  total_duration: number;
  thumbnail_url: string | null;
  is_favorite: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

const mapRowToProject = (row: VideoProjectRow): VideoProject => ({
  id: row.id,
  title: row.title,
  slides: row.slides || [],
  audio: row.audio,
  transition: row.transition as TransitionType,
  totalDuration: row.total_duration,
  thumbnailUrl: row.thumbnail_url || undefined,
  isFavorite: row.is_favorite,
  status: row.status as 'draft' | 'completed',
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const useVideoProjects = () => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch projects from database
  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('video_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProjects = (data as unknown as VideoProjectRow[]).map(mapRowToProject);
      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error fetching video projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    fetchProjects();

    const channel = supabase
      .channel('video_projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_projects',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProject = mapRowToProject(payload.new as unknown as VideoProjectRow);
            setProjects((prev) => [newProject, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedProject = mapRowToProject(payload.new as unknown as VideoProjectRow);
            setProjects((prev) =>
              prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setProjects((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects, user]);

  // Save new project
  const saveProject = async (projectData: {
    title: string;
    slides: SlideImage[];
    audio: AudioTrack | null;
    transition: TransitionType;
    totalDuration: number;
    thumbnailUrl?: string;
    status?: 'draft' | 'completed';
  }) => {
    if (!user) {
      toast({
        title: 'Tidak bisa menyimpan',
        description: 'Silakan login terlebih dahulu',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('video_projects')
        .insert({
          title: projectData.title,
          slides: JSON.parse(JSON.stringify(projectData.slides)),
          audio: projectData.audio ? JSON.parse(JSON.stringify(projectData.audio)) : null,
          transition: projectData.transition,
          total_duration: projectData.totalDuration,
          thumbnail_url: projectData.thumbnailUrl || null,
          status: projectData.status || 'draft',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Project tersimpan!',
        description: 'Video project berhasil disimpan',
      });

      return mapRowToProject(data as unknown as VideoProjectRow);
    } catch (error) {
      console.error('Error saving video project:', error);
      toast({
        title: 'Gagal menyimpan project',
        description: 'Terjadi kesalahan, coba lagi',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update project
  const updateProject = async (
    id: string,
    updates: {
      title?: string;
      slides?: SlideImage[];
      audio?: AudioTrack | null;
      transition?: TransitionType;
      totalDuration?: number;
      thumbnailUrl?: string;
      isFavorite?: boolean;
      status?: 'draft' | 'completed';
    }
  ) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.slides !== undefined) updateData.slides = updates.slides;
      if (updates.audio !== undefined) updateData.audio = updates.audio;
      if (updates.transition !== undefined) updateData.transition = updates.transition;
      if (updates.totalDuration !== undefined) updateData.total_duration = updates.totalDuration;
      if (updates.thumbnailUrl !== undefined) updateData.thumbnail_url = updates.thumbnailUrl;
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { error } = await supabase
        .from('video_projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating video project:', error);
      toast({
        title: 'Gagal mengupdate project',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Project dihapus',
      });

      return true;
    } catch (error) {
      console.error('Error deleting video project:', error);
      toast({
        title: 'Gagal menghapus project',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return false;

    return updateProject(id, { isFavorite: !project.isFavorite });
  };

  // Load project for editing
  const loadProject = (id: string): VideoProject | undefined => {
    return projects.find((p) => p.id === id);
  };

  return {
    projects,
    isLoading,
    saveProject,
    updateProject,
    deleteProject,
    toggleFavorite,
    loadProject,
    refetch: fetchProjects,
  };
};
