import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "EduForge's AI-powered learning paths helped me master complex algorithms in half the time. The personalized approach is incredible!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      role: "Mathematics Tutor",
      content: "As an educator, I'm impressed by the platform's ability to adapt to each student's learning style. It's revolutionizing online education.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Data Science Learner",
      content: "The smart flashcards and progress tracking keep me motivated. I've completed 3 courses this month with excellent retention rates.",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <section className="py-20 px-4 lg:px-8 bg-navy-medium">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-kontora font-black text-foreground mb-6">
            What Our Students Say
          </h2>
          <p className="text-xl text-muted-foreground font-poppins max-w-2xl mx-auto">
            Hear from thousands of satisfied learners who've transformed their education with EduForge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-navy-light border-border hover:border-blue-bright/50 transition-all duration-300 relative"
            >
              <CardContent className="p-8">
                <Quote className="w-8 h-8 text-blue-bright/30 mb-4" />
                
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-muted-foreground font-poppins leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-bright rounded-full flex items-center justify-center text-white font-kontora font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-kontora font-bold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground font-poppins">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;