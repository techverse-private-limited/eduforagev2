
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

interface EnhancedMessageBubbleProps {
  message: Message;
}

const EnhancedMessageBubble = ({ message }: EnhancedMessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { toast } = useToast();
  const isUser = message.role === 'user';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast({
      title: "Thank you!",
      description: "Your feedback helps improve the AI assistant",
    });
  };

  return (
    <div className={`flex gap-4 py-6 px-6 ${isUser ? 'bg-background' : 'bg-muted/20'} group`}>
      <div className="flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-gradient-to-br from-emerald-500 to-blue-500 text-white'
          }`}
        >
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm text-muted-foreground">
            {isUser ? 'You' : 'AI Assistant'}
          </div>
          <div className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {message.image && (
          <div className="mb-3">
            <img
              src={message.image}
              alt="Uploaded content"
              className="max-w-sm h-auto rounded-lg border shadow-sm"
            />
          </div>
        )}
        
        <div className="prose prose-sm max-w-none text-foreground">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-2"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('up')}
                className={`h-8 px-2 ${feedback === 'up' ? 'text-green-500' : ''}`}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('down')}
                className={`h-8 px-2 ${feedback === 'down' ? 'text-red-500' : ''}`}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessageBubble;
