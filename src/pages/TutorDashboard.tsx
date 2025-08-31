
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, TrendingUp, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const TutorDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    qualifications: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('none');

  useEffect(() => {
    if (!loading && (!user || userRole !== 'tutor')) {
      navigate('/login');
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        const { data: verificationRequest } = await supabase
          .from('tutor_verification_requests')
          .select('status, full_name, qualifications')
          .eq('tutor_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (verificationRequest) {
          setVerificationStatus(verificationRequest.status);
          setFormData({
            fullName: verificationRequest.full_name,
            qualifications: verificationRequest.qualifications
          });
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const handleSubmitVerification = async () => {
    if (!user || !formData.fullName || !formData.qualifications || !resumeFile) {
      toast({
        title: "Error",
        description: "Please fill all fields and upload a resume",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Get tutor profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Upload resume to storage
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${profile.id}/resume_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Submit verification request
      const { error: insertError } = await supabase
        .from('tutor_verification_requests')
        .insert({
          tutor_id: profile.id,
          full_name: formData.fullName,
          qualifications: formData.qualifications,
          resume_url: publicUrl
        });

      if (insertError) throw insertError;

      setVerificationStatus('pending');
      toast({
        title: "Success",
        description: "Verification request submitted successfully!",
      });

    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit verification request",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || userRole !== 'tutor') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-kontora font-black text-green-600 mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Welcome back, {user.user_metadata?.full_name || user.email}
        </p>
      </div>

      {/* Profile Section */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Users className="w-5 h-5" />
            <span>Profile & Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-green-600">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  disabled={verificationStatus === 'approved'}
                  className="w-full mt-1 p-2 border border-green-200 rounded-lg focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:bg-gray-100"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-green-600">Qualifications</label>
                <input 
                  type="text" 
                  placeholder="e.g., PhD Computer Science" 
                  value={formData.qualifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                  disabled={verificationStatus === 'approved'}
                  className="w-full mt-1 p-2 border border-green-200 rounded-lg focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:bg-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-green-600">Resume Upload</label>
              <div className="flex items-center gap-3 mt-1">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  disabled={verificationStatus === 'approved'}
                  className="flex-1 p-2 border border-green-200 rounded-lg disabled:bg-gray-100"
                />
                {resumeFile && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{resumeFile.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {verificationStatus !== 'approved' && (
                <button 
                  onClick={handleSubmitVerification}
                  disabled={uploading || verificationStatus === 'pending'}
                  className="px-4 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : verificationStatus === 'pending' ? 'Submitted' : 'Submit for Verification'}
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  verificationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {verificationStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                  {verificationStatus === 'approved' ? 'Verified' :
                   verificationStatus === 'pending' ? 'Pending Approval' :
                   verificationStatus === 'rejected' ? 'Rejected' :
                   'Not Submitted'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-600">Schedule Meeting</h3>
                <p className="text-sm text-muted-foreground">Set up sessions with students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-600">View Students</h3>
                <p className="text-sm text-muted-foreground">Check student progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-100">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-600">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Prepare content & quizzes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorDashboard;
