import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DraftHistory, GeneratedContent, TemplateType } from '@/types/textGenerator';
import { useToast } from '@/hooks/use-toast';

interface ContentDraftRow {
  id: string;
  title: string;
  template_id: string;
  tone: string;
  duration: number;
  output_format: string;
  field_values: Record<string, unknown>;
  brand_voice: Record<string, unknown> | null;
  production_options: Record<string, unknown> | null;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const mapRowToDraft = (row: ContentDraftRow): DraftHistory => {
  const content = row.content as {
    mainScript?: string;
    caption?: string;
    hashtags?: string[];
    onScreenText?: string[];
    shotList?: string[];
    subtitleFriendly?: string;
    metadata?: {
      duration?: number;
      wordCount?: number;
      tone?: string;
      format?: string;
    };
  };

  return {
    id: row.id,
    title: row.title,
    templateId: row.template_id as TemplateType,
    content: {
      id: row.id,
      templateId: row.template_id as TemplateType,
      content: {
        mainScript: content.mainScript || '',
        caption: content.caption,
        hashtags: content.hashtags,
        onScreenText: content.onScreenText,
        shotList: content.shotList,
        subtitleFriendly: content.subtitleFriendly,
      },
      metadata: {
        duration: row.duration,
        wordCount: content.metadata?.wordCount || 0,
        tone: row.tone as DraftHistory['content']['metadata']['tone'],
        format: row.output_format as DraftHistory['content']['metadata']['format'],
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      title: row.title,
      isDraft: true,
    },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};

export const useContentDrafts = () => {
  const [drafts, setDrafts] = useState<DraftHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch drafts from database
  const fetchDrafts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mappedDrafts = (data as ContentDraftRow[]).map(mapRowToDraft);
      setDrafts(mappedDrafts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    fetchDrafts();

    const channel = supabase
      .channel('content_drafts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_drafts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newDraft = mapRowToDraft(payload.new as ContentDraftRow);
            setDrafts((prev) => [newDraft, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedDraft = mapRowToDraft(payload.new as ContentDraftRow);
            setDrafts((prev) =>
              prev.map((d) => (d.id === updatedDraft.id ? updatedDraft : d))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setDrafts((prev) => prev.filter((d) => d.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDrafts]);

  // Save draft to database
  const saveDraft = async (
    content: GeneratedContent,
    fieldValues: Record<string, string | string[]>,
    brandVoice?: Record<string, unknown>,
    productionOptions?: Record<string, unknown>
  ) => {
    try {
      const insertData = {
        title: content.title,
        template_id: content.templateId,
        tone: content.metadata.tone,
        duration: content.metadata.duration,
        output_format: content.metadata.format,
        field_values: fieldValues as unknown as Record<string, unknown>,
        brand_voice: brandVoice || null,
        production_options: productionOptions || null,
        content: {
          mainScript: content.content.mainScript,
          caption: content.content.caption,
          hashtags: content.content.hashtags,
          onScreenText: content.content.onScreenText,
          shotList: content.content.shotList,
          subtitleFriendly: content.content.subtitleFriendly,
          metadata: content.metadata,
        } as unknown as Record<string, unknown>,
      };

      const { error } = await supabase.from('content_drafts').insert(insertData as never);

      if (error) throw error;

      toast({
        title: 'Draft tersimpan!',
        description: 'Kamu bisa akses draft ini dari panel Riwayat',
      });

      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Gagal menyimpan draft',
        description: 'Terjadi kesalahan, coba lagi',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete draft
  const deleteDraft = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_drafts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Draft dihapus',
      });

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({
        title: 'Gagal menghapus draft',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Duplicate draft
  const duplicateDraft = async (draft: DraftHistory) => {
    try {
      const { data: originalData, error: fetchError } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('id', draft.id)
        .single();

      if (fetchError) throw fetchError;

      const original = originalData as ContentDraftRow;

      const insertData = {
        title: `${original.title} (Copy)`,
        template_id: original.template_id,
        tone: original.tone,
        duration: original.duration,
        output_format: original.output_format,
        field_values: original.field_values as unknown as Record<string, unknown>,
        brand_voice: original.brand_voice as unknown as Record<string, unknown> | null,
        production_options: original.production_options as unknown as Record<string, unknown> | null,
        content: original.content as unknown as Record<string, unknown>,
      };

      const { error } = await supabase.from('content_drafts').insert(insertData as never);

      if (error) throw error;

      toast({
        title: 'Draft diduplikasi',
        description: `${original.title} (Copy)`,
      });

      return true;
    } catch (error) {
      console.error('Error duplicating draft:', error);
      toast({
        title: 'Gagal menduplikasi draft',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Rename draft
  const renameDraft = async (id: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('content_drafts')
        .update({ title: newTitle })
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error renaming draft:', error);
      toast({
        title: 'Gagal mengubah nama draft',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    drafts,
    isLoading,
    saveDraft,
    deleteDraft,
    duplicateDraft,
    renameDraft,
    refetch: fetchDrafts,
  };
};
