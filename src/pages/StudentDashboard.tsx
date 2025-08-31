
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import StudentSidebar from '@/components/StudentSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Trophy, Clock, Star } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

const StudentDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || userRole !== 'student')) {
      navigate('/login');
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || userRole !== 'student') {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header with sidebar trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger style={{ color: 'hsl(217, 91%, 60%)' }} className="hover:bg-blue-50" />
            <div className="flex-1">
              <h1 className="text-xl font-kontora font-black" style={{ color: 'hsl(217, 91%, 60%)' }}>
                Student Dashboard
              </h1>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 lg:p-8">
            {/* Welcome section */}
            <div className="mb-6 lg:mb-8">
              <p className="font-poppins text-sm lg:text-base" style={{ color: 'hsl(217, 91%, 60%)' }}>
                Welcome back, {user.user_metadata?.full_name || user.email}
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
                      <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter your full name" 
                        className="w-full mt-1 p-2 border rounded-lg"
                        style={{ borderColor: 'hsl(217, 91%, 80%)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Registration Number</label>
                      <input 
                        type="text" 
                        placeholder="Enter your reg number" 
                        className="w-full mt-1 p-2 border rounded-lg"
                        style={{ borderColor: 'hsl(217, 91%, 80%)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Degree/Program</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Computer Science Engineering" 
                      className="w-full mt-1 p-2 border rounded-lg"
                      style={{ borderColor: 'hsl(217, 91%, 80%)' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}>
                      Edit
                    </button>
                    <button className="px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }}>
                      Submit
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'hsl(217, 91%, 95%)' }}>
                      <BookOpen className="w-6 h-6" style={{ color: 'hsl(217, 91%, 60%)' }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Create Roadmap</h3>
                      <p className="text-sm" style={{ color: 'hsl(217, 91%, 60%)' }}>Select skill & set timeline</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 95%)' }}>
                      <Trophy className="w-6 h-6" style={{ color: 'hsl(142, 76%, 36%)' }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Take Quiz</h3>
                      <p className="text-sm" style={{ color: 'hsl(217, 91%, 60%)' }}>AI-powered mock tests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'hsl(38, 92%, 95%)' }}>
                      <Clock className="w-6 h-6" style={{ color: 'hsl(38, 92%, 50%)' }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'hsl(217, 91%, 60%)' }}>Schedule Meeting</h3>
                      <p className="text-sm" style={{ color: 'hsl(217, 91%, 60%)' }}>Connect with tutors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
