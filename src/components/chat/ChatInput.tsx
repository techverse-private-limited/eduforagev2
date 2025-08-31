
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Upload, X } from 'lucide-react';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  selectedImage: File | null;
  imagePreview: string | null;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const ChatInput = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  selectedImage,
  imagePreview,
  onImageSelect,
  onRemoveImage
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-4">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-w-32 h-auto rounded-lg border shadow-sm" />
            <button
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3 items-end">
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          onChange={onImageSelect} 
          className="hidden" 
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          disabled={isLoading}
        >
          <Upload className="w-4 h-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Assistant..."
            className="min-h-[50px] max-h-32 resize-none pr-12 border-border/50 focus:border-primary"
            disabled={isLoading}
          />
          
          <Button
            onClick={onSendMessage}
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
