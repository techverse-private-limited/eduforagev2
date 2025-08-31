import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, CheckCircle, X, Eye, Mail, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

interface TutorProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  verification_status: string;
  qualifications: string;
  resume_url: string;
  created_at: string;
}

const AdminTutors = () => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      // Use raw HTTP request to bypass RLS since admin auth is separate
      const response = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/profiles?role=eq.tutor&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTutors(data || []);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast({
        title: "Error",
        description: "Failed to load tutors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTutorStatus = async (tutorId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
      
      const response = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/profiles?id=eq.${tutorId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            verification_status: newStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update tutor status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: `Tutor ${newStatus === 'approved' ? 'activated' : 'deactivated'} successfully`,
      });

      fetchTutors();
    } catch (error) {
      console.error('Error updating tutor status:', error);
      toast({
        title: "Error",
        description: "Failed to update tutor status",
        variant: "destructive"
      });
    }
  };

  const openResume = async (resumeUrl: string) => {
    if (!resumeUrl) {
      toast({
        title: "No Resume",
        description: "This tutor hasn't uploaded a resume yet",
        variant: "destructive"
      });
      return;
    }

    try {
      // Extract the file path from the full URL
      const urlParts = resumeUrl.split('/storage/v1/object/public/resumes/');
      if (urlParts.length < 2) {
        throw new Error('Invalid resume URL format');
      }
      
      const filePath = urlParts[1];

      // Generate a signed URL for secure access to private bucket
      const { data: signedUrlData, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

      if (error) {
        console.error('Error generating signed URL:', error);
        throw error;
      }

      if (signedUrlData?.signedUrl) {
        window.open(signedUrlData.signedUrl, '_blank');
      } else {
        throw new Error('Failed to generate signed URL');
      }
    } catch (error) {
      console.error('Error opening resume:', error);
      toast({
        title: "Error",
        description: "Failed to open resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading tutors...</div>
      </div>
    );
  }

  const approvedTutors = tutors.filter(t => t.verification_status === 'approved');
  const rejectedTutors = tutors.filter(t => t.verification_status === 'rejected');
  const pendingTutors = tutors.filter(t => t.verification_status === 'pending');

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-kontora font-bold text-[hsl(0,84%,60%)]">
            Tutor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage tutor accounts and verification status
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            {approvedTutors.length} approved
          </div>
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-600" />
            {rejectedTutors.length} rejected
          </div>
        </div>
      </div>

      {tutors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tutors found</h3>
            <p className="text-muted-foreground">
              Tutors will appear here once they register
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className={`border-l-4 ${
              tutor.verification_status === 'approved' ? 'border-l-green-500' :
              tutor.verification_status === 'rejected' ? 'border-l-red-500' :
              'border-l-yellow-500'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      {tutor.full_name || 'Unnamed Tutor'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tutor.qualifications || 'No qualifications listed'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined: {new Date(tutor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    tutor.verification_status === 'approved' ? 'default' :
                    tutor.verification_status === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    <div className="flex items-center gap-1">
                      {tutor.verification_status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {tutor.verification_status === 'rejected' && <X className="w-3 h-3" />}
                      {tutor.verification_status === 'pending' && <User className="w-3 h-3" />}
                      {tutor.verification_status?.charAt(0).toUpperCase() + tutor.verification_status?.slice(1)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex gap-3 flex-wrap">
                  {tutor.resume_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openResume(tutor.resume_url)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Resume
                    </Button>
                  )}

                  {tutor.verification_status !== 'pending' && (
                    <Button
                      size="sm"
                      variant={tutor.verification_status === 'approved' ? 'destructive' : 'default'}
                      onClick={() => toggleTutorStatus(tutor.id, tutor.verification_status)}
                      className="flex items-center gap-2"
                    >
                      {tutor.verification_status === 'approved' ? (
                        <>
                          <X className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminTutors;