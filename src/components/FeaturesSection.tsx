import { Card, CardContent } from "@/components/ui/card";
import { Brain, Users, BookOpen, TrendingUp, Sparkles, Target } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Adaptive algorithms that personalize your learning journey based on your progress and preferences.",
      color: "text-blue-bright",
      bgColor: "bg-blue-bright/10"
    },
    {
      icon: Users,
      title: "Expert Tutors",
      description: "Connect with qualified tutors who provide personalized guidance and mentorship.",
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Courses",
      description: "Access thousands of courses across various subjects with interactive content.",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and insights.",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10"
    },
    {
      icon: Sparkles,
      title: "Smart Flashcards",
      description: "AI-generated flashcards that adapt to your learning style and retention patterns.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10"
    },
    {
      icon: Target,
      title: "Goal Achievement",
      description: "Set learning goals and receive personalized roadmaps to achieve them effectively.",
      color: "text-red-400",
      bgColor: "bg-red-400/10"
    }
  ];

  return (
    <section className="py-20 px-4 lg:px-8 bg-navy-medium">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-kontora font-black text-foreground mb-6">
            Why Choose EduForge?
          </h2>
          <p className="text-xl text-muted-foreground font-poppins max-w-3xl mx-auto">
            Experience the future of learning with our cutting-edge platform designed to maximize your potential.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="bg-navy-light border-border hover:border-blue-bright/50 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                    <IconComponent className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-kontora font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-poppins leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;