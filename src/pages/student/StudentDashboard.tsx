import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SavedRoadmaps from '@/components/SavedRoadmaps';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    reg_no: '',
    degree_program: '',
    learning_speed: 'medium'
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, reg_no, degree_program, learning_speed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        await createProfile();
        return;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          reg_no: data.reg_no || '',
          degree_program: data.degree_program || '',
          learning_speed: data.learning_speed || 'medium'
        });
      } else {
        // No profile found, create one
        await createProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      await createProfile();
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          role: 'student'
        });

      if (error) {
        console.error('Error creating profile:', error);
        toast.error('Failed to create profile');
        return;
      }

      // After creating, set default values
      setProfile({
        full_name: user.user_metadata?.full_name || '',
        reg_no: '',
        degree_program: '',
        learning_speed: 'medium'
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to update your profile');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          reg_no: profile.reg_no,
          degree_program: profile.degree_program,
          learning_speed: profile.learning_speed
        })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
        return;
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">You need to sign in to access your profile.</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Welcome section */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-kontora font-black text-blue-dark mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-blue-600 font-poppins text-sm lg:text-base">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
            <BookOpen className="w-5 h-5" />
            <span>Profile Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Email ID</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled={true}
                  className="w-full mt-1 p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  style={{ borderColor: 'hsl(217, 91%, 80%)', color: 'hsl(217, 91%, 60%)' }}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Full Name</label>
                <input 
                  type="text" 
                  value={profile.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your full name" 
                  className="w-full mt-1 p-2 border rounded-lg disabled:bg-gray-50"
                  style={{ borderColor: 'hsl(217, 91%, 80%)' }}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Registration Number</label>
                <input 
                  type="text" 
                  value={profile.reg_no}
                  onChange={(e) => handleInputChange('reg_no', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your reg number" 
                  className="w-full mt-1 p-2 border rounded-lg disabled:bg-gray-50"
                  style={{ borderColor: 'hsl(217, 91%, 80%)' }}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Degree/Program</label>
              <input 
                type="text" 
                value={profile.degree_program}
                onChange={(e) => handleInputChange('degree_program', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Computer Science Engineering" 
                className="w-full mt-1 p-2 border rounded-lg disabled:bg-gray-50"
                style={{ borderColor: 'hsl(217, 91%, 80%)' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Learning Speed</label>
              <select 
                value={profile.learning_speed}
                onChange={(e) => handleInputChange('learning_speed', e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border rounded-lg disabled:bg-gray-50"
                style={{ borderColor: 'hsl(217, 91%, 80%)' }}
              >
                <option value="low">Low - Take time to understand concepts thoroughly</option>
                <option value="medium">Medium - Balanced pace of learning</option>
                <option value="high">High - Fast-paced learning and quick comprehension</option>
              </select>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg text-white font-medium" 
                  style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity" 
                    style={{ backgroundColor: 'hsl(142, 76%, 36%)' }}
                  >
                    Save Profile
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="px-4 py-2 rounded-lg border font-medium" 
                    style={{ color: 'hsl(217, 91%, 60%)', borderColor: 'hsl(217, 91%, 60%)' }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Roadmaps Section */}
      <SavedRoadmaps />
    </div>
  );
};

export default StudentDashboard;