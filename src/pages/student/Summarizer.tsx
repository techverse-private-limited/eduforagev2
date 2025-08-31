
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSummarizerData } from '@/hooks/useSummarizerData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, CheckCircle, History, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { submitFileForSummarization, SummarizerResponse } from '@/services/summarizerAPI';
import { SummaryCard } from '@/components/SummaryCard';
import { MindMapCard } from '@/components/MindMapCard';
import { FileUploadCard } from '@/components/summarizer/FileUploadCard';
import { ProcessingStatus } from '@/components/summarizer/ProcessingStatus';

type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

const Summarizer = () => {
  const { user } = useAuth();
  const { summarizerData, isLoading: isLoadingHistory, error: historyError, forceRefresh } = useSummarizerData();
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizerResponse | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetUploadState = useCallback(() => {
    setUploadedFile(null);
    setSummaryResult(null);
    setProcessingState('idle');
    setErrorMessage(null);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Please log in to use the summarizer');
      return;
    }

    console.log('File upload started:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Validate file size (10MB limit for documents)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload PDF, DOC, TXT, or image files.');
      return;
    }

    setUploadedFile(file);
    setProcessingState('processing');
    setSummaryResult(null);
    setErrorMessage(null);

    try {
      console.log('Sending file to API...');
      const result = await submitFileForSummarization(file, user.id);
      console.log('API response received:', result);
      
      setSummaryResult(result);
      
      if (result.success) {
        setProcessingState('success');
        toast.success('File processed successfully!');
        
        // Force refresh the history data after successful upload
        setTimeout(() => {
          console.log('Forcing data refresh after successful processing...');
          forceRefresh();
        }, 1500);
      } else {
        setProcessingState('error');
        setErrorMessage(result.error || 'Failed to process file');
        toast.error(result.error || 'Failed to process file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingState('error');
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred';
      setErrorMessage(errorMsg);
      toast.error('An error occurred while processing the file');
      setSummaryResult({
        success: false,
        error: errorMsg
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Text copied to clipboard!');
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const renderHistoryCards = () => {
    if (historyError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-700 font-medium">Error loading history</p>
            <p className="text-sm text-red-600 mt-1">{historyError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={forceRefresh}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (summarizerData.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No previous summaries found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first document to get started!
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summarizerData.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Summary #{item.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(item.text || '')}
                  className="h-8 w-8 p-0"
                >
                  {copiedText === item.text ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString()} at{' '}
                {new Date(item.created_at).toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.text || 'No summary available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-8 w-8" style={{ color: 'hsl(217, 91%, 60%)' }} />
        <div>
          <h1 className="text-3xl font-kontora font-black" style={{ color: 'hsl(217, 91%, 60%)' }}>
            AI Summarizer
          </h1>
          <p className="text-muted-foreground font-poppins">
            Upload documents to get AI-powered summaries
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <FileUploadCard
        dragActive={dragActive}
        isUploading={processingState === 'processing'}
        uploadedFile={uploadedFile}
        onDrag={handleDrag}
        onDrop={handleDrop}
        onFileChange={handleFileChange}
        onRemoveFile={resetUploadState}
      />

      {/* Processing Status */}
      {processingState !== 'idle' && (
        <ProcessingStatus 
          status={processingState} 
          message={errorMessage || undefined}
        />
      )}

      {/* Current Upload Results */}
      {summaryResult && processingState === 'success' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-kontora font-bold" style={{ color: 'hsl(217, 91%, 60%)' }}>
            Latest Summary
          </h2>
          
          <div className="space-y-6">
            <SummaryCard 
              data={summaryResult.data!} 
              onCopy={copyToClipboard} 
              copiedText={copiedText} 
            />
            {summaryResult.data?.mindmap && (
              <MindMapCard mindmap={summaryResult.data.mindmap} />
            )}
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-kontora font-bold" style={{ color: 'hsl(217, 91%, 60%)' }}>
            <History className="inline h-6 w-6 mr-2" />
            Previous Summaries
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={forceRefresh}
            disabled={isLoadingHistory}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            {isLoadingHistory ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {isLoadingHistory ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          renderHistoryCards()
        )}
      </div>
    </div>
  );
};

export default Summarizer;
