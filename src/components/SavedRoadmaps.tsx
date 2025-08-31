import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { BookOpen, Clock, Target, ExternalLink, CheckCircle2, Play } from 'lucide-react';

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  resources: Array<{
    type: string;
    title: string;
    url: string;
    description: string;
  }>;
  skills: string[];
  completed: boolean;
}

interface Roadmap {
  id: string;
  track_name: string;
  experience_level: string;
  timeframe: string;
  selected_topics: string[];
  roadmap_json: any; // Using any for JSON data from Supabase
  progress_tracking: number;
  current_step: number;
  total_steps: number;
  created_at: string;
}

const SavedRoadmaps = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, [user]);

  const fetchRoadmaps = async () => {
    if (!user) return;

    try {
      // Get student profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (!profileData) {
        console.log('No profile found for user');
        return;
      }

      // Fetch roadmaps
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('student_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const markStepComplete = async (roadmapId: string, stepId: number) => {
    try {
      const roadmap = roadmaps.find(r => r.id === roadmapId);
      if (!roadmap) return;

      const updatedSteps = roadmap.roadmap_json.steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      );

      const completedSteps = updatedSteps.filter(step => step.completed).length;
      const progressPercentage = Math.round((completedSteps / roadmap.total_steps) * 100);
      const nextStep = completedSteps < roadmap.total_steps ? completedSteps + 1 : roadmap.current_step;

      const updatedRoadmapJson = {
        ...roadmap.roadmap_json,
        steps: updatedSteps
      };

      const { error } = await supabase
        .from('roadmaps')
        .update({
          roadmap_json: updatedRoadmapJson,
          progress_tracking: progressPercentage,
          current_step: nextStep
        })
        .eq('id', roadmapId);

      if (error) throw error;

      // Update local state
      setRoadmaps(prev => prev.map(r => 
        r.id === roadmapId 
          ? {
              ...r,
              roadmap_json: updatedRoadmapJson,
              progress_tracking: progressPercentage,
              current_step: nextStep
            }
          : r
      ));

      toast.success('Step marked as complete!');
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  const getCurrentLearningStep = (roadmap: Roadmap) => {
    const currentStep = roadmap.roadmap_json.steps.find(step => step.id === roadmap.current_step);
    return currentStep?.title || 'Course completed!';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading roadmaps...</div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="text-center p-8">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-kontora font-bold mb-2">No Roadmaps Yet</h3>
        <p className="text-muted-foreground">Generate your first AI-powered learning roadmap to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-kontora font-black text-primary mb-2">
          Your Learning Roadmaps
        </h2>
        <p className="text-muted-foreground">
          Track your progress and continue learning
        </p>
      </div>

      {roadmaps.map((roadmap) => (
        <Card key={roadmap.id} className="border-2 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-kontora font-bold text-primary mb-2">
                  {roadmap.track_name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">
                    <Target className="w-3 h-3 mr-1" />
                    {roadmap.experience_level}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {roadmap.timeframe}
                  </Badge>
                  {roadmap.selected_topics.slice(0, 3).map(topic => (
                    <Badge key={topic} variant="outline">{topic}</Badge>
                  ))}
                  {roadmap.selected_topics.length > 3 && (
                    <Badge variant="outline">+{roadmap.selected_topics.length - 3} more</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progress: {roadmap.progress_tracking}%</span>
                    <span className="text-muted-foreground">
                      Step {roadmap.current_step} of {roadmap.total_steps}
                    </span>
                  </div>
                  <Progress value={roadmap.progress_tracking} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Currently learning:</span> {getCurrentLearningStep(roadmap)}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => setExpandedRoadmap(
                  expandedRoadmap === roadmap.id ? null : roadmap.id
                )}
                variant="outline"
                size="sm"
              >
                {expandedRoadmap === roadmap.id ? 'Hide Details' : 'View Roadmap'}
              </Button>
            </div>

            {expandedRoadmap === roadmap.id && (
              <div className="mt-6 space-y-4">
                <p className="text-muted-foreground">{roadmap.roadmap_json.description}</p>
                
                <div className="grid gap-4">
                  {roadmap.roadmap_json.steps.map((step, index) => (
                    <Card 
                      key={step.id} 
                      className={`border ${
                        step.completed 
                          ? 'border-green-200 bg-green-50' 
                          : step.id === roadmap.current_step
                          ? 'border-primary bg-primary/5'
                          : 'border-muted'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Step {step.id}
                              </span>
                              {step.completed && (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              )}
                              {step.id === roadmap.current_step && !step.completed && (
                                <Play className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <h4 className="font-kontora font-bold text-lg">{step.title}</h4>
                            <p className="text-muted-foreground text-sm mb-3">{step.description}</p>
                            <p className="text-xs text-muted-foreground mb-3">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Estimated time: {step.estimatedTime}
                            </p>
                          </div>
                        </div>

                        {/* Resources */}
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Learning Resources:</h5>
                          <div className="grid gap-2">
                            {step.resources.map((resource, resourceIndex) => (
                              <div 
                                key={resourceIndex}
                                className="flex items-center justify-between p-2 bg-background rounded border"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {resource.type}
                                    </Badge>
                                    <span className="font-medium text-sm">{resource.title}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {resource.description}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(resource.url, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Skills */}
                        {step.skills.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-sm mb-2">Skills you'll learn:</h5>
                            <div className="flex flex-wrap gap-1">
                              {step.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Complete button */}
                        {!step.completed && (
                          <div className="mt-4">
                            <Button
                              onClick={() => markStepComplete(roadmap.id, step.id)}
                              size="sm"
                              className="w-full"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark as Complete
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedRoadmaps;