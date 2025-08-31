
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, AlertTriangle, TrendingUp, Clock, User, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AILog {
  id: string;
  student_id: string | null;
  user_id: string | null;
  query_text: string;
  ai_response?: string;
  response_rating?: number;
  needs_tutor_intervention: boolean;
  created_at: string;
  student_profile?: {
    full_name: string;
    reg_no: string;
  } | null;
}

interface QueryPattern {
  topic: string;
  count: number;
  queries: string[];
}

const TutorAssistant = () => {
  const { user } = useAuth();
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [queryPatterns, setQueryPatterns] = useState<QueryPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string>('');
  const [customResponse, setCustomResponse] = useState('');
  const [currentTutorId, setCurrentTutorId] = useState<string>('');

  useEffect(() => {
    fetchCurrentTutorId();
  }, [user]);

  useEffect(() => {
    if (currentTutorId) {
      fetchAILogs();
      analyzeQueryPatterns();
    }
  }, [currentTutorId]);

  const fetchCurrentTutorId = async () => {
    if (!user) return;

    try {
      const { data: tutorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (tutorProfile) {
        setCurrentTutorId(tutorProfile.id);
      }
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
    }
  };

  const fetchAILogs = async () => {
    try {
      // First get student IDs assigned to this tutor
      const { data: roadmapData } = await supabase
        .from('roadmaps')
        .select('student_id')
        .eq('assigned_tutor_id', currentTutorId);

      const studentIds = roadmapData?.map(r => r.student_id) || [];

      if (studentIds.length === 0) {
        setAiLogs([]);
        return;
      }

      // Fetch AI logs for students assigned to this tutor
      // Since student_id is now nullable, we need to handle both cases
      const { data, error } = await supabase
        .from('ai_assistant_logs')
        .select('*')
        .or(`student_id.in.(${studentIds.join(',')}),user_id.in.(${await getUserIdsFromStudentIds(studentIds)})`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Manually fetch student profiles for the logs
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          let studentProfile = null;
          
          if (log.student_id) {
            // Try to get profile by student_id
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, reg_no')
              .eq('id', log.student_id)
              .maybeSingle();
            studentProfile = profile;
          } else if (log.user_id) {
            // Try to get profile by user_id
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, reg_no')
              .eq('user_id', log.user_id)
              .maybeSingle();
            studentProfile = profile;
          }

          return {
            ...log,
            student_profile: studentProfile
          };
        })
      );

      setAiLogs(logsWithProfiles);
    } catch (error) {
      console.error('Error fetching AI logs:', error);
      toast({
        title: "Error",
        description: "Failed to load AI assistant logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserIdsFromStudentIds = async (studentIds: string[]) => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id')
      .in('id', studentIds);
    
    return data?.map(p => p.user_id).filter(Boolean) || [];
  };

  const analyzeQueryPatterns = async () => {
    try {
      // First get student IDs assigned to this tutor
      const { data: roadmapData } = await supabase
        .from('roadmaps')
        .select('student_id')
        .eq('assigned_tutor_id', currentTutorId);

      const studentIds = roadmapData?.map(r => r.student_id) || [];

      if (studentIds.length === 0) {
        setQueryPatterns([]);
        return;
      }

      // Get user IDs for the assigned students
      const userIds = await getUserIdsFromStudentIds(studentIds);

      // Get all queries from assigned students (using both student_id and user_id)
      const { data, error } = await supabase
        .from('ai_assistant_logs')
        .select('query_text')
        .or(`student_id.in.(${studentIds.join(',')}),user_id.in.(${userIds.join(',')})`)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Simple pattern analysis (in a real app, you'd use NLP)
      const patterns: Record<string, string[]> = {};
      
      (data || []).forEach(log => {
        const query = log.query_text.toLowerCase();
        let category = 'General';
        
        if (query.includes('javascript') || query.includes('js') || query.includes('react')) {
          category = 'JavaScript/React';
        } else if (query.includes('python') || query.includes('django') || query.includes('flask')) {
          category = 'Python';
        } else if (query.includes('css') || query.includes('html') || query.includes('styling')) {
          category = 'Frontend/CSS';
        } else if (query.includes('database') || query.includes('sql') || query.includes('mysql')) {
          category = 'Database';
        } else if (query.includes('algorithm') || query.includes('data structure')) {
          category = 'Algorithms';
        }
        
        if (!patterns[category]) patterns[category] = [];
        patterns[category].push(log.query_text);
      });

      const patternArray = Object.entries(patterns).map(([topic, queries]) => ({
        topic,
        count: queries.length,
        queries: queries.slice(0, 3) // Show only first 3 examples
      })).sort((a, b) => b.count - a.count);

      setQueryPatterns(patternArray);
    } catch (error) {
      console.error('Error analyzing query patterns:', error);
    }
  };

  const markForIntervention = async (logId: string, needs: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_assistant_logs')
        .update({ needs_tutor_intervention: needs })
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: "Success",
        description: needs ? "Marked for intervention" : "Unmarked for intervention",
      });
      
      fetchAILogs();
    } catch (error) {
      console.error('Error updating intervention flag:', error);
      toast({
        title: "Error",
        description: "Failed to update intervention flag",
        variant: "destructive"
      });
    }
  };

  const provideCustomResponse = async () => {
    if (!selectedLogId || !customResponse.trim()) {
      toast({
        title: "Error",
        description: "Please select a query and provide a response",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real implementation, you would store the custom response
      // and potentially send it to the student
      toast({
        title: "Success",
        description: "Custom response provided (feature to be fully implemented)",
      });
      
      setCustomResponse('');
      setSelectedLogId('');
    } catch (error) {
      console.error('Error providing custom response:', error);
    }
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating <= 2) return 'bg-red-100 text-red-800';
    if (rating <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading AI assistant data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-kontora font-bold text-[hsl(142,76%,36%)]">
            AI Assistant Supervision
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI interactions and provide additional guidance
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Query Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Common Query Patterns (Last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queryPatterns.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No patterns detected yet
              </p>
            ) : (
              <div className="space-y-3">
                {queryPatterns.map((pattern, index) => (
                  <div key={pattern.topic} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{pattern.topic}</h4>
                      <Badge variant="secondary">{pattern.count} queries</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Example queries:</p>
                      <ul className="space-y-1">
                        {pattern.queries.map((query, i) => (
                          <li key={i} className="truncate">• {query}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Response Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Provide Custom Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Explanation/Response:
              </label>
              <Textarea
                placeholder="Provide additional explanation or recorded session link..."
                value={customResponse}
                onChange={(e) => setCustomResponse(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <Button 
              onClick={provideCustomResponse}
              className="w-full bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
            >
              Send Custom Response
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Interaction Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Recent AI Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiLogs.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No AI interactions yet</h3>
              <p className="text-muted-foreground">
                Student AI queries will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiLogs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {log.student_profile?.full_name || 'Unknown Student'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({log.student_profile?.reg_no || 'N/A'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.response_rating && (
                        <Badge className={getRatingColor(log.response_rating)}>
                          {log.response_rating}/5 stars
                        </Badge>
                      )}
                      {log.needs_tutor_intervention && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Attention
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-800 mb-1">Student Query:</p>
                      <p className="text-sm">{log.query_text}</p>
                    </div>
                    
                    {log.ai_response && (
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-800 mb-1">AI Response:</p>
                        <p className="text-sm">{log.ai_response}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedLogId === log.id ? "default" : "outline"}
                      onClick={() => setSelectedLogId(log.id)}
                    >
                      Select for Response
                    </Button>
                    
                    {!log.needs_tutor_intervention ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markForIntervention(log.id, true)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Mark for Intervention
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markForIntervention(log.id, false)}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Remove Flag
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorAssistant;
