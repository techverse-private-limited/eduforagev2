import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAIResponses } from '@/hooks/useAIResponses';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/chat/EmptyState';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lastProcessedResponseId, setLastProcessedResponseId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { latestResponse } = useAIResponses();

  const WEBHOOK_URL = 'https://cbkarehack.app.n8n.cloud/webhook-test/a1245646-bea3-4aa1-9e32-d1ed002c3a9b';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle new AI responses from real-time updates
  useEffect(() => {
    if (latestResponse && latestResponse.id !== lastProcessedResponseId && latestResponse.ai_response) {
      console.log('Processing new AI response with ID:', latestResponse.id);
      console.log('Response content:', latestResponse.ai_response);
      
      const assistantMessage: Message = {
        id: latestResponse.id,
        role: 'assistant',
        content: latestResponse.ai_response,
        timestamp: new Date(latestResponse.created_at),
      };

      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === latestResponse.id);
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        
        console.log('Adding new AI response to messages');
        return [...prev, assistantMessage];
      });

      setLastProcessedResponseId(latestResponse.id);
      
      // Stop loading state when response is received
      setIsLoading(false);

      toast({
        title: "Response received",
        description: "AI assistant has responded to your query.",
      });
    }
  }, [latestResponse, lastProcessedResponseId, toast]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const sendToWebhook = async (message: string, image?: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('message', message);

    if (image) {
      // Attach binary file
      formData.append('data', image);

      // Also attach base64 reference as a plain form field (NOT JSON)
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(image);
      });

      // Send only the base64 data URI string as image_data
      formData.append('image_data', base64Data);
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send to webhook');
    }

    return await response.json();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      image: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to webhook:', inputMessage);
      // Send to webhook - the response will come through real-time updates
      await sendToWebhook(inputMessage, selectedImage || undefined);

      toast({
        title: "Message sent",
        description: "Your message is being processed by the AI assistant.",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      removeImage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[75vh] bg-background rounded-lg border border-border shadow-sm">
      {/* Chat Messages */}
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border/50">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedImage={selectedImage}
        imagePreview={imagePreview}
        onImageSelect={handleImageSelect}
        onRemoveImage={removeImage}
      />
    </div>
  );
};

export default ChatInterface;
