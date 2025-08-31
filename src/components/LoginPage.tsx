import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, User, GraduationCap, Settings, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor' | 'admin'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { signInAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role: 'student' | 'tutor' | 'admin') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setIsSignUp(false);
      // Clear form for admin
      setFormData({
        fullName: '',
        email: '',
        password: ''
      });
    } else {
      // Clear form when switching roles
      setFormData({
        fullName: '',
        email: '',
        password: ''
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSignUp && !formData.fullName) {
      toast.error('Please enter your full name');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp && selectedRole !== 'admin') {
        await signUp(formData.email, formData.password, formData.fullName, selectedRole);
      } else if (selectedRole === 'admin') {
        // Use admin auth for admin login
        const success = await signInAdmin(formData.email, formData.password);
        if (success) {
          navigate('/admin');
        }
      } else {
        // Use regular auth for student/tutor login
        await signIn(formData.email, formData.password);
        // Navigate to specific role dashboard
        if (selectedRole === 'student') {
          navigate('/student');
        } else if (selectedRole === 'tutor') {
          navigate('/tutor');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'student' as const,
      label: 'Student',
      icon: User,
      description: 'Access personalized learning paths',
      color: '#2563eb',
      bgColor: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700',
      borderColor: 'border-blue-600',
      textColor: 'text-blue-600',
      focusBorder: 'focus:border-blue-600',
      image: 'https://gprtclzwkgtyvrrgifpu.supabase.co/storage/v1/object/public/assets/student.png'
    },
    {
      id: 'tutor' as const,
      label: 'Tutor',
      icon: GraduationCap,
      description: 'Teach and mentor students',
      color: '#16a249',
      bgColor: 'bg-green-600',
      hoverBg: 'hover:bg-green-700',
      borderColor: 'border-green-600',
      textColor: 'text-green-600',
      focusBorder: 'focus:border-green-600',
      image: 'https://gprtclzwkgtyvrrgifpu.supabase.co/storage/v1/object/public/assets/tutor.png'
    },
    {
      id: 'admin' as const,
      label: 'Admin',
      icon: Settings,
      description: 'Manage platform and users',
      color: '#dc2626',
      bgColor: 'bg-red-600',
      hoverBg: 'hover:bg-red-700',
      borderColor: 'border-red-600',
      textColor: 'text-red-600',
      focusBorder: 'focus:border-red-600',
      image: 'https://gprtclzwkgtyvrrgifpu.supabase.co/storage/v1/object/public/assets/admin.png'
    }
  ];

  const currentRole = roles.find(r => r.id === selectedRole)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-light via-white to-blue-light/50 flex flex-col lg:flex-row">
      {/* Left Side - Character Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-6 xl:p-12">
        <div className="relative">
          {/* Role-specific Image */}
          <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <img 
              src={currentRole.image} 
              alt={`${currentRole.label} illustration`}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Back Button */}
          <Link to="/">
            <Button variant="ghost" className="mb-2 sm:mb-4 text-muted-foreground hover:text-foreground text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-kontora font-black text-blue-dark">Welcome Back</h1>
            <p className="text-sm sm:text-base text-muted-foreground font-poppins">Choose your role and sign in to continue</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {roles.map((role) => {
              const IconComponent = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`p-3 sm:p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                    isSelected 
                      ? `${role.borderColor} ${role.bgColor} text-white shadow-lg` 
                      : `border-border bg-white text-muted-foreground hover:${role.borderColor}/50`
                  }`}
                >
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${isSelected ? 'text-white' : role.textColor}`} />
                  <div className={`text-xs sm:text-sm font-poppins font-semibold ${isSelected ? 'text-white' : 'text-blue-dark'}`}>
                    {role.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Auth Toggle - Hide for admin */}
          {selectedRole !== 'admin' && (
            <div className="flex justify-center">
              <div className="bg-muted rounded-2xl p-1 flex">
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-poppins font-medium transition-all ${
                    !isSignUp 
                      ? 'bg-white text-blue-dark shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-poppins font-medium transition-all ${
                    isSignUp 
                      ? 'bg-white text-blue-dark shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          <Card className="border-0 shadow-xl rounded-3xl">
            <CardHeader className="text-center pb-4 px-4 sm:px-6">
              <div className="space-y-1">
                <div className="text-lg font-kontora font-bold text-blue-dark">
                  {selectedRole === 'admin' ? 'Admin Sign In' : (isSignUp ? 'Create Account' : 'Sign In')}
                </div>
                <div className="text-sm text-muted-foreground font-poppins">
                  as {currentRole.label}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {isSignUp && selectedRole !== 'admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-poppins font-medium text-blue-dark">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`rounded-2xl border-border ${currentRole.focusBorder} transition-colors font-poppins text-sm sm:text-base`}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-poppins font-medium text-blue-dark">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`rounded-2xl border-border ${currentRole.focusBorder} transition-colors font-poppins text-sm sm:text-base`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-poppins font-medium text-blue-dark">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`rounded-2xl border-border ${currentRole.focusBorder} transition-colors font-poppins text-sm sm:text-base`}
                    required
                  />
                </div>

                {(!isSignUp || selectedRole === 'admin') && (
                  <div className="text-right">
                    <button type="button" className={`text-sm ${currentRole.textColor} hover:opacity-80 font-poppins font-medium transition-colors`}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${currentRole.bgColor} ${currentRole.hoverBg} text-white font-poppins font-semibold transition-all hover:scale-105 rounded-2xl shadow-lg group h-10 sm:h-11 text-sm sm:text-base`}
                >
                  {isLoading ? 'Please wait...' : (selectedRole === 'admin' ? 'Sign In' : (isSignUp ? 'Create Account' : 'Sign In'))}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {isSignUp && selectedRole !== 'admin' && (
                  <p className="text-xs text-center text-muted-foreground font-poppins leading-relaxed px-2">
                    By creating an account, you agree to our{' '}
                    <span className={`${currentRole.textColor} hover:opacity-80 cursor-pointer`}>Terms of Service</span>
                    {' '}and{' '}
                    <span className={`${currentRole.textColor} hover:opacity-80 cursor-pointer`}>Privacy Policy</span>
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
