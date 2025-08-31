
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Shield, BarChart3 } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

const AdminDashboard = () => {
  const { adminUser, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header with sidebar trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="text-red-600 hover:bg-red-50" />
            <div className="flex-1">
              <h1 className="text-xl font-kontora font-black text-red-800">
                Admin Dashboard
              </h1>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 lg:p-8">
            {/* Welcome section */}
            <div className="mb-6 lg:mb-8">
              <p className="text-red-600 font-poppins text-sm lg:text-base">
                Welcome back, {adminUser?.full_name}
              </p>
            </div>

            {/* Pending Tutor Verifications */}
            <Card 
              className="border-0 shadow-lg mb-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate('/admin/tutor-verifications')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <GraduationCap className="w-5 h-5 text-red-600" />
                  <span>Pending Tutor Verifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">Click to view and manage tutor verification requests</p>
              </CardContent>
            </Card>

            {/* Quick Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-red-100">
                      <GraduationCap className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">Manage Tutors</h3>
                      <p className="text-sm text-red-600">Active/Deactivate tutors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">Student Details</h3>
                      <p className="text-sm text-red-600">Monitor student activity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <BookOpen className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">Student Feedback</h3>
                      <p className="text-sm text-red-600">Review tutor ratings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-100">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">Notifications</h3>
                      <p className="text-sm text-red-600">System alerts & updates</p>
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

export default AdminDashboard;
