
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  topic: z.string().min(1, 'Please enter the topic of your doubt'),
  queryText: z.string().min(10, 'Please provide more details about your issue (minimum 10 characters)'),
});

interface SupportTicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketSubmitted?: () => void;
}

export const SupportTicketForm = ({ open, onOpenChange, onTicketSubmitted }: SupportTicketFormProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      queryText: '',
    },
  });

  // Load user profile when dialog opens
  React.useEffect(() => {
    if (open && user) {
      loadUserProfile();
    }
  }, [open, user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, reg_no')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive"
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `support-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUserProfile) {
      toast({
        title: "Error",
        description: "Profile information not loaded",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          student_id: currentUserProfile.id,
          query_text: `Topic: ${values.topic}\n\n${values.queryText}`,
          image_url: imageUrl,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Support ticket submitted successfully! A tutor will be assigned to help you soon.",
      });

      form.reset();
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
      onTicketSubmitted?.();

    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-kontora font-bold" style={{ color: 'hsl(217, 91%, 60%)' }}>
            Submit Support Request
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to get help from our tutors
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Details (Fixed/Read-only) */}
          <div className="p-4 bg-blue-50 rounded-lg border">
            <h3 className="font-semibold mb-3 text-blue-800">Your Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Name:</span>
                <span className="ml-2">{currentUserProfile?.full_name || 'Loading...'}</span>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <span className="ml-2">{currentUserProfile?.email || 'Loading...'}</span>
              </div>
              {currentUserProfile?.reg_no && (
                <div>
                  <span className="font-medium">Registration No:</span>
                  <span className="ml-2">{currentUserProfile.reg_no}</span>
                </div>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic of Doubt *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., JavaScript Functions, Resume Review, Career Guidance"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="queryText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe Your Issue *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide detailed information about the issue you're facing..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload Section */}
              <div className="space-y-2">
                <FormLabel>Upload Image (Optional)</FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-auto max-h-48 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600 mb-2">
                        Click to upload an image of your issue
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}
                  className="hover:opacity-90"
                >
                  {uploading ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
