
import React from 'react';
import { Bot, MessageSquare, Upload, Zap } from 'lucide-react';

const EmptyState = () => {
  const suggestions = [
    {
      icon: MessageSquare,
      title: "Ask a question",
      description: "Get help with your studies"
    },
    {
      icon: Upload,
      title: "Upload an image",
      description: "Get help with visual content"
    },
    {
      icon: Zap,
      title: "Quick assistance",
      description: "Clear your doubts instantly"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            How can I help you today?
          </h3>
          <p className="text-muted-foreground">
            Ask me anything about your studies or upload an image for assistance
          </p>
        </div>

        <div className="grid gap-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
            >
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <suggestion.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{suggestion.title}</div>
                <div className="text-xs text-muted-foreground">{suggestion.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
