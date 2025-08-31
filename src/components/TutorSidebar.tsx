
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Star,
  HelpCircle,
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

const TutorSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/tutor' },
    { icon: Users, label: 'Student Details', path: '/tutor/students' },
    { icon: Calendar, label: 'Meetings', path: '/tutor/meetings' },
    { icon: HelpCircle, label: 'Support System', path: '/tutor/support' },
    { icon: Star, label: 'Feedback', path: '/tutor/feedback' },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar 
      className="border-r border-green-200" 
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="border-b border-green-200 p-4">
        <div className="flex flex-col gap-2">
          {state !== 'collapsed' && (
            <>
              <h2 className="text-xl font-kontora font-black text-green-600">
                EduForge
              </h2>
              <p className="text-xs text-green-500">
                Tutor Portal
              </p>
            </>
          )}
          {state === 'collapsed' && (
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {state !== 'collapsed' && (
            <SidebarGroupLabel className="text-green-600 font-medium px-2 py-2">
              Core Features
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={isActive}
                      className={`relative w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' 
                          : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                      }`}
                      tooltip={state === 'collapsed' ? item.label : undefined}
                    >
                      <IconComponent className="w-5 h-5 shrink-0" />
                      {state !== 'collapsed' && (
                        <span className="font-medium truncate">{item.label}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="w-full justify-start gap-3 h-11 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              tooltip={state === 'collapsed' ? 'Sign Out' : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {state !== 'collapsed' && (
                <span className="font-medium truncate">Sign Out</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default TutorSidebar;
