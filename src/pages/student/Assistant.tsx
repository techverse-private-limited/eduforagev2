
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedChatInterface from "@/components/EnhancedChatInterface";

const Assistant = () => {
  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Assistant
          </CardTitle>
          <CardDescription>
            Your personalized AI tutor powered by Gemini. Ask questions, upload images, and get instant help with your studies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedChatInterface />
        </CardContent>
      </Card>
    </div>
  );
};

export default Assistant;
