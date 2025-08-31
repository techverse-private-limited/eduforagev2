import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Trophy, Clock } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Active Students",
      description: "Join thousands of learners worldwide"
    },
    {
      icon: BookOpen,
      value: "1,200+",
      label: "Expert Courses",
      description: "Comprehensive curriculum across all subjects"
    },
    {
      icon: Trophy,
      value: "95%",
      label: "Success Rate",
      description: "Students achieve their learning goals"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Support",
      description: "Always available when you need help"
    }
  ];

  return (
    <section className="py-20 px-4 lg:px-8 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-kontora font-black text-foreground mb-6">
            Trusted by Learners Worldwide
          </h2>
          <p className="text-xl text-muted-foreground font-poppins max-w-2xl mx-auto">
            Join our growing community of successful students and educators.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card 
                key={index} 
                className="bg-navy-medium border-border text-center hover:border-blue-bright/50 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-bright/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-blue-bright" />
                  </div>
                  <div className="text-4xl font-kontora font-black text-blue-bright mb-2">
                    {stat.value}
                  </div>
                  <h3 className="text-xl font-kontora font-bold text-foreground mb-2">
                    {stat.label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-poppins">
                    {stat.description}
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

export default StatsSection;