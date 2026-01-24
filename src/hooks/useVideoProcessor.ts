import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { VideoOperation, ProcessingJob, JobStatus } from '@/types/videoEditor';

const POLL_INTERVAL = 2000; // 2 seconds

export function useVideoProcessor() {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const checkStatus = useCallback(async (jobId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: { action: 'status', jobId },
      });

      if (error) throw error;

      const status: JobStatus = 
        data.status === 'ASSEMBLY_COMPLETED' ? 'completed' :
        data.status === 'ASSEMBLY_EXECUTING' ? 'processing' :
        data.status === 'ASSEMBLY_UPLOADING' ? 'processing' :
        data.error ? 'failed' : 'processing';

      setJob(prev => prev ? {
        ...prev,
        status,
        progress: data.progress || (status === 'completed' ? 100 : prev.progress),
        outputUrls: data.outputUrls || [],
        error: data.error,
      } : null);

      // Stop polling if completed or failed
      if (status === 'completed' || status === 'failed') {
        stopPolling();
      }

      return { status, outputUrls: data.outputUrls };
    } catch (err) {
      console.error('Error checking status:', err);
      return null;
    }
  }, [stopPolling]);

  const startPolling = useCallback((jobId: string) => {
    setIsPolling(true);
    pollIntervalRef.current = window.setInterval(() => {
      checkStatus(jobId);
    }, POLL_INTERVAL);
  }, [checkStatus]);

  const submitJob = useCallback(async (
    videoUrl: string,
    operations: VideoOperation[] = []
  ): Promise<string | null> => {
    try {
      setJob({
        id: '',
        status: 'submitting',
        progress: 0,
        outputUrls: [],
        createdAt: new Date(),
      });

      const { data, error } = await supabase.functions.invoke('process-video', {
        body: {
          action: 'submit',
          videoUrl,
          operations,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit job');
      }

      const jobId = data.jobId;

      setJob({
        id: jobId,
        status: 'processing',
        progress: 0,
        outputUrls: [],
        createdAt: new Date(),
      });

      // Start polling for status
      startPolling(jobId);

      return jobId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setJob(prev => prev ? {
        ...prev,
        status: 'failed',
        error: errorMessage,
      } : null);
      return null;
    }
  }, [startPolling]);

  const cancelJob = useCallback(async () => {
    if (!job?.id) return;

    try {
      stopPolling();
      
      await supabase.functions.invoke('process-video', {
        body: { action: 'cancel', jobId: job.id },
      });

      setJob(prev => prev ? {
        ...prev,
        status: 'cancelled',
      } : null);
    } catch (err) {
      console.error('Error cancelling job:', err);
    }
  }, [job?.id, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setJob(null);
  }, [stopPolling]);

  return {
    job,
    isPolling,
    submitJob,
    cancelJob,
    checkStatus,
    reset,
  };
}
