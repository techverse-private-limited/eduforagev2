
import React from 'react';
import { Bot, Sparkles, MessageCircle, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const WelcomeMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mb-4 mx-auto">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Your AI Assistant</h2>
        <p className="text-muted-foreground max-w-md">
          I'm here to help you with your studies! Ask me questions, upload images, or start a conversation about any topic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full mb-8">
        <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-emerald-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-base mb-2 text-foreground">Ask Questions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Get instant answers to your study questions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-base mb-2 text-foreground">Upload Images</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Share screenshots or photos for help</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-base mb-2 text-foreground">Smart Learning</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Get personalized explanations and tips</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 max-w-md">
        <p className="text-sm text-muted-foreground">
          💡 <strong className="text-foreground">Pro tip:</strong> Try asking "Explain this step by step" for detailed solutions
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;
