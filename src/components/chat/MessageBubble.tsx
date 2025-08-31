
import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 py-4 px-6 ${isUser ? 'bg-background' : 'bg-muted/30'}`}>
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-emerald-500 text-white'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="font-medium text-sm text-muted-foreground">
          {isUser ? 'You' : 'Assistant'}
        </div>
        
        {message.image && (
          <img
            src={message.image}
            alt="Uploaded"
            className="max-w-sm h-auto rounded-lg border shadow-sm"
          />
        )}
        
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
