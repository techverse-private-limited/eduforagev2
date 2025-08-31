import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Users, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStudentEmailVerification } from '@/hooks/useStudentEmailVerification';
import { toast } from '@/hooks/use-toast';

interface SendFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSent: () => void;
}

interface Student {
  id: string;
  full_name: string;
  reg_no: string;
  email: string;
}

const RATINGS = [1, 2, 3, 4, 5];

const SendFeedbackModal: React.FC<SendFeedbackModalProps> = ({ isOpen, onClose, onFeedbackSent }) => {
  const { user } = useAuth();
  const [studentEmail, setStudentEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isEmailValidating, setIsEmailValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isValid, student, isLoading, error } = useStudentEmailVerification(studentEmail);

  const handleSendFeedback = async () => {
    if (!isValid || !student) {
      toast({
        title: "Error",
        description: "Please verify the student's email address.",
        variant: "destructive"
      });
      return;
    }

    if (!feedbackText.trim()) {
      toast({
        title: "Error",
        description: "Feedback cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the tutor profile ID
      const { data: tutorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!tutorProfile) {
        throw new Error('Tutor profile not found');
      }

      // Insert the feedback into the tutor_feedback table
      const { error: insertError } = await supabase
        .from('tutor_feedback')
        .insert([
          {
            tutor_id: tutorProfile.id,
            student_id: student.id,
            rating: rating,
            feedback_text: feedbackText,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Feedback sent successfully!",
      });

      onFeedbackSent();
      onClose();
    } catch (err: any) {
      console.error("Error sending feedback:", err);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Feedback to Student</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Email Verification */}
          <div>
            <Label htmlFor="email">Student Email</Label>
            <div className="relative">
              <Input
                type="email"
                id="email"
                placeholder="student@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                disabled={isEmailValidating}
              />
              {isLoading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </div>
              )}
            </div>
            {studentEmail && !isLoading && (
              <>
                {isValid && student ? (
                  <div className="mt-2 text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Student Verified: {student.full_name} ({student.reg_no})
                  </div>
                ) : error ? (
                  <div className="mt-2 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Rating */}
          <div>
            <Label>Rating</Label>
            <RadioGroup defaultValue={String(rating)} onValueChange={(value) => setRating(Number(value))} className="flex flex-wrap gap-2 mt-2">
              {RATINGS.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(r)} id={`rating-${r}`} />
                  <Label htmlFor={`rating-${r}`} className="cursor-pointer">
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Feedback Text */}
          <div>
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Provide your feedback to the student..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSendFeedback} className="ml-2 bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]" disabled={isSubmitting || !isValid}>
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendFeedbackModal;
