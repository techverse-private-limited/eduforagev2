
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
interface AdminAuthContextType {
  adminUser: any | null;
  loading: boolean;
  signInAdmin: (email: string, password: string) => Promise<boolean>;
  signOutAdmin: () => void;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const initializeAdmin = () => {
      try {
        // Check if admin is already logged in (from localStorage)
        const savedAdmin = localStorage.getItem('admin_user');
        const savedAdminExpiry = localStorage.getItem('admin_user_expiry');
        
        if (savedAdmin && savedAdminExpiry && mounted) {
          const now = new Date().getTime();
          const expiry = parseInt(savedAdminExpiry);
          
          if (now < expiry) {
            // Session is still valid
            setAdminUser(JSON.parse(savedAdmin));
          } else {
            // Session expired, clean up
            localStorage.removeItem('admin_user');
            localStorage.removeItem('admin_user_expiry');
          }
        }
      } catch (error) {
        console.error('Error initializing admin auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAdmin();
    
    return () => {
      mounted = false;
    };
  }, []);

  const signInAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Verify admin credentials against Supabase table
      const { data: admin, error } = await supabase
        .from('admin_profiles')
        .select('id, email, full_name')
        .eq('email', email)
        .eq('password_hash', password)
        .maybeSingle();

      if (error) {
        console.error('Admin sign-in error:', error);
        toast.error('Failed to sign in as admin');
        return false;
      }

      if (!admin) {
        toast.error('Invalid admin credentials');
        return false;
      }

      const adminData = {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name ?? 'Administrator',
        role: 'admin' as const,
      };

      // Set session expiry to 24 hours from now
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;

      setAdminUser(adminData);
      localStorage.setItem('admin_user', JSON.stringify(adminData));
      localStorage.setItem('admin_user_expiry', expiryTime.toString());
      toast.success('Admin signed in successfully!');
      return true;
    } catch (error: any) {
      toast.error('Failed to sign in as admin');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_user_expiry');
    toast.success('Admin signed out successfully!');
  };

  const value = {
    adminUser,
    loading,
    signInAdmin,
    signOutAdmin,
    isAdmin: !!adminUser,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
