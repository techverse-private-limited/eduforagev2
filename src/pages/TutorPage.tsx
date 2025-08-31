
import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import TutorSidebar from '@/components/TutorSidebar';
import TutorDashboard from './TutorDashboard';
import TutorMeetings from './tutor/TutorMeetings';
import TutorStudents from './tutor/TutorStudents';
import TutorSupport from './tutor/TutorSupport';
import TutorFeedback from './tutor/TutorFeedback';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const TutorPage = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (userRole && userRole !== 'tutor') {
        if (userRole === 'student') {
          navigate('/student');
        } else if (userRole === 'admin') {
          navigate('/admin');
        }
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || (userRole && userRole !== 'tutor')) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
        <SidebarInset className="flex-1">
          {/* Main App Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="text-green-600 hover:bg-green-50 -ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-kontora font-black text-green-600">
                EduForge Tutor Portal
              </h1>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">
            <Routes>
              <Route index element={<TutorDashboard />} />
              <Route path="students" element={<TutorStudents />} />
              <Route path="meetings" element={<TutorMeetings />} />
              <Route path="support" element={<TutorSupport />} />
              <Route path="feedback" element={<TutorFeedback />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TutorPage;
