
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStudentEmailVerification } from '@/hooks/useStudentEmailVerification';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  meetingLink: z.string().url('Please enter a valid URL'),
  studentSelection: z.enum(['all', 'specific']),
  studentEmail: z.string().email('Please enter a valid email').optional(),
  scheduledDate: z.date({
    required_error: 'Please select a date and time',
  }),
}).refine((data) => {
  if (data.studentSelection === 'specific' && !data.studentEmail) {
    return false;
  }
  return true;
}, {
  message: "Student email is required when selecting specific student",
  path: ["studentEmail"],
});

type FormData = z.infer<typeof formSchema>;

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void;
}

const CreateMeetingModal = ({ isOpen, onClose, onMeetingCreated }: CreateMeetingModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      meetingLink: '',
      studentSelection: 'all',
      studentEmail: '',
    },
  });

  const studentSelection = form.watch('studentSelection');
  const studentEmail = form.watch('studentEmail') || '';
  
  const emailVerification = useStudentEmailVerification(
    studentSelection === 'specific' ? studentEmail : ''
  );

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    // For specific student selection, ensure email is verified
    if (data.studentSelection === 'specific' && !emailVerification.isValid) {
      toast({
        title: "Error",
        description: "Please enter a valid student email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current tutor's profile ID
      const { data: tutorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!tutorProfile) {
        toast({
          title: "Error",
          description: "Tutor profile not found",
          variant: "destructive"
        });
        return;
      }

      if (data.studentSelection === 'all') {
        // Get all students
        const { data: allStudents, error: studentsError } = await supabase
          .from('profiles')
          .select('id, user_id')
          .eq('role', 'student');

        if (studentsError) {
          throw studentsError;
        }

        // Create meetings for all students
        if (allStudents && allStudents.length > 0) {
          const meetingsToCreate = allStudents.map((student) => ({
            tutor_id: tutorProfile.id,
            student_id: student.id,
            title: data.title,
            description: data.description,
            scheduled_at: data.scheduledDate.toISOString(),
            meeting_link: data.meetingLink,
            status: 'scheduled' as const,
          }));

          const { error: meetingError } = await supabase
            .from('meetings')
            .insert(meetingsToCreate);

          if (meetingError) throw meetingError;

          toast({
            title: "Success",
            description: `Meeting "${data.title}" created for ${allStudents.length} students`,
          });
        } else {
          toast({
            title: "Info",
            description: "No students found to create meetings for",
            variant: "default"
          });
        }
      } else {
        // Create meeting for specific verified student
        if (!emailVerification.student) {
          toast({
            title: "Error",
            description: "Student verification failed",
            variant: "destructive"
          });
          return;
        }

        // Create meeting for the specific student
        const { error: meetingError } = await supabase
          .from('meetings')
          .insert({
            tutor_id: tutorProfile.id,
            student_id: emailVerification.student.id,
            title: data.title,
            description: data.description,
            scheduled_at: data.scheduledDate.toISOString(),
            meeting_link: data.meetingLink,
            status: 'scheduled' as const,
          });

        if (meetingError) throw meetingError;

        toast({
          title: "Success",
          description: `Meeting "${data.title}" created for ${emailVerification.student.full_name}`,
        });
      }

      form.reset();
      onClose();
      onMeetingCreated();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmailVerificationStatus = () => {
    if (studentSelection !== 'specific' || !studentEmail) return null;

    if (emailVerification.isLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Verifying email...
        </div>
      );
    }

    if (emailVerification.error) {
      return (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="w-4 h-4" />
          {emailVerification.error}
        </div>
      );
    }

    if (emailVerification.isValid && emailVerification.student) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Student verified
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <User className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium text-green-800">{emailVerification.student.full_name}</p>
              <p className="text-sm text-green-600">Reg: {emailVerification.student.reg_no}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Meeting</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meeting title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter meeting description" 
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://meet.google.com/xxx-xxx-xxx" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP 'at' p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentSelection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Students</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose student selection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="specific">Specific Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {studentSelection === 'specific' && (
              <FormField
                control={form.control}
                name="studentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter student email address" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    {renderEmailVerificationStatus()}
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
                disabled={isSubmitting || (studentSelection === 'specific' && !emailVerification.isValid)}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Meeting'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingModal;
