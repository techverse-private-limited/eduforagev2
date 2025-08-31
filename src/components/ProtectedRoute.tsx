
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoading = loading || adminLoading;
    if (!isLoading) {
      if (requiredRole === 'admin') {
        if (!isAdmin) {
          navigate(redirectTo);
        }
        return;
      }

      if (!user) {
        navigate(redirectTo);
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        // Redirect based on user's actual role
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
            navigate('/login');
            break;
        }
      }
    }
  }, [user, userRole, loading, adminLoading, isAdmin, navigate, requiredRole, redirectTo]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (requiredRole === 'admin') {
    if (!isAdmin) {
      return null;
    }
  } else {
    if (!user) {
      return null;
    }

    if (requiredRole && userRole !== requiredRole) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
