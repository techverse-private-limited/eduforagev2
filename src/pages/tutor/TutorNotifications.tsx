import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellRing, Calendar, Users, Star, HelpCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: 'meeting' | 'progress' | 'feedback' | 'support' | 'general';
}

const TutorNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTutorId, setCurrentTutorId] = useState<string>('');

  useEffect(() => {
    fetchCurrentTutorId();
  }, [user]);

  useEffect(() => {
    if (currentTutorId) {
      fetchNotifications();
      
      // Real-time notifications
      const channel = supabase
        .channel('notifications_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          () => {
            fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', currentTutorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include notification types based on content
      const notificationsWithTypes = (data || []).map(notification => ({
        ...notification,
        type: getNotificationType(notification.title, notification.message)
      }));
      
      setNotifications(notificationsWithTypes);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationType = (title: string, message: string): Notification['type'] => {
    const content = (title + ' ' + message).toLowerCase();
    
    if (content.includes('meeting') || content.includes('appointment')) return 'meeting';
    if (content.includes('progress') || content.includes('roadmap')) return 'progress';
    if (content.includes('feedback') || content.includes('rating')) return 'feedback';
    if (content.includes('support') || content.includes('query')) return 'support';
    return 'general';
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type?: Notification['type']) => {
    switch (type) {
      case 'meeting': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'progress': return <Users className="w-5 h-5 text-green-600" />;
      case 'feedback': return <Star className="w-5 h-5 text-yellow-600" />;
      case 'support': return <HelpCircle className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBorder = (type?: Notification['type']) => {
    switch (type) {
      case 'meeting': return 'border-l-blue-500';
      case 'progress': return 'border-l-green-500';
      case 'feedback': return 'border-l-yellow-500';
      case 'support': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-kontora font-bold text-[hsl(142,76%,36%)]">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with important alerts and updates
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellRing className="w-4 h-4" />
            {unreadCount} unread
          </div>
        </div>
      </div>

      {/* Notification Categories Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { type: 'meeting', label: 'Meetings', icon: Calendar, color: 'blue' },
          { type: 'progress', label: 'Progress', icon: Users, color: 'green' },
          { type: 'feedback', label: 'Feedback', icon: Star, color: 'yellow' },
          { type: 'support', label: 'Support', icon: HelpCircle, color: 'orange' }
        ].map(({ type, label, icon: Icon, color }) => {
          const count = notifications.filter(n => n.type === type && !n.is_read).length;
          return (
            <Card key={type} className={`border-l-4 border-l-${color}-500`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    getNotificationBorder(notification.type)
                  } ${notification.is_read ? 'opacity-60' : 'bg-blue-50/30'}`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.is_read && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorNotifications;