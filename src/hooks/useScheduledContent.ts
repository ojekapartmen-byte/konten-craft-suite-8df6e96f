import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduledContent, CreateScheduledContent, Platform, ScheduleStatus } from '@/types/scheduling';

interface ScheduledContentRow {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  scheduled_at: string;
  status: string;
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

const mapRowToScheduledContent = (row: ScheduledContentRow): ScheduledContent => ({
  ...row,
  platform: row.platform as Platform,
  status: row.status as ScheduleStatus,
});

export const useScheduledContent = () => {
  const [schedules, setSchedules] = useState<ScheduledContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSchedules = useCallback(async () => {
    if (!user) {
      setSchedules([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scheduled_content')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setSchedules((data as ScheduledContentRow[]).map(mapRowToScheduledContent));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: 'Gagal memuat jadwal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = async (data: CreateScheduledContent) => {
    if (!user) {
      toast({ title: 'Silakan login', variant: 'destructive' });
      return null;
    }

    try {
      const insertData = {
        ...data,
        user_id: user.id,
        email_address: data.email_address || user.email,
      };

      const { data: result, error } = await supabase
        .from('scheduled_content')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      const newSchedule = mapRowToScheduledContent(result as ScheduledContentRow);
      setSchedules(prev => [...prev, newSchedule].sort((a, b) => 
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ));

      toast({ title: 'Jadwal berhasil dibuat!' });
      return newSchedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({ title: 'Gagal membuat jadwal', variant: 'destructive' });
      return null;
    }
  };

  const updateSchedule = async (id: string, data: Partial<CreateScheduledContent>) => {
    try {
      const { error } = await supabase
        .from('scheduled_content')
        .update(data as never)
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.map(s => 
        s.id === id ? { ...s, ...data } as ScheduledContent : s
      ));

      toast({ title: 'Jadwal diperbarui!' });
      return true;
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({ title: 'Gagal memperbarui jadwal', variant: 'destructive' });
      return false;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Jadwal dihapus!' });
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({ title: 'Gagal menghapus jadwal', variant: 'destructive' });
      return false;
    }
  };

  const markAsPosted = async (id: string) => {
    return updateSchedule(id, { status: 'posted' } as never);
  };

  const sendReminder = async (id: string) => {
    try {
      const schedule = schedules.find(s => s.id === id);
      if (!schedule) throw new Error('Schedule not found');

      const { error } = await supabase.functions.invoke('send-schedule-reminder', {
        body: { scheduleId: id },
      });

      if (error) throw error;

      toast({ title: 'Reminder terkirim!' });
      await fetchSchedules();
      return true;
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({ title: 'Gagal mengirim reminder', variant: 'destructive' });
      return false;
    }
  };

  return {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    markAsPosted,
    sendReminder,
    refetch: fetchSchedules,
  };
};
