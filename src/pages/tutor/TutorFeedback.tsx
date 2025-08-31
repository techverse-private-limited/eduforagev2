import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, User, Calendar, MessageCircle, TrendingUp, Send, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SendFeedbackModal from '@/components/tutor/SendFeedbackModal';

interface FeedbackItem {
  id: string;
  rating: number;
  feedback_txt: string;
  created_at: string;
  student_profile?: {
    full_name: string;
    reg_no: string;
  };
}

interface SentFeedbackItem {
  id: string;
  rating: number;
  feedback_text: string;
  created_at: string;
  student_profile?: {
    full_name: string;
    reg_no: string;
  };
}

interface FeedbackStats {
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: Record<number, number>;
}

const EMOJI_RATINGS = [
  { value: 1, emoji: '😢', label: 'Needs Improvement' },
  { value: 2, emoji: '😞', label: 'Below Average' },
  { value: 3, emoji: '😐', label: 'Average' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😍', label: 'Excellent' },
];

const TutorFeedback: React.FC = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [sentFeedback, setSentFeedback] = useState<SentFeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    averageRating: 0,
    totalFeedback: 0,
    ratingDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentTutorId, setCurrentTutorId] = useState<string>('');
  const [showSendFeedbackModal, setShowSendFeedbackModal] = useState(false);

  useEffect(() => {
    fetchCurrentTutorId();
  }, [user]);

  useEffect(() => {
    if (currentTutorId) {
      fetchFeedback();
      fetchSentFeedback();
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

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          student_profile:profiles!feedback_student_id_fkey (
            full_name,
            reg_no
          )
        `)
        .eq('tutor_id', currentTutorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const feedbackData = data || [];
      setFeedback(feedbackData);
      
      // Calculate statistics
      if (feedbackData.length > 0) {
        const totalRating = feedbackData.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = totalRating / feedbackData.length;
        
        const ratingDistribution: Record<number, number> = {};
        feedbackData.forEach(item => {
          ratingDistribution[item.rating] = (ratingDistribution[item.rating] || 0) + 1;
        });

        setStats({
          averageRating: Math.round(averageRating * 10) / 10,
          totalFeedback: feedbackData.length,
          ratingDistribution
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSentFeedback = async () => {
    try {
      // First get the tutor feedback
      const { data: tutorFeedbackData, error: tutorFeedbackError } = await supabase
        .from('tutor_feedback')
        .select('*')
        .eq('tutor_id', currentTutorId)
        .order('created_at', { ascending: false });

      if (tutorFeedbackError) throw tutorFeedbackError;
      
      if (tutorFeedbackData && tutorFeedbackData.length > 0) {
        // Get student profiles for each feedback
        const studentIds = tutorFeedbackData.map(item => item.student_id);
        const { data: studentProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, reg_no')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const sentFeedbackWithProfiles = tutorFeedbackData.map(item => {
          const studentProfile = studentProfiles?.find(profile => profile.id === item.student_id);
          return {
            ...item,
            student_profile: studentProfile ? {
              full_name: studentProfile.full_name || 'Unknown',
              reg_no: studentProfile.reg_no || 'N/A'
            } : undefined
          };
        });

        setSentFeedback(sentFeedbackWithProfiles);
      } else {
        setSentFeedback([]);
      }
    } catch (error) {
      console.error('Error fetching sent feedback:', error);
    }
  };

  const respondToFeedback = async (feedbackId: string) => {
    const response = responses[feedbackId];
    if (!response?.trim()) {
      toast({
        title: "Error",
        description: "Please provide a response",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real implementation, you would store the response in a separate table
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Response sent to student (feature to be fully implemented)",
      });
      
      setResponses(prev => ({ ...prev, [feedbackId]: '' }));
    } catch (error) {
      console.error('Error responding to feedback:', error);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  const renderEmojiRating = (rating: number) => {
    const ratingData = EMOJI_RATINGS.find(r => r.value === rating);
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{ratingData?.emoji}</span>
        <div>
          <span className="font-medium">{rating}/5</span>
          <p className="text-sm text-muted-foreground">{ratingData?.label}</p>
        </div>
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="text-lg">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-kontora font-bold text-[hsl(142,76%,36%)]">
            Feedback Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            View student feedback and send feedback to students
          </p>
        </div>
        <Button
          onClick={() => setShowSendFeedbackModal(true)}
          className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] w-full sm:w-auto"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Feedback
        </Button>
      </div>

      {/* Feedback Statistics - Mobile Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-yellow-100 rounded-full flex-shrink-0">
                <Star className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-muted-foreground">Average Rating</p>
                <p className={`text-xl lg:text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating}/5.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-xl lg:text-2xl font-bold">{stats.totalFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-green-100 rounded-full flex-shrink-0">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-muted-foreground">5-Star Reviews</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {stats.ratingDistribution[5] || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="received" className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="text-xs sm:text-sm">Received Feedback</TabsTrigger>
          <TabsTrigger value="sent" className="text-xs sm:text-sm">Sent Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {/* Rating Distribution */}
          {stats.totalFeedback > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingDistribution[rating] || 0;
                    const percentage = stats.totalFeedback > 0 ? (count / stats.totalFeedback) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-2 w-12 sm:w-20 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-medium">{rating}</span>
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground w-8 sm:w-12 text-right flex-shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Received Feedback List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Recent Feedback from Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Star className="w-10 h-10 lg:w-12 lg:h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-base lg:text-lg font-medium mb-2">No feedback yet</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Student feedback will appear here once they rate your sessions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div key={item.id} className="p-3 lg:p-4 border rounded-lg space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm lg:text-base truncate">
                              {item.student_profile?.full_name || 'Anonymous'}
                            </h4>
                            <p className="text-xs lg:text-sm text-muted-foreground">
                              {item.student_profile?.reg_no}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          {renderStarRating(item.rating)}
                          <div className="flex items-center gap-1 text-xs lg:text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm lg:text-base">{item.feedback_txt}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Your Response (Optional):
                          </label>
                          <Textarea
                            placeholder="Thank the student or provide additional guidance..."
                            value={responses[item.id] || ''}
                            onChange={(e) => setResponses(prev => ({ 
                              ...prev, 
                              [item.id]: e.target.value 
                            }))}
                            className="min-h-[80px] text-sm lg:text-base"
                          />
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => respondToFeedback(item.id)}
                          className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] w-full sm:w-auto"
                        >
                          Send Response
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Send className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Feedback Sent to Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sentFeedback.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Send className="w-10 h-10 lg:w-12 lg:h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-base lg:text-lg font-medium mb-2">No feedback sent yet</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Feedback you send to students will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentFeedback.map((item) => (
                    <div key={item.id} className="p-3 lg:p-4 border rounded-lg space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm lg:text-base truncate">
                              {item.student_profile?.full_name || 'Student'}
                            </h4>
                            <p className="text-xs lg:text-sm text-muted-foreground">
                              {item.student_profile?.reg_no}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
                          {renderEmojiRating(item.rating)}
                          <div className="flex items-center gap-1 text-xs lg:text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm lg:text-base">{item.feedback_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SendFeedbackModal
        isOpen={showSendFeedbackModal}
        onClose={() => setShowSendFeedbackModal(false)}
        onFeedbackSent={() => {
          fetchSentFeedback();
          toast({
            title: "Success",
            description: "Feedback sent successfully!",
          });
        }}
      />
    </div>
  );
};

export default TutorFeedback;
