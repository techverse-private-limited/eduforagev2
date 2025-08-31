import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Send, Clock, User, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TutorProfile {
  id: string;
  full_name: string;
  reg_no: string;
}

interface FeedbackItem {
  id: string;
  rating: number;
  feedback_txt: string;
  created_at: string;
  tutor_profile?: {
    full_name: string;
    reg_no: string;
  };
}

const Feedback = () => {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pastFeedback, setPastFeedback] = useState<FeedbackItem[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');

  useEffect(() => {
    fetchCurrentStudentId();
    fetchTutors();
  }, [user]);

  useEffect(() => {
    if (currentStudentId) {
      fetchPastFeedback();
    }
  }, [currentStudentId]);

  const fetchCurrentStudentId = async () => {
    if (!user) return;

    try {
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentProfile) {
        setCurrentStudentId(studentProfile.id);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  const fetchTutors = async () => {
    try {
      console.log('Fetching tutors...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, reg_no')
        .eq('role', 'tutor')
        .eq('verification_status', 'approved')
        .not('full_name', 'is', null);

      console.log('Tutors query result:', { data, error });
      if (error) throw error;
      setTutors(data || []);
      console.log('Tutors set:', data || []);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const fetchPastFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          tutor_profile:profiles!feedback_tutor_id_fkey (
            full_name,
            reg_no
          )
        `)
        .eq('student_id', currentStudentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPastFeedback(data || []);
    } catch (error) {
      console.error('Error fetching past feedback:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedTutor || !rating || !feedbackText.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: currentStudentId,
          tutor_id: selectedTutor,
          rating,
          feedback_txt: feedbackText.trim()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback submitted successfully!"
      });

      // Reset form
      setSelectedTutor('');
      setRating(0);
      setFeedbackText('');
      
      // Refresh past feedback
      fetchPastFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= currentRating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
        {!interactive && (
          <span className="ml-2 text-sm text-muted-foreground">({currentRating}/5)</span>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-kontora font-black text-blue-dark mb-2">
          Feedback
        </h2>
        <p className="text-blue-600 font-poppins text-sm lg:text-base">
          Share feedback about your tutors and sessions
        </p>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">Feedback History</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
                <Star className="w-5 h-5" />
                <span>Rate Your Tutor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Tutor
                </label>
                <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tutor to rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.full_name} {tutor.reg_no ? `(${tutor.reg_no})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating (1-5 stars)
                </label>
                {renderStarRating(rating, true)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Feedback
                </label>
                <Textarea
                  placeholder="Share your experience with this tutor..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleSubmitFeedback}
                disabled={loading || !selectedTutor || !rating || !feedbackText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
                <MessageCircle className="w-5 h-5" />
                <span>Your Feedback History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastFeedback.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
                  <p className="text-muted-foreground">
                    Your submitted feedback will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {feedback.tutor_profile?.full_name || 'Tutor'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {feedback.tutor_profile?.reg_no}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {renderStarRating(feedback.rating)}
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{feedback.feedback_txt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feedback;