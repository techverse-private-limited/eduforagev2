import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Shield, Database, GitBranch, Cloud } from "lucide-react";

const About = () => {
  const developers = [
    {
      name: "DHATSHINAMOORTHY R",
      role: "Frontend Lead",
      specialties: ["React", "UI/UX", "Tech Lead"],
      icon: <Code className="h-6 w-6" />,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Prakash S",
      role: "Authentication & Role based Specialist",
      specialties: ["Authentication", "Role Management", "Security"],
      icon: <Shield className="h-6 w-6" />,
      gradient: "from-green-500 to-teal-600"
    },
    {
      name: "NagaChaithanya",
      role: "Database Manager",
      specialties: ["Supabase", "Database Design", "Data Management"],
      icon: <Database className="h-6 w-6" />,
      gradient: "from-orange-500 to-red-600"
    },
    {
      name: "Rokeshwaran G",
      role: "Data/API & State Management Specialist",
      specialties: ["API Integration", "State Management", "Data Flow"],
      icon: <GitBranch className="h-6 w-6" />,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Manjusha",
      role: "Deployment & DevOps Engineer",
      specialties: ["CI/CD", "Cloud Infrastructure", "Monitoring"],
      icon: <Cloud className="h-6 w-6" />,
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="pt-24 pb-16 px-4 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Meet Our Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The talented developers behind EduForge - bringing innovation and expertise to transform education through technology.
          </p>
        </div>
      </section>

      {/* Developer Cards Section */}
      <section className="pb-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((developer, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${developer.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {developer.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {developer.name}
                  </CardTitle>
                  <p className="text-muted-foreground font-medium">
                    {developer.role}
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {developer.specialties.map((specialty, specIndex) => (
                      <Badge 
                        key={specIndex} 
                        variant="secondary" 
                        className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 lg:px-8 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            At EduForge, we're committed to revolutionizing education through cutting-edge technology. 
            Our diverse team of specialists combines expertise in frontend development, security, 
            database management, API integration, and deployment to create a seamless learning platform 
            that empowers students, tutors, and administrators alike.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
