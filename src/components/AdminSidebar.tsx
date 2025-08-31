import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Star,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const AdminSidebar = () => {
  const { signOutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/tutor_verification_requests?status=eq.pending&select=count`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          }
        }
      );

      if (response.ok) {
        const count = response.headers.get('Content-Range');
        if (count) {
          const total = parseInt(count.split('/')[1]);
          setPendingCount(total || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { 
      icon: GraduationCap, 
      label: 'Tutor Details', 
      path: '/admin/tutors',
      badge: pendingCount > 0 ? `${pendingCount} pending` : null
    },
    { icon: Users, label: 'Student Details', path: '/admin/students' },
    { icon: Star, label: 'Tutor Feedback', path: '/admin/feedback' },
  ];

  const handleSignOut = () => {
    signOutAdmin();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r border-red-200">
      <SidebarHeader className="border-b border-red-200">
        <div className="flex flex-col gap-2 px-2 py-4">
          {state !== 'collapsed' && (
            <>
              <h2 className="text-xl font-kontora font-black text-red-800">
                EduForge
              </h2>
              <p className="text-xs text-red-600 font-poppins">
                Admin Panel
              </p>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-red-700 font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={isActive}
                      className={`w-full justify-start gap-3 transition-colors ${
                        isActive 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'hover:bg-red-50 hover:text-red-700 text-red-600'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <div className="flex items-center justify-between w-full">
                        <span className="font-poppins font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-800"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-poppins font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
