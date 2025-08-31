
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AIResponse {
  id: string;
  ai_response: string;
  created_at: string;
  query_text: string;
  user_id?: string;
  student_id?: string;
}

export const useAIResponses = () => {
  const [latestResponse, setLatestResponse] = useState<AIResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const { user } = useAuth();

  // Get current student ID when user changes
  useEffect(() => {
    const getCurrentStudentId = async () => {
      if (!user?.id) return;

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          console.log('Current student ID:', profileData.id);
          setCurrentStudentId(profileData.id);
        }
      } catch (error) {
        console.error('Error fetching student ID:', error);
      }
    };

    getCurrentStudentId();
  }, [user?.id]);

  const pollForNewResponses = async () => {
    if (!user?.id || !currentStudentId || isPolling) return;

    setIsPolling(true);

    try {
      console.log('Polling for responses for student:', currentStudentId);
      
      // Fetch the latest AI assistant response using both user_id and student_id
      const { data, error } = await supabase
        .from('ai_assistant_logs')
        .select('id, ai_response, created_at, query_text, user_id, student_id')
        .or(`user_id.eq.${user.id},student_id.eq.${currentStudentId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching AI responses:', error);
        return;
      }

      if (data && data.ai_response) {
        console.log('Latest AI response found:', data);
        setLatestResponse(data);
      }
    } catch (error) {
      console.error('Error polling for responses:', error);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    if (!user?.id || !currentStudentId) return;

    console.log('Setting up real-time subscription for user:', user.id, 'student:', currentStudentId);

    // Initial poll
    pollForNewResponses();

    // Set up real-time subscription for new AI responses
    const channel = supabase
      .channel('ai-responses-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_assistant_logs'
        },
        async (payload) => {
          console.log('New AI response detected:', payload);
          const newResponse = payload.new as AIResponse;
          
          // Check if this response belongs to the current user
          let isForCurrentUser = false;
          
          if (newResponse.user_id === user.id) {
            console.log('Response matches current user_id:', user.id);
            isForCurrentUser = true;
          } else if (newResponse.student_id === currentStudentId) {
            console.log('Response matches current student_id:', currentStudentId);
            isForCurrentUser = true;
          }
          
          if (isForCurrentUser && newResponse.ai_response) {
            console.log('Setting latest response:', newResponse);
            setLatestResponse(newResponse);
          } else {
            console.log('Response not for current user:', {
              responseUserId: newResponse.user_id,
              responseStudentId: newResponse.student_id,
              currentUserId: user.id,
              currentStudentId: currentStudentId
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentStudentId]);

  return { latestResponse, pollForNewResponses };
};
