
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Upload, X, Paperclip, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  selectedImage: File | null;
  imagePreview: string | null;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const EnhancedChatInput = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  selectedImage,
  imagePreview,
  onImageSelect,
  onRemoveImage
}: EnhancedChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (inputMessage.trim() || selectedImage)) {
        onSendMessage();
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Create a proper event object
      const input = document.createElement('input');
      input.type = 'file';
      const dt = new DataTransfer();
      dt.items.add(imageFile);
      input.files = dt.files;
      
      // Create a proper synthetic event
      const syntheticEvent = {
        target: input,
        currentTarget: input,
        nativeEvent: new Event('change'),
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => {},
        preventDefault: () => {},
        stopPropagation: () => {},
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: Event.AT_TARGET,
        isTrusted: true,
        timeStamp: Date.now(),
        type: 'change'
      } as React.ChangeEvent<HTMLInputElement>;
      
      onImageSelect(syntheticEvent);
    }
  };

  const suggestedPrompts = [
    "Explain this step by step",
    "What's the main concept here?",
    "Give me practice problems",
    "Summarize this topic"
  ];

  return (
    <div 
      className={`border-t bg-background p-4 ${isDragging ? 'bg-muted/50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Quick Prompts */}
      {!inputMessage && !selectedImage && !isLoading && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-muted/80 transition-colors text-xs"
                onClick={() => setInputMessage(prompt)}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-4">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-w-40 h-auto rounded-lg border shadow-sm" />
            <button
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 shadow-sm transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {selectedImage?.name}
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">Drop your image here</p>
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
          className="flex-shrink-0 hover:bg-muted transition-colors"
          disabled={isLoading}
          title="Upload image"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedImage ? "Describe what you need help with..." : "Ask me anything about your studies..."}
            className="min-h-[52px] max-h-32 resize-none pr-12 border-border/50 focus:border-primary transition-colors"
            disabled={isLoading}
          />
          
          <Button
            onClick={onSendMessage}
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
            size="icon"
            className={`absolute bottom-2 right-2 h-8 w-8 transition-all ${
              (!inputMessage.trim() && !selectedImage) || isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105'
            }`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Character count and tips */}
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>
          💡 Use Shift+Enter for new lines
        </span>
        <span>
          {inputMessage.length}/2000
        </span>
      </div>
    </div>
  );
};

export default EnhancedChatInput;
