
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (userRole) {
        // Route to appropriate dashboard based on role
        switch (userRole) {
          case 'student':
            navigate('/student');
            break;
          case 'tutor':
            navigate('/tutor');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            console.error('Invalid user role:', userRole);
            break;
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
};

export default Dashboard;
