
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SummarizerData {
  id: number;
  text: string | null;
  created_at: string;
  student_id: string | null;
}

export const useSummarizerData = () => {
  const [summarizerData, setSummarizerData] = useState<SummarizerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch summarizer data for current user with retry logic
  const fetchSummarizerData = useCallback(async (retryCount = 0) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching summarizer data for user:', user.id, `(attempt ${retryCount + 1})`);
      
      const { data, error } = await supabase
        .from('ai_summarizer')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched summarizer data:', data);
      setSummarizerData(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching summarizer data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      
      // Retry logic for transient errors
      if (retryCount < 2 && (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        console.log(`Retrying fetch in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => fetchSummarizerData(retryCount + 1), (retryCount + 1) * 1000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Force refresh data (useful after successful upload)
  const forceRefresh = useCallback(() => {
    console.log('Force refreshing summarizer data...');
    fetchSummarizerData(0);
  }, [fetchSummarizerData]);

  // Set up real-time subscription with improved error handling
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for user:', user.id);

    // Initial fetch
    fetchSummarizerData();

    // Set up real-time subscription for new summaries
    const channel = supabase
      .channel('ai-summarizer-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_summarizer',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New summarizer data detected:', payload);
          const newData = payload.new as SummarizerData;
          setSummarizerData(prev => {
            // Avoid duplicates
            const exists = prev.some(item => item.id === newData.id);
            if (exists) return prev;
            return [newData, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_summarizer',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Updated summarizer data detected:', payload);
          const updatedData = payload.new as SummarizerData;
          setSummarizerData(prev => 
            prev.map(item => item.id === updatedData.id ? updatedData : item)
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error, retrying...');
          // Retry subscription after a delay
          setTimeout(() => {
            supabase.removeChannel(channel);
            // Re-run effect to retry subscription
            fetchSummarizerData();
          }, 3000);
        }
      });

    return () => {
      console.log('Cleaning up summarizer real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSummarizerData]);

  return { 
    summarizerData, 
    isLoading, 
    error,
    refreshData: fetchSummarizerData,
    forceRefresh,
    currentStudentId: user?.id 
  };
};
