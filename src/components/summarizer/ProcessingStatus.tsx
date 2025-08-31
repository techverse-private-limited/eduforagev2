
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'processing' | 'success' | 'error';
  message?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status, message }) => {
  if (status === 'processing') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-blue-900">Processing document...</p>
              <p className="text-sm text-blue-700">
                AI is analyzing your document and generating insights
              </p>
            </div>
          </div>
          <Progress value={60} className="mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Processing complete!</p>
              <p className="text-sm text-green-700">
                Your document has been successfully analyzed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Processing failed</p>
              <p className="text-sm text-red-700">
                {message || 'An error occurred while processing your document'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
