import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload, X, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ResumeAnalysisResults from '@/components/ResumeAnalysisResults';

const Resume = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch student profile ID and existing resume data
  useEffect(() => {
    if (user) {
      fetchStudentProfile();
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    if (!user) return;

    try {
      // First, get the student's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profile) {
        setStudentProfileId(profile.id);
        // Now fetch existing resume data using the profile ID
        await fetchExistingResume(profile.id);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  const fetchExistingResume = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('student_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching resume:', error);
        return;
      }

      if (data) {
        setUploadedUrl(data.resume_url);
        setJobDescription(data.job_description || '');
        setAnalysisResults({
          skillsNeedsToImprove: data.skills_needs_to_improve,
          atsScore: data.ats_score,
          bestCareerPath: data.best_career_path
        });
      }
    } catch (error) {
      console.error('Error fetching existing resume:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const uploadFile = async () => {
    if (!file || !user || !studentProfileId) return;

    if (!jobDescription.trim()) {
      toast.error('Please provide a job description for ATS analysis');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = 'pdf';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      setUploadedUrl(publicUrl);
      toast.success('Resume uploaded successfully!');

      // Save to database using the correct student profile ID
      const { error: dbError } = await supabase
        .from('resumes')
        .upsert({
          student_id: studentProfileId,
          resume_url: publicUrl,
          job_description: jobDescription
        });

      if (dbError) {
        console.error('Database error:', dbError);
      } else {
        // Start analysis
        await analyzeResume(publicUrl, fileName);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const analyzeResume = async (resumeUrl: string, fileName: string) => {
    if (!user || !studentProfileId) return;

    setAnalyzing(true);
    
    try {
      // Create FormData for the Supabase edge function
      const formData = new FormData();
      
      // Add the file
      formData.append('resume', file!);
      
      // Add JSON data
      const jsonData = {
        file_name: fileName,
        user_id: user.id,
        student_id: studentProfileId,
        job_description: jobDescription,
        resume_url: resumeUrl
      };
      
      formData.append('data', JSON.stringify(jsonData));

      // Call the Supabase edge function
      const { data: result, error } = await supabase.functions.invoke('analyze-resume', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      // Set analysis results for display
      setAnalysisResults({
        skillsNeedsToImprove: result.skills_needs_to_improve,
        atsScore: result.ats_score,
        bestCareerPath: result.best_career_path
      });

      toast.success('Resume analysis completed!');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadedUrl(null);
    setUploadProgress(0);
    setAnalysisResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-kotora font-black text-blue-dark mb-2">
          Resume Analyzer
        </h2>
        <p className="text-blue-600 font-poppins text-sm lg:text-base">
          Upload your resume and job description to get AI-powered ATS analysis
        </p>
      </div>

      <div className="space-y-6">
        {/* Job Description Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
              <Briefcase className="w-5 h-5" />
              <span>Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="job-description">
                Paste the job description you're applying for
              </Label>
              <Textarea
                id="job-description"
                placeholder="Paste the complete job description here to get accurate ATS scoring..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[120px]"
                disabled={uploading || analyzing}
              />
              <p className="text-sm text-gray-500">
                This will be used to calculate your ATS compatibility score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
              <Upload className="w-5 h-5" />
              <span>Upload Resume</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF files only (Max size: 10MB)
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Select File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={uploading || analyzing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {/* Analysis Progress */}
                {analyzing && !uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing resume...</span>
                      <span>Processing</span>
                    </div>
                    <Progress value={50} className="w-full" />
                  </div>
                )}

                {/* Upload Success */}
                {uploadedUrl && !uploading && !analyzing && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>Resume uploaded and analyzed successfully!</span>
                  </div>
                )}

                {/* Upload Button */}
                {!uploadedUrl && (
                  <Button
                    onClick={uploadFile}
                    disabled={uploading || analyzing || !jobDescription.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload & Analyze Resume'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results Section */}
        {analysisResults && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
                <FileText className="w-5 h-5" />
                <span>AI Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeAnalysisResults
                skillsNeedsToImprove={analysisResults.skillsNeedsToImprove}
                atsScore={analysisResults.atsScore}
                bestCareerPath={analysisResults.bestCareerPath}
              />
            </CardContent>
          </Card>
        )}

        {/* Empty State for Analysis */}
        {!analysisResults && !analyzing && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
                <FileText className="w-5 h-5" />
                <span>AI Analysis & Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Upload Resume & Job Description to Get Started
                </h3>
                <p className="text-gray-500 mb-4">
                  Once you upload your resume with a job description, you'll receive:
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    ATS compatibility score for the specific job
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Skills that need improvement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Best career path recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Personalized improvement suggestions
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Resume;
