
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 px-4 lg:px-8 bg-background min-h-screen flex items-center">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Trust Badge */}
            <div className="flex items-center space-x-2 text-blue-bright">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-poppins font-medium">
                Trusted by 50,000+ learners worldwide
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-kontora font-black leading-tight">
                <span className="text-blue-bright">AI-Powered</span>
                <br />
                <span className="text-foreground">Adaptive Learning</span>
              </h1>
              <p className="text-xl text-muted-foreground font-poppins leading-relaxed max-w-lg">
                Personalized roadmaps, AI flashcards, and smart tutoring — all in one place.
                Transform how you learn with our intelligent platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-blue-bright hover:bg-blue-bright/90 text-white font-poppins font-semibold hover:opacity-90 transition-all hover:scale-105 rounded-2xl shadow-lg group w-full sm:w-auto">
                  Get Started (Student)
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-2 border-blue-bright text-blue-bright hover:bg-blue-bright hover:text-white font-poppins font-semibold transition-all hover:scale-105 rounded-2xl w-full sm:w-auto">
                  <Users className="w-5 h-5 mr-2" />
                  Join as Tutor
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-kontora font-black text-blue-bright">50,000+</div>
                <div className="text-sm text-muted-foreground font-poppins">Active Learners</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-kontora font-black text-blue-bright">1M+</div>
                <div className="text-sm text-muted-foreground font-poppins">Lessons Completed</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-float">
            <img 
              src="https://gprtclzwkgtyvrrgifpu.supabase.co/storage/v1/object/public/assets/herosection.png" 
              alt="AI-Powered Learning Platform"
              className="w-full h-auto object-contain max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
