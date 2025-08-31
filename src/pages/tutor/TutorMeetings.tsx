import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CreateMeetingModal from '@/components/tutor/CreateMeetingModal';

interface Meeting {
  id: string;
  student_id: string;
  tutor_id: string;
  title: string | null;
  description: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meeting_link?: string;
  student_profile?: {
    full_name: string;
    reg_no: string;
  };
}

const TutorMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchMeetings();
    
    // Real-time updates for meetings
    const channel = supabase
      .channel('meetings_updates')
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
      // Get current tutor's profile ID
      const { data: tutorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!tutorProfile) return;

      // Fetch meetings for this tutor
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          student_profile:profiles!meetings_student_id_fkey (
            full_name,
            reg_no
          )
        `)
        .eq('tutor_id', tutorProfile.id)
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

  const updateMeetingStatus = async (meetingId: string, status: Meeting['status']) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status })
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Meeting ${status === 'completed' ? 'completed' : status}`,
      });
      
      fetchMeetings();
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to update meeting status",
        variant: "destructive"
      });
    }
  };

  const generateMeetingLink = async (meetingId: string) => {
    const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;
    
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ meeting_link: meetingLink })
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meeting link generated",
      });
      
      fetchMeetings();
    } catch (error) {
      console.error('Error generating meeting link:', error);
      toast({
        title: "Error",
        description: "Failed to generate meeting link",
        variant: "destructive"
      });
    }
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

  const handleCreateMeeting = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleMeetingCreated = () => {
    fetchMeetings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-kontora font-bold text-[hsl(142,76%,36%)]">
            Meeting Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your student meetings and sessions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {meetings.length} meetings
          </div>
          <Button
            onClick={handleCreateMeeting}
            className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Meeting
          </Button>
        </div>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No meetings scheduled</h3>
            <p className="text-muted-foreground mb-4">
              Your student meetings will appear here once scheduled
            </p>
            <Button
              onClick={handleCreateMeeting}
              className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="border-l-4 border-l-[hsl(142,76%,36%)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {meeting.title || 'Meeting'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      with {meeting.student_profile?.full_name || 'Unknown Student'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(meeting.status)}>
                    {meeting.status.replace('-', ' ')}
                  </Badge>
                </div>
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mt-2">
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
                    <Users className="w-4 h-4" />
                    Reg: {meeting.student_profile?.reg_no || 'N/A'}
                  </div>
                </div>

                {meeting.meeting_link && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Meeting Link:</span>
                    <a 
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {meeting.meeting_link}
                    </a>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {meeting.status === 'scheduled' && (
                    <>
                      {!meeting.meeting_link && (
                        <Button
                          size="sm"
                          onClick={() => generateMeetingLink(meeting.id)}
                          className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Generate Link
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMeetingStatus(meeting.id, 'in-progress')}
                      >
                        Start Meeting
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateMeetingStatus(meeting.id, 'cancelled')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}

                  {meeting.status === 'in-progress' && (
                    <Button
                      size="sm"
                      onClick={() => updateMeetingStatus(meeting.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}

                  {meeting.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Meeting completed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  );
};

export default TutorMeetings;
