
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversations } from '@/hooks/useConversations';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedMessageBubble from '@/components/chat/EnhancedMessageBubble';
import EnhancedTypingIndicator from '@/components/chat/EnhancedTypingIndicator';
import EnhancedChatInput from '@/components/chat/EnhancedChatInput';
import WelcomeMessage from '@/components/chat/WelcomeMessage';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import { uploadChatImage, fileToBase64 } from '@/services/imageUpload';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

const EnhancedChatInterface = () => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, loading: messagesLoading } = useChatMessages(currentConversationId);
  const { createConversation } = useConversations();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Convert database messages to component format
  const formattedMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    image: msg.image_url && msg.image_url !== 'temp-image' ? msg.image_url : undefined
  }));

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

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

    setIsLoading(true);
    let imageUrl: string | null = null;
    let imageData: string | null = null;

    try {
      // Upload image to storage if present
      if (selectedImage) {
        imageUrl = await uploadChatImage(selectedImage);
        imageData = await fileToBase64(selectedImage);
      }

      // Call Gemini Edge Function
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          message: inputMessage,
          conversationId: currentConversationId,
          imageData: imageData
        }
      });

      if (error) throw error;

      // Update current conversation ID if new one was created
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }

      // Update the image URL in the database if we uploaded one
      if (imageUrl && selectedImage) {
        await supabase
          .from('chat_messages')
          .update({ image_url: imageUrl })
          .eq('conversation_id', data.conversationId)
          .eq('role', 'user')
          .eq('image_url', 'temp-image');
      }

      toast({
        title: "Message sent successfully!",
        description: "AI assistant is processing your request.",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setInputMessage('');
      removeImage();
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    const newConversation = await createConversation();
    if (newConversation) {
      setCurrentConversationId(newConversation.id);
      toast({
        title: "New conversation started",
        description: "Ready for your questions!",
      });
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  return (
    <div className={`flex h-full max-h-[75vh] bg-background rounded-lg border border-border shadow-sm ${isMobile ? 'flex-col relative' : ''}`}>
      {/* Desktop Conversation Sidebar */}
      {!isMobile && (
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewChat={handleNewChat}
        />
      )}

      {/* Mobile Hamburger Menu - positioned absolutely in top right */}
      {isMobile && (
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewChat={handleNewChat}
        />
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'pt-16' : ''}`}>
        {/* Chat Messages */}
        <ScrollArea className="flex-1">
          {!currentConversationId ? (
            <WelcomeMessage />
          ) : messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground animate-pulse">Loading your conversation...</div>
            </div>
          ) : formattedMessages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <div className={`divide-y divide-border/30 ${isMobile ? 'px-2' : ''}`}>
              {formattedMessages.map((message) => (
                <EnhancedMessageBubble key={message.id} message={message} />
              ))}
              
              {isLoading && <EnhancedTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <EnhancedChatInput
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
    </div>
  );
};

export default EnhancedChatInterface;
