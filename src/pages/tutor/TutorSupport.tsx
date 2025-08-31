import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Clock, CheckCircle, AlertTriangle, User, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  student_id: string;
  query_text: string;
  image_url?: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  tutor_id?: string;
  student_profile?: {
    full_name: string;
    reg_no: string;
  };
}

const TutorSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentTutorId, setCurrentTutorId] = useState<string>('');

  useEffect(() => {
    fetchCurrentTutorId();
  }, [user]);

  useEffect(() => {
    if (currentTutorId) {
      fetchSupportTickets();
      
      // Real-time updates for support tickets
      const channel = supabase
        .channel('support_tickets_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_tickets'
          },
          () => {
            fetchSupportTickets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentTutorId]);

  const fetchCurrentTutorId = async () => {
    if (!user) return;

    try {
      const { data: tutorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (tutorProfile) {
        setCurrentTutorId(tutorProfile.id);
      }
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      // Fetch all tickets (unassigned and assigned to current tutor)
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          student_profile:profiles!support_tickets_student_id_fkey (
            full_name,
            reg_no
          )
        `)
        .or(`tutor_id.is.null,tutor_id.eq.${currentTutorId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignTicket = async (ticketId: string) => {
    try {
      console.log('Starting ticket assignment for ticket:', ticketId);
      
      // Get ticket details first to get student info
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select(`
          *,
          student_profile:profiles!support_tickets_student_id_fkey (
            full_name
          )
        `)
        .eq('id', ticketId)
        .single();

      if (!ticket) throw new Error('Ticket not found');

      console.log('Ticket found:', ticket);

      // Get current tutor's name
      const { data: tutorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', currentTutorId)
        .single();

      const tutorName = tutorProfile?.full_name || 'A tutor';
      console.log('Tutor name:', tutorName);

      // Update ticket first
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ 
          tutor_id: currentTutorId,
          status: 'in_progress' 
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('Error updating ticket:', updateError);
        throw updateError;
      }

      console.log('Ticket updated successfully');

      // Try to create notification - handle gracefully if it fails
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: ticket.student_id,
            title: 'Support Ticket Assigned',
            message: `Your support ticket has been assigned to ${tutorName} and is now being reviewed.`,
            is_read: false
          });

        if (notificationError) {
          console.warn('Failed to create notification:', notificationError);
          // Don't throw error - ticket assignment was successful
        } else {
          console.log('Notification created successfully');
        }
      } catch (notificationError) {
        console.warn('Notification creation failed, but ticket was assigned:', notificationError);
      }

      toast({
        title: "Success",
        description: "Ticket assigned to you successfully",
      });
      
      fetchSupportTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive"
      });
    }
  };

  const resolveTicket = async (ticketId: string) => {
    try {
      const response = responses[ticketId];
      if (!response?.trim()) {
        toast({
          title: "Error",
          description: "Please provide a response before resolving",
          variant: "destructive"
        });
        return;
      }

      // Get ticket details for student notification
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select(`
          *,
          student_profile:profiles!support_tickets_student_id_fkey (
            full_name
          )
        `)
        .eq('id', ticketId)
        .single();

      if (!ticket) throw new Error('Ticket not found');

      // Get current tutor's name
      const { data: tutorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', currentTutorId)
        .single();

      const tutorName = tutorProfile?.full_name || 'Your tutor';

      // Update ticket with resolution and tutor response
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'resolved',
          tutor_response: response
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Try to create notification - handle gracefully if it fails
      try {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: ticket.student_id,
            title: 'Support Ticket Resolved',
            message: `Your support ticket has been resolved by ${tutorName}. Response: "${response.length > 100 ? response.substring(0, 100) + '...' : response}"`,
            is_read: false
          });
      } catch (notificationError) {
        console.warn('Failed to create notification for resolved ticket:', notificationError);
      }

      toast({
        title: "Success",
        description: "Ticket resolved successfully",
      });
      
      setResponses(prev => ({ ...prev, [ticketId]: '' }));
      fetchSupportTickets();
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast({
        title: "Error",
        description: "Failed to resolve ticket",
        variant: "destructive"
      });
    }
  };

  const escalateToAdmin = async (ticketId: string) => {
    try {
      // In a real implementation, you might create a notification for admin
      // or update the ticket with an escalation flag
      toast({
        title: "Info",
        description: "Ticket escalated to admin (feature to be implemented)",
      });
    } catch (error) {
      console.error('Error escalating ticket:', error);
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return <HelpCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading support tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-kontora font-bold text-[hsl(142,76%,36%)]">
            Support System
          </h1>
          <p className="text-muted-foreground mt-1">
            Handle student queries and provide assistance
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="w-4 h-4" />
          {tickets.length} tickets
        </div>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No support tickets</h3>
            <p className="text-muted-foreground">
              Student queries will appear here when submitted
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="border-l-4 border-l-[hsl(142,76%,36%)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {ticket.student_profile?.full_name || 'Unknown Student'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ticket.student_profile?.reg_no} • {new Date(ticket.created_at).toLocaleString()}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Student Query:</h4>
                  <p className="text-sm">{ticket.query_text}</p>
                  
                  {ticket.image_url && (
                    <div className="mt-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                      <a 
                        href={ticket.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Attached Image
                      </a>
                    </div>
                  )}
                </div>

                {ticket.status === 'open' && !ticket.tutor_id && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => assignTicket(ticket.id)}
                      className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
                    >
                      Assign to Me
                    </Button>
                  </div>
                )}

                {ticket.tutor_id === currentTutorId && ticket.status === 'in_progress' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Response:
                      </label>
                      <Textarea
                        placeholder="Type your response to help the student..."
                        value={responses[ticket.id] || ''}
                        onChange={(e) => setResponses(prev => ({ 
                          ...prev, 
                          [ticket.id]: e.target.value 
                        }))}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => resolveTicket(ticket.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve Ticket
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => escalateToAdmin(ticket.id)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Escalate to Admin
                      </Button>
                    </div>
                  </div>
                )}

                {ticket.status === 'resolved' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Ticket has been resolved
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorSupport;
