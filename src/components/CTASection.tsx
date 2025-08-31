import { Button } from "@/components/ui/button";
import { ArrowRight, Users, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 px-4 lg:px-8 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-kontora font-black text-foreground mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground font-poppins max-w-3xl mx-auto mb-8">
            Join thousands of students and educators who are already experiencing the future of education with EduForge.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/login">
            <Button 
              size="lg" 
              className="bg-blue-bright hover:bg-blue-bright/90 text-white font-poppins font-semibold transition-all hover:scale-105 rounded-2xl shadow-lg group px-8 py-4"
            >
              <Users className="w-5 h-5 mr-3" />
              Start Learning Today
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Link to="/login">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-blue-bright text-blue-bright hover:bg-blue-bright hover:text-white font-poppins font-semibold transition-all hover:scale-105 rounded-2xl px-8 py-4"
            >
              <GraduationCap className="w-5 h-5 mr-3" />
              Become a Tutor
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground font-poppins">
            No credit card required • Free trial available • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;