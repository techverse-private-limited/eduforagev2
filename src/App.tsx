
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "sonner";
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import About from '@/pages/About';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import StudentPage from '@/pages/StudentPage';
import TutorPage from '@/pages/TutorPage';
import AdminDashboard from '@/pages/AdminDashboard';
import TutorVerifications from '@/pages/admin/TutorVerifications';
import AdminTutors from '@/pages/admin/AdminTutors';
import AdminStudents from '@/pages/admin/AdminStudents';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="eduforge-theme">
        <AuthProvider>
          <AdminAuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/*" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tutor/*" 
                  element={
                    <ProtectedRoute requiredRole="tutor">
                      <TutorPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/tutor-verifications" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <TutorVerifications />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/tutors" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminTutors />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/students" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminStudents />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
