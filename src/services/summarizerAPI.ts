export interface SummarizerResponse {
  success: boolean;
  data?: {
    title?: string;
    summary?: string;
    sections?: string[];
    topics?: string[];
    insights?: string[];
    actionItems?: string[];
    mindmap?: {
      centralNode: string;
      branches: Array<{
        name: string;
        children: string[];
      }>;
    };
    text?: string;
  };
  error?: string;
}

export const submitFileForSummarization = async (
  file: File,
  userId: string
): Promise<SummarizerResponse> => {
  try {
    console.log('Preparing file for upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: userId
    });

    const formData = new FormData();
    formData.append('file_upload', file, file.name);
    formData.append('user_id', userId);

    console.log('FormData prepared, sending request...');
    
    const response = await fetch('https://gprtclzwkgtyvrrgifpu.supabase.co/functions/v1/document-summarizer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      // Try to extract error payload if present
      let errText = `HTTP error! status: ${response.status}`;
      try {
        const maybeJson = await response.json();
        if (maybeJson?.error) {
          errText = String(maybeJson.error);
        }
      } catch {
        // ignore parse error; keep original errText
      }
      throw new Error(errText);
    }

    const raw = await response.json();
    console.log('Raw response data:', raw);

    // The Edge Function returns: { success: boolean, data?: {...}, error?: string }
    // Map it to our SummarizerResponse type correctly (do NOT nest data inside data again).
    const mapped: SummarizerResponse = {
      success: !!raw?.success,
      data: raw?.data,        // <-- pass through the inner data object as-is
      error: raw?.error || undefined,
    };

    console.log('Mapped response for UI:', mapped);
    return mapped;
  } catch (error) {
    console.error('Error submitting file for summarization:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process file',
    };
  }
};
