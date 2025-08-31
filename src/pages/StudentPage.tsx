
import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import StudentSidebar from '@/components/StudentSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

// Import student pages
import StudentDashboard from './student/StudentDashboard';
import Roadmap from './student/Roadmap';
import Meetings from './student/Meetings';
import Resume from './student/Resume';
import Quizzes from './student/Quizzes';
import Leaderboard from './student/Leaderboard';
import Assistant from './student/Assistant';
import Summarizer from './student/Summarizer';
import Feedback from './student/Feedback';
import Support from './student/Support';

const StudentPage = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (userRole && userRole !== 'student') {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'tutor') {
          navigate('/tutor');
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
            <SidebarTrigger className="text-blue-600 hover:bg-blue-50" />
            <div className="flex-1">
              <h1 className="text-xl font-kontora font-black text-blue-800">
                Student Dashboard
              </h1>
            </div>
          </header>

          {/* Main content with nested routes */}
          <main className="flex-1">
            <Routes>
              <Route index element={<StudentDashboard />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="resume" element={<Resume />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="summarizer" element={<Summarizer />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="support" element={<Support />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentPage;
