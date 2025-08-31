
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  query_text: string;
  image_url?: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  tutor_response?: string;
}

interface SupportTicketsListProps {
  refreshTrigger?: number;
}

export const SupportTicketsList = ({ refreshTrigger }: SupportTicketsListProps) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTickets();
      
      // Set up real-time updates for support tickets
      const channel = supabase
        .channel('student_support_tickets')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_tickets'
          },
          () => {
            fetchTickets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, refreshTrigger]);

  const fetchTickets = async () => {
    try {
      // Get current user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading your support tickets...</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No support tickets yet</h3>
          <p className="text-muted-foreground">
            Submit your first support request to get help from our tutors
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Support Tickets</h3>
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {ticket.query_text.split('\n\n')[0].replace('Topic: ', '') || 'Support Request'}
              </CardTitle>
              <Badge className={getStatusColor(ticket.status)}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(ticket.created_at).toLocaleDateString()} at{' '}
              {new Date(ticket.created_at).toLocaleTimeString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm whitespace-pre-line">
                  {ticket.query_text.split('\n\n').slice(1).join('\n\n') || ticket.query_text}
                </p>
              </div>
              
              {ticket.image_url && (
                <div className="flex items-center gap-2">
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

              {ticket.tutor_response && ticket.status === 'resolved' && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Tutor Response:</h4>
                  <p className="text-sm text-green-700 whitespace-pre-line">
                    {ticket.tutor_response}
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {ticket.status === 'open' && 'Waiting for tutor assignment...'}
                {ticket.status === 'in_progress' && 'A tutor is working on your request'}
                {ticket.status === 'resolved' && 'This ticket has been resolved'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
