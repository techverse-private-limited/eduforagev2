
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  Brain,
  Trophy,
  MessageSquare,
  Sparkles,
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

const StudentSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
    { icon: BookOpen, label: 'Roadmap', path: '/student/roadmap' },
    { icon: Calendar, label: 'Meetings', path: '/student/meetings' },
    { icon: FileText, label: 'Resume Analyzer', path: '/student/resume' },
    { icon: Brain, label: 'AI Mock Quizzes', path: '/student/quizzes' },
    { icon: Trophy, label: 'Leaderboard', path: '/student/leaderboard' },
    { icon: MessageSquare, label: 'AI Assistant', path: '/student/assistant' },
    { icon: Sparkles, label: 'AI Summarizer', path: '/student/summarizer' },
    { icon: Star, label: 'Feedback', path: '/student/feedback' },
    { icon: HelpCircle, label: 'Support System', path: '/student/support' },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r" style={{ borderColor: 'hsl(217, 91%, 60%)' }}>
      <SidebarHeader className="border-b" style={{ borderColor: 'hsl(217, 91%, 60%)' }}>
        <div className="flex flex-col gap-2 px-2 py-4">
          {state !== 'collapsed' && (
            <>
              <h2 className="text-xl font-kontora font-black" style={{ color: 'hsl(217, 91%, 60%)' }}>
                EduForge
              </h2>
              <p className="text-xs font-poppins" style={{ color: 'hsl(217, 91%, 60%)' }}>
                Student Portal
              </p>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel style={{ color: 'hsl(217, 91%, 60%)' }} className="font-medium">
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
                          ? 'text-white hover:opacity-90' 
                          : 'hover:text-white'
                      }`}
                      style={isActive ? { 
                        backgroundColor: 'hsl(217, 91%, 60%)',
                        color: 'white'
                      } : {
                        color: 'hsl(217, 91%, 60%)'
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-poppins font-medium">{item.label}</span>
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
              className="w-full justify-start gap-3 hover:text-white"
              style={{ color: 'hsl(217, 91%, 60%)' }}
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

export default StudentSidebar;
