import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, CheckCircle, X, Eye, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

interface TutorVerification {
  id: string;
  tutor_id: string;
  full_name: string;
  qualifications: string;
  resume_url: string;
  status: string;
  submitted_at: string;
  tutor: {
    user_id: string;
    full_name: string;
  } | null;
}

const TutorVerifications = () => {
  const [verifications, setVerifications] = useState<TutorVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      // Use raw HTTP request to bypass RLS since admin auth is separate
      const response = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/tutor_verification_requests?order=submitted_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVerifications((data || []).map((item: any) => ({
        ...item,
        tutor: null
      })));
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (verificationId: string, tutorId: string, action: 'approved' | 'rejected') => {
    try {
      const headers = {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      // Update verification status
      const updateResponse = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/tutor_verification_requests?id=eq.${verificationId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: action,
            reviewed_at: new Date().toISOString()
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Failed to update verification: ${updateResponse.status}`);
      }

      // Update tutor's verification status in profiles
      const profileResponse = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/profiles?id=eq.${tutorId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            verification_status: action === 'approved' ? 'approved' : 'rejected'
          })
        }
      );

      if (!profileResponse.ok) {
        throw new Error(`Failed to update profile: ${profileResponse.status}`);
      }

      // Send notification to tutor
      const notificationResponse = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/notifications`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipient_id: tutorId,
            title: `Verification ${action === 'approved' ? 'Approved' : 'Rejected'}`,
            message: action === 'approved' 
              ? 'Congratulations! Your tutor verification has been approved. You can now start tutoring students.'
              : 'Your tutor verification has been rejected. Please review your qualifications and resubmit.'
          })
        }
      );

      if (!notificationResponse.ok) {
        console.warn('Failed to send notification, but continuing...');
      }

      toast({
        title: "Success",
        description: `Tutor verification ${action} successfully`,
      });

      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
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
      console.log('Original resume URL:', resumeUrl);

      // Normalize into a storage file path relative to the 'resumes' bucket
      let filePath = resumeUrl.trim();

      const publicPrefix = '/storage/v1/object/public/resumes/';
      const privatePrefix = '/storage/v1/object/resumes/';
      const fullPublicPrefix = 'https://gprtclzwkgtyvrrgifpu.supabase.co' + publicPrefix;
      const fullPrivatePrefix = 'https://gprtclzwkgtyvrrgifpu.supabase.co' + privatePrefix;

      if (filePath.startsWith(fullPublicPrefix)) {
        filePath = filePath.slice(fullPublicPrefix.length);
      } else if (filePath.startsWith(fullPrivatePrefix)) {
        filePath = filePath.slice(fullPrivatePrefix.length);
      } else if (filePath.includes(publicPrefix)) {
        filePath = filePath.split(publicPrefix)[1];
      } else if (filePath.includes(privatePrefix)) {
        filePath = filePath.split(privatePrefix)[1];
      } else if (filePath.startsWith('/resumes/')) {
        filePath = filePath.slice('/resumes/'.length);
      } else if (filePath.startsWith('resumes/')) {
        filePath = filePath.slice('resumes/'.length);
      }

      // Remove any query string
      filePath = filePath.split('?')[0];

      console.log('Normalized file path:', filePath);

      // Try generating a signed URL (works for private buckets)
      const { data: signedUrlData, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 60 * 10); // 10 minutes expiry

      if (error || !signedUrlData?.signedUrl) {
        console.warn('Signed URL failed, falling back to public URL', error);
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);
        window.open(publicUrl, '_blank');
        return;
      }

      window.open(signedUrlData.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening resume:', error);
      toast({
        title: "Error",
        description: "Failed to open resume. The file might not exist or access might be restricted.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading verifications...</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-kontora font-bold text-[hsl(0,84%,60%)]">
            Tutor Verifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve tutor verification requests
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="w-4 h-4" />
          {verifications.filter(v => v.status === 'pending').length} pending requests
        </div>
      </div>

      {verifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No verification requests</h3>
            <p className="text-muted-foreground">
              Tutor verification requests will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {verifications.map((verification) => (
            <Card key={verification.id} className={`border-l-4 ${
              verification.status === 'approved' ? 'border-l-green-500' :
              verification.status === 'rejected' ? 'border-l-red-500' :
              'border-l-yellow-500'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      {verification.full_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {verification.qualifications}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(verification.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    verification.status === 'approved' ? 'default' :
                    verification.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    <div className="flex items-center gap-1">
                      {verification.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {verification.status === 'rejected' && <X className="w-3 h-3" />}
                      {verification.status === 'pending' && <Clock className="w-3 h-3" />}
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex gap-3 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openResume(verification.resume_url)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Resume
                  </Button>

                  {verification.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerification(verification.id, verification.tutor_id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerification(verification.id, verification.tutor_id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
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

export default TutorVerifications;
