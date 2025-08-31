
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  id: string;
  student_id: string;
  score: number;
  rank: number;
  updated_at: string;
  student: {
    full_name: string;
    reg_no: string;
    avatar_url?: string;
  };
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          *,
          student:profiles!leaderboard_student_id_fkey (
            full_name,
            reg_no,
            avatar_url
          )
        `)
        .order('rank', { ascending: true })
        .limit(20);

      if (error) throw error;

      setLeaderboard(data || []);

      // Find current user's rank
      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (userProfile) {
          const userEntry = data?.find(entry => entry.student_id === userProfile.id);
          setUserRank(userEntry || null);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { leaderboard, userRank, loading, refetch: fetchLeaderboard };
};
