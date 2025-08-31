
import React from 'react';
import { Bot, Brain } from 'lucide-react';

const EnhancedTypingIndicator = () => {
  return (
    <div className="flex gap-4 py-6 px-6 bg-muted/20">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-white flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="font-semibold text-sm text-muted-foreground">
          AI Assistant
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="w-4 h-4 animate-pulse" />
            <span>Thinking and analyzing your question...</span>
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTypingIndicator;
