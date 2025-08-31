
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadCardProps {
  dragActive: boolean;
  isUploading: boolean;
  uploadedFile: File | null;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  dragActive,
  isUploading,
  uploadedFile,
  onDrag,
  onDrop,
  onFileChange,
  onRemoveFile,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload your document</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, DOC, TXT, and image files (max 10MB)
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={onFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
            disabled={isUploading}
          />
          <Button
            asChild
            disabled={isUploading}
            style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}
            className="hover:opacity-90"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? 'Processing...' : 'Choose File'}
            </label>
          </Button>
        </div>

        {uploadedFile && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{uploadedFile.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <Progress value={50} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Processing your document...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
