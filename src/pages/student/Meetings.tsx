
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Video, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meeting_link?: string;
  tutor_profile?: {
    full_name: string;
  };
}

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
    
    // Real-time updates for meetings
    const channel = supabase
      .channel('student_meetings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings'
        },
        () => {
          fetchMeetings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchMeetings = async () => {
    if (!user) return;

    try {
      // Get current student's profile ID
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!studentProfile) return;

      // Fetch meetings for this student
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          description,
          scheduled_at,
          status,
          meeting_link,
          tutor_profile:profiles!meetings_tutor_id_fkey (
            full_name
          )
        `)
        .eq('student_id', studentProfile.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Meeting['status']) => {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-lg">Loading meetings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-kontora font-black text-blue-dark mb-2">
          My Meetings
        </h2>
        <p className="text-blue-600 font-poppins text-sm lg:text-base">
          View and join your scheduled meetings with tutors
        </p>
      </div>

      {meetings.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No meetings scheduled</h3>
            <p className="text-muted-foreground">
              Your tutor meetings will appear here when they are scheduled
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {meeting.title || 'Meeting'}
                  </CardTitle>
                  <Badge className={getStatusColor(meeting.status)}>
                    {getStatusText(meeting.status)}
                  </Badge>
                </div>
                {meeting.description && (
                  <p className="text-muted-foreground text-sm mt-2">
                    {meeting.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {new Date(meeting.scheduled_at).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    Tutor: {meeting.tutor_profile?.full_name || 'Unknown'}
                  </div>
                </div>

                {meeting.meeting_link && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Meeting Link Available</span>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {meeting.status === 'scheduled' && meeting.meeting_link && (
                    <Button
                      onClick={() => joinMeeting(meeting.meeting_link!)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                  )}

                  {meeting.status === 'in-progress' && meeting.meeting_link && (
                    <Button
                      onClick={() => joinMeeting(meeting.meeting_link!)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Now
                    </Button>
                  )}

                  {meeting.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      Meeting completed
                    </div>
                  )}

                  {meeting.status === 'cancelled' && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      Meeting cancelled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Meetings;
