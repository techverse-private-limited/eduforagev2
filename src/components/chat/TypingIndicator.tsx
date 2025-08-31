
import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-4 py-4 px-6 bg-muted/30">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="font-medium text-sm text-muted-foreground">
          Assistant
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
